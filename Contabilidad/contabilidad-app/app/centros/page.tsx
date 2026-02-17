"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import { CentroGestor, CENTROS_GESTORES_INICIALES } from "@/lib/data";

export default function CentrosPage() {
  const [centros, setCentros] = useState<CentroGestor[]>(CENTROS_GESTORES_INICIALES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CentroGestor>>({});
  const [showForm, setShowForm] = useState(false);
  const [newForm, setNewForm] = useState({ codigo: "", nombre: "" });

  const handleEdit = (centro: CentroGestor) => {
    setEditingId(centro.id);
    setEditForm({ ...centro });
  };

  const handleSave = () => {
    if (editingId && editForm) {
      setCentros(centros.map(c => c.id === editingId ? { ...c, ...editForm } as CentroGestor : c));
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar este centro gestor?")) {
      setCentros(centros.filter(c => c.id !== id));
    }
  };

  const handleAdd = () => {
    const newCentro: CentroGestor = {
      id: crypto.randomUUID(),
      codigo: newForm.codigo,
      nombre: newForm.nombre,
    };
    setCentros([...centros, newCentro]);
    setShowForm(false);
    setNewForm({ codigo: "", nombre: "" });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-murcia-blue">
          Centros Gestores
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard 
            title="Total Centros" 
            value={centros.length}
            icon="🏛️"
          />
        </div>

        <div className="card">
          <div className="p-4 border-b flex justify-between items-center">
            <input
              type="text"
              placeholder="Filtrar..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-murcia-blue w-64"
            />
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Nuevo Centro
            </button>
          </div>

          {showForm && (
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold mb-3">Nuevo Centro Gestor</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newForm.codigo}
                  onChange={(e) => setNewForm({ ...newForm, codigo: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded w-32"
                  placeholder="Código"
                />
                <input
                  type="text"
                  value={newForm.nombre}
                  onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded flex-1"
                  placeholder="Denominación"
                />
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-murcia-blue text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="table-header">Código</th>
                  <th className="table-header">Denominación</th>
                  <th className="table-header" style={{ width: "150px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {centros.map((centro) => (
                  <tr key={centro.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono">
                      {editingId === centro.id ? (
                        <input
                          type="text"
                          value={editForm.codigo || ""}
                          onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded w-32"
                        />
                      ) : (
                        centro.codigo
                      )}
                    </td>
                    <td className="table-cell">
                      {editingId === centro.id ? (
                        <input
                          type="text"
                          value={editForm.nombre || ""}
                          onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded w-full"
                        />
                      ) : (
                        centro.nombre
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        {editingId === centro.id ? (
                          <>
                            <button onClick={handleSave} className="px-2 py-1 bg-green-600 text-white text-sm rounded">✓</button>
                            <button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-500 text-white text-sm rounded">✕</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(centro)} className="px-2 py-1 bg-blue-600 text-white text-sm rounded">✏️</button>
                            <button onClick={() => handleDelete(centro.id)} className="px-2 py-1 bg-red-600 text-white text-sm rounded">🗑️</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
