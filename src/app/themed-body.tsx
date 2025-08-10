'use client';

import { useSettings } from "@/context/settings-context";
import { cn } from "@/lib/utils";

export const ThemedBody = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSettings();

  return (
    <body 
      className={cn(
        "font-body antialiased",
        `theme-${settings.theme}`
      )}
    >
      {children}
    </body>
  );
};
