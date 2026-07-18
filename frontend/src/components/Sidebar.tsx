import type { Role } from "../types";

export type Page =
  | "dashboard"
  | "articles"
  | "typesArticle"
  | "lots"
  | "ventes"
  | "ordonnances"
  | "achats"
  | "receptions"
  | "transferts"
  | "reformes"
  | "clients"
  | "clientMutuelles"
  | "fournisseurs"
  | "mutuelles"
  | "employes"
  | "utilisateurs"
  | "magasins"
  | "rapports";

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
  role: Role;
  username: string;
  onLogout: () => void;
}

interface NavItem {
  key: Page;
  label: string;
  roles: Role[];
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Vue d'ensemble",
    items: [{ key: "dashboard", label: "Tableau de bord", roles: ["admin", "pharmacien", "gestionnaire_stock", "caissier", "responsable_achats"] }],
  },
  {
    title: "Ventes & clients",
    items: [
      { key: "ventes", label: "Ventes", roles: ["admin", "pharmacien", "caissier"] },
      { key: "ordonnances", label: "Ordonnances", roles: ["admin", "pharmacien"] },
      { key: "clients", label: "Clients", roles: ["admin", "pharmacien", "caissier"] },
      { key: "mutuelles", label: "Mutuelles", roles: ["admin", "pharmacien", "caissier"] },
      { key: "clientMutuelles", label: "Clients ↔ Mutuelles", roles: ["admin", "pharmacien", "caissier"] },
    ],
  },
  {
    title: "Stock & achats",
    items: [
      { key: "articles", label: "Articles", roles: ["admin", "gestionnaire_stock"] },
      { key: "typesArticle", label: "Types d'article", roles: ["admin", "gestionnaire_stock"] },
      { key: "lots", label: "Stock / Lots", roles: ["admin", "gestionnaire_stock"] },
      { key: "achats", label: "Achats", roles: ["admin", "responsable_achats"] },
      { key: "receptions", label: "Réceptions", roles: ["admin", "gestionnaire_stock", "responsable_achats"] },
      { key: "transferts", label: "Transferts", roles: ["admin", "gestionnaire_stock"] },
      { key: "reformes", label: "Réformes", roles: ["admin", "gestionnaire_stock", "pharmacien"] },
      { key: "magasins", label: "Magasins", roles: ["admin", "gestionnaire_stock"] },
    ],
  },
  {
    title: "Partenaires & suivi",
    items: [
      { key: "fournisseurs", label: "Fournisseurs", roles: ["admin", "responsable_achats"] },
      { key: "employes", label: "Employés", roles: ["admin"] },
      { key: "utilisateurs", label: "Comptes utilisateurs", roles: ["admin"] },
      { key: "rapports", label: "Rapports", roles: ["admin", "responsable_achats"] },
    ],
  },
];

const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  pharmacien: "Pharmacien",
  gestionnaire_stock: "Gestionnaire de stock",
  caissier: "Caissier",
  responsable_achats: "Responsable achats",
};

export default function Sidebar({ current, onNavigate, role, username, onLogout }: SidebarProps) {
  return (
    <aside className="w-60 shrink-0 bg-pharma-900 text-white min-h-screen p-4 overflow-y-auto flex flex-col">
      <div className="flex items-center gap-2 mb-6 px-2">
        <span className="w-2.5 h-2.5 rounded-full bg-pharma-300" />
        <span className="font-medium text-sm tracking-wide">PharmaGest</span>
      </div>
      <nav className="flex flex-col gap-4 flex-1">
        {SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(role));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.title}>
              <p className="text-[11px] uppercase tracking-wide text-pharma-400 px-3 mb-1">
                {section.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {visibleItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className={`text-left text-sm px-3 py-2 rounded-md transition-colors ${
                      current === item.key
                        ? "bg-pharma-700 text-white"
                        : "text-pharma-200 hover:bg-pharma-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-pharma-800 pt-3 mt-3 px-2">
        <p className="text-xs text-pharma-300">{username}</p>
        <p className="text-[11px] text-pharma-400 mb-2">{ROLE_LABELS[role]}</p>
        <button onClick={onLogout} className="text-xs text-pharma-300 hover:text-white hover:underline">
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
