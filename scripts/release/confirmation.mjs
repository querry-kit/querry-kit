import { setTimeout as delay } from 'node:timers/promises';

// A claim is durable before sending bytes: a lost response, crash, or rerun cannot submit them again.
export async function submitAndConfirm({
  observe,
  alreadyClaimed,
  claim,
  submit,
  tag,
  now = Date.now,
  wait = delay,
  budget = 600_000,
}) {
  const claimed = await alreadyClaimed();
  const initial = await observe();
  if (initial === 'complete') return tag();
  let submissionError;
  if (initial === 'missing' && !claimed) {
    await claim();
    try {
      await submit();
    } catch (error) {
      submissionError = error;
    }
  }
  const end = now() + budget;
  let backoff = 1000;
  while (now() < end) {
    // Registry timeouts are bounded by the remaining confirmation budget. Contradictions throw immediately.
    try {
      if ((await observe(end - now())) === 'complete') return tag();
    } catch (error) {
      if (!error.retryable) throw error;
    }
    await wait(Math.max(0, Math.min(backoff, end - now())));
    backoff = Math.min(backoff * 2, 15000);
  }
  throw new Error(
    'Registry state unconfirmed: rerun the failed job using its original SHA and reviewed artifact. Do not republish.',
    { cause: submissionError },
  );
}
