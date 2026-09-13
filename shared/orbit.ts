export function attendancePercent(attended: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((attended / total) * 100);
}

export function safeSkipMargin(attended: number, total: number, mandate = 0.75): number {
  if (total <= 0 || mandate >= 1) return 0;
  return Math.max(0, Math.floor(attended / mandate - total));
}

export function priorityScore(input: {
  daysUntilDue: number;
  weightage: number;
  estimatedMinutes: number;
  averageMinutes: number;
}): number {
  const urgency = Math.max(0, 100 - input.daysUntilDue * 14);
  const impact = Math.min(100, input.weightage * 10);
  const effort = Math.min(100, (input.estimatedMinutes / Math.max(input.averageMinutes, 1)) * 50);
  return Math.round(urgency * 0.45 + impact * 0.35 + effort * 0.2);
}
