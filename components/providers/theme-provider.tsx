"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Dark by default; the choice persists. The inline script sets the class
    on <html> before first paint, so there is no flash. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      themes={["dark", "light"]}
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
