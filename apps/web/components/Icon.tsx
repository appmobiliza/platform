import type { IconName } from "./types";

export function Icon({ name }: { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  return (
    <svg aria-hidden className="mz-icon" viewBox="0 0 24 24">
      {name === "dashboard" && (
        <>
          <rect {...common} height="7" width="7" x="3" y="3" />
          <rect {...common} height="7" width="7" x="14" y="3" />
          <rect {...common} height="7" width="7" x="3" y="14" />
          <rect {...common} height="7" width="7" x="14" y="14" />
        </>
      )}
      {name === "file" && (
        <>
          <path
            {...common}
            d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"
          />
          <path {...common} d="M14 3v5h5" />
        </>
      )}
      {name === "users" && (
        <>
          <path {...common} d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle {...common} cx="9.5" cy="7" r="4" />
          <path {...common} d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path {...common} d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )}
      {name === "user" && (
        <>
          <path {...common} d="M20 21a8 8 0 0 0-16 0" />
          <circle {...common} cx="12" cy="7" r="4" />
        </>
      )}
      {name === "chart" && (
        <>
          <path {...common} d="M4 20V10" />
          <path {...common} d="M10 20V4" />
          <path {...common} d="M16 20v-7" />
          <path {...common} d="M22 20H2" />
        </>
      )}
      {name === "settings" && (
        <>
          <path {...common} d="M21 4h-7" />
          <path {...common} d="M10 4H3" />
          <path {...common} d="M21 12h-9" />
          <path {...common} d="M8 12H3" />
          <path {...common} d="M21 20h-5" />
          <path {...common} d="M12 20H3" />
          <circle {...common} cx="12" cy="4" r="2" />
          <circle {...common} cx="10" cy="12" r="2" />
          <circle {...common} cx="14" cy="20" r="2" />
        </>
      )}
      {name === "alert" && (
        <>
          <path {...common} d="m12 3 10 18H2z" />
          <path {...common} d="M12 9v4" />
          <path {...common} d="M12 17h.01" />
        </>
      )}
      {name === "clock" && (
        <>
          <circle {...common} cx="12" cy="12" r="9" />
          <path {...common} d="M12 7v5l3 2" />
        </>
      )}
      {name === "pulse" && <path {...common} d="M3 12h4l2-6 4 12 2-6h6" />}
      {name === "chevron" && <path {...common} d="m8 10 4 4 4-4" />}
      {name === "pin" && (
        <>
          <path
            {...common}
            d="M12 21s7-6.25 7-12a7 7 0 1 0-14 0c0 5.75 7 12 7 12z"
          />
          <circle {...common} cx="12" cy="9" r="2" />
        </>
      )}
    </svg>
  );
}
