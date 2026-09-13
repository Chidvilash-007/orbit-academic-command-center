import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { prisma } from "./prisma";
import { z } from "zod";

const parsedTaskSchema = z.object({
  title: z.string(), course: z.string(), dueLabel: z.string(), dueDate: z.string(),
  priority: z.enum(["low", "medium", "high"]), durationMinutes: z.number(), rationale: z.string(),
});
const taskInputSchema = z.object({ title: z.string().min(1).max(191), description: z.string().optional(), dueAt: z.string().datetime().optional(), priority: z.enum(["low", "medium", "high"]).default("medium"), durationMinutes: z.number().int().min(5).max(720).default(45), courseId: z.number().int().optional(), aiRationale: z.string().optional() });

async function parsePlannerText(text: string) {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You convert a student's natural-language academic note into one concise planner task. Return only the requested JSON. Context: VIT student, courses include Computer Networks, Machine Learning, Operating Systems, Probability & Stats, Data Structures, and Software Engineering. Resolve relative dates into a friendly dueLabel and ISO dueDate when possible." },
      { role: "user", content: text },
    ],
    response_format: { type: "json_schema", json_schema: { name: "planner_task", strict: true, schema: { type: "object", properties: { title: { type: "string" }, course: { type: "string" }, dueLabel: { type: "string" }, dueDate: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"] }, durationMinutes: { type: "number" }, rationale: { type: "string" } }, required: ["title", "course", "dueLabel", "dueDate", "priority", "durationMinutes", "rationale"], additionalProperties: false } } },
  });
  const content = response.choices?.[0]?.message?.content;
  return parsedTaskSchema.parse(JSON.parse(typeof content === "string" ? content : JSON.stringify(content ?? {})));
}

async function courseForUser(userId: number, courseName: string) {
  const normalized = courseName.trim();
  const existing = await prisma.course.findFirst({ where: { userId, name: { contains: normalized } } });
  if (existing) return existing;
  const code = normalized.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase() || "GEN001";
  return prisma.course.upsert({ where: { userId_code: { userId, code } }, update: { name: normalized }, create: { userId, code, name: normalized, color: "violet" } });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  onboarding: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await prisma.user.findUnique({ where: { openId: ctx.user.openId }, include: { courses: { orderBy: { name: "asc" } } } });
      return user ? { onboardingComplete: user.onboardingComplete, profile: { name: user.name, email: user.email, university: user.university, program: user.program, year: user.year, semester: user.semester, targetCgpa: user.targetCgpa?.toString() ?? null, attendanceMandate: user.attendanceMandate, preferredStudyStart: user.preferredStudyStart, preferredStudyEnd: user.preferredStudyEnd }, courses: user.courses } : null;
    }),
    complete: protectedProcedure.input(z.object({ university: z.string().min(2), program: z.string().min(2), year: z.number().int().min(1).max(8), semester: z.number().int().min(1).max(12), targetCgpa: z.number().min(0).max(10), attendanceMandate: z.number().int().min(50).max(100), preferredStudyStart: z.string().optional(), preferredStudyEnd: z.string().optional(), courses: z.array(z.object({ code: z.string().min(2).max(32), name: z.string().min(2).max(191), credits: z.number().int().min(1).max(10), color: z.string().max(24).default("violet") })).min(1) })).mutation(async ({ ctx, input }) => {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({ where: { openId: ctx.user.openId }, data: { university: input.university, program: input.program, year: input.year, semester: input.semester, targetCgpa: input.targetCgpa, attendanceMandate: input.attendanceMandate, preferredStudyStart: input.preferredStudyStart, preferredStudyEnd: input.preferredStudyEnd, onboardingComplete: true } });
        for (const course of input.courses) await tx.course.upsert({ where: { userId_code: { userId: user.id, code: course.code } }, update: { name: course.name, credits: course.credits, color: course.color }, create: { userId: user.id, ...course } });
      });
      return { success: true } as const;
    }),
  }),
  profile: router({
    update: protectedProcedure.input(z.object({ name: z.string().min(2).max(191).optional(), university: z.string().min(2).max(191).optional(), program: z.string().min(2).max(191).optional(), year: z.number().int().min(1).max(8).optional(), semester: z.number().int().min(1).max(12).optional(), targetCgpa: z.number().min(0).max(10).optional(), attendanceMandate: z.number().int().min(50).max(100).optional() })).mutation(({ ctx, input }) => prisma.user.update({ where: { openId: ctx.user.openId }, data: input })),
  }),
  courses: router({
    list: protectedProcedure.query(({ ctx }) => prisma.course.findMany({ where: { userId: ctx.user.id }, orderBy: { name: "asc" } })),
    create: protectedProcedure.input(z.object({ code: z.string().min(2).max(32), name: z.string().min(2).max(191), credits: z.number().int().min(1).max(10).default(3), color: z.string().max(24).default("violet") })).mutation(({ ctx, input }) => prisma.course.create({ data: { ...input, userId: ctx.user.id } })),
    delete: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => prisma.course.deleteMany({ where: { id: input.id, userId: ctx.user.id } })),
  }),
  tasks: router({
    list: protectedProcedure.query(({ ctx }) => prisma.task.findMany({ where: { userId: ctx.user.id }, include: { course: true }, orderBy: [{ status: "asc" }, { dueAt: "asc" }] })),
    create: protectedProcedure.input(taskInputSchema).mutation(({ ctx, input }) => prisma.task.create({ data: { ...input, userId: ctx.user.id, dueAt: input.dueAt ? new Date(input.dueAt) : undefined }, include: { course: true } })),
    toggle: protectedProcedure.input(z.object({ id: z.number().int(), status: z.enum(["TODO", "IN_PROGRESS", "DONE"]) })).mutation(({ ctx, input }) => prisma.task.updateMany({ where: { id: input.id, userId: ctx.user.id }, data: { status: input.status } })),
  }),
  timetable: router({
    list: protectedProcedure.query(({ ctx }) => prisma.timetableEvent.findMany({ where: { userId: ctx.user.id }, include: { course: true }, orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }] })),
    create: protectedProcedure.input(z.object({ title: z.string().min(2).max(191), courseId: z.number().int().optional(), dayOfWeek: z.number().int().min(0).max(6), startMinute: z.number().int().min(0).max(1439), endMinute: z.number().int().min(1).max(1440), room: z.string().max(64).optional(), eventType: z.string().max(24).default("class") })).mutation(({ ctx, input }) => prisma.timetableEvent.create({ data: { ...input, userId: ctx.user.id } })),
    updatePosition: protectedProcedure.input(z.object({ id: z.number().int(), dayOfWeek: z.number().int().min(0).max(6), startMinute: z.number().int().min(0).max(1439), endMinute: z.number().int().min(1).max(1440) })).mutation(({ ctx, input }) => prisma.timetableEvent.updateMany({ where: { id: input.id, userId: ctx.user.id }, data: { dayOfWeek: input.dayOfWeek, startMinute: input.startMinute, endMinute: input.endMinute } })),
    delete: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(({ ctx, input }) => prisma.timetableEvent.deleteMany({ where: { id: input.id, userId: ctx.user.id } })),
  }),
  ai: router({
    parsePlannerInput: publicProcedure.input(z.object({ text: z.string().min(3).max(500) })).mutation(({ input }) => parsePlannerText(input.text)),
    createFromNaturalLanguage: protectedProcedure.input(z.object({ text: z.string().min(3).max(500) })).mutation(async ({ ctx, input }) => {
      const parsed = await parsePlannerText(input.text);
      const course = await courseForUser(ctx.user.id, parsed.course);
      const dueAt = parsed.dueDate && !Number.isNaN(Date.parse(parsed.dueDate)) ? new Date(parsed.dueDate) : undefined;
      return prisma.task.create({ data: { userId: ctx.user.id, courseId: course.id, title: parsed.title, dueAt, priority: parsed.priority, durationMinutes: parsed.durationMinutes, aiRationale: parsed.rationale }, include: { course: true } });
    }),
  }),
});

export type AppRouter = typeof appRouter;
