import Image from "next/image";

// Respaldo estático (sin WebGL): render real de la propia escena 3D, para
// conservar la identidad del objeto. El fondo del render es el mismo walnut del
// hero, así compone sin costuras. El titular y el CTA siguen en HTML (en HeroV2).
export function HeroCoreFallback() {
  return (
    <div className="hv2-fallback" aria-hidden="true">
      <Image
        src="/hero/core-render.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: "center 46%" }}
      />
    </div>
  );
}
