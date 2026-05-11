import type { NavItem } from "./types";

export const navItems: NavItem[] = [
  { key: "overview", label: "Visão Geral", icon: "dashboard", href: "/" },
  {
    key: "services",
    label: "Atendimentos",
    icon: "file",
    href: "/services",
  },
  { key: "fellows", label: "Bolsistas", icon: "users", href: "/bolsistas" },
  { key: "students", label: "Alunos", icon: "user", href: "/alunos" },
  { key: "reports", label: "Relatórios", icon: "chart", href: "/relatorios" },
  {
    key: "settings",
    label: "Configurações",
    icon: "settings",
    href: "/configuracoes",
  },
];

export const fellows = [
  {
    initials: "LC",
    name: "Lucas Carvalho",
    detail: "IC → RU",
    status: "Em atendimento",
    tone: "warning",
    avatar: "cyan",
  },
  {
    initials: "MC",
    name: "Maria Costa",
    detail: "FAED → Biblioteca",
    status: "Em atendimento",
    tone: "warning",
    avatar: "violet",
  },
  {
    initials: "RS",
    name: "Rafael Souza",
    detail: "Disponível",
    status: "Disponível",
    tone: "success",
    avatar: "lime",
  },
  {
    initials: "TM",
    name: "Thaís Moura",
    detail: "Disponível",
    status: "Disponível",
    tone: "success",
    avatar: "orange",
  },
  {
    initials: "PL",
    name: "Pedro Lima",
    detail: "Indisponível",
    status: "Offline",
    tone: "danger",
    avatar: "lavender",
  },
];

export const latestServices = [
  {
    title: "Lucas C. → Maria Aparecida · IC → RU",
    meta: "Em andamento · iniciado às 10h17",
    status: "Ativo",
    tone: "warning",
  },
  {
    title: "Beatriz F. → João Henrique · FAED → Biblioteca",
    meta: "Em andamento · iniciado às 10h02",
    status: "Ativo",
    tone: "warning",
  },
  {
    title: "Rafael S. → Rodrigo Santos · RU → IC",
    meta: "Concluído · 09h14 – 09h26 · 12 min",
    status: "Concluído",
    tone: "success",
  },
  {
    title: "Thais M. → Ana Clara · IC → Reitoria",
    meta: "Concluído · 08h41 – 08h58 · 17 min",
    status: "Concluído",
    tone: "success",
  },
];

export const serviceRows = [
  ["24/04", "09h00", "Felipe S.", "Beatriz Oliveira"],
  ["24/04", "09h15", "Felipe S.", "Ana Clara"],
  ["24/04", "09h30", "Felipe S.", "João Pedro"],
  ["24/04", "09h45", "Carlos M.", "Maria Eduarda"],
  ["23/04", "10h00", "Carlos M.", "Laura Silva"],
  ["23/04", "10h15", "Carlos M.", "José Alves"],
  ["23/04", "10h30", "Ana C.", "Fernanda Maia"],
] as const;
