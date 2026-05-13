import { Difficulty, Question, Operation } from "../types/game";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]): T {
  return items[randInt(0, items.length - 1)]!;
}

function evalOp(a: number, b: number, op: Operation): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return Math.floor(a / b);
    default: {
      const _exhaustive: never = op;
      return _exhaustive;
    }
  }
}

function expressionOf(q: Omit<Question, "id" | "correct" | "expression">): string {
  const sym =
    q.op === "*" ? "×" : q.op === "/" ? "÷" : q.op === "+" ? "+" : "−";
  return `${q.left} ${sym} ${q.right}`;
}

function operationsForDifficulty(difficulty: Difficulty): Operation[] {
  if (difficulty === "easy") {
    return pick<Operation[]>([
      ["+", "-"],
      ["+", "-", "*"],
    ]);
  }
  return ["+", "-", "*", "/"];
}

/** Build a solvable integer question for the given difficulty. */
export function generateQuestion(difficulty: Difficulty): Question {
  const opsPool = operationsForDifficulty(difficulty);
  const op = pick(opsPool);

  let left = 0;
  let right = 0;

  if (op === "+") {
    const max = difficulty === "easy" ? 20 : difficulty === "medium" ? 60 : 120;
    left = randInt(1, max);
    right = randInt(1, max);
  } else if (op === "-") {
    const max = difficulty === "easy" ? 25 : difficulty === "medium" ? 80 : 150;
    left = randInt(2, max);
    right = randInt(1, left - 1);
  } else if (op === "*") {
    if (difficulty === "easy") {
      left = randInt(2, 9);
      right = randInt(2, 9);
    } else if (difficulty === "medium") {
      left = randInt(3, 15);
      right = randInt(3, 15);
    } else {
      left = randInt(5, 25);
      right = randInt(5, 25);
    }
  } else {
    // division — integer result
    const divisor =
      difficulty === "easy"
        ? randInt(2, 9)
        : difficulty === "medium"
          ? randInt(3, 12)
          : randInt(4, 18);
    const quotient =
      difficulty === "easy"
        ? randInt(2, 9)
        : difficulty === "medium"
          ? randInt(3, 15)
          : randInt(5, 25);
    left = divisor * quotient;
    right = divisor;
  }

  const correct = evalOp(left, right, op);
  const expression = expressionOf({ left, right, op });
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  return { id, left, right, op, correct, expression };
}

/** Wrong answers for multiple choice — distinct from correct. */
export function buildMultipleChoiceOptions(
  correct: number,
  difficulty: Difficulty
): number[] {
  const spread =
    difficulty === "easy" ? 3 : difficulty === "medium" ? 8 : 15;
  const candidates = new Set<number>();
  candidates.add(correct);
  let guard = 0;
  while (candidates.size < 4 && guard < 50) {
    guard += 1;
    const delta = randInt(-spread * 2, spread * 2) || 1;
    const jitter = randInt(-spread, spread);
    const v = correct + delta + jitter;
    if (Number.isFinite(v) && v !== correct) {
      candidates.add(v);
    }
  }
  while (candidates.size < 4) {
    candidates.add(correct + candidates.size + 1);
  }
  const arr = [...candidates];
  // shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function trueFalseStatement(
  q: Question
): { shownResult: number; isStatementTrue: boolean; label: string } {
  const lie = Math.random() < 0.45;
  if (!lie) {
    return {
      shownResult: q.correct,
      isStatementTrue: true,
      label: `${q.expression} = ${q.correct}`,
    };
  }
  const wrong =
    q.correct + pick([-1, 1, -2, 2, 3, -3, 5, -5, 7, -7].map((d) => d));
  const shown = wrong === q.correct ? q.correct + 1 : wrong;
  return {
    shownResult: shown,
    isStatementTrue: false,
    label: `${q.expression} = ${shown}`,
  };
}
