export type Page =
  | "dashboard"
  | "articles"
  | "lots"
  | "ventes"
  | "ordonnances"
  | "achats"
  | "receptions"
  | "transferts"
  | "reformes"
  | "clients"
  | "fournisseurs"
  | "mutuelles"
  | "rapports";

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const SECTIONS: { title: string; items: { key: Page; label: string }[] }[] = [
  {
    title: "Vue d'ensemble",
    items: [{ key: "dashboard", label: "Tableau de bord" }],
  },
  {
    title: "Ventes & clients",
    items: [
      { key: "ventes", label: "Ventes" },
      { key: "ordonnances", label: "Ordonnances" },
      { key: "clients", label: "Clients" },
      { key: "mutuelles", label: "Mutuelles" },
    ],
  },
  {
    title: "Stock & achats",
    items: [
      { key: "articles", label: "Articles" },
      { key: "lots", label: "Stock / Lots" },
      { key: "achats", label: "Achats" },
      { key: "receptions", label: "Réceptions" },
      { key: "transferts", label: "Transferts" },
      { key: "reformes", label: "Réformes" },
    ],
  },
  {
    title: "Partenaires & suivi",
    items: [
      { key: "fournisseurs", label: "Fournisseurs" },
      { key: "rapports", label: "Rapports" },
    ],
  },
];

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <aside className="w-60 shrink-0 bg-pharma-900 text-white min-h-screen p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 px-2">
        <span className="w-2.5 h-2.5 rounded-full bg-pharma-300" />
        <span className="font-medium text-sm tracking-wide">PharmaGest</span>
      </div>
      <nav className="flex flex-col gap-4">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] uppercase tracking-wide text-pharma-400 px-3 mb-1">
              {section.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
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
        ))}
      </nav>
    </aside>
  );
}
