import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Users, Lock } from "lucide-react";
import { useLocation } from "wouter";

/**
 * Página Home - Design Humanista e Acolhedor
 * Paleta: Azul-petróleo, Terra-ocre, Verde-menta, Coral-suave
 * Tipografia: Poppins (display) + Inter (body)
 */
export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header com navegação */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">OD</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">
                Ouvidoria Digital
              </h1>
              <p className="text-xs text-muted-foreground">Participa DF</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setLocation("/")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Início
            </button>
            <button
              onClick={() => setLocation("/acessibilidade")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Acessibilidade
            </button>
            <button
              onClick={() => setLocation("/gestao")}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Gestão
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />

        <img
          src="/images/hero-ouvidoria.png"
          alt="Pessoas compartilhando feedback"
          className="w-full h-[250px] md:h-[400px] object-cover object-center"
        />

        {/* Gradiente para suavizar a transição com o fundo */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative container py-12 md:py-20">
          <div className="max-w-2xl">
            <h2 className="heading-display text-primary mb-6">
              Sua voz importa
            </h2>

            <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
              Registre suas manifestações, sugestões e reclamações de forma
              simples, segura e inclusiva. Sem burocracia, sem complicações.
              Apenas você e suas ideias.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => setLocation("/nova")}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-lg"
              >
                Registrar Manifestação
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => setLocation("/protocolo")}
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/5 rounded-lg"
              >
                Consultar Protocolo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Benefícios */}
      <section className="py-20 bg-white">
        <div className="container">
          <h3 className="heading-lg text-center text-primary mb-16">
            Por que usar a Ouvidoria Digital?
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">
                Rápido e Simples
              </h4>
              <p className="text-sm text-foreground/70">
                Registre sua manifestação em poucos passos, sem formulários
                complexos.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-secondary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">
                Seguro e Privado
              </h4>
              <p className="text-sm text-foreground/70">
                Seus dados são protegidos. Opção de envio anônimo disponível.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-destructive/10 to-transparent border border-destructive/20 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Acessível</h4>
              <p className="text-sm text-foreground/70">
                Interface inclusiva com suporte a leitores de tela e alto
                contraste.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">
                Sua Voz Conta
              </h4>
              <p className="text-sm text-foreground/70">
                Contribua para melhorar os serviços públicos do Distrito
                Federal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container text-center">
          <h3 className="heading-lg text-primary mb-6">
            Pronto para compartilhar sua opinião?
          </h3>
          <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto">
            Comece agora mesmo. Leva menos de 2 minutos para registrar sua
            manifestação.
          </p>
          <Button
            onClick={() => setLocation("/nova")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-lg"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Ouvidoria Digital</h4>
              <p className="text-sm text-background/70">
                Plataforma de manifestações do Participa DF
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links Úteis</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setLocation("/acessibilidade")}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Acessibilidade
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/gestao")}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    Painel Administrativo
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Informações</h4>
              <p className="text-sm text-background/70">
                © 2026 Governo do Distrito Federal
                <br />
                Todos os direitos reservados
              </p>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm text-background/70">
            <p>Desenvolvido com acessibilidade e inclusão em mente</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
