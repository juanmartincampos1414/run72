import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX = 25 * 1024 * 1024; // 25 MB

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

/**
 * Extrae el TEXTO PLANO de un archivo adjunto (transcripción completa de la meet).
 * No persiste nada: devuelve el texto para que el admin lo revise/guarde desde la ficha.
 * Soporta .docx (Word) y .txt/.md/.vtt/.srt. .doc viejo (binario) no está soportado.
 */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Form inválido." }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "El archivo supera 25 MB." }, { status: 413 });
  }

  const ext = extOf(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  let text = "";
  try {
    if (ext === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value ?? "";
    } else if (["txt", "md", "vtt", "srt", "text"].includes(ext)) {
      text = buffer.toString("utf8");
    } else if (ext === "doc") {
      return NextResponse.json(
        { error: "El .doc viejo no se puede leer. Guardalo como .docx (Archivo → Guardar como → .docx) y subilo de nuevo." },
        { status: 415 },
      );
    } else {
      return NextResponse.json(
        { error: `Formato .${ext || "?"} no soportado. Subí un .docx o .txt.` },
        { status: 415 },
      );
    }
  } catch {
    return NextResponse.json({ error: "No pude leer el archivo. ¿Es un .docx válido?" }, { status: 422 });
  }

  // Normalizamos: colapsamos líneas en blanco de más, recortamos.
  text = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (text.length < 20) {
    return NextResponse.json(
      { error: "El archivo no tiene texto legible (¿está vacío o es solo imágenes?)." },
      { status: 422 },
    );
  }

  return NextResponse.json({ text, chars: text.length, name: file.name });
}
