const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const auth = {
  getAccessToken: (): string | undefined => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;
  },

  getRefreshToken: (): string | undefined => {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
  },

  setTokens: (access: string, refresh: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },

  clearTokens: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
