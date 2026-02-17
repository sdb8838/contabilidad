"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/presupuesto", label: "Presupuesto", icon: "💰" },
  { href: "/ejecutado", label: "Ejecutado", icon: "✅" },
  { href: "/prevision", label: "Previsión", icon: "📋" },
  { href: "/partidas", label: "Partidas", icon: "📁" },
  { href: "/centros", label: "Centros", icon: "🏛️" },
];

const adminItems = [
  { href: "/password", label: "Contraseña", icon: "🔑" },
  { href: "/admin/users", label: "Usuarios", icon: "👥" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <nav className="bg-murcia-blue text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏛️</span>
              <span className="font-bold text-lg">Ejecución Presupuestaria 2026</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-murcia-blue text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏛️</span>
              <span className="font-bold text-lg">Ejecución Presupuestaria 2026</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  pathname === item.href ? "bg-murcia-red" : "hover:bg-blue-600"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            {user?.role === "admin" && (
              <>
                <div className="w-px h-8 bg-blue-400 mx-2"></div>
                {adminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      pathname === item.href ? "bg-yellow-600" : "hover:bg-yellow-500"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}
            <div className="w-px h-8 bg-blue-400 mx-2"></div>
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-sm bg-blue-800 rounded-lg">
                  {user.displayName}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
