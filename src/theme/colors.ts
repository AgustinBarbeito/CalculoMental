/** Brand accent — user choice */
export const ACCENT = "#2F8886";

export type ColorScheme = "light" | "dark";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentContrast: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  warningSoft: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: "#F2FAF9",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  border: "#D5E8E6",
  text: "#153130",
  textSecondary: "#4A6664",
  textMuted: "#7A918F",
  accent: ACCENT,
  accentSoft: "#D9EFED",
  accentContrast: "#FFFFFF",
  success: "#2A9D6A",
  successSoft: "#DCF5E8",
  danger: "#C94C54",
  dangerSoft: "#FCE4E5",
  warning: "#D9A23C",
  warningSoft: "#FFF2D6",
  overlay: "rgba(21, 49, 48, 0.45)",
};

export const darkColors: ThemeColors = {
  background: "#0E1716",
  surface: "#162322",
  surfaceElevated: "#1E2E2C",
  border: "#2A3D3B",
  text: "#E9F4F3",
  textSecondary: "#A3B8B6",
  textMuted: "#6F8583",
  accent: ACCENT,
  accentSoft: "#1E3F3D",
  accentContrast: "#FFFFFF",
  success: "#4CD395",
  successSoft: "#14352A",
  danger: "#F07178",
  dangerSoft: "#3A1E22",
  warning: "#F0C14D",
  warningSoft: "#3A3010",
  overlay: "rgba(0, 0, 0, 0.55)",
};

export function getColors(scheme: ColorScheme): ThemeColors {
  return scheme === "dark" ? darkColors : lightColors;
}
