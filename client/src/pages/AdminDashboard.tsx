import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  adminListManifestations,
  type AdminManifestationsResponse,
  type ManifestationListItem,
} from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, MessageSquare, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<AdminManifestationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await adminListManifestations({ page, per_page: 10 });
      setData(result);
    } catch (error) {
      toast.error("Erro ao carregar dados administrativos");
      console.error(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const items = data?.items ?? [];

  // Derivados a partir da página atual
  const anonymousCount = useMemo(
    () => items.filter(i => i.anonymous).length,
    [items]
  );

  const byInputType = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const it of items) {
      const key = it.input_type || "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
    }
    return acc;
  }, [items]);

  const chartData = useMemo(
    () =>
      Object.entries(byInputType).map(([name, value]) => ({
        name,
        value,
      })),
    [byInputType]
  );

  const anonPercentage = useMemo(() => {
    const denom = items.length || 1;
    return Math.round((anonymousCount / denom) * 100);
  }, [anonymousCount, items.length]);

  const COLORS = ["#1e5a7a", "#4ecdc4", "#c9a961", "#ff6b6b", "#2d8b9e"];

  const statusLabel = (status: string) => {
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
          <h1 className="heading-md text-primary">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Visualização de manifestações e estatísticas operacionais
          </p>
        </div>
      </header>

      <main className="container py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-foreground/70">Carregando dados...</p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total (API)
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {data.total}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      (Nesta página: {items.length})
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-accent" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Anônimas (nesta página)
                    </p>
                    <p className="text-3xl font-bold text-secondary">
                      {anonymousCount}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {anonPercentage}% da página
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-secondary" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Tipos (nesta página)
                    </p>
                    <p className="text-3xl font-bold text-destructive">
                      {Object.keys(byInputType).length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      diferentes tipos
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-destructive" />
                </div>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="heading-md text-primary mb-6">
                  Manifestações por Tipo (página atual)
                </h3>

                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8e6e3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#1e5a7a"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">
                    Sem dados
                  </p>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="heading-md text-primary mb-6">
                  Distribuição de Anonimato (página atual)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Identificado",
                          value: items.length - anonymousCount,
                        },
                        { name: "Anônimo", value: anonymousCount },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      <Cell fill="#1e5a7a" />
                      <Cell fill="#4ecdc4" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Tabela */}
            <Card className="p-6">
              <h3 className="heading-md text-primary mb-6">
                Últimas Manifestações
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Protocolo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Tipo
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Anonimato
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">
                        Data
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item: ManifestationListItem) => (
                      <tr
                        key={item.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-primary">
                          {item.protocol ?? "-"}
                        </td>
                        <td className="py-3 px-4 capitalize">
                          {item.input_type ?? "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                            {statusLabel(item.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {item.anonymous ? "Sim" : "Não"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Página {page} • Exibindo até 10 manifestações
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    variant="outline"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={items.length < 10}
                    variant="outline"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-foreground/70">Erro ao carregar dados</p>
            <Button onClick={loadData} variant="outline" className="mt-4">
              Tentar Novamente
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
