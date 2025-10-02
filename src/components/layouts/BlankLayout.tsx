"use client";

import { Theme } from "@/types";
import { getBackgroundStyle } from "@/lib/themes";

interface BlankLayoutProps {
  theme: Theme;
}

export function BlankLayout({ theme }: BlankLayoutProps) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={getBackgroundStyle(theme)}
    >
      <div className="text-center">
        <p className="text-muted-foreground text-sm opacity-50">Blank Canvas</p>
        <p className="text-muted-foreground text-xs opacity-40 mt-2">
          Use annotations to add content
        </p>
      </div>
    </div>
  );
}
