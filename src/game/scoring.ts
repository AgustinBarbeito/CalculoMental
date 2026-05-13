/**
 * Scoring from assignment brief:
 * - Correct fast (< 75% of time limit): +100
 * - Correct within time: +70
 * - Wrong: -30
 * - No answer / timeout: -50
 */
export function computeScoreDelta(params: {
  timeLimitMs: number;
  reactionMs: number;
  correct: boolean;
  timedOut: boolean;
}): number {
  const { timeLimitMs, reactionMs, correct, timedOut } = params;
  if (timedOut) {
    return -50;
  }
  if (!correct) {
    return -30;
  }
  const quickThreshold = timeLimitMs * 0.75;
  if (reactionMs <= quickThreshold) {
    return 100;
  }
  return 70;
}
