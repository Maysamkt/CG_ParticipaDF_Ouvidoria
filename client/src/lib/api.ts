// API Ouvidoria Participa DF - alinhado ao OpenAPI (multipart + draft/attachments/submit)

export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "https://api.simplificagov.com";

async function readBody(res: Response) {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? await res.json() : await res.text();
}

// --------- Tipos (respostas) ---------

export type ManifestationStatus = "draft" | "received";

export type CreateDraftResponse = {
  id: string;
  status: ManifestationStatus;
  protocol?: string | null; // pode vir ausente ou null no draft (tolerante)
};

export type SubmitResponse = {
  protocol: string;
  status: "received";
};

export type AttachmentListItem = {
  id: string; // uuid
  type: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

export type AttachmentsListResponse = {
  protocol: string;
  attachments: AttachmentListItem[];
};

export type ManifestationDetailResponse = {
  protocol: string;
  status: ManifestationStatus;
  input_type: string;
  created_at: string;
  attachments_count: number;
  subject_label?: string | null;
  summary?: string | null;
  extracted_text?: string | null;
};

// --------- Tipos de entrada (contrato) ---------

export type DraftMeta = {
  // POST aceita text ou original_text; use um ou outro
  text?: string;
  original_text?: string;

  anonymous?: boolean;

  subject_id?: string | null;
  subject_label?: string | null;
  summary?: string | null;
  administrative_region?: string | null;

  // No OpenAPI: POST -> complementary_tags é string|null
  complementary_tags?: string | null;

  location_lat?: number | string | null;
  location_lng?: number | string | null;
  location_description?: string | null;

  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
};

// PATCH tem schema diferente: complementary_tags vira array
export type UpdateDraftBody = {
  original_text?: string | null;
  subject_id?: string | null;
  subject_label?: string | null;
  complementary_tags?: string[] | null; // PATCH
  summary?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  location_description?: string | null;
  administrative_region?: string | null;
  anonymous?: boolean | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
};

export type UpdateDraftResponse = {
  id: string;
  protocol: string | null;
  status: ManifestationStatus;
};

// --------- Admin list ---------

export type ManifestationListItem = {
  id: string;
  protocol: string | null;
  input_type: string;
  anonymous: boolean;
  status: ManifestationStatus;
  created_at: string; // ISO date
  attachments_count: number;
};

export type AdminManifestationsResponse = {
  total: number;
  page: number;
  per_page: number;
  items: ManifestationListItem[];
};

// --------- Helpers ---------

function appendIf(form: FormData, key: string, val: unknown) {
  if (val === undefined || val === null) return;
  const s = typeof val === "string" ? val.trim() : String(val);
  if (s === "") return;
  form.append(key, s);
}

function normalizeDecimal(val: number | string | null | undefined) {
  if (val === undefined || val === null) return val;
  if (typeof val === "string") return val.trim().replace(",", ".");
  return val;
}

// --------- Endpoints ---------

// POST /v1/manifestations (multipart/form-data) -> cria draft
export async function createManifestationDraft(
  meta: DraftMeta,
  file?: File
): Promise<CreateDraftResponse> {
  const hasText = !!(meta.text?.trim() || meta.original_text?.trim());
  const hasFile = !!file;

  if (!hasText && !hasFile) {
    throw new Error("Informe texto (text/original_text) ou anexe um arquivo.");
  }

  const fd = new FormData();

  // Conteúdo
  appendIf(fd, "text", meta.text);
  appendIf(fd, "original_text", meta.original_text);

  // Flags
  if (typeof meta.anonymous === "boolean") {
    fd.append("anonymous", String(meta.anonymous));
  }

  // Metadados
  appendIf(fd, "subject_id", meta.subject_id);
  appendIf(fd, "subject_label", meta.subject_label);
  appendIf(fd, "summary", meta.summary);
  appendIf(fd, "administrative_region", meta.administrative_region);
  appendIf(fd, "complementary_tags", meta.complementary_tags);

  // Localização (normaliza vírgula)
  appendIf(fd, "location_lat", normalizeDecimal(meta.location_lat));
  appendIf(fd, "location_lng", normalizeDecimal(meta.location_lng));
  appendIf(fd, "location_description", meta.location_description);

  // Contato (somente se NÃO for anônimo)
  if (!meta.anonymous) {
    appendIf(fd, "contact_name", meta.contact_name);
    appendIf(fd, "contact_email", meta.contact_email);
    appendIf(fd, "contact_phone", meta.contact_phone);
  }

  // Arquivo opcional
  if (file) fd.append("files", file);

  const res = await fetch(`${API_BASE}/v1/manifestations`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const body = await readBody(res);
    console.error("createManifestationDraft error", res.status, body);
    throw new Error("Erro ao criar manifestação");
  }

  return res.json();
}

// PATCH /v1/manifestations/{id} (json) -> atualiza draft
export async function updateManifestationDraft(
  manifestationId: string,
  body: UpdateDraftBody
): Promise<UpdateDraftResponse> {
  const res = await fetch(`${API_BASE}/v1/manifestations/${manifestationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await readBody(res);
    console.error("updateManifestationDraft error", res.status, err);
    throw new Error("Erro ao atualizar manifestação");
  }

  return res.json();
}

// POST /v1/manifestations/{id}/attachments (multipart) -> adiciona anexos (files[])
export async function addManifestationAttachments(
  manifestationId: string,
  files: File[]
): Promise<void> {
  if (!files.length) return;

  const fd = new FormData();
  files.forEach(f => fd.append("files", f)); // contrato: files (array)

  const res = await fetch(
    `${API_BASE}/v1/manifestations/${manifestationId}/attachments`,
    {
      method: "POST",
      body: fd,
    }
  );

  if (!res.ok) {
    const err = await readBody(res);
    console.error("addManifestationAttachments error", res.status, err);
    throw new Error("Erro ao enviar anexos");
  }
}

// POST /v1/manifestations/{id}/submit -> gera protocolo
export async function submitManifestation(
  manifestationId: string
): Promise<SubmitResponse> {
  const res = await fetch(
    `${API_BASE}/v1/manifestations/${manifestationId}/submit`,
    { method: "POST" }
  );

  if (!res.ok) {
    const err = await readBody(res);
    console.error("submitManifestation error", res.status, err);
    throw new Error("Erro ao finalizar manifestação");
  }

  return res.json();
}

// GET /v1/manifestations/{protocol}
export async function getManifestationByProtocol(
  protocol: string
): Promise<ManifestationDetailResponse> {
  const res = await fetch(
    `${API_BASE}/v1/manifestations/${encodeURIComponent(protocol)}`
  );

  if (!res.ok) {
    const err = await readBody(res);
    console.error("getManifestationByProtocol error", res.status, err);
    throw new Error("Erro ao consultar protocolo");
  }

  return res.json();
}

// GET /v1/manifestations/{protocol}/attachments
export async function listAttachments(
  protocol: string
): Promise<AttachmentsListResponse> {
  const res = await fetch(
    `${API_BASE}/v1/manifestations/${encodeURIComponent(protocol)}/attachments`
  );

  if (!res.ok) {
    const err = await readBody(res);
    console.error("listAttachments error", res.status, err);
    throw new Error("Erro ao listar anexos");
  }

  return res.json();
}

// GET /v1/admin/manifestations?page=&per_page=
export async function adminListManifestations(params?: {
  page?: number;
  per_page?: number;
}): Promise<AdminManifestationsResponse> {
  const page = params?.page ?? 1;
  const perPage = params?.per_page ?? 20;

  const url = new URL(`${API_BASE}/v1/admin/manifestations`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  const res = await fetch(url.toString());

  if (!res.ok) {
    const err = await readBody(res);
    console.error("adminListManifestations error", res.status, err);
    throw new Error("Erro ao listar manifestações (admin)");
  }

  return res.json();
}

// --------- Aliases (compatibilidade com imports antigos) ---------

// AdminDashboard.tsx (antigo)
export type { AdminManifestationsResponse as ManifestationListResponse };
export const listManifestations = adminListManifestations;

// ProtocolQuery.tsx (antigo)
export type ManifestationResponse = ManifestationDetailResponse;
export const getManifestation = getManifestationByProtocol;
