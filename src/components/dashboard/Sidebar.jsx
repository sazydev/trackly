import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Target,
  Settings,
  User,
  LogOut,
} from "lucide-react";

const links = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "revenues", label: "Revenus", icon: TrendingUp },
  { id: "expenses", label: "Dépenses", icon: Wallet },
  { id: "goals", label: "Objectifs", icon: Target },
  { id: "settings", label: "Paramètres", icon: Settings },
  { id: "profile", label: "Profil", icon: User },
];

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <img src="/logo/logo.png" alt="Trackly Logo" className="sidebar-logo" />

        <nav className="sidebar-nav">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <button
                key={link.id}
                className={activePage === link.id ? "active" : ""}
                onClick={() => setActivePage(link.id)}
              >
                <Icon size={18} />
                {link.label}
              </button>
            );
          })}
        </nav>
      </div>

      <button className="logout-btn" onClick={onLogout}>
        <LogOut size={18} />
        Déconnexion
      </button>
    </aside>
  );
}