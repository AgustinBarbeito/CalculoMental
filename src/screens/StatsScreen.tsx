import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { useTheme } from "../context/ThemeContext";
import { DIFFICULTY_LABEL, MODE_LABEL } from "../game/difficulty";
import { loadHistory } from "../storage/gameStorage";
import type { RoundSummary } from "../types/game";
import { radius, spacing } from "../theme/spacing";

export function StatsScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<RoundSummary[]>([]);

  useFocusEffect(
    useCallback(() => {
      void loadHistory().then(setItems);
    }, [])
  );

  return (
    <Screen>
      <Text style={[styles.title, { color: colors.text }]}>Historial</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Últimas rondas guardadas en el dispositivo.
      </Text>

      <FlatList
        data={items}
        keyExtractor={(it, idx) => `${it.endedAt}-${idx}`}
        contentContainerStyle={{ paddingBottom: spacing.xl, gap: spacing.sm }}
        ListEmptyComponent={
          <Text style={{ color: colors.textMuted, marginTop: spacing.lg }}>
            Todavía no hay partidas registradas.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {MODE_LABEL[item.mode]} · {DIFFICULTY_LABEL[item.difficulty]}
            </Text>
            <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
              Puntos:{" "}
              <Text style={{ color: colors.accent, fontWeight: "900" }}>
                {item.score}
              </Text>{" "}
              · {item.totalQuestions} preguntas · {item.correctCount} bien
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "900", marginBottom: spacing.xs },
  sub: { fontSize: 14, marginBottom: spacing.md },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: 6,
  },
  cardTitle: { fontSize: 15, fontWeight: "800" },
  cardMeta: { fontSize: 13, fontWeight: "600" },
});
