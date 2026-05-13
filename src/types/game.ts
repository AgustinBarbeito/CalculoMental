export type Difficulty = "easy" | "medium" | "hard";

export type GameMode =
  | "classic"
  | "trueFalse"
  | "multipleChoice"
  | "continuousClock";

export type Operation = "+" | "-" | "*" | "/";

export interface Question {
  id: string;
  left: number;
  right: number;
  op: Operation;
  /** Correct numeric result (integer division for /). */
  correct: number;
  /** Shown expression text, e.g. "12 + 7". */
  expression: string;
}

export interface TrueFalsePayload {
  expressionWithResult: string;
  shownResult: number;
  isStatementTrue: boolean;
}

export interface MultipleChoicePayload {
  options: number[];
  correctIndex: number;
}

export interface RoundConfig {
  mode: GameMode;
  difficulty: Difficulty;
  /** Questions per round (ignored shape for continuousClock — use totalSeconds). */
  iterations: number;
  /** Total session seconds for continuousClock. */
  totalSeconds?: number;
}

export interface RoundAnswerRecord {
  questionId: string;
  correct: boolean;
  /** ms from question shown until answer committed (or timeout). */
  reactionMs: number;
  /** Score delta applied for this step. */
  scoreDelta: number;
  timedOut: boolean;
}

export interface RoundSummary {
  mode: GameMode;
  difficulty: Difficulty;
  score: number;
  correctCount: number;
  wrongCount: number;
  timeoutCount: number;
  totalQuestions: number;
  avgReactionMs: number;
  startedAt: number;
  endedAt: number;
  /** continuousClock: ended by mistake vs time */
  endedReason?: "completed" | "wrong" | "time";
}
