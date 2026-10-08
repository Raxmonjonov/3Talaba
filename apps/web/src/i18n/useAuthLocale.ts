import { useContext } from "react";
import { AuthLocaleContext } from "./authLocaleContext";

export function useAuthLocale() {
  const ctx = useContext(AuthLocaleContext);
  if (!ctx) {
    throw new Error("useAuthLocale must be used inside <AuthLocaleProvider>");
  }
  return ctx;
}
