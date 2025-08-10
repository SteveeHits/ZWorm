'use client';

import { useSettings } from "@/context/settings-context";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const ThemedBody = ({ children }: { children: React.ReactNode }) => {
  const { settings, isMounted } = useSettings();
  
  useEffect(() => {
    if (isMounted) {
      document.body.style.setProperty('--background-hsl', settings.backgroundColor);
      document.body.style.setProperty('--foreground-hsl', settings.textColor);
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
    <body 
      className={cn(
        "font-body antialiased",
        `theme-${settings.theme}`,
        settings.useGradient && 'use-gradient',
        settings.animation && settings.animation !== 'none' && `animation-${settings.animation}`,
      )}
      style={{
        backgroundColor: `hsl(${settings.backgroundColor})`,
        color: `hsl(${settings.textColor})`,
        '--gradient-from': settings.gradientFrom,
        '--gradient-to': settings.gradientTo,
      } as React.CSSProperties}
    >
      {children}
    </body>
  );
};