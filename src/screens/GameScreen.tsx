import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { TimerBar } from "../components/TimerBar";
import { NumericKeypad } from "../components/NumericKeypad";
import { PrimaryButton } from "../components/PrimaryButton";
import { useTheme } from "../context/ThemeContext";
import { DIFFICULTY_LABEL, MODE_LABEL } from "../game/difficulty";
import { useGameSession } from "../hooks/useGameSession";
import type { RootStackParamList } from "../navigation/types";
import { appendHistory, maybeUpdateBestScore } from "../storage/gameStorage";
import type { RoundSummary } from "../types/game";
import { radius, spacing } from "../theme/spacing";

type Nav = NativeStackNavigationProp<RootStackParamList, "Game">;
type Rt = RouteProp<RootStackParamList, "Game">;

export function GameScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { colors } = useTheme();
  const config = route.params;

  const [input, setInput] = useState("");

  const onComplete = useCallback(
    (summary: RoundSummary) => {
      void (async () => {
        try {
          await appendHistory(summary);
          await maybeUpdateBestScore(
            summary.mode,
            summary.difficulty,
            summary.score
          );
        } catch {
          // local-only app: still show summary even if persistence fails
        }
        navigation.replace("Summary", { summary });
      })();
    },
    [navigation]
  );

  const game = useGameSession(config, onComplete);

  useEffect(() => {
    setInput("");
  }, [game.current?.id]);

  const playing = game.phase === "playing";
  const isContinuous = config.mode === "continuousClock";

  const sessionTotalMs = useMemo(() => {
    if (!isContinuous) return 0;
    const sec = config.totalSeconds ?? 90;
    return Math.max(15, Math.min(600, sec)) * 1000;
  }, [config.totalSeconds, isContinuous]);

  const progressLabel = isContinuous
    ? `Respondidas: ${game.completedCount}`
    : game.progressTotal
      ? `Pregunta ${game.completedCount + 1} / ${game.progressTotal}`
      : "";

  const submitClassic = () => {
    const n = parseInt(input, 10);
    if (Number.isNaN(n)) return;
    game.submitNumericAnswer(n);
  };

  return (
    <Screen>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {MODE_LABEL[config.mode]} · {DIFFICULTY_LABEL[config.difficulty]}
          </Text>
          <Text style={[styles.progress, { color: colors.textMuted }]}>
            {progressLabel}
          </Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
            Puntos
          </Text>
          <Text style={[styles.scoreVal, { color: colors.accent }]}>
            {game.score}
          </Text>
        </View>
      </View>

      {isContinuous && game.sessionLeftMs != null ? (
        <View style={{ marginBottom: spacing.md }}>
          <TimerBar
            totalMs={sessionTotalMs}
            leftMs={game.sessionLeftMs}
            label="Tiempo total"
          />
        </View>
      ) : null}

      <TimerBar
        totalMs={game.timeLimitMs}
        leftMs={game.timeLeftMs}
        label="Tiempo por operación"
      />

      <View style={{ height: spacing.lg }} />

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {(config.mode === "classic" || config.mode === "continuousClock") &&
        game.current ? (
          <>
            <Text style={[styles.expr, { color: colors.text }]}>
              {game.current.expression} = ?
            </Text>
            <View
              style={[
                styles.inputBox,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
            >
              <Text style={[styles.inputText, { color: colors.text }]}>
                {input || " "}
              </Text>
            </View>
            <NumericKeypad
              value={input}
              onChange={setInput}
              onSubmit={submitClassic}
              disabled={!playing}
            />
          </>
        ) : null}

        {config.mode === "trueFalse" && game.trueFalse ? (
          <>
            <Text style={[styles.expr, { color: colors.text, marginBottom: spacing.lg }]}>
              {game.trueFalse.label}
            </Text>
            <View style={styles.tfRow}>
              <PrimaryButton
                label="Verdadero"
                onPress={() => game.submitTrueFalse(true)}
                disabled={!playing}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                variant="danger"
                label="Falso"
                onPress={() => game.submitTrueFalse(false)}
                disabled={!playing}
                style={{ flex: 1 }}
              />
            </View>
          </>
        ) : null}

        {config.mode === "multipleChoice" && game.multipleChoice ? (
          <>
            <Text style={[styles.expr, { color: colors.text, marginBottom: spacing.lg }]}>
              {game.current?.expression} = ?
            </Text>
            <View style={styles.mcGrid}>
              {game.multipleChoice.options.map((opt, idx) => (
                <PrimaryButton
                  key={`${opt}-${idx}`}
                  variant="ghost"
                  label={String(opt)}
                  onPress={() => game.submitChoiceIndex(idx)}
                  disabled={!playing}
                  style={styles.mcBtn}
                />
              ))}
            </View>
          </>
        ) : null}
      </View>

      {game.phase === "feedback" && game.lastFeedback ? (
        <View
          style={[styles.feedback, { backgroundColor: colors.overlay }]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.feedbackCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.feedTitle, { color: colors.text }]}>
              {game.lastFeedback.timedOut
                ? "Tiempo agotado"
                : game.lastFeedback.correct
                  ? "Correcto"
                  : "Incorrecto"}
            </Text>
            <Text style={[styles.feedDelta, { color: colors.textSecondary }]}>
              {game.lastFeedback.delta > 0 ? "+" : ""}
              {game.lastFeedback.delta} pts
            </Text>
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  meta: { fontSize: 13, fontWeight: "700" },
  progress: { fontSize: 12, marginTop: 4 },
  scoreBox: { alignItems: "flex-end" },
  scoreLabel: { fontSize: 12, fontWeight: "700" },
  scoreVal: { fontSize: 28, fontWeight: "900" },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    flex: 1,
  },
  expr: { fontSize: 34, fontWeight: "800", textAlign: "center" },
  inputBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  inputText: { fontSize: 28, fontWeight: "800", textAlign: "center" },
  tfRow: { flexDirection: "row", gap: spacing.sm },
  mcGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  mcBtn: { width: "48%", flexGrow: 1 },
  feedback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  feedbackCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  feedTitle: { fontSize: 22, fontWeight: "900" },
  feedDelta: { fontSize: 16, fontWeight: "700" },
});
