import { Difficulty, GameMode } from "../types/game";

export interface DifficultyProfile {
  /** Seconds allowed per operation (per-question cap). */
  timePerQuestionSec: number;
}

export const DIFFICULTY_PROFILE: Record<Difficulty, DifficultyProfile> = {
  easy: { timePerQuestionSec: 12 },
  medium: { timePerQuestionSec: 10 },
  hard: { timePerQuestionSec: 7 },
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

export const MODE_LABEL: Record<GameMode, string> = {
  classic: "Clásico",
  trueFalse: "Verdadero / Falso",
  multipleChoice: "Opción múltiple",
  continuousClock: "Contra reloj",
};

/** Emoji corto para tarjetas de modo en la configuración. */
export const MODE_EMOJI: Record<GameMode, string> = {
  classic: "⌨️",
  trueFalse: "⚖️",
  multipleChoice: "🎯",
  continuousClock: "⏱️",
};

export const MODE_DESCRIPTION: Record<GameMode, string> = {
  classic: "Teclado numérico: escribís el resultado.",
  trueFalse: "Indicás si la cuenta mostrada es verdadera o falsa.",
  multipleChoice: "Cuatro opciones: tocás la correcta.",
  continuousClock: "Racha bajo tiempo total; un error termina la ronda.",
};

export const DIFFICULTY_EMOJI: Record<Difficulty, string> = {
  easy: "🌿",
  medium: "⚡",
  hard: "🔥",
};

export const DIFFICULTY_DESCRIPTION: Record<Difficulty, string> = {
  easy: "Números acotados, más tiempo por operación.",
  medium: "Mezcla equilibrada de operaciones.",
  hard: "Mayor rango y menos tiempo por operación.",
};

export function bestScoreKey(mode: GameMode, difficulty: Difficulty): string {
  return `${mode}::${difficulty}`;
}
