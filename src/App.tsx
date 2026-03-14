import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Mission from "./pages/Mission";
import Team from "./pages/Team";
import Tutorial from "./pages/Tutorial";
import AppPage from "./pages/AppPage";
import ThemeEditor from "./pages/ThemeEditor";
import BehindTheMath from "./pages/BehindTheMath";
import NotFound from "./pages/NotFound";
import { DemoModeProvider } from "./contexts/DemoModeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DemoModeProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/team" element={<Team />} />
            <Route path="/tutorial" element={<Tutorial />} />
            <Route path="/app" element={<AppPage />} />
            <Route path="/theme-editor" element={<ThemeEditor />} />
            <Route path="/behind-the-math" element={<BehindTheMath />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DemoModeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
