import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { useTheme, ThemePreference } from "../context/ThemeContext";
import { radius, spacing } from "../theme/spacing";

const OPTIONS: { key: ThemePreference; label: string; hint: string }[] = [
  { key: "system", label: "Sistema", hint: "Sigue a claro/oscuro del teléfono" },
  { key: "light", label: "Claro", hint: "Fondo pastel, buen contraste diurno" },
  { key: "dark", label: "Oscuro", hint: "Menos brillo, mismos acentos" },
];

export function SettingsScreen() {
  const { colors, preference, setPreference } = useTheme();

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>Apariencia</Text>

      <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
        {OPTIONS.map((o) => {
          const active = preference === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => setPreference(o.key)}
              style={[
                styles.row,
                {
                  borderColor: active ? colors.accent : colors.border,
                  backgroundColor: active ? colors.accentSoft : colors.surface,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>
                  {o.label}
                </Text>
                <Text style={[styles.rowHint, { color: colors.textMuted }]}>
                  {o.hint}
                </Text>
              </View>
              <View
                style={[
                  styles.dot,
                  {
                    borderColor: active ? colors.accent : colors.border,
                    backgroundColor: active ? colors.accent : "transparent",
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "900", marginBottom: spacing.xs },
  row: {
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  rowTitle: { fontSize: 16, fontWeight: "800" },
  rowHint: { fontSize: 13, marginTop: 4, fontWeight: "600" },
  dot: { width: 18, height: 18, borderRadius: 999, borderWidth: 2 },
});
