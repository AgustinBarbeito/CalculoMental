import AsyncStorage from "@react-native-async-storage/async-storage";
import { Difficulty, GameMode, RoundSummary } from "../types/game";
import { bestScoreKey } from "../game/difficulty";

const HISTORY_KEY = "@mental_math_history_v1";
const BEST_PREFIX = "@mental_math_best_v1::";

export async function loadHistory(): Promise<RoundSummary[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as RoundSummary[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendHistory(entry: RoundSummary): Promise<void> {
  const prev = await loadHistory();
  const next = [entry, ...prev].slice(0, 50);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export async function loadBestScore(
  mode: GameMode,
  difficulty: Difficulty
): Promise<number> {
  const raw = await AsyncStorage.getItem(BEST_PREFIX + bestScoreKey(mode, difficulty));
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export async function maybeUpdateBestScore(
  mode: GameMode,
  difficulty: Difficulty,
  score: number
): Promise<number> {
  const key = BEST_PREFIX + bestScoreKey(mode, difficulty);
  const prev = await loadBestScore(mode, difficulty);
  const next = Math.max(prev, score);
  if (next > prev) {
    await AsyncStorage.setItem(key, String(next));
  }
  return next;
}
