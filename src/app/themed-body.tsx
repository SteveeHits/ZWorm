'use client';

import { useSettings } from "@/context/settings-context";
import { cn } from "@/lib/utils";

export const ThemedBody = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSettings();

  return (
    <body 
      className={cn(
        "font-body antialiased",
        settings.theme,
        "animations-enabled",
        settings.backgroundAnimationsEnabled && 'background-animations-enabled'
      )}
      style={{
        backgroundImage: settings.backgroundAnimationsEnabled 
          ? `linear-gradient(-45deg, hsl(var(--background)), hsl(var(--muted)), hsl(var(--background)))`
          : 'none'
      }}
    >
      {children}
    </body>
  );
};
