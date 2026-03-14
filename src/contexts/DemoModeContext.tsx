import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface DemoModeContextType {
  isDemoMode: boolean;
}

const DemoModeContext = createContext<DemoModeContextType>({ isDemoMode: false });

export const useDemoMode = () => useContext(DemoModeContext);

export const DemoModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("mode") === "demo") {
      setIsDemoMode(true);
    }
  }, [location.search]);

  return (
    <DemoModeContext.Provider value={{ isDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
};
