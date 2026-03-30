export type UnmuteConfig = {
  instructions: Instructions;
  voice: string;
  // The backend doesn't care about this, we use it for analytics
  voiceName: string;
  // The backend doesn't care about this, we use it for analytics
  isCustomInstructions: boolean;
};

// Will be overridden immediately by the voices fetched from the backend
export const DEFAULT_UNMUTE_CONFIG: UnmuteConfig = {
  instructions: {
    type: "smalltalk",
    language: "en/fr",
  },
  voice: "barack_demo.wav",
  voiceName: "Missing voice",
  isCustomInstructions: false,
};

export type LanguageCode = "en" | "fr" | "en/fr" | "fr/en";

export type ConstantInstructions = {
  type: "constant";
  text: string;
  language?: LanguageCode;
};

export type Instructions =
  | ConstantInstructions
  | { type: "smalltalk"; language?: LanguageCode }
  | { type: "guess_animal"; language?: LanguageCode }
  | { type: "quiz_show"; language?: LanguageCode };

