import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { useTheme } from "../context/ThemeContext";
import type { ThemeColors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import type { RootStackParamList } from "../navigation/types";
import {
  DIFFICULTY_DESCRIPTION,
  DIFFICULTY_EMOJI,
  DIFFICULTY_LABEL,
  MODE_DESCRIPTION,
  MODE_EMOJI,
  MODE_LABEL,
} from "../game/difficulty";
import type { Difficulty, GameMode } from "../types/game";

type Nav = NativeStackNavigationProp<RootStackParamList, "Setup">;

const MODES: GameMode[] = [
  "classic",
  "trueFalse",
  "multipleChoice",
  "continuousClock",
];
const DIFFS: Difficulty[] = ["easy", "medium", "hard"];

function StepBadge({ n, colors }: { n: number; colors: ThemeColors }) {
  return (
    <View style={[styles.badge, { backgroundColor: colors.accent }]}>
      <Text style={[styles.badgeText, { color: colors.accentContrast }]}>
        {n}
      </Text>
    </View>
  );
}

export function SetupScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  const [mode, setMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [iterations, setIterations] = useState(10);
  const [totalSeconds, setTotalSeconds] = useState(90);

  const isContinuous = mode === "continuousClock";
  const step2Ready = mode != null;
  const step3Ready = mode != null && difficulty != null;
  const canStart = step3Ready;

  const config = useMemo(() => {
    if (!mode || !difficulty) return null;
    return isContinuous
      ? { mode, difficulty, iterations: 1, totalSeconds }
      : { mode, difficulty, iterations };
  }, [difficulty, isContinuous, iterations, mode, totalSeconds]);

  const sectionShell = (disabled: boolean) => ({
    opacity: disabled ? 0.38 : 1,
  });

  return (
    <Screen scroll>
      <Text style={[styles.screenTitle, { color: colors.text }]}>
        Configurar partida
      </Text>
      <Text style={[styles.screenSub, { color: colors.textSecondary }]}>
        Tres pasos en esta pantalla: modo, dificultad e intensidad.
      </Text>

      {/* 1 · Modo */}
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.sectionHead}>
          <StepBadge n={1} colors={colors} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Modo de juego
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
              Elegí cómo vas a responder
            </Text>
          </View>
        </View>
        <View style={styles.modeGrid}>
          {MODES.map((m) => {
            const active = m === mode;
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={({ pressed }) => [
                  styles.modeTile,
                  {
                    borderColor: active ? colors.accent : colors.border,
                    backgroundColor: active
                      ? colors.accentSoft
                      : colors.surfaceElevated,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Text style={styles.modeEmoji}>{MODE_EMOJI[m]}</Text>
                <Text
                  style={[
                    styles.modeTitle,
                    { color: active ? colors.accent : colors.text },
                  ]}
                >
                  {MODE_LABEL[m]}
                </Text>
                <Text
                  style={[styles.modeDesc, { color: colors.textSecondary }]}
                  numberOfLines={3}
                >
                  {MODE_DESCRIPTION[m]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2 · Dificultad */}
      <View
        style={[
          styles.section,
          sectionShell(!step2Ready),
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        pointerEvents={step2Ready ? "auto" : "none"}
      >
        <View style={styles.sectionHead}>
          <StepBadge n={2} colors={colors} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Dificultad
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
              Tiempo por operación y tamaño de números
            </Text>
          </View>
        </View>
        <View style={styles.diffRow}>
          {DIFFS.map((d) => {
            const active = d === difficulty;
            return (
              <Pressable
                key={d}
                onPress={() => setDifficulty(d)}
                style={({ pressed }) => [
                  styles.diffTile,
                  {
                    borderColor: active ? colors.accent : colors.border,
                    backgroundColor: active
                      ? colors.accentSoft
                      : colors.surfaceElevated,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <Text style={styles.diffEmoji}>{DIFFICULTY_EMOJI[d]}</Text>
                <Text
                  style={[
                    styles.diffTitle,
                    { color: active ? colors.accent : colors.text },
                  ]}
                >
                  {DIFFICULTY_LABEL[d]}
                </Text>
                <Text
                  style={[styles.diffDesc, { color: colors.textSecondary }]}
                  numberOfLines={3}
                >
                  {DIFFICULTY_DESCRIPTION[d]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 3 · Intensidad */}
      <View
        style={[
          styles.section,
          sectionShell(!step3Ready),
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        pointerEvents={step3Ready ? "auto" : "none"}
      >
        <View style={styles.sectionHead}>
          <StepBadge n={3} colors={colors} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isContinuous ? "Tiempo total" : "Preguntas por ronda"}
            </Text>
            <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
              {isContinuous
                ? "Duración de la sesión; un error corta la ronda."
                : "Cuántas operaciones tendrá la ronda (1 a 30)."}
            </Text>
          </View>
        </View>

        {!isContinuous ? (
          <View style={styles.counterWrap}>
            <View style={styles.counterRow}>
              <PrimaryButton
                variant="ghost"
                label="−"
                onPress={() => setIterations((n) => Math.max(1, n - 1))}
                style={styles.counterBtn}
              />
              <View
                style={[
                  styles.counterDisplay,
                  { borderColor: colors.border, backgroundColor: colors.accentSoft },
                ]}
              >
                <Text style={[styles.counterVal, { color: colors.accent }]}>
                  {iterations}
                </Text>
              </View>
              <PrimaryButton
                variant="ghost"
                label="+"
                onPress={() => setIterations((n) => Math.min(30, n + 1))}
                style={styles.counterBtn}
              />
            </View>
          </View>
        ) : (
          <View style={styles.counterWrap}>
            <View style={styles.counterRow}>
              <PrimaryButton
                variant="ghost"
                label="−"
                onPress={() => setTotalSeconds((n) => Math.max(15, n - 15))}
                style={styles.counterBtn}
              />
              <View
                style={[
                  styles.counterDisplay,
                  { borderColor: colors.border, backgroundColor: colors.accentSoft },
                ]}
              >
                <Text style={[styles.counterVal, { color: colors.accent }]}>
                  {totalSeconds}s
                </Text>
              </View>
              <PrimaryButton
                variant="ghost"
                label="+"
                onPress={() => setTotalSeconds((n) => Math.min(600, n + 15))}
                style={styles.counterBtn}
              />
            </View>
          </View>
        )}
      </View>

      {!canStart ? (
        <Text style={[styles.hintFooter, { color: colors.textMuted }]}>
          Completá los pasos 1 y 2 para ajustar la intensidad y comenzar.
        </Text>
      ) : null}

      <View style={{ height: spacing.md }} />

      <PrimaryButton
        label="Comenzar"
        disabled={!canStart || !config}
        onPress={() => {
          if (config) navigation.navigate("Game", config);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenTitle: { fontSize: 26, fontWeight: "900", marginBottom: 4 },
  screenSub: { fontSize: 14, lineHeight: 20, marginBottom: spacing.lg },
  section: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 15, fontWeight: "900" },
  sectionTitle: { fontSize: 18, fontWeight: "900" },
  sectionSub: { fontSize: 13, fontWeight: "600", marginTop: 2, lineHeight: 18 },
  modeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  modeTile: {
    width: "48%",
    flexGrow: 1,
    minWidth: 148,
    borderRadius: radius.md,
    borderWidth: 2,
    padding: spacing.md,
    gap: 6,
  },
  modeEmoji: { fontSize: 22 },
  modeTitle: { fontSize: 15, fontWeight: "800" },
  modeDesc: { fontSize: 12, lineHeight: 16, fontWeight: "600" },
  diffRow: { flexDirection: "row", gap: spacing.sm },
  diffTile: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
    gap: 4,
    minHeight: 120,
  },
  diffEmoji: { fontSize: 20 },
  diffTitle: { fontSize: 14, fontWeight: "900", textAlign: "center" },
  diffDesc: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  counterWrap: { alignItems: "center" },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  counterBtn: { width: 56, minHeight: 52, paddingVertical: spacing.sm },
  counterDisplay: {
    minWidth: 100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  counterVal: { fontSize: 26, fontWeight: "900" },
  hintFooter: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
});
