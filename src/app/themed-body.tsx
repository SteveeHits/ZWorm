'use client';

import { useSettings } from "@/context/settings-context";
import { cn } from "@/lib/utils";

export const ThemedBody = ({ children }: { children: React.ReactNode }) => {
  const { settings, isMounted } = useSettings();
  
  if (!isMounted) {
    return (
        <body className={cn(
            "font-body antialiased",
            `theme-${'violet'}`
          )}>
            {children}
          </body>
    );
  }

  return (
    <body className={cn(
      "font-body antialiased",
      `theme-${settings.theme}`
    )}>
      {children}
    </body>
  );
};
