import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Share2,
  Tags,
  Settings,
  BookOpen,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAppDispatch } from "../app/hooks";
import { logout } from "../app/store";

const menuItems = [
  { path: "/help", label: "Инструкция", icon: BookOpen },
  { path: "/webinars", label: "Вебинары", icon: Calendar },
  { path: "/experts", label: "Эксперты", icon: Users },
  { path: "/socials", label: "Соцсети", icon: Share2 },
  { path: "/rubrics", label: "Рубрики", icon: Tags },
  { path: "/site-content", label: "Контент сайта", icon: Settings },
];

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="app-container">
      <aside className={sidebarOpen ? "sidebar" : "sidebar sidebar-collapsed"}>
        <div className="sidebar-header">
          <h1
            className={sidebarOpen ? "sidebar-title" : ""}
            style={{ display: sidebarOpen ? "block" : "none" }}
          >
            Админка
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-toggle"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={
                  isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"
                }
              >
                <Icon size={20} />
                <span style={{ display: sidebarOpen ? "inline" : "none" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <div style={{ marginTop: "auto", marginBottom: "2rem" }}>
            <button
              onClick={handleLogout}
              className="sidebar-link"
              style={{
                width: "100%",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
            >
              <LogOut size={20} />
              <span style={{ display: sidebarOpen ? "inline" : "none" }}>
                Выйти
              </span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <div className="content-padding">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
