import { useState } from "react";
import Sidebar, { Page } from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ArticleList from "./components/ArticleList";
import TypeArticleList from "./components/TypeArticleList";
import LotList from "./components/LotList";
import VenteList from "./components/VenteList";
import OrdonnanceList from "./components/OrdonnanceList";
import AchatList from "./components/AchatList";
import ReceptionList from "./components/ReceptionList";
import TransfertList from "./components/TransfertList";
import ReformeList from "./components/ReformeList";
import ClientList from "./components/ClientList";
import FournisseurList from "./components/FournisseurList";
import MutuelleList from "./components/MutuelleList";
import Rapports from "./components/Rapports";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");

  function renderPage() {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "articles":
        return <ArticleList />;
      case "typesArticle":
        return <TypeArticleList />;
      case "lots":
        return <LotList />;
      case "ventes":
        return <VenteList />;
      case "ordonnances":
        return <OrdonnanceList />;
      case "achats":
        return <AchatList />;
      case "receptions":
        return <ReceptionList />;
      case "transferts":
        return <TransfertList />;
      case "reformes":
        return <ReformeList />;
      case "clients":
        return <ClientList />;
      case "fournisseurs":
        return <FournisseurList />;
      case "mutuelles":
        return <MutuelleList />;
      case "rapports":
        return <Rapports />;
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="flex-1 p-6">{renderPage()}</main>
    </div>
  );
}