// The problems inside a merged ticket, one per fix, counted the desk's way (CauseTable):
// every report is filed under the cause its tenant gives it (causes.ts). The reports the desk read
// as a one-day move (desk-notes.json) are a problem of their own, but they stay counted where they
// are filed, so the one-day row overlaps the cause it is filed under.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day'];


export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; groups: ProblemGroup[]; filedAs: Record<string, number> } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const c = causeOf(r, tenantOf(r)) ?? 'unplaced';
    by.set(c, [...(by.get(c) ?? []), r]);
  }
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) by.set('one-day', moved);
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  // Where the one-day reports are filed: cause → count.
  const filedAs = moved.reduce<Record<string, number>>((n, r) => {
    const c = causeOf(r, tenantOf(r)) ?? 'unplaced';
    return { ...n, [c]: (n[c] ?? 0) + 1 };
  }, {});
  return { merged, groups, filedAs };
}
