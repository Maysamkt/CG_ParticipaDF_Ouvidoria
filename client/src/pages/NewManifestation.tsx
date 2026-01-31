import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Send,
  Paperclip,
  Camera,
  Mic,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  AlertCircle,
} from "lucide-react";
import { useLocation } from "wouter";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import CameraCaptureModal from "@/components/CameraCaptureModal";
import AudioRecorder from "@/components/AudioRecorder";
import TagsInput from "@/components/TagsInput";
import LocationSearch from "@/components/LocationSearch";

import { API_BASE } from "@/lib/api.ts";

import { LocationPicker } from "@/components/LocationPicker";

type AttachmentType = "image" | "audio" | "video";

type AttachmentItem = {
  file: File;
  type: AttachmentType;
  preview?: string; // objectURL para img/audio/video
};

type IdentityMode = "anonymous" | "identify" | "login";

function inferType(file: File): AttachmentType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return "video";
}

function safeCreateObjectURL(file: File) {
  try {
    return URL.createObjectURL(file);
  } catch {
    return undefined;
  }
}

export default function NewManifestation() {
  const [, navigate] = useLocation();
  // Texto principal
  const [content, setContent] = useState("");

  // Metadados
  const [subjectLabel, setSubjectLabel] = useState("");
  const [administrativeRegion, setAdministrativeRegion] = useState("");
  const [locationDescription, setLocationDescription] = useState("");

  // Tags em chips
  const [tags, setTags] = useState<string[]>([]);

  // Geo via mapa
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);

  // Contato/anonimato

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [identityMode, setIdentityMode] = useState<IdentityMode>("anonymous");
  const [showIdentityChoice, setShowIdentityChoice] = useState(false);
  const anonymous = identityMode === "anonymous";

  // Anexos
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // UI
  const [loading, setLoading] = useState(false);

  // Avisos
  const [showSensitiveWarning, setShowSensitiveWarning] = useState(false);
  const [showAnonymousWarning, setShowAnonymousWarning] = useState(false);
  const [sensitiveDataTypes, setSensitiveDataTypes] = useState<string[]>([]);

  // Revisão final
  const [showReview, setShowReview] = useState(false);

  // Câmera
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");

  // ===== helpers =====
  const hasContent = useMemo(() => {
    return content.trim().length > 0 || attachments.length > 0;
  }, [content, attachments.length]);

  const counts = useMemo(() => {
    return attachments.reduce(
      (acc, a) => {
        acc[a.type] += 1;
        return acc;
      },
      { image: 0, audio: 0, video: 0 } as Record<AttachmentType, number>
    );
  }, [attachments]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      attachments.forEach(a => {
        if (a.preview) URL.revokeObjectURL(a.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFileAsAttachment = (file: File) => {
    const type = inferType(file);
    const preview = safeCreateObjectURL(file);

    setAttachments(prev => [...prev, { file, type, preview }]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return next;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(addFileAsAttachment);
    e.target.value = "";
  };

  // Detectar dados sensíveis (bem simples; você pode plugar seu detector real)
  const detectSensitive = (text: string) => {
    const types: string[] = [];
    if (/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/.test(text)) types.push("CPF");
    if (/\b\d{2}\.?\d{3}\.?\d{3}-?[0-9Xx]\b/.test(text)) types.push("RG");
    if (/\b(\+?55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}\b/.test(text))
      types.push("Telefone");
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text))
      types.push("Email");
    return Array.from(new Set(types));
  };

  const buildAutoSummary = () => {
    const parts: string[] = [];

    if (subjectLabel.trim()) parts.push(`Assunto: ${subjectLabel.trim()}`);

    const text = content.trim();
    if (text) {
      const oneLine = text.replace(/\s+/g, " ").slice(0, 220);
      parts.push(`Relato: ${oneLine}${text.length > 220 ? "..." : ""}`);
    }

    if (attachments.length) {
      const mediaBits = [
        counts.image ? `${counts.image} imagem(ns)` : null,
        counts.audio ? `${counts.audio} áudio(s)` : null,
        counts.video ? `${counts.video} vídeo(s)` : null,
      ].filter(Boolean);
      parts.push(`Anexos: ${mediaBits.join(", ")}`);
    }

    if (geo)
      parts.push(`Local: (${geo.lat.toFixed(6)}, ${geo.lng.toFixed(6)})`);
    if (administrativeRegion.trim())
      parts.push(`Região: ${administrativeRegion.trim()}`);
    if (locationDescription.trim())
      parts.push(`Referência: ${locationDescription.trim()}`);

    if (tags.length) parts.push(`Tags: ${tags.join(", ")}`);

    return parts.join("\n");
  };

  // ===== API =====
  async function apiCreateDraft(payload: FormData) {
    const res = await fetch(`${API_BASE}/v1/manifestations`, {
      method: "POST",
      body: payload,
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("create draft error:", res.status, err);
      throw new Error(err || "Falha ao criar manifestação (draft).");
    }
    return res.json();
  }

  async function apiAddAttachments(id: string, files: File[]) {
    const fd = new FormData();
    files.forEach(f => fd.append("files", f, f.name));

    const res = await fetch(`${API_BASE}/v1/manifestations/${id}/attachments`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("attachments error:", res.status, err);
      throw new Error(err || "Falha ao enviar anexos.");
    }
    return res.json();
  }

  async function apiSubmit(id: string) {
    const res = await fetch(`${API_BASE}/v1/manifestations/${id}/submit`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Falha ao finalizar manifestação.");
    return res.json() as Promise<{ protocol: string; status: string }>;
  }

  // ===== Fluxo =====
  const handleReviewAndSend = () => {
    if (!hasContent) return;

    // Sensível?
    const types = detectSensitive(content);
    if (types.length) {
      setSensitiveDataTypes(types);
      setShowSensitiveWarning(true);
      return;
    }

    // Anônimo?
    setShowIdentityChoice(true);
  };

  const handleContinueWithWarning = () => {
    setShowSensitiveWarning(false);

    if (anonymous) {
      setShowAnonymousWarning(true);
      return;
    }

    setShowReview(true);
  };

  const handleReviewAndSendAfterAnonymous = () => {
    setShowAnonymousWarning(false);
    setShowReview(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Cria draft com multipart/form-data
      const fd = new FormData();

      const hasText = content.trim().length > 0;
      const hasAtt = attachments.length > 0;

      if (hasText) fd.append("text", content.trim());

      // Se NÃO tem texto, mas tem anexos, manda o primeiro como "file" (contrato do POST)
      if (!hasText && hasAtt) {
        const first = attachments[0].file;
        fd.append("file", first, first.name);
      }

      fd.append("anonymous", anonymous ? "true" : "false");

      if (!anonymous) {
        if (contactName.trim()) fd.append("contact_name", contactName.trim());
        if (contactEmail.trim())
          fd.append("contact_email", contactEmail.trim());
        if (contactPhone.trim())
          fd.append("contact_phone", contactPhone.trim());
      }

      if (subjectLabel.trim()) fd.append("subject_label", subjectLabel.trim());
      if (tags.length) fd.append("complementary_tags", tags.join(", "));
      if (administrativeRegion.trim())
        fd.append("administrative_region", administrativeRegion.trim());
      if (locationDescription.trim())
        fd.append("location_description", locationDescription.trim());

      if (geo) {
        fd.append("location_lat", String(geo.lat));
        fd.append("location_lng", String(geo.lng));
      }

      const summary = buildAutoSummary();
      if (summary) fd.append("summary", summary);

      const draft = await apiCreateDraft(fd);

      // Anexos
      if (attachments.length) {
        const hasText = content.trim().length > 0;

        // Se não tinha texto, o primeiro já foi como "file" no draft, então envie o resto
        const filesToSend = hasText
          ? attachments.map(a => a.file)
          : attachments.slice(1).map(a => a.file);

        if (filesToSend.length) {
          await apiAddAttachments(draft.id, filesToSend);
        }
      }

      // Submit
      const final = await apiSubmit(draft.id);

      // navega direto para a página de protocolo
      navigate(`/protocolo/${final.protocol}`);
    } catch (e: any) {
      alert(e?.message ?? "Erro ao enviar manifestação.");
    } finally {
      setLoading(false);
    }
  };

  // ===== Câmera / Áudio / Busca =====
  const openCameraPhoto = () => {
    setCameraMode("photo");
    setIsCameraOpen(true);
  };

  const openCameraVideo = () => {
    setCameraMode("video");
    setIsCameraOpen(true);
  };

  const onCameraCaptured = (file: File) => {
    addFileAsAttachment(file);
  };

  const onAudioRecorded = (file: File) => {
    addFileAsAttachment(file);
  };

  const onPickLocation = (lat: number, lng: number, label: string) => {
    setGeo({ lat, lng });

    // Preenche o campo com o principal
    const short = (label.split(",")[0] || label).trim();
    setAdministrativeRegion(short);
  };

  // ===== UI =====
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <button
            onClick={() => {
              setShowReview(false);
              setShowSensitiveWarning(false);
              setShowAnonymousWarning(false);
              navigate("/");
            }}
            className="text-primary hover:text-primary/80 transition-colors"
            aria-label="Voltar para página inicial"
          >
            ← Voltar
          </button>

          <h1 className="heading-md text-primary">Nova Manifestação</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Camera modal */}
      <CameraCaptureModal
        open={isCameraOpen}
        mode={cameraMode}
        onClose={() => setIsCameraOpen(false)}
        onCaptured={onCameraCaptured}
      />

      {/* Review modal */}
      {showReview && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
          <div className="w-full max-w-lg bg-background rounded-xl border border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Revisar e enviar</h2>
                <p className="text-sm text-muted-foreground">
                  Confira as informações antes de gerar o protocolo.
                </p>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowReview(false)}
                aria-label="Fechar revisão"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {buildAutoSummary()}
                </pre>
              </div>

              {/* Escolha de identidade */}
              <div className="mt-4 rounded-lg border border-border p-4">
                <p className="text-sm font-semibold mb-2">
                  Como deseja enviar?
                </p>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="identity"
                      checked={identityMode === "anonymous"}
                      onChange={() => setIdentityMode("anonymous")}
                    />
                    <span className="text-sm">
                      Enviar anonimamente (apenas protocolo)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="identity"
                      checked={identityMode === "identify"}
                      onChange={() => setIdentityMode("identify")}
                    />
                    <span className="text-sm">
                      Identificar-me para acompanhamento
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowReview(false)}>
                Voltar e editar
              </Button>
              <Button
                onClick={async () => {
                  setShowReview(false);
                  await handleSubmit();
                }}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 container py-8 flex flex-col max-w-2xl mx-auto">
        <Card className="p-6 flex-1 flex flex-col">
          {/* Metadados */}
          <div className="mb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">
                  Detalhes (opcional)
                </p>
                <p className="text-xs text-muted-foreground">
                  Ajuda a classificar e encaminhar mais rápido
                </p>
              </div>

              <div className="grid gap-3">
                <div className="grid gap-1">
                  <label className="text-sm font-medium" htmlFor="subjectLabel">
                    Assunto
                  </label>
                  <input
                    id="subjectLabel"
                    value={subjectLabel}
                    onChange={e => setSubjectLabel(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Ex: Iluminação pública, Buraco na via, Atendimento..."
                  />
                </div>

                {/* Mapa */}
                <div className="grid gap-1">
                  <LocationPicker
                    latitude={geo?.lat ?? null}
                    longitude={geo?.lng ?? null}
                    onLocationSelect={(lat, lng, address, adminRegion) => {
                      setGeo({ lat, lng });

                      // Preenche o campo com o principal
                      if (address) {
                        const short = (address.split(",")[0] || address).trim();
                        setAdministrativeRegion(short);
                      }
                      if (adminRegion) {
                        setAdministrativeRegion(adminRegion);
                      }
                    }}
                  />

                  <div className="mt-2 text-xs text-muted-foreground">
                    {geo ? (
                      <>
                        Lat: {geo.lat.toFixed(6)} | Lng: {geo.lng.toFixed(6)}
                      </>
                    ) : (
                      <>Selecione um ponto no mapa (opcional).</>
                    )}
                  </div>
                </div>

                {/* Busca de localização */}
                <div className="relative z-60">
                  <LocationSearch
                    onLocationSelect={loc => {
                      const lat = Number(loc.lat);
                      const lng = Number(loc.lon);
                      const label = loc.display_name;

                      onPickLocation(lat, lng, label);
                    }}
                  />
                </div>

                {/* Região Administrativa como texto (preenchida pelo search, mas editável) */}
                <div className="grid gap-1">
                  <label
                    className="text-sm font-medium"
                    htmlFor="administrativeRegion"
                  >
                    Região Administrativa
                  </label>
                  <input
                    id="administrativeRegion"
                    value={administrativeRegion}
                    onChange={e => setAdministrativeRegion(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Ex: Ceilândia, Plano Piloto, Águas Claras..."
                  />
                </div>

                {/* Tags em chips */}
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Tags</label>
                  <TagsInput
                    value={tags}
                    onChange={setTags}
                    placeholder="Digite e use vírgula. Ex: trânsito, urgência, acessibilidade"
                  />
                </div>

                <div className="grid gap-1">
                  <label
                    className="text-sm font-medium"
                    htmlFor="locationDescription"
                  >
                    Descrição do local
                  </label>
                  <input
                    id="locationDescription"
                    value={locationDescription}
                    onChange={e => setLocationDescription(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Ex: Em frente ao mercado X, perto do ponto de ônibus..."
                  />
                </div>
              </div>
            </div>
            {/* Texto principal mais marcado */}
            <label
              htmlFor="content-textarea"
              className="block text-sm font-semibold mb-2"
            >
              Sua manifestação
            </label>
            <p id="content-help" className="text-xs text-muted-foreground mb-2">
              Descreva com detalhes. Você pode anexar foto, vídeo ou áudio.
            </p>
            <Textarea
              id="content-textarea"
              name="manifestation_text"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Descreva sua manifestação, sugestão ou reclamação..."
              className="min-h-[170px] resize-none text-base rounded-xl border-2 border-border px-4 py-3
                         focus:ring-4 focus:ring-primary/25 focus:border-primary/60"
              aria-describedby="content-help"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                {content.length} caracteres
              </p>
            </div>
          </div>

          {/* Preview de anexos */}
          {attachments.length > 0 && (
            <div className="mb-6 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Anexos ({attachments.length})
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((attachment, index) => (
                  <div
                    key={`${attachment.file.name}-${attachment.file.size}-${attachment.file.lastModified}`}
                    className="relative rounded-lg overflow-hidden bg-muted border border-border"
                  >
                    {attachment.type === "image" && attachment.preview ? (
                      <img
                        src={attachment.preview}
                        alt={`Imagem anexada: ${attachment.file.name}`}
                        className="w-full h-48 object-cover"
                      />
                    ) : attachment.type === "audio" && attachment.preview ? (
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2 text-sm">
                          <Music className="w-4 h-4" />
                          Áudio gravado
                        </div>
                        <audio
                          controls
                          src={attachment.preview}
                          className="w-full"
                        />
                      </div>
                    ) : attachment.type === "video" && attachment.preview ? (
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2 text-sm">
                          <Video className="w-4 h-4" />
                          Vídeo
                        </div>
                        <video
                          controls
                          src={attachment.preview}
                          className="w-full rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1"
                      aria-label={`Remover anexo ${index + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <p
                      className="text-xs text-muted-foreground p-2 truncate"
                      title={attachment.file.name}
                    >
                      {attachment.file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chips de conteúdo */}
          {hasContent && (
            <div
              className="mb-6 flex flex-wrap gap-2"
              role="status"
              aria-label="Resumo do conteúdo a ser enviado"
            >
              {content.trim().length > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    Texto
                  </span>
                </div>
              )}

              {counts.image > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                  <ImageIcon className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium text-accent">
                    {counts.image} Imagem{counts.image > 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {counts.audio > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
                  <Music className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-medium text-secondary">
                    {counts.audio} Áudio{counts.audio > 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {counts.video > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20">
                  <Video className="w-4 h-4 text-destructive" />
                  <span className="text-xs font-medium text-destructive">
                    {counts.video} Vídeo{counts.video > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex gap-2 mt-auto pt-6 border-t border-border flex-wrap">
            {/* Anexar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isCameraOpen}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                loading || isCameraOpen
                  ? "opacity-50 cursor-not-allowed"
                  : "border-border hover:bg-muted"
              }`}
              aria-label="Anexar arquivo"
              title="Anexar arquivo"
            >
              <Paperclip className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium hidden sm:inline">
                Anexar
              </span>
            </button>

            {/* Áudio */}
            <AudioRecorder onRecorded={onAudioRecorded} />

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,audio/*,video/*"
            />

            {/* Foto */}
            <button
              type="button"
              onClick={openCameraPhoto}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "border-border hover:bg-muted"
              }`}
              aria-label="Abrir câmera para foto"
              title="Tirar foto"
            >
              <Camera className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium hidden sm:inline">Foto</span>
            </button>

            {/* Vídeo */}
            <button
              type="button"
              onClick={openCameraVideo}
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                loading
                  ? "opacity-50 cursor-not-allowed"
                  : "border-border hover:bg-muted"
              }`}
              aria-label="Abrir câmera para vídeo"
              title="Gravar vídeo"
            >
              <Video className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium hidden sm:inline">
                Vídeo
              </span>
            </button>

            {/* Revisar e enviar */}
            <Button
              type="button"
              onClick={handleReviewAndSend}
              disabled={!hasContent || loading}
              className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-lg"
              aria-label="Revisar e enviar manifestação"
              title="Revisar e enviar"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Avançar
                </>
              )}
            </Button>
          </div>
        </Card>
      </main>

      {/* Modal de Alerta - Dados Sensíveis */}
      {showSensitiveWarning && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-labelledby="sensitive-dialog-title"
          aria-describedby="sensitive-dialog-desc"
          aria-modal="true"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setShowSensitiveWarning(false);
          }}
        >
          <Card className="max-w-md w-full p-6">
            <div className="flex gap-4 mb-6">
              <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-1" />
              <div>
                <h2
                  id="sensitive-dialog-title"
                  className="heading-md text-primary mb-2"
                >
                  Dados Sensíveis Detectados
                </h2>
                <p
                  id="sensitive-dialog-desc"
                  className="text-foreground/70 text-sm"
                >
                  Detectamos possíveis dados pessoais em sua mensagem:
                </p>
              </div>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold mb-3">Tipos encontrados:</p>
              <ul className="space-y-1">
                {sensitiveDataTypes.map(type => (
                  <li key={type} className="text-sm text-destructive">
                    • {type}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <p className="text-sm">
                <strong>Dica:</strong> Evite compartilhar CPF, RG, telefone ou
                endereço completo.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => setShowSensitiveWarning(false)}
                variant="outline"
                className="flex-1"
              >
                Editar
              </Button>
              <Button
                type="button"
                onClick={handleContinueWithWarning}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Continuar Mesmo Assim
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal "Como deseja enviar" */}
      {showIdentityChoice && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
          <div className="w-full max-w-lg bg-background rounded-xl border border-border p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  Como você quer enviar?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Você pode enviar anônimo ou se identificar para facilitar
                  retorno.
                </p>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowIdentityChoice(false)}
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <Button
                variant="default"
                className="justify-start"
                onClick={() => {
                  setIdentityMode("anonymous");
                  setShowIdentityChoice(false);
                  setShowReview(true);
                }}
              >
                Enviar como anônimo (mais rápido)
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setIdentityMode("identify")}
              >
                Me identificar (opcional)
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setIdentityMode("login")}
              >
                Entrar (demonstração)
              </Button>
            </div>

            {/* Identificar (campos aparecem só se escolher) */}
            {identityMode === "identify" && (
              <div className="mt-4 grid gap-3">
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Nome (opcional)</label>
                  <input
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Seu nome"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">
                    E-mail (opcional)
                  </label>
                  <input
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="voce@email.com"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-sm font-medium">
                    Telefone (opcional)
                  </label>
                  <input
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="(61) 9xxxx-xxxx"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIdentityMode("anonymous");
                      setContactName("");
                      setContactEmail("");
                      setContactPhone("");
                    }}
                  >
                    Voltar para anônimo
                  </Button>

                  <Button
                    onClick={() => {
                      setShowIdentityChoice(false);
                      setShowReview(true);
                    }}
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Login mock */}
            {identityMode === "login" && (
              <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm">
                  Login real fora do escopo do hackathon. Aqui é uma simulação.
                </p>
                <div className="mt-3 grid gap-2">
                  <Button
                    onClick={() => {
                      // mock: “preenche” um usuário fictício
                      setContactName("Cidadão(a) Autenticado(a)");
                      setContactEmail("usuario@exemplo.com");
                      setIdentityMode("identify");
                    }}
                  >
                    Entrar com gov.br (demo)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIdentityMode("identify");
                    }}
                  >
                    Entrar com e-mail (demo)
                  </Button>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIdentityMode("anonymous")}
                  >
                    Preferir anônimo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmação - Anonimato */}
      {showAnonymousWarning && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="anonymous-dialog-title"
          aria-describedby="anonymous-dialog-desc"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setShowAnonymousWarning(false);
          }}
        >
          <Card className="max-w-md w-full p-6">
            <div className="flex gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h2
                  id="anonymous-dialog-title"
                  className="heading-md text-primary mb-2"
                >
                  Envio anônimo
                </h2>
                <p
                  id="anonymous-dialog-desc"
                  className="text-foreground/70 text-sm"
                >
                  Você escolheu enviar esta manifestação como anônima.
                </p>
              </div>
            </div>

            <div className="bg-muted/60 border border-border rounded-lg p-4 mb-4">
              <p className="text-sm text-foreground">
                <strong>Atenção:</strong> o acompanhamento será apenas pelo{" "}
                <strong>número de protocolo</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowAnonymousWarning(false)}
              >
                Voltar e revisar
              </Button>
              <Button
                type="button"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleReviewAndSendAfterAnonymous}
              >
                Confirmar anonimato
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
