import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../theme/spacing";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "solid" | "ghost" | "danger";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  variant = "solid",
  disabled,
  style,
}: PrimaryButtonProps) {
  const { colors } = useTheme();
  const bg =
    variant === "solid"
      ? colors.accent
      : variant === "danger"
        ? colors.danger
        : "transparent";
  const fg =
    variant === "solid" || variant === "danger"
      ? colors.accentContrast
      : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
          borderWidth: variant === "ghost" ? 2 : 0,
          borderColor: variant === "ghost" ? colors.border : "transparent",
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 17, fontWeight: "600" },
});
