"use client";

import {
  ACCESS_ITEMS,
  MATERIAL_ITEMS,
  REFERENCE_LIKES,
  SOCIAL_NETWORKS,
  type IntakeData,
  type TriState,
} from "@/lib/intake";
import { cn } from "@/lib/cn";

type Patch = (p: Partial<IntakeData>) => void;

const inp =
  "h-11 w-full rounded-xl border border-line bg-surface/60 px-3 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-brand-blue/60 focus:bg-surface-2";

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/[0.05] px-4 py-3 text-xs leading-relaxed text-muted">
      {children}
    </p>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-all",
        active
          ? "border-transparent bg-gradient-to-br from-brand-blue/20 to-brand-violet/15 text-fg ring-1 ring-brand-blue/50"
          : "border-line bg-surface/40 text-muted hover:border-line-strong hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function TriRadio({
  value,
  onChange,
  options = [
    { v: "si", l: "Sí" },
    { v: "no", l: "No" },
    { v: "unsure", l: "No estoy seguro" },
  ],
}: {
  value: TriState | "si" | "no" | null;
  onChange: (v: TriState) => void;
  options?: { v: string; l: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Pill key={o.v} active={value === o.v} onClick={() => onChange(o.v as TriState)}>
          {o.l}
        </Pill>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-xs text-muted"
    >
      <span
        className={cn(
          "flex h-4 w-7 items-center rounded-full p-0.5 transition-colors",
          on ? "bg-gradient-to-r from-brand-cyan to-brand-violet" : "bg-white/[0.1]",
        )}
      >
        <span className={cn("h-3 w-3 rounded-full bg-white transition-transform", on && "translate-x-3")} />
      </span>
      {label}
    </button>
  );
}

/* ============ Paso: Funcionalidades ============ */
export function IntakeFunctionalities({
  options,
  intake,
  onChange,
}: {
  options: string[];
  intake: IntakeData;
  onChange: Patch;
}) {
  function toggle(f: string) {
    onChange({
      functionalities: intake.functionalities.includes(f)
        ? intake.functionalities.filter((x) => x !== f)
        : [...intake.functionalities, f],
    });
  }
  function addCustom() {
    const v = prompt("Funcionalidad personalizada:");
    if (v?.trim()) onChange({ customFunctionalities: [...intake.customFunctionalities, v.trim()] });
  }

  return (
    <div className="grid gap-4">
      <Hint>Marcá lo que necesitás. Definir las funcionalidades desde el inicio evita bloqueos y acelera la entrega.</Hint>
      {options.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {options.map((f) => (
            <Pill key={f} active={intake.functionalities.includes(f)} onClick={() => toggle(f)}>
              {f}
            </Pill>
          ))}
        </div>
      ) : (
        <p className="text-sm text-faint">Elegí un tipo de proyecto para ver funcionalidades sugeridas.</p>
      )}
      {intake.customFunctionalities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {intake.customFunctionalities.map((f) => (
            <span key={f} className="rounded-full border border-brand-violet/40 bg-brand-violet/10 px-3 py-1.5 text-sm text-fg">
              {f}
            </span>
          ))}
        </div>
      )}
      <button type="button" onClick={addCustom} className="w-fit text-sm text-brand-cyan hover:underline">
        + Agregar funcionalidad personalizada
      </button>
    </div>
  );
}

/* ============ Paso: Lo que ya tenés ============ */
export function IntakeInfra({ intake, onChange }: { intake: IntakeData; onChange: Patch }) {
  const infra = intake.infra;
  const setInfra = (p: Partial<IntakeData["infra"]>) => onChange({ infra: { ...infra, ...p } });

  function toggleAccess(a: string) {
    onChange({
      access: intake.access.includes(a) ? intake.access.filter((x) => x !== a) : [...intake.access, a],
    });
  }
  function toggleSocial(n: string) {
    const cur = intake.social[n] ?? { active: false, user: "", url: "", access: false };
    onChange({ social: { ...intake.social, [n]: { ...cur, active: !cur.active } } });
  }
  function setSocial(n: string, p: Partial<{ user: string; url: string; access: boolean }>) {
    const cur = intake.social[n] ?? { active: true, user: "", url: "", access: false };
    onChange({ social: { ...intake.social, [n]: { ...cur, ...p } } });
  }

  return (
    <div className="grid gap-5">
      <Hint>Si ya tenés parte de tu infraestructura lista, podemos aprovecharla y avanzar más rápido.</Hint>

      {/* Dominio */}
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <p className="mb-2 text-sm font-medium">¿Ya tenés dominio?</p>
        <TriRadio value={infra.domain} onChange={(v) => setInfra({ domain: v })} />
        {infra.domain === "si" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Dominio actual"><input className={inp} value={infra.domainName} onChange={(e) => setInfra({ domainName: e.target.value })} placeholder="ej: mimarca.com" /></Field>
            <Field label="Proveedor"><input className={inp} value={infra.domainProvider} onChange={(e) => setInfra({ domainProvider: e.target.value })} placeholder="ej: GoDaddy, Nic.ar" /></Field>
            <div className="sm:col-span-2"><Toggle on={infra.domainAccess} onClick={() => setInfra({ domainAccess: !infra.domainAccess })} label="Tengo acceso al panel" /></div>
          </div>
        )}
      </div>

      {/* Hosting */}
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <p className="mb-2 text-sm font-medium">¿Ya tenés hosting?</p>
        <TriRadio value={infra.hosting} onChange={(v) => setInfra({ hosting: v })} />
        {infra.hosting === "si" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Proveedor"><input className={inp} value={infra.hostingProvider} onChange={(e) => setInfra({ hostingProvider: e.target.value })} /></Field>
            <Field label="Tipo de hosting"><input className={inp} value={infra.hostingType} onChange={(e) => setInfra({ hostingType: e.target.value })} placeholder="ej: compartido, VPS, Vercel" /></Field>
            <div className="sm:col-span-2"><Toggle on={infra.hostingAccess} onClick={() => setInfra({ hostingAccess: !infra.hostingAccess })} label="Tengo acceso" /></div>
          </div>
        )}
      </div>

      {/* Correo */}
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <p className="mb-2 text-sm font-medium">¿Ya usás correos corporativos?</p>
        <TriRadio value={infra.email} onChange={(v) => setInfra({ email: v as "si" | "no" })} options={[{ v: "si", l: "Sí" }, { v: "no", l: "No" }]} />
        {infra.email === "si" && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Proveedor"><input className={inp} value={infra.emailProvider} onChange={(e) => setInfra({ emailProvider: e.target.value })} placeholder="ej: Google Workspace" /></Field>
            <Field label="Cantidad de cuentas"><input className={inp} value={infra.emailAccounts} onChange={(e) => setInfra({ emailAccounts: e.target.value })} /></Field>
          </div>
        )}
      </div>

      {/* Presencia digital */}
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <p className="mb-1 text-sm font-medium">Presencia digital</p>
        <p className="mb-3 text-xs text-faint">Indicá tus redes existentes (las que tengas).</p>
        <div className="space-y-2">
          {SOCIAL_NETWORKS.map((n) => {
            const s = intake.social[n];
            const on = s?.active;
            return (
              <div key={n} className="rounded-xl border border-line bg-ink/40 p-3">
                <Toggle on={!!on} onClick={() => toggleSocial(n)} label={n} />
                {on && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <input className={inp} value={s?.user ?? ""} onChange={(e) => setSocial(n, { user: e.target.value })} placeholder="Usuario" />
                    <input className={inp} value={s?.url ?? ""} onChange={(e) => setSocial(n, { url: e.target.value })} placeholder="URL" />
                    <div className="sm:col-span-2"><Toggle on={!!s?.access} onClick={() => setSocial(n, { access: !s?.access })} label="Tengo acceso actualmente" /></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Accesos */}
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <p className="mb-1 text-sm font-medium">Accesos con los que ya contás</p>
        <p className="mb-3 text-xs text-faint">No pidas credenciales acá — solo marcá lo que tenés. Las pediremos después de forma segura.</p>
        <div className="flex flex-wrap gap-2">
          {ACCESS_ITEMS.map((a) => (
            <Pill key={a} active={intake.access.includes(a)} onClick={() => toggleAccess(a)}>{a}</Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ Paso: Marca y referencias ============ */
export function IntakeMaterial({ intake, onChange }: { intake: IntakeData; onChange: Patch }) {
  function toggleMaterial(m: string) {
    onChange({
      material: intake.material.includes(m) ? intake.material.filter((x) => x !== m) : [...intake.material, m],
    });
  }
  function addRef() {
    if (intake.references.length >= 5) return;
    onChange({ references: [...intake.references, { url: "", likes: [] }] });
  }
  function setRef(i: number, p: Partial<{ url: string; likes: string[] }>) {
    onChange({ references: intake.references.map((r, idx) => (idx === i ? { ...r, ...p } : r)) });
  }
  function removeRef(i: number) {
    onChange({ references: intake.references.filter((_, idx) => idx !== i) });
  }
  function toggleLike(i: number, like: string) {
    const r = intake.references[i];
    const likes = r.likes.includes(like) ? r.likes.filter((x) => x !== like) : [...r.likes, like];
    setRef(i, { likes });
  }

  return (
    <div className="grid gap-5">
      <Hint>Compartir referencias y material desde el inicio reduce cambios posteriores y mejora el resultado final.</Hint>

      {/* Material */}
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <p className="mb-1 text-sm font-medium">¿Ya contás con alguno de estos recursos?</p>
        <p className="mb-3 text-xs text-faint">Podés adjuntar los archivos en el paso de contexto.</p>
        <div className="flex flex-wrap gap-2">
          {MATERIAL_ITEMS.map((m) => (
            <Pill key={m} active={intake.material.includes(m)} onClick={() => toggleMaterial(m)}>{m}</Pill>
          ))}
        </div>
      </div>

      {/* Referencias que gustan */}
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <p className="mb-1 text-sm font-medium">Sitios web que te gustan</p>
        <p className="mb-3 text-xs text-faint">Hasta 5. Nos ayudan a entender tu visión.</p>
        <div className="space-y-3">
          {intake.references.map((r, i) => (
            <div key={i} className="rounded-xl border border-line bg-ink/40 p-3">
              <div className="flex gap-2">
                <input className={inp} value={r.url} onChange={(e) => setRef(i, { url: e.target.value })} placeholder="https://..." />
                <button type="button" onClick={() => removeRef(i)} className="shrink-0 text-xs text-faint hover:text-red-300">Quitar</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REFERENCE_LIKES.map((l) => (
                  <button key={l} type="button" onClick={() => toggleLike(i, l)}
                    className={cn("rounded-full px-2.5 py-1 text-xs transition-colors",
                      r.likes.includes(l) ? "bg-brand-blue/20 text-fg ring-1 ring-brand-blue/40" : "bg-white/[0.04] text-muted hover:text-fg")}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {intake.references.length < 5 && (
          <button type="button" onClick={addRef} className="mt-3 text-sm text-brand-cyan hover:underline">+ Agregar referencia</button>
        )}
      </div>

      {/* No gustan */}
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <p className="mb-3 text-sm font-medium">Sitios que NO te gustan</p>
        <input className={`${inp} mb-3`} value={intake.dislikeUrls} onChange={(e) => onChange({ dislikeUrls: e.target.value })} placeholder="URLs separadas por coma (opcional)" />
        <Field label="¿Qué te gustaría evitar?">
          <textarea className={`${inp} h-auto py-2`} rows={2} value={intake.avoid} onChange={(e) => onChange({ avoid: e.target.value })} />
        </Field>
      </div>

      {/* Comentarios */}
      <div className="rounded-2xl border border-line bg-surface/40 p-4">
        <Field label="¿Hay algo importante que debamos saber para construir tu proyecto exactamente como lo imaginás?">
          <textarea className={`${inp} h-auto py-2`} rows={3} value={intake.comments} onChange={(e) => onChange({ comments: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}
