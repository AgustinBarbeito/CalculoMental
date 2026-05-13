import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../theme/spacing";

interface TimerBarProps {
  totalMs: number;
  leftMs: number;
  label?: string;
}

export function TimerBar({ totalMs, leftMs, label }: TimerBarProps) {
  const { colors } = useTheme();
  const ratio = totalMs <= 0 ? 0 : Math.max(0, Math.min(1, leftMs / totalMs));
  const urgent = ratio < 0.25;

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: urgent ? colors.warning : colors.accent,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { fontSize: 13, fontWeight: "600" },
  track: {
    height: 10,
    borderRadius: radius.pill,
    overflow: "hidden",
    width: "100%",
  },
  fill: { height: "100%", borderRadius: radius.pill },
});
