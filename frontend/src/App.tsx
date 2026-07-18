import { useEffect, useState } from "react";
import Sidebar, { Page } from "./components/Sidebar";
import Login from "./components/Login";
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
import ClientMutuelleList from "./components/ClientMutuelleList";
import FournisseurList from "./components/FournisseurList";
import MutuelleList from "./components/MutuelleList";
import EmployeList from "./components/EmployeList";
import UtilisateurList from "./components/UtilisateurList";
import MagasinList from "./components/MagasinList";
import Rapports from "./components/Rapports";
import { getCurrentUser, logout } from "./services/api";
import type { CurrentUser } from "./types";

export default function App() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [page, setPage] = useState<Page>("dashboard");

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
    setPage("dashboard");
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

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
      case "clientMutuelles":
        return <ClientMutuelleList />;
      case "fournisseurs":
        return <FournisseurList />;
      case "mutuelles":
        return <MutuelleList />;
      case "employes":
        return <EmployeList />;
      case "utilisateurs":
        return <UtilisateurList />;
      case "magasins":
        return <MagasinList />;
      case "rapports":
        return <Rapports />;
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        current={page}
        onNavigate={setPage}
        role={user.role}
        username={user.username}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-6">{renderPage()}</main>
    </div>
  );
}
