import { deleteCookie, getCookie, setCookie } from "cookies-next";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const auth = {
  getAccessToken: () => getCookie(ACCESS_TOKEN_KEY) as string | undefined,
  getRefreshToken: () => getCookie(REFRESH_TOKEN_KEY) as string | undefined,

  setTokens: (access: string, refresh: string) => {
    setCookie(ACCESS_TOKEN_KEY, access, { maxAge: 15 * 60 });
    setCookie(REFRESH_TOKEN_KEY, refresh, { maxAge: 7 * 24 * 60 * 60 });
  },

  clearTokens: () => {
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
  },
};
