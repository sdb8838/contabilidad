"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

interface AuthorizedUser {
  username: string;
  displayName: string;
  addedAt: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AuthorizedUser[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not admin
  if (user?.role !== "admin") {
    router.push("/");
    return null;
  }

  useEffect(() => {
    fetch("/api/auth/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addUser = async () => {
    if (!newUsername || !newDisplayName) {
      setError("Usuario y nombre son requeridos");
      return;
    }

    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, displayName: newDisplayName }),
      });

      const data = await res.json();

      if (data.success) {
        setUsers([...users, { username: newUsername, displayName: newDisplayName, addedAt: new Date().toISOString() }]);
        setNewUsername("");
        setNewDisplayName("");
        setError("");
      } else {
        setError(data.error || "Error al añadir usuario");
      }
    } catch {
      setError("Error de conexión");
    }
  };

  const removeUser = async (username: string) => {
    if (!confirm(`¿Eliminar a ${username} de los usuarios autorizados?`)) return;

    try {
      const res = await fetch(`/api/auth/users?username=${encodeURIComponent(username)}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setUsers(users.filter(u => u.username !== username));
      }
    } catch {
      setError("Error al eliminar usuario");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-murcia-blue">Gestión de Usuarios Autorizados</h1>

        <div className="card mb-6">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold">Añadir Usuario del Directorio</h2>
            <p className="text-sm text-gray-500 mt-1">Los usuarios del directorio activo (LDAP) deben ser autorizados antes de poder acceder a la aplicación.</p>
          </div>
          <div className="p-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario (sAMAccountName)</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-murcia-blue"
                  placeholder="Ej: jgarcia"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-murcia-blue"
                  placeholder="Ej: Juan García López"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addUser}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold">Usuarios Autorizados ({users.length})</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay usuarios autorizados. Añada usuarios del directorio para que puedan acceder.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="table-header">Usuario</th>
                    <th className="table-header">Nombre Completo</th>
                    <th className="table-header">Añadido</th>
                    <th className="table-header" style={{ width: "100px" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.username} className="hover:bg-gray-50">
                      <td className="table-cell font-mono">{u.username}</td>
                      <td className="table-cell">{u.displayName}</td>
                      <td className="table-cell text-gray-500">
                        {new Date(u.addedAt).toLocaleDateString("es-ES")}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => removeUser(u.username)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
