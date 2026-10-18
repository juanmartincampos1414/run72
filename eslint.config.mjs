import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "run72-os/**",
      "public/**",
    ],
  },
  {
    // Las reglas estrictas del plugin react-hooks (React 19) marcan como error
    // lecturas intencionales de APIs del navegador tras montar (matchMedia,
    // localStorage, IntersectionObserver) y accesos a refs. Son avisos útiles,
    // no bugs en estos patrones SSR-safe: las dejamos como warning.
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
];

export default eslintConfig;
