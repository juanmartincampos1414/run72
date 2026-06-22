import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* ---------- Service icons ---------- */
export const CodeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m8 8-4 4 4 4" />
    <path d="m16 8 4 4-4 4" />
    <path d="m13.5 6-3 12" />
  </svg>
);

export const SparkIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3v4" />
    <path d="m6.3 6.3 2.8 2.8" />
    <path d="M3 12h4" />
    <path d="M12 12l8 9" />
    <path d="M12 12 20 6" />
  </svg>
);

export const TargetIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </svg>
);

export const RocketIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 16c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.8-.8.9-2 .2-2.8-.7-.7-2-.6-3.2.8Z" />
    <path d="M9 15s.5-3 3-6c2.5-3 5-3.5 7.5-3.5C19.5 8 19 10.5 16 13c-3 2.5-6 3-6 3" />
    <path d="m15 9 .01 0" />
  </svg>
);

/* ---------- Ideal-for icons ---------- */
export const StartupIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 2 4 7v10l8 5 8-5V7l-8-5Z" />
    <path d="m12 7-4 2.5v5L12 17l4-2.5v-5L12 7Z" />
  </svg>
);

export const FounderIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
  </svg>
);

export const CompanyIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 21h16" />
    <path d="M6 21V5l8-3v19" />
    <path d="M14 9h4v12" />
    <path d="M9 7h0M9 11h0M9 15h0" />
  </svg>
);

export const ProductIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3.5 8 12 3l8.5 5v8L12 21l-8.5-5V8Z" />
    <path d="M3.5 8 12 13l8.5-5" />
    <path d="M12 13v8" />
  </svg>
);

export const ValidateIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
    <path d="m8.5 11 1.8 1.8 3.2-3.6" />
  </svg>
);

export const DigitalIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z" />
  </svg>
);

/* ---------- Utility icons ---------- */
export const ArrowRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const PlayIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m10 8.5 5 3.5-5 3.5Z" fill="currentColor" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m4 12 5 5L20 6" />
  </svg>
);

export const BoltIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
);

export const MailIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const LinkedInIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M7 10v7" />
    <path d="M7 7v.01" />
    <path d="M11 17v-4a2 2 0 0 1 4 0v4" />
    <path d="M11 17v-7" />
  </svg>
);

const map = {
  code: CodeIcon,
  spark: SparkIcon,
  target: TargetIcon,
  rocket: RocketIcon,
  startup: StartupIcon,
  founder: FounderIcon,
  company: CompanyIcon,
  product: ProductIcon,
  validate: ValidateIcon,
  digital: DigitalIcon,
} as const;

export type IconName = keyof typeof map;

export function Icon({ name, ...props }: { name: IconName } & IconProps) {
  const Cmp = map[name];
  return <Cmp {...props} />;
}
