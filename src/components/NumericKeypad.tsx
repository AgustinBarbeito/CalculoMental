import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius, spacing } from "../theme/spacing";

interface NumericKeypadProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["⌫", "0", "OK"],
] as const;

export function NumericKeypad({
  value,
  onChange,
  onSubmit,
  disabled,
}: NumericKeypadProps) {
  const { colors } = useTheme();

  const handleKey = (k: string) => {
    if (disabled) return;
    if (k === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }
    if (k === "OK") {
      onSubmit();
      return;
    }
    if (value.length >= 5) return;
    const next = value === "" ? k : `${value}${k}`;
    onChange(next.replace(/^0+(?=\d)/, ""));
  };

  return (
    <View style={styles.wrap}>
      {ROWS.map((row) => (
        <View key={row.join("")} style={styles.row}>
          {row.map((k) => (
            <Pressable
              key={k}
              onPress={() => handleKey(k)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.key,
                {
                  backgroundColor:
                    k === "OK" ? colors.accent : colors.surfaceElevated,
                  borderColor: k === "OK" ? colors.accent : colors.border,
                  opacity: disabled ? 0.4 : pressed ? 0.88 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.keyText,
                  {
                    color:
                      k === "OK" ? colors.accentContrast : colors.text,
                  },
                ]}
              >
                {k}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: "row", gap: spacing.sm },
  key: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: { fontSize: 22, fontWeight: "600" },
});
