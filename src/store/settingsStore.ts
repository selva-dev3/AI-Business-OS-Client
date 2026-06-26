import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CompanySettings } from "@/types/user";

interface SettingsState {
  company: CompanySettings | null;
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;

  setCompany: (company: CompanySettings) => void;
  setLanguage: (language: string) => void;
  setTimezone: (timezone: string) => void;
  setDateFormat: (dateFormat: string) => void;
  setCurrency: (currency: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      company: null,
      language: "en",
      timezone: "UTC",
      dateFormat: "MMM dd, yyyy",
      currency: "USD",

      setCompany: (company) => set({ company }),
      setLanguage: (language) => set({ language }),
      setTimezone: (timezone) => set({ timezone }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: "settings-storage",
    }
  )
);
