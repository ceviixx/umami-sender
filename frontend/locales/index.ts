import de from "./lang/de.json"
import en from "./lang/en.json"
import fr from "./lang/fr.json"

export const translations = {
  de,
  en,
  fr,
  
};

export type Language = keyof typeof translations;
