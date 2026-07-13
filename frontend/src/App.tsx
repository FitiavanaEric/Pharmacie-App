import { useState } from "react";
import Sidebar, { Page } from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ArticleList from "./components/ArticleList";
import LotList from "./components/LotList";
import VenteList from "./components/VenteList";
import ClientList from "./components/ClientList";
import FournisseurList from "./components/FournisseurList";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  function renderPage() {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "articles":
        return <ArticleList />;
      case "lots":
        return <LotList />;
      case "ventes":
        return <VenteList />;
      case "clients":
        return <ClientList />;
      case "fournisseurs":
        return <FournisseurList />;
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="flex-1 p-6">{renderPage()}</main>
    </div>
  );
}
