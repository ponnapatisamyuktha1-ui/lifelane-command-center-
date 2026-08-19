import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster theme="dark" position="top-right" />
            <Home />
          </TooltipProvider>
        </ThemeProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
