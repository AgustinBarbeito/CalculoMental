import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { useTheme } from "../context/ThemeContext";
import { DIFFICULTY_LABEL, MODE_LABEL } from "../game/difficulty";
import type { RootStackParamList } from "../navigation/types";
import { loadBestScore } from "../storage/gameStorage";
import { radius, spacing } from "../theme/spacing";

type Nav = NativeStackNavigationProp<RootStackParamList, "Summary">;
type Rt = RouteProp<RootStackParamList, "Summary">;

export function SummaryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { colors } = useTheme();
  const { summary } = route.params;
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    void loadBestScore(summary.mode, summary.difficulty).then(setBest);
  }, [summary.difficulty, summary.mode]);

  const accuracy = useMemo(() => {
    if (summary.totalQuestions === 0) return 0;
    return Math.round((summary.correctCount / summary.totalQuestions) * 100);
  }, [summary.correctCount, summary.totalQuestions]);

  const endLabel =
    summary.endedReason === "completed"
      ? "Ronda completada"
      : summary.endedReason === "wrong"
        ? "Error (contra reloj)"
        : summary.endedReason === "time"
          ? "Tiempo agotado"
          : null;

  const statMini = (label: string, value: string) => (
    <View
      style={[
        styles.statMini,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.statMiniLabel, { color: colors.textMuted }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.statMiniVal, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  return (
    <Screen edges={["top", "left", "right", "bottom"]} contentStyle={styles.screenRoot}>
      <View style={styles.column}>
        <View style={styles.topBlock}>
          <Text style={[styles.title, { color: colors.text }]}>Ronda terminada</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={1}>
            {MODE_LABEL[summary.mode]} · {DIFFICULTY_LABEL[summary.difficulty]}
          </Text>
          {endLabel ? (
            <Text style={[styles.endPill, { color: colors.accent, backgroundColor: colors.accentSoft }]}>
              {endLabel}
            </Text>
          ) : null}
        </View>

        <View style={styles.mid}>
          <View style={[styles.scoreRow, { backgroundColor: colors.accentSoft }]}>
            <View style={styles.scoreMain}>
              <Text style={[styles.scoreK, { color: colors.textSecondary }]}>Puntaje</Text>
              <Text style={[styles.scoreNum, { color: colors.accent }]}>{summary.score}</Text>
            </View>
            {best != null ? (
              <View style={styles.scoreSide}>
                <Text style={[styles.scoreK, { color: colors.textSecondary }]}>Récord</Text>
                <Text style={[styles.scoreSideNum, { color: colors.text }]}>{best}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.grid}>
            {statMini("Precisión", `${accuracy}%`)}
            {statMini("Correctas", String(summary.correctCount))}
            {statMini("Incorrectas", String(summary.wrongCount))}
            {statMini("Timeouts", String(summary.timeoutCount))}
            {statMini("Preguntas", String(summary.totalQuestions))}
            {statMini("T. medio", `${summary.avgReactionMs} ms`)}
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label="Jugar otra vez"
            onPress={() =>
              navigation.reset({
                index: 1,
                routes: [{ name: "Home" }, { name: "Setup" }],
              })
            }
            style={styles.btn}
          />
          <PrimaryButton
            variant="ghost"
            label="Inicio"
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: "Home" }] })
            }
            style={styles.btnGhost}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  column: {
    flex: 1,
    gap: spacing.sm,
  },
  mid: {
    flex: 1,
    minHeight: 0,
    justifyContent: "center",
    gap: spacing.sm,
  },
  topBlock: {
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 13,
    fontWeight: "600",
  },
  endPill: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: "hidden",
    fontSize: 11,
    fontWeight: "800",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  scoreMain: { flex: 1, gap: 2 },
  scoreSide: { alignItems: "flex-end", gap: 2 },
  scoreK: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  scoreNum: { fontSize: 34, fontWeight: "900", lineHeight: 38 },
  scoreSideNum: { fontSize: 18, fontWeight: "800" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.xs,
    columnGap: spacing.xs,
  },
  statMini: {
    width: "31.5%",
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 2,
  },
  statMiniLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statMiniVal: { fontSize: 14, fontWeight: "800" },
  footer: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  btn: { paddingVertical: 12 },
  btnGhost: { paddingVertical: 10 },
});
