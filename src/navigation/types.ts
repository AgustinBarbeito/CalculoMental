import { RoundConfig, RoundSummary } from "../types/game";

export type RootStackParamList = {
  Home: undefined;
  Setup: undefined;
  Game: RoundConfig;
  Summary: { summary: RoundSummary };
  Stats: undefined;
  Settings: undefined;
};
