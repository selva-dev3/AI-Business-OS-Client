export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  session: () => [...authKeys.all, "session"] as const,
} as const;
