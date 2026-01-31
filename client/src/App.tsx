import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Accessibility from "./pages/Accessibility";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import NewManifestation from "./pages/NewManifestation";
import ProtocolQuery from "./pages/ProtocolQuery";

/**
 * Ouvidoria Digital - Participa DF
 * Acessibilidade: WCAG 2.1 AA
 */

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/nova" component={NewManifestation} />
      <Route path="/protocolo/:protocol" component={ProtocolQuery} />
      <Route path="/protocolo" component={ProtocolQuery} />
      <Route path="/acessibilidade" component={Accessibility} />
      <Route path="/gestao" component={AdminDashboard} />
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AccessibilityProvider>
          <TooltipProvider>
            {/* Skip link: melhora navegação por teclado */}
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:shadow"
            >
              Pular para o conteúdo principal
            </a>

            <Toaster />

            <main id="main" tabIndex={-1} className="min-h-dvh">
              <Router />
            </main>
          </TooltipProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
