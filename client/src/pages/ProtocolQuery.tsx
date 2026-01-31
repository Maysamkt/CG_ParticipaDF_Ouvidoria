import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import {
  getManifestationByProtocol,
  type ManifestationDetailResponse,
} from "@/lib/api";

export default function ProtocolQuery() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/protocolo/:protocol");

  const [searchProtocol, setSearchProtocol] = useState(params?.protocol || "");
  const [manifestation, setManifestation] =
    useState<ManifestationDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (params?.protocol) {
      setSearchProtocol(params.protocol);
      handleSearch(params.protocol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.protocol]);

  const handleSearch = async (protocol: string) => {
    if (!protocol.trim()) {
      toast.error("Por favor, digite um número de protocolo");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const result = await getManifestationByProtocol(protocol.trim());
      setManifestation(result);
    } catch {
      toast.error("Protocolo não encontrado");
      setManifestation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchProtocol);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <CheckCircle className="w-6 h-6 text-accent" />;
      case "draft":
        return <Clock className="w-6 h-6 text-secondary" />;
      default:
        return <AlertCircle className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "received":
        return "Recebida";
      case "draft":
        return "Rascunho";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container py-4">
          <button
            onClick={() => setLocation("/")}
            className="text-primary hover:text-primary/80 transition-colors mb-4"
          >
            ← Voltar
          </button>
          <h1 className="heading-md text-primary">Consultar Protocolo</h1>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 mb-8">
            <h2 className="heading-md text-primary mb-6">
              Busque sua manifestação
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Digite seu número de protocolo"
                  value={searchProtocol}
                  onChange={e => setSearchProtocol(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Search className="w-4 h-4" />
                  Buscar
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Digite o número de protocolo que você recebeu ao enviar sua
                manifestação
              </p>
            </form>
          </Card>

          {searched && loading && (
            <Card className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-foreground/70">Buscando protocolo...</p>
            </Card>
          )}

          {searched && !loading && manifestation && (
            <Card className="p-8">
              <div className="flex items-start gap-4 mb-8">
                {getStatusIcon(manifestation.status)}
                <div className="flex-1">
                  <h3 className="heading-md text-primary mb-2">
                    {getStatusLabel(manifestation.status)}
                  </h3>
                  <p className="text-foreground/70">
                    Status atual da sua manifestação
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Número de Protocolo
                  </p>
                  <p className="text-lg font-bold text-primary">
                    {manifestation.protocol}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Data de Envio
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(manifestation.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Tipo de entrada
                  </p>
                  <p className="text-sm text-foreground capitalize">
                    {manifestation.input_type}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Anexos</p>
                  <p className="text-sm text-foreground">
                    {manifestation.attachments_count}
                  </p>
                </div>

                {manifestation.subject_label && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Assunto
                    </p>
                    <p className="text-sm text-foreground">
                      {manifestation.subject_label}
                    </p>
                  </div>
                )}

                {manifestation.summary && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Resumo</p>
                    <p className="text-sm text-foreground">
                      {manifestation.summary}
                    </p>
                  </div>
                )}
              </div>

              {manifestation.extracted_text && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
                  <h4 className="font-semibold text-sm mb-3">
                    Texto extraído dos anexos
                  </h4>
                  <p className="text-sm text-foreground/70 whitespace-pre-wrap">
                    {manifestation.extracted_text}
                  </p>
                </div>
              )}

              <div className="mt-8">
                <Button
                  onClick={() => setLocation("/")}
                  variant="outline"
                  className="w-full"
                >
                  Voltar ao Início
                </Button>
              </div>
            </Card>
          )}

          {searched && !loading && !manifestation && (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="heading-md text-foreground mb-2">
                Protocolo não encontrado
              </h3>
              <p className="text-foreground/70 mb-6">
                Verifique se digitou corretamente.
              </p>
              <Button
                onClick={() => {
                  setSearchProtocol("");
                  setSearched(false);
                  setManifestation(null);
                }}
                variant="outline"
              >
                Tentar novamente
              </Button>
            </Card>
          )}

          {!searched && (
            <Card className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground/70">
                Digite seu protocolo para consultar o status
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
