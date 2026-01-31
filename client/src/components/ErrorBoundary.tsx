import { cn } from "@/lib/utils";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Evite enviar dados sensíveis.
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      const isProd = import.meta.env.PROD;

      return (
        <div className="flex items-center justify-center min-h-dvh p-6 bg-background">
          <div
            className="w-full max-w-2xl rounded-xl border bg-card p-6 shadow-sm"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle
                size={40}
                className="text-destructive flex-shrink-0"
                aria-hidden="true"
              />

              <div className="min-w-0">
                <h2 className="text-lg font-semibold">
                  Ocorreu um erro inesperado
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Você pode tentar recarregar a página. Se o problema continuar,
                  volte para a página inicial e tente novamente.
                </p>
              </div>
            </div>

            {!isProd && (
              <div className="mt-5 rounded-lg bg-muted p-4 overflow-auto">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Detalhes (apenas em desenvolvimento)
                </p>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {this.state.error?.stack || String(this.state.error)}
                </pre>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2",
                  "bg-primary text-primary-foreground hover:opacity-90"
                )}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Recarregar
              </button>

              <a
                href="/"
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2",
                  "border bg-background hover:bg-muted"
                )}
              >
                <Home size={16} aria-hidden="true" />
                Ir para o início
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
