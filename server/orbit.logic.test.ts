import { describe, expect, it } from "vitest";
import { attendancePercent, priorityScore, safeSkipMargin } from "../shared/orbit";

describe("orbit academic logic", () => {
  it("calculates attendance percentages safely", () => {
    expect(attendancePercent(23, 26)).toBe(88);
    expect(attendancePercent(0, 0)).toBe(0);
  });

  it("calculates the number of classes a student can skip while meeting the mandate", () => {
    expect(safeSkipMargin(23, 26)).toBe(4);
    expect(safeSkipMargin(15, 22)).toBe(0);
  });

  it("ranks urgent, high-impact work above low-impact work", () => {
    const urgent = priorityScore({ daysUntilDue: 0, weightage: 9, estimatedMinutes: 120, averageMinutes: 90 });
    const later = priorityScore({ daysUntilDue: 7, weightage: 3, estimatedMinutes: 45, averageMinutes: 90 });
    expect(urgent).toBeGreaterThan(later);
    expect(urgent).toBeGreaterThan(80);
  });
});
