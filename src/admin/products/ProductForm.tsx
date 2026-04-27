import { useState } from "react";
import {
  Loader2,
  X,
  Upload,
  ImageIcon,
  Tag,
  DollarSign,
  Settings,
  Star,
  Eye,
  EyeOff,
  Check,
  Trash2,
} from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { optimizeProductImage, resolveProductImage } from "@/lib/productImage";
import { logAdminAction } from "@/lib/audit";
import { verifyImageMagicBytes } from "@/lib/sanitize";
import { convertImageToWebP } from "@/lib/imageConversion";

export const PRODUCT_GROUPS = ["Bebidas", "Mercearia", "Limpeza"] as const;
export type ProductGroup = (typeof PRODUCT_GROUPS)[number];

export interface ProductFormValue {
  id: string;
  name: string;
  category: string;
  details: string;
  price: number;
  price_retail: number | null;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  product_group: ProductGroup;
}

const productSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(200),
  category: z.string().trim().min(1, "Informe a categoria").max(80),
  details: z.string().trim().min(1, "Informe o volume/descrição").max(200),
  price: z.number().min(0, "Preço inválido").max(1_000_000),
  price_retail: z.number().min(0, "Preço avulso inválido").max(1_000_000).nullable(),
  sort_order: z.number().int().min(0).max(100000),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  product_group: z.enum(["Bebidas", "Mercearia", "Limpeza"]),
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface Props {
  initial: ProductFormValue;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ProductForm = ({ initial, isNew, onClose, onSaved }: Props) => {
  const [form, setForm] = useState({
    name: initial.name,
    category: initial.category,
    details: initial.details,
    price: initial.price,
    price_retail: initial.price_retail ?? null,
    sort_order: initial.sort_order,
    is_active: initial.is_active,
    is_featured: initial.is_featured,
    product_group: initial.product_group ?? "Bebidas",
  });
  const [imageUrl, setImageUrl] = useState<string | null>(initial.image_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const previewImage = imageUrl
    ? (() => {
        const resolved = resolveProductImage(imageUrl);
        return resolved.startsWith("http") ? optimizeProductImage(resolved, 400, 86) : resolved;
      })()
    : null;

  const handleUpload = async (file: File) => {
    if (uploading) return;
    if (file.size > MAX_IMAGE_SIZE) {
      setError("Imagem maior que 5MB.");
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Use JPG, PNG ou WEBP.");
      return;
    }
    if (!(await verifyImageMagicBytes(file))) {
      setError("Arquivo não é uma imagem válida.");
      return;
    }
    setError(null);
    setUploading(true);
    let webpFile: File;
    try {
      webpFile = await convertImageToWebP(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao converter imagem para WebP.");
      setUploading(false);
      return;
    }
    const safeName = form.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 40);
    const path = `${safeName || "produto"}-${crypto.randomUUID()}.webp`;
    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, webpFile, { cacheControl: "31536000", upsert: false, contentType: "image/webp" });
    if (upErr) {
      setError("Falha no upload: " + upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = productSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    const d = parsed.data;
    const payload = {
      name: d.name,
      category: d.category,
      details: d.details,
      price: d.price,
      price_retail: d.price_retail,
      sort_order: d.sort_order,
      is_active: d.is_active,
      is_featured: d.is_featured,
      product_group: d.product_group,
      image_url: imageUrl,
    };
    const { data: saved, error: dbErr } = isNew
      ? await supabase.from("products").insert(payload).select("id").single()
      : await supabase
          .from("products")
          .update(payload)
          .eq("id", initial.id)
          .select("id")
          .single();
    setSaving(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    void logAdminAction({
      action: isNew ? "create" : "update",
      entityType: "product",
      entityId: saved?.id ?? initial.id,
      metadata: { name: d.name, category: d.category, price: d.price },
    });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="absolute inset-0 bg-foreground/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card-hover animate-scale-in">
        {/* Header com gradiente sutil */}
        <div className="relative flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 via-card to-card px-6 py-4">
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-red shadow-red">
              {isNew ? (
                <ImageIcon className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              ) : (
                <Settings className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              )}
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-foreground sm:text-xl">
                {isNew ? "Novo produto" : "Editar produto"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isNew
                  ? "Adicione um item ao catálogo"
                  : `Editando "${initial.name}"`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground/60 transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="grid gap-6 p-6 md:grid-cols-[280px_1fr]">
            {/* COLUNA ESQUERDA — Imagem */}
            <div className="space-y-3">
              <SectionTitle icon={<ImageIcon className="h-3.5 w-3.5" />}>
                Imagem
              </SectionTitle>

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) void handleUpload(f);
                }}
                className={`group relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                  dragOver
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : imageUrl
                      ? "border-border bg-secondary/40 hover:border-primary/50"
                      : "border-border bg-secondary/40 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                {previewImage ? (
                  <>
                    <img
                      src={previewImage}
                      alt=""
                      className="h-full w-full object-contain p-3"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-foreground/70 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-bold text-foreground shadow-card">
                        <Upload className="h-3.5 w-3.5" /> Trocar imagem
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-4 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" strokeWidth={2.5} />
                    </span>
                    <p className="text-sm font-bold text-foreground">
                      Arraste a imagem aqui
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      ou clique para escolher · JPG, PNG, WEBP · até 5MB
                    </p>
                  </div>
                )}

                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card/90 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs font-bold text-foreground">
                        Enviando...
                      </span>
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUpload(f);
                  }}
                />
              </label>

              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground/70 transition-colors hover:border-destructive/50 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remover imagem
                </button>
              )}
            </div>

            {/* COLUNA DIREITA — Campos */}
            <div className="space-y-6">
              {/* Bloco: identificação */}
              <section className="space-y-4">
                <SectionTitle icon={<Tag className="h-3.5 w-3.5" />}>
                  Identificação
                </SectionTitle>

                <Field label="Nome do produto" required>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Coca-Cola"
                    className="input-pro"
                  />
                </Field>

                <Field label="Grupo" required>
                  <div className="grid grid-cols-3 gap-2">
                    {PRODUCT_GROUPS.map((g) => {
                      const active = form.product_group === g;
                      return (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setForm({ ...form, product_group: g })}
                          className={`relative overflow-hidden rounded-xl border-2 px-3 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all ${
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-foreground/60 hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          {active && (
                            <Check className="absolute right-1.5 top-1.5 h-3 w-3" strokeWidth={3} />
                          )}
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Categoria" required hint="Ex: Cerveja, Refrigerante">
                    <input
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Categoria"
                      className="input-pro"
                    />
                  </Field>
                  <Field label="Volume / descrição" required hint="Ex: 350ml lata">
                    <input
                      required
                      value={form.details}
                      onChange={(e) => setForm({ ...form, details: e.target.value })}
                      placeholder="Volume"
                      className="input-pro"
                    />
                  </Field>
                </div>
              </section>

              {/* Bloco: preços */}
              <section className="space-y-4">
                <SectionTitle icon={<DollarSign className="h-3.5 w-3.5" />}>
                  Preços
                </SectionTitle>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Revendedor"
                    required
                    badge={<span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-extrabold text-primary">PRINCIPAL</span>}
                    hint="Preço de atacado"
                  >
                    <PriceInput
                      value={form.price}
                      onChange={(v) => setForm({ ...form, price: v })}
                      required
                    />
                  </Field>
                  <Field
                    label="Avulso"
                    badge={<span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-extrabold text-foreground/60">OPCIONAL</span>}
                    hint="Deixe vazio se não vende avulso"
                  >
                    <PriceInput
                      value={form.price_retail}
                      onChange={(v) => setForm({ ...form, price_retail: v })}
                      placeholder="0,00"
                    />
                  </Field>
                </div>
              </section>

              {/* Bloco: visibilidade */}
              <section className="space-y-4">
                <SectionTitle icon={<Settings className="h-3.5 w-3.5" />}>
                  Visibilidade & Ordem
                </SectionTitle>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ToggleRow
                    icon={form.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    label="Produto ativo"
                    description="Visível no site público"
                    checked={form.is_active}
                    onChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  <ToggleRow
                    icon={<Star className="h-4 w-4" />}
                    label="Em destaque"
                    description="Aparece na página inicial"
                    checked={form.is_featured}
                    onChange={(v) => setForm({ ...form, is_featured: v })}
                  />
                </div>

                <Field label="Ordem de exibição" hint="Menor número aparece primeiro">
                  <input
                    type="number"
                    min="0"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                    className="input-pro w-32"
                  />
                </Field>
              </section>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-destructive text-[10px] font-extrabold text-destructive-foreground">
                    !
                  </span>
                  <p className="text-xs font-semibold text-destructive">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer fixo */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-card/95 px-6 py-4 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-bold text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center justify-center gap-2 rounded-full gradient-red px-8 py-2.5 text-sm font-bold text-primary-foreground shadow-red transition-all hover:shadow-red-strong disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" strokeWidth={3} />
              )}
              {isNew ? "Criar produto" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============= subcomponentes =============

const SectionTitle = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
      {icon}
    </span>
    <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-foreground/80">
      {children}
    </h3>
    <div className="h-px flex-1 bg-border" />
  </div>
);

const Field = ({
  label,
  children,
  required,
  hint,
  badge,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  badge?: React.ReactNode;
}) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/70">
        {label}
        {required && <span className="text-primary">*</span>}
      </label>
      {badge}
    </div>
    {children}
    {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
  </div>
);

const PriceInput = ({
  value,
  onChange,
  required,
  placeholder,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  required?: boolean;
  placeholder?: string;
}) => (
  <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2.5 transition-all hover:border-foreground/20 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
    <span className="shrink-0 text-sm font-extrabold leading-none text-muted-foreground">
      R$
    </span>
    <input
      required={required}
      type="number"
      step="0.01"
      min="0"
      placeholder={placeholder ?? "0,00"}
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? null : Number(v));
      }}
      className="min-w-0 flex-1 bg-transparent text-base font-extrabold text-foreground outline-none placeholder:text-muted-foreground/60"
    />
  </div>
);

const ToggleRow = ({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
      checked
        ? "border-primary/50 bg-primary/5"
        : "border-border bg-background hover:border-foreground/20"
    }`}
  >
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
        checked ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/50"
      }`}
    >
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
    <span
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-secondary"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-all ${
          checked ? "left-[18px]" : "left-0.5"
        }`}
      />
    </span>
  </button>
);