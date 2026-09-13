import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

const taskParseSchema = z.object({
  title: z.string(),
  course: z.string(),
  dueLabel: z.string(),
  dueDate: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  durationMinutes: z.number(),
  rationale: z.string(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  ai: router({
    parsePlannerInput: publicProcedure
      .input(z.object({ text: z.string().min(3).max(500) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You convert a student's natural-language academic note into one concise planner task. Return only the requested JSON. Use the current academic context: VIT student, courses include Computer Networks, Machine Learning, Operating Systems, Probability & Stats, Data Structures, and Software Engineering. Resolve relative dates like tomorrow or Friday into a friendly dueLabel and ISO dueDate when possible.",
            },
            { role: "user", content: input.text },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "planner_task",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  course: { type: "string" },
                  dueLabel: { type: "string" },
                  dueDate: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  durationMinutes: { type: "number" },
                  rationale: { type: "string" },
                },
                required: ["title", "course", "dueLabel", "dueDate", "priority", "durationMinutes", "rationale"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = response.choices?.[0]?.message?.content;
        const raw = typeof content === "string" ? content : JSON.stringify(content ?? {});
        return taskParseSchema.parse(JSON.parse(raw));
      }),
  }),
});

export type AppRouter = typeof appRouter;
