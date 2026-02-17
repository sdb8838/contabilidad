"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { Partida, CENTROS_GESTORES_INICIALES, EJERCICIO_DEFAULT, EJERCICIOS } from "@/lib/data";
import { exportToXlsx } from "@/components/CsvXlsxUtils";

export default function Page() {
  const [data, setData] = useState<Partida[]>([]);
  const [allData, setAllData] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);
  const [cg, setCg] = useState(CENTROS_GESTORES_INICIALES[0]?.codigo || "");
  const [ej, setEj] = useState(EJERCICIO_DEFAULT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Partida>>({});
  const [showForm, setShowForm] = useState(false);
  const [newForm, setNewForm] = useState({ codigo: "", descripcion: "" });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  useEffect(() => {
    fetch("/api/data").then(r => r.json()).then(d => {
      setData(d.partidas || []);
      setAllData(d.partidas || []);
      setLoading(false);
    });
  }, []);

  const sortedData = useMemo(() => {
    let sorted = [...allData];
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key as keyof Partida];
        const bVal = b[sortConfig.key as keyof Partida];
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc" 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }
        return 0;
      });
    }
    return sorted;
  }, [allData, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc"
    }));
  };

  const filtered = useMemo(() => {
    return sortedData.filter(p => p.ejercicio === ej && p.centro_gestor === cg);
  }, [sortedData, ej, cg]);

  const exportData = () => {
    exportToXlsx(filtered.map(p => ({ Ejercicio: ej, CentroGestor: cg, Codigo: p.codigo, Descripcion: p.descripcion })), `partidas_${cg}_${ej}`, "Partidas");
  };

  const edit = (p: Partida) => { setEditingId(p.id); setEditForm({ ...p }); };
  const save = async () => { 
    if (editingId && editForm) {
      const updatedData = data.map(p => p.id === editingId ? { ...p, ...editForm, ejercicio: ej, centro_gestor: cg } as Partida : p);
      setData(updatedData);
      setAllData(updatedData);
      setEditingId(null);
      setEditForm({});
      await fetch("/api/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "partidas", data: updatedData }) });
    }
  };
  const del = async (id: string) => { 
    if (confirm("¿Eliminar?")) {
      const updatedData = data.filter(p => p.id !== id);
      setData(updatedData);
      setAllData(updatedData);
      await fetch("/api/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "partidas", data: updatedData }) });
    }
  };
  const add = async () => { 
    const newPartida = { id: crypto.randomUUID(), ejercicio: ej, centro_gestor: cg, codigo: newForm.codigo, descripcion: newForm.descripcion };
    const updatedData = [...data, newPartida];
    setData(updatedData);
    setAllData(updatedData);
    setShowForm(false);
    setNewForm({ codigo: "", descripcion: "" });
    await fetch("/api/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "partidas", data: updatedData }) });
  };

  if (loading) return <main className="min-h-screen bg-gray-50"><Navbar /><div className="flex justify-center h-64"><p className="text-gray-500">Cargando...</p></div></main>;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-murcia-blue">Partidas Presupuestarias</h1>
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
          <div className="flex-1"><label className="block text-sm font-medium mb-2">Centro Gestor</label>
            <select value={cg} onChange={e => setCg(e.target.value)} className="px-4 py-2 border rounded-lg w-full">
              {CENTROS_GESTORES_INICIALES.map(cg => <option key={cg.id} value={cg.codigo}>{cg.codigo} - {cg.nombre}</option>)}
            </select>
          </div>
          <div className="flex-1"><label className="block text-sm font-medium mb-2">Ejercicio</label>
            <select value={ej} onChange={e => setEj(parseInt(e.target.value))} className="px-4 py-2 border rounded-lg w-full">
              {EJERCICIOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center"><span className="text-lg font-semibold text-blue-800">Total Partidas {ej}-{cg}</span>
            <span className="text-2xl font-bold text-blue-700">{filtered.length}</span>
          </div>
        </div>
        <div className="card">
          <div className="p-4 border-b flex justify-between items-center gap-4 flex-wrap">
            <input type="text" placeholder="Filtrar..." className="px-4 py-2 border rounded-lg w-64" />
            <div className="flex gap-2">
              <button onClick={exportData} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">📥 XLSX</button>
              <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{showForm ? "Cancelar" : "+ Nueva"}</button>
            </div>
          </div>
          {showForm && (
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-semibold mb-3">Nueva Partida</h3>
              <div className="flex gap-3">
                <input type="text" value={newForm.codigo} onChange={e => setNewForm({ ...newForm, codigo: e.target.value })} className="px-3 py-2 border rounded w-32" placeholder="Código" />
                <input type="text" value={newForm.descripcion} onChange={e => setNewForm({ ...newForm, descripcion: e.target.value })} className="px-3 py-2 border rounded flex-1" placeholder="Descripción" />
                <button onClick={add} className="px-4 py-2 bg-murcia-blue text-white rounded-lg hover:bg-blue-700">Guardar</button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="table-header cursor-pointer hover:bg-blue-100" onClick={() => handleSort("codigo")}>
                    Código {sortConfig?.key === "codigo" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="table-header cursor-pointer hover:bg-blue-100" onClick={() => handleSort("descripcion")}>
                    Descripción {sortConfig?.key === "descripcion" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="table-header" style={{ width: "150px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono">{editingId === p.id ? <input type="text" value={editForm.codigo || ""} onChange={e => setEditForm({ ...editForm, codigo: e.target.value })} className="px-2 py-1 border rounded w-32" /> : p.codigo}</td>
                    <td className="table-cell">{editingId === p.id ? <input type="text" value={editForm.descripcion || ""} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })} className="px-2 py-1 border rounded w-full" /> : p.descripcion}</td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        {editingId === p.id ? <><button onClick={save} className="px-2 py-1 bg-green-600 text-white text-sm rounded">✓</button><button onClick={() => setEditingId(null)} className="px-2 py-1 bg-gray-500 text-white text-sm rounded">✕</button></> : <><button onClick={() => edit(p)} className="px-2 py-1 bg-blue-600 text-white text-sm rounded">✏️</button><button onClick={() => del(p.id)} className="px-2 py-1 bg-red-600 text-white text-sm rounded">🗑️</button></>}
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
