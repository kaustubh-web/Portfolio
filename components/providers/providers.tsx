"use client";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={150}>
        <SmoothScroll>{children}</SmoothScroll>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
