<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket, type Problem } from '#lib/kb/problems';

  // How many reports in a ticket belong to one problem, for use inside a sentence.
  let { ticket, problem }: { ticket: number; problem: Problem } = $props();

  const n = $derived(
    splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove).groups.find((g) => g.problem === problem)?.reports
      .length ?? 0,
  );
</script>

<strong>{n}</strong>
