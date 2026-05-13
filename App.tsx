import "react-native-gesture-handler";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./src/context/ThemeContext";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  const tree = (
    <SafeAreaProvider style={styles.safe}>
      <ThemeProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );

  if (Platform.OS === "web") {
    return (
      <View style={styles.webBackdrop}>
        <View style={[styles.webPhoneShell, webShadow]}>{tree}</View>
      </View>
    );
  }

  return tree;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  webBackdrop: {
    flex: 1,
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#0f1716",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  webPhoneShell: {
    flex: 1,
    width: "100%",
    maxWidth: 390,
    maxHeight: 844,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
});

/** RN Web: sombra no está en ViewStyle de TypeScript; se aplica solo en web. */
const webShadow =
  Platform.OS === "web"
    ? ({
        boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
      } as object)
    : null;
