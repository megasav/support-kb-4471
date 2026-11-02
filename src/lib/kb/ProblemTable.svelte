<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket, type Problem } from '#lib/kb/problems';

  // issues: problem → link to the ticket filed for it.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k} ×${n}`)
      .join(' · ');
  const label = (href: string) => '#' + href.split('/').pop();
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports in #{ticket} ·
  <strong>{split.groups.length}</strong>
  {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>channels</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td><strong>{g.reports.length}</strong></td>
        <td>{g.tenants.length}</td>
        <td class="small">{channels(g.channels)}</td>
        <td class="small">{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if g.problem !== 'unplaced' && issues[g.problem]}
            <a href={issues[g.problem]}>{label(issues[g.problem]!)}</a>
          {:else}
            <span class="none">none yet</span>
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

{#each Object.entries(split.filedAs) as [cause, n] (cause)}
  <p class="small">The {n} <code>one-day</code> reports are also counted under <code>{cause}</code>, where their tenant files them, as the desk counts (<a href="/kb/incidents/{ticket}">#{ticket}</a>).</p>
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .small { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
</style>
