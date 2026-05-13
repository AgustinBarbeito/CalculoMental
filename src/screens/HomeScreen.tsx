import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../theme/spacing";
import type { RootStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  return (
    <Screen>
      <View style={styles.topSpacer} />

      <View style={styles.hero}>
        <View
          style={[
            styles.accentLine,
            { backgroundColor: colors.accent },
          ]}
        />
        <Text style={[styles.kicker, { color: colors.textSecondary }]}>
          Entrenamiento local
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          🧠 Cálculo mental
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Precisión y velocidad, sin conexión a internet.
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.navigate("Setup")}
        style={({ pressed }) => [
          styles.ctaCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={[styles.ctaAccent, { backgroundColor: colors.accent }]} />
        <View style={styles.ctaBody}>
          <Text style={[styles.ctaTitle, { color: colors.text }]}>
            Nueva partida
          </Text>
          <Text style={[styles.ctaHint, { color: colors.textSecondary }]}>
            Elegí modo, dificultad y ronda en el siguiente paso
          </Text>
        </View>
        <Text style={[styles.ctaArrow, { color: colors.accent }]}>→</Text>
      </Pressable>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Text style={[styles.linksLabel, { color: colors.textMuted }]}>
        Más
      </Text>
      <View style={styles.links}>
        <Pressable
          onPress={() => navigation.navigate("Stats")}
          style={({ pressed }) => [
            styles.linkRow,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <Text style={styles.linkEmoji}>📊</Text>
          <View style={styles.linkTextWrap}>
            <Text style={[styles.linkTitle, { color: colors.text }]}>
              Historial
            </Text>
            <Text style={[styles.linkSub, { color: colors.textMuted }]}>
              Últimas rondas y desempeño
            </Text>
          </View>
          <Text style={[styles.linkChevron, { color: colors.textMuted }]}>
            ›
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Settings")}
          style={({ pressed }) => [
            styles.linkRow,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <Text style={styles.linkEmoji}>⚙️</Text>
          <View style={styles.linkTextWrap}>
            <Text style={[styles.linkTitle, { color: colors.text }]}>
              Ajustes
            </Text>
            <Text style={[styles.linkSub, { color: colors.textMuted }]}>
              Tema claro u oscuro
            </Text>
          </View>
          <Text style={[styles.linkChevron, { color: colors.textMuted }]}>
            ›
          </Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, minHeight: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topSpacer: { height: spacing.sm },
  hero: {
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  accentLine: {
    width: 48,
    height: 4,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  sub: {
    fontSize: 16,
    lineHeight: 23,
    marginTop: spacing.xs,
    maxWidth: 340,
  },
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  ctaAccent: {
    width: 5,
    alignSelf: "stretch",
  },
  ctaBody: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: 4,
  },
  ctaTitle: { fontSize: 19, fontWeight: "800" },
  ctaHint: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
  ctaArrow: {
    fontSize: 22,
    fontWeight: "700",
    paddingRight: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
    opacity: 0.85,
  },
  linksLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  links: { gap: spacing.sm },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  linkEmoji: { fontSize: 22 },
  linkTextWrap: { flex: 1, gap: 2 },
  linkTitle: { fontSize: 16, fontWeight: "800" },
  linkSub: { fontSize: 13, fontWeight: "600" },
  linkChevron: { fontSize: 22, fontWeight: "300" },
});
