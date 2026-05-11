export type IconName =
  | "dashboard"
  | "file"
  | "users"
  | "user"
  | "chart"
  | "settings"
  | "alert"
  | "clock"
  | "pulse"
  | "chevron"
  | "pin";

export type SidebarKey =
  | "overview"
  | "services"
  | "fellows"
  | "students"
  | "reports"
  | "settings";

export type NavItem = {
  key: SidebarKey;
  label: string;
  icon: IconName;
  href: string;
};

export type Tone = "neutral" | "success" | "warning" | "danger" | "primary";
