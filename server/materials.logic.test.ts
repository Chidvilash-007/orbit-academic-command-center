import { describe, expect, it } from "vitest";
import { noteSchema } from "./routers";

describe("materials note generation contract", () => {
  it("accepts a complete exam-note response with formulas and revision sections", () => {
    const parsed = noteSchema.parse({
      title: "Computer Networks — Exam Notes",
      executiveSummary: "A compact summary of routing and transport concepts.",
      importantTopics: ["Routing protocols", "Congestion control"],
      formulas: ["Throughput = window size / RTT"],
      examChecklist: ["Compare distance-vector and link-state routing"],
      quickRecall: ["RIP uses hop count as its metric"],
    });
    expect(parsed.formulas).toHaveLength(1);
    expect(parsed.examChecklist[0]).toContain("Compare");
  });

  it("rejects incomplete AI output so a broken response cannot unlock a PDF", () => {
    expect(() => noteSchema.parse({ title: "Incomplete", executiveSummary: "Missing sections" })).toThrow();
  });
});
