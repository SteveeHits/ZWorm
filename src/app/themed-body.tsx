'use client';

import { useSettings } from "@/context/settings-context";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const ThemedBody = ({ children }: { children: React.ReactNode }) => {
  const { settings, isMounted } = useSettings();
  
  useEffect(() => {
    if (isMounted) {
      document.documentElement.style.setProperty('--background', settings.backgroundColor);
      document.documentElement.style.setProperty('--foreground', settings.textColor);
    }
  }, [settings, isMounted]);

  if (!isMounted) {
    return (
        <body className={cn("font-body antialiased")}>
          {children}
        </body>
    );
  }

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
