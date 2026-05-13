import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Question,
  RoundAnswerRecord,
  RoundConfig,
  RoundSummary,
} from "../types/game";
import { DIFFICULTY_PROFILE } from "../game/difficulty";
import {
  buildMultipleChoiceOptions,
  generateQuestion,
  trueFalseStatement,
} from "../game/generator";
import { computeScoreDelta } from "../game/scoring";

const FEEDBACK_MS = 380;

function clampIterations(n: number): number {
  return Math.min(30, Math.max(1, Math.round(n)));
}

export interface ActiveMc {
  options: number[];
  correctIndex: number;
}

export interface ActiveTf {
  label: string;
  /** Whether the equality shown is mathematically correct. */
  statementIsTrue: boolean;
}

export interface UseGameSessionResult {
  phase: "playing" | "feedback" | "done";
  score: number;
  current?: Question;
  multipleChoice?: ActiveMc;
  trueFalse?: ActiveTf;
  timeLimitMs: number;
  timeLeftMs: number;
  sessionLeftMs: number | null;
  /** Number of questions already finished this round. */
  completedCount: number;
  progressTotal: number | null;
  lastFeedback?: { correct: boolean; delta: number; timedOut: boolean };
  submitNumericAnswer: (value: number) => void;
  submitTrueFalse: (userSaysTrue: boolean) => void;
  submitChoiceIndex: (index: number) => void;
}

export function useGameSession(
  config: RoundConfig,
  onComplete: (summary: RoundSummary) => void
): UseGameSessionResult {
  const timeLimitMs = useMemo(
    () => DIFFICULTY_PROFILE[config.difficulty].timePerQuestionSec * 1000,
    [config.difficulty]
  );

  const isContinuous = config.mode === "continuousClock";
  const iterationsTotal = useMemo(() => {
    if (isContinuous) return null;
    return clampIterations(config.iterations);
  }, [config.iterations, isContinuous]);

  const sessionTotalMs = useMemo(() => {
    if (!isContinuous) return null;
    const sec = config.totalSeconds ?? 90;
    return Math.max(15, Math.min(600, sec)) * 1000;
  }, [config.totalSeconds, isContinuous]);

  const [phase, setPhase] = useState<"playing" | "feedback" | "done">("playing");
  const [score, setScore] = useState(0);
  const [records, setRecords] = useState<RoundAnswerRecord[]>([]);
  const [current, setCurrent] = useState<Question | undefined>();
  const [multipleChoice, setMultipleChoice] = useState<ActiveMc | undefined>();
  const [trueFalse, setTrueFalse] = useState<ActiveTf | undefined>();
  const [timeLeftMs, setTimeLeftMs] = useState(timeLimitMs);
  const [sessionLeftMs, setSessionLeftMs] = useState<number | null>(
    sessionTotalMs
  );
  const [lastFeedback, setLastFeedback] = useState<
    UseGameSessionResult["lastFeedback"]
  >();
  const [completedCount, setCompletedCount] = useState(0);

  const roundStartedAtRef = useRef(Date.now());
  const questionStartedAtRef = useRef<number>(Date.now());
  const deadlineRef = useRef<number>(Date.now() + timeLimitMs);
  const sessionDeadlineRef = useRef<number | null>(
    sessionTotalMs ? Date.now() + sessionTotalMs : null
  );
  const questionTimeoutFiredRef = useRef(false);
  const roundEndedRef = useRef(false);
  const lastSessionLeftMsRef = useRef<number | null>(sessionTotalMs);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finalizeRef = useRef(onComplete);
  finalizeRef.current = onComplete;

  const recordsRef = useRef(records);
  recordsRef.current = records;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const completedRef = useRef(completedCount);
  completedRef.current = completedCount;

  const prepareQuestion = useCallback(
    (q: Question) => {
      questionTimeoutFiredRef.current = false;
      setCurrent(q);
      const start = Date.now();
      questionStartedAtRef.current = start;
      deadlineRef.current = start + timeLimitMs;
      setTimeLeftMs(timeLimitMs);

      if (config.mode === "multipleChoice") {
        const options = buildMultipleChoiceOptions(q.correct, config.difficulty);
        const correctIndex = options.indexOf(q.correct);
        setMultipleChoice({
          options,
          correctIndex: correctIndex >= 0 ? correctIndex : 0,
        });
        setTrueFalse(undefined);
      } else if (config.mode === "trueFalse") {
        const tf = trueFalseStatement(q);
        setTrueFalse({
          label: tf.label,
          statementIsTrue: tf.isStatementTrue,
        });
        setMultipleChoice(undefined);
      } else {
        setMultipleChoice(undefined);
        setTrueFalse(undefined);
      }
    },
    [config.difficulty, config.mode, timeLimitMs]
  );

  const bootstrapped = useRef(false);
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    roundStartedAtRef.current = Date.now();
    const first = generateQuestion(config.difficulty);
    prepareQuestion(first);
    if (sessionTotalMs) {
      sessionDeadlineRef.current = Date.now() + sessionTotalMs;
      setSessionLeftMs(sessionTotalMs);
    }
  }, [config.difficulty, prepareQuestion, sessionTotalMs]);

  const buildSummary = useCallback(
    (endedReason: RoundSummary["endedReason"]): RoundSummary => {
      const endedAt = Date.now();
      const recs = recordsRef.current;
      const avg =
        recs.length === 0
          ? 0
          : Math.round(
              recs.reduce((a, b) => a + b.reactionMs, 0) / recs.length
            );
      return {
        mode: config.mode,
        difficulty: config.difficulty,
        score: scoreRef.current,
        correctCount: recs.filter((r) => r.correct && !r.timedOut).length,
        wrongCount: recs.filter((r) => !r.correct && !r.timedOut).length,
        timeoutCount: recs.filter((r) => r.timedOut).length,
        totalQuestions: recs.length,
        avgReactionMs: avg,
        startedAt: roundStartedAtRef.current,
        endedAt,
        endedReason,
      };
    },
    [config.difficulty, config.mode]
  );

  const finishRound = useCallback(
    (endedReason: RoundSummary["endedReason"]) => {
      if (roundEndedRef.current) return;
      roundEndedRef.current = true;
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      setPhase("done");
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      finalizeRef.current(buildSummary(endedReason));
    },
    [buildSummary]
  );

  const advanceAfterFeedback = useCallback(
    (opts: { wrongAnswer: boolean; questionTimedOut: boolean }) => {
      if (roundEndedRef.current) return;
      if (isContinuous) {
        if (opts.wrongAnswer && !opts.questionTimedOut) {
          finishRound("wrong");
          return;
        }
        const next = generateQuestion(config.difficulty);
        prepareQuestion(next);
        if (sessionDeadlineRef.current && lastSessionLeftMsRef.current != null) {
          sessionDeadlineRef.current =
            Date.now() + lastSessionLeftMsRef.current;
        }
        setPhase("playing");
        return;
      }

      const done = completedRef.current + 1;
      if (done >= (iterationsTotal ?? 0)) {
        finishRound("completed");
        return;
      }
      setCompletedCount(done);
      const next = generateQuestion(config.difficulty);
      prepareQuestion(next);
      if (sessionDeadlineRef.current && lastSessionLeftMsRef.current != null) {
        sessionDeadlineRef.current = Date.now() + lastSessionLeftMsRef.current;
      }
      setPhase("playing");
    },
    [config.difficulty, finishRound, isContinuous, iterationsTotal, prepareQuestion]
  );

  const pushRecordAndScore = useCallback(
    (rec: Omit<RoundAnswerRecord, "questionId"> & { questionId?: string }) => {
      const full: RoundAnswerRecord = {
        questionId: rec.questionId ?? current?.id ?? "q",
        correct: rec.correct,
        reactionMs: rec.reactionMs,
        scoreDelta: rec.scoreDelta,
        timedOut: rec.timedOut,
      };
      setRecords((prev) => {
        const next = [...prev, full];
        recordsRef.current = next;
        return next;
      });
      setScore((s) => {
        const v = s + rec.scoreDelta;
        scoreRef.current = v;
        return v;
      });
    },
    [current?.id]
  );

  const scheduleFeedback = useCallback(
    (payload: {
      feedback: { correct: boolean; delta: number; timedOut: boolean };
      wrongAnswer: boolean;
      questionTimedOut: boolean;
    }) => {
      setLastFeedback(payload.feedback);
      setPhase("feedback");
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => {
        advanceAfterFeedback({
          wrongAnswer: payload.wrongAnswer,
          questionTimedOut: payload.questionTimedOut,
        });
      }, FEEDBACK_MS);
    },
    [advanceAfterFeedback]
  );

  const onQuestionTimeout = useCallback(() => {
    if (phase !== "playing" || questionTimeoutFiredRef.current) return;
    questionTimeoutFiredRef.current = true;
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    const reactionMs = timeLimitMs;
    const delta = computeScoreDelta({
      timeLimitMs,
      reactionMs,
      correct: false,
      timedOut: true,
    });
    pushRecordAndScore({
      correct: false,
      reactionMs,
      scoreDelta: delta,
      timedOut: true,
    });
    scheduleFeedback({
      feedback: { correct: false, delta, timedOut: true },
      wrongAnswer: false,
      questionTimedOut: true,
    });
  }, [phase, pushRecordAndScore, scheduleFeedback, timeLimitMs]);

  const onSessionTimeout = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    finishRound("time");
  }, [finishRound]);

  useEffect(() => {
    if (phase !== "playing") {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    tickRef.current = setInterval(() => {
      const now = Date.now();

      if (sessionDeadlineRef.current) {
        const sLeft = Math.max(0, sessionDeadlineRef.current - now);
        lastSessionLeftMsRef.current = sLeft;
        setSessionLeftMs(sLeft);
        if (sLeft <= 0) {
          onSessionTimeout();
          return;
        }
      }

      const left = Math.max(0, deadlineRef.current - now);
      setTimeLeftMs(left);
      if (left <= 0) {
        onQuestionTimeout();
      }
    }, 80);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [onQuestionTimeout, onSessionTimeout, phase]);

  const commitAnswer = useCallback(
    (opts: { correct: boolean }) => {
      if (phase !== "playing" || !current || questionTimeoutFiredRef.current) {
        return;
      }
      questionTimeoutFiredRef.current = true;
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }

      const now = Date.now();
      const reactionMs = Math.min(
        timeLimitMs,
        Math.max(0, now - questionStartedAtRef.current)
      );
      const delta = computeScoreDelta({
        timeLimitMs,
        reactionMs,
        correct: opts.correct,
        timedOut: false,
      });

      pushRecordAndScore({
        questionId: current.id,
        correct: opts.correct,
        reactionMs,
        scoreDelta: delta,
        timedOut: false,
      });

      const wrongAnswer = !opts.correct;
      scheduleFeedback({
        feedback: { correct: opts.correct, delta, timedOut: false },
        wrongAnswer,
        questionTimedOut: false,
      });
    },
    [current, phase, pushRecordAndScore, scheduleFeedback, timeLimitMs]
  );

  const submitNumericAnswer = useCallback(
    (value: number) => {
      if (!current) return;
      commitAnswer({ correct: value === current.correct });
    },
    [commitAnswer, current]
  );

  const submitTrueFalse = useCallback(
    (userSaysTrue: boolean) => {
      if (!current || !trueFalse) return;
      commitAnswer({ correct: userSaysTrue === trueFalse.statementIsTrue });
    },
    [commitAnswer, current, trueFalse]
  );

  const submitChoiceIndex = useCallback(
    (index: number) => {
      if (!current || !multipleChoice) return;
      commitAnswer({ correct: index === multipleChoice.correctIndex });
    },
    [commitAnswer, current, multipleChoice]
  );

  useEffect(
    () => () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    },
    []
  );

  return {
    phase,
    score,
    current,
    multipleChoice,
    trueFalse,
    timeLimitMs,
    timeLeftMs,
    sessionLeftMs,
    completedCount,
    progressTotal: iterationsTotal,
    lastFeedback,
    submitNumericAnswer,
    submitTrueFalse,
    submitChoiceIndex,
  };
}
