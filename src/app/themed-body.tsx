'use client';

import { useSettings } from "@/context/settings-context";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const ThemedBody = ({ children }: { children: React.ReactNode }) => {
  const { settings, isMounted } = useSettings();
  
  useEffect(() => {
    if (isMounted) {
      document.body.style.setProperty('--background', settings.backgroundColor);
      document.body.style.setProperty('--foreground', settings.textColor);
      document.body.style.setProperty('--gradient-from', settings.gradientFrom);
      document.body.style.setProperty('--gradient-to', settings.gradientTo);
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
    <body className={cn(
      "font-body antialiased",
      `theme-${settings.theme}`,
      settings.useGradient && 'use-gradient',
      settings.animation && `animation-${settings.animation}`,
    )}>
      {children}
    </body>
  );
};
