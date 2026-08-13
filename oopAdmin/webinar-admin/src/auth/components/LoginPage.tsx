import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Share2, Tags, MessageSquare, Settings, LogIn } from "lucide-react";
import { useLoginMutation } from "../api/authApi";
import { useAppDispatch } from "../../app/hooks";
import { setToken } from "../../app/store";
import { toast } from "sonner";

const menuItems = [
  { label: "Вебинары", icon: Calendar },
  { label: "Эксперты", icon: Users },
  { label: "Соцсети", icon: Share2 },
  { label: "Рубрики", icon: Tags },
  { label: "Обратная связь", icon: MessageSquare },
  { label: "Настройки", icon: Settings },
];

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login({
        username: username.trim(),
        password,
      }).unwrap();

      if (!response?.token) {
        toast.error("Неверный логин или пароль");
        return;
      }

      dispatch(setToken(response.token));
      toast.success("Успешный вход!");
      navigate("/webinars");
    } catch (error: unknown) {
      const data =
        error && typeof error === "object" && "data" in error
          ? (error as { data?: unknown }).data
          : undefined;

      const message =
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : "Ошибка входа. Проверьте логин и пароль.";

      toast.error(message);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Админка</h1>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="login-sidebar-link">
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="login-main">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-icon">
              <LogIn size={28} />
            </div>
            <h1 className="page-title login-title">Вход в систему</h1>
            <p className="login-subtitle">
              Введите данные для доступа к панели управления
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="label">Логин</label>
              <input
                type="text"
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label className="label">Пароль</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary login-btn"
              disabled={isLoading}
            >
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
