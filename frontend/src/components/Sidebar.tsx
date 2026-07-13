export type Page = "dashboard" | "articles" | "lots" | "ventes" | "clients" | "fournisseurs";

interface SidebarProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { key: Page; label: string }[] = [
  { key: "dashboard", label: "Tableau de bord" },
  { key: "articles", label: "Articles" },
  { key: "lots", label: "Stock / Lots" },
  { key: "ventes", label: "Ventes" },
  { key: "clients", label: "Clients" },
  { key: "fournisseurs", label: "Fournisseurs" },
];

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 shrink-0 bg-pharma-900 text-white min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <span className="w-2.5 h-2.5 rounded-full bg-pharma-300" />
        <span className="font-medium text-sm tracking-wide">PharmaGest</span>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
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
      </nav>
    </aside>
  );
}
