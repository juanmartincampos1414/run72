"use client";

import { useEffect, useState } from "react";

/** Input de precio que muestra el monto con separador de miles (es-AR: puntos). */
export function PriceInput({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  const [text, setText] = useState(value ? value.toLocaleString("es-AR") : "");
  useEffect(() => {
    setText(value ? value.toLocaleString("es-AR") : "");
  }, [value]);
  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "");
        const n = digits ? parseInt(digits, 10) : 0;
        setText(n ? n.toLocaleString("es-AR") : "");
        onChange(n);
      }}
      className={className}
      placeholder="0"
    />
  );
}
