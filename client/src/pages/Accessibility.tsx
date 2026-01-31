import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Volume2, Eye, Type, Zap, Hand } from "lucide-react";

/**
 * Página de Preferências de Acessibilidade
 * Design: Humanista e Acolhedor
 * Inclui: Alto contraste, fonte ampliada, redução de movimento, Libras
 */
export default function Accessibility() {
  const [, setLocation] = useLocation();
  const {
    settings,
    toggleHighContrast,
    setFontSize,
    toggleReduceMotion,
    resetSettings,
  } = useAccessibility();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container py-4">
          <button
            onClick={() => setLocation("/")}
            className="text-primary hover:text-primary/80 transition-colors mb-4"
          >
            ← Voltar
          </button>
          <h1 className="heading-md text-primary">
            Preferências de Acessibilidade
          </h1>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Alto Contraste */}
          <Card className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <Eye className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="heading-md text-primary mb-2">Alto Contraste</h2>
                <p className="text-foreground/70 text-sm">
                  Aumenta o contraste entre elementos para melhor legibilidade
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={() => toggleHighContrast()}
              />
              <label
                htmlFor="high-contrast"
                className="text-sm font-medium cursor-pointer flex-1"
              >
                {settings.highContrast ? "Ativado" : "Desativado"}
              </label>
            </div>
          </Card>

          {/* Tamanho da Fonte */}
          <Card className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <Type className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="heading-md text-primary mb-2">
                  Tamanho da Fonte
                </h2>
                <p className="text-foreground/70 text-sm">
                  Ajuste o tamanho do texto para melhor conforto visual
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { value: "normal" as const, label: "Normal" },
                { value: "large" as const, label: "Grande" },
                { value: "xlarge" as const, label: "Muito Grande" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFontSize(value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    settings.fontSize === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="font-semibold">{label}</span>
                  <p className="text-sm text-foreground/70 mt-1">
                    {value === "normal" && "Tamanho padrão"}
                    {value === "large" && "18px - Aumentado"}
                    {value === "xlarge" && "20px - Muito aumentado"}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Reduzir Movimento */}
          <Card className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <Zap className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="heading-md text-primary mb-2">
                  Reduzir Movimento
                </h2>
                <p className="text-foreground/70 text-sm">
                  Desativa animações e transições para reduzir desconforto
                  visual
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="reduce-motion"
                checked={settings.reduceMotion}
                onCheckedChange={() => toggleReduceMotion()}
              />
              <label
                htmlFor="reduce-motion"
                className="text-sm font-medium cursor-pointer flex-1"
              >
                {settings.reduceMotion ? "Ativado" : "Desativado"}
              </label>
            </div>
          </Card>

          {/* Libras */}
          <Card className="p-8 border-2 border-accent/30 bg-accent/5">
            <div className="flex items-start gap-4 mb-6">
              <Hand className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="heading-md text-accent mb-2">Libras </h2>
                <p className="text-foreground/70 text-sm">
                  Suporte a Língua Brasileira de Sinais para melhor inclusão de
                  pessoas surdas
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 mb-6 border border-accent/20 flex items-center justify-center min-h-48">
              <div className="text-center">
                <Hand className="w-12 h-12 text-accent/40 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Widget de Libras flutuante disponível na página
                </p>
                <p className="text-xs text-muted-foreground">
                  Para visualizar conteúdo em Língua de Sinais Brasileira,
                  clique no ícone do widget (icone de mão) localizado no lado
                  direito da tela.
                </p>
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-foreground/70">
                <strong>Sobre Libras:</strong> A Língua Brasileira de Sinais é a
                língua natural da comunidade surda brasileira. Permitindo que
                pessoas surdas acessem as informações de forma mais inclusiva e
                acessível.
              </p>
            </div>
          </Card>

          {/* Informações Adicionais */}
          <Card className="p-8 bg-accent/10 border border-accent/20">
            <h3 className="font-semibold mb-4">Dicas de Acessibilidade</h3>
            <ul className="space-y-3 text-sm text-foreground/70">
              <li>
                <strong>Navegação por teclado:</strong> Use Tab para navegar
                entre elementos e Enter para ativar
              </li>
              <li>
                <strong>Leitor de tela:</strong> A interface é totalmente
                compatível com leitores de tela como NVDA, JAWS e VoiceOver
              </li>
              <li>
                <strong>Foco visível:</strong> Todos os elementos interativos
                têm indicadores de foco claros e bem contrastados
              </li>
              <li>
                <strong>Contraste:</strong> Ative o modo de alto contraste para
                melhor legibilidade em qualquer ambiente
              </li>
              <li>
                <strong>Redução de movimento:</strong> Desative animações se
                tiver sensibilidade a movimento ou epilepsia fotossensível
              </li>
            </ul>
          </Card>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={resetSettings}
              variant="outline"
              className="flex-1"
            >
              Restaurar Padrões
            </Button>
            <Button
              onClick={() => setLocation("/")}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
