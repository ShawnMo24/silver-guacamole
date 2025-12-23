import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeMode = "day" | "dusk";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("day");

  useEffect(() => {
    const saved = localStorage.getItem("lpm-theme-mode") as ThemeMode | null;
    if (saved) {
      setMode(saved);
      document.documentElement.classList.toggle("dusk", saved === "dusk");
    }
  }, []);

  const toggleMode = () => {
    const newMode = mode === "day" ? "dusk" : "day";
    setMode(newMode);
    localStorage.setItem("lpm-theme-mode", newMode);
    document.documentElement.classList.toggle("dusk", newMode === "dusk");
  };

  return (
    <button
      onClick={toggleMode}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors",
        "border border-border/50 hover:border-mrsg-cyan/30",
        "text-muted-foreground hover:text-foreground"
      )}
      data-testid="button-theme-toggle"
    >
      {mode === "day" ? (
        <>
          <Sun className="h-3 w-3" />
          <span>Day</span>
        </>
      ) : (
        <>
          <Moon className="h-3 w-3" />
          <span>Dusk</span>
        </>
      )}
    </button>
  );
}
