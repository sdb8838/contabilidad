"use client";

import { useState, useEffect } from "react";
import { Operacion, Partida, CentroGestor, EJERCICIO_DEFAULT } from "@/lib/data";

interface EditableTableProps {
  data: Operacion[];
  columns: ColumnConfig[];
  onSave: (data: Operacion[]) => void;
  tipoOperacion: string;
  partidas?: Partida[];
  centrosGestores?: CentroGestor[];
  ejercicioDefault?: number;
  centroGestorDefault?: string;
  onExport?: () => void;
  onImport?: () => void;
}

export interface ColumnConfig {
  key: keyof Operacion;
  label: string;
  width?: string;
  editable?: boolean;
  type?: "text" | "number" | "date" | "select";
  options?: { value: string; label: string }[];
}

export default function EditableTable({ data, columns, onSave, tipoOperacion, partidas, centrosGestores, ejercicioDefault = EJERCICIO_DEFAULT, centroGestorDefault = "", onExport, onImport }: EditableTableProps) {
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Operacion>>({});
  const [showForm, setShowForm] = useState(false);
  const [newForm, setNewForm] = useState<Partial<Operacion>>({
    tipo_operacion: tipoOperacion,
    ejercicio: ejercicioDefault,
    centro_gestor: centroGestorDefault,
    partida_economico: "",
    importe_total: 0,
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  // Actualizar newForm cuando cambia el centro_gestor o ejercicio por defecto
  useEffect(() => {
    setNewForm(prev => ({
      ...prev,
      ejercicio: ejercicioDefault,
      centro_gestor: centroGestorDefault,
    }));
  }, [ejercicioDefault, centroGestorDefault]);

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as unknown as Record<string, unknown>)[sortKey];
    const bVal = (b as unknown as Record<string, unknown>)[sortKey];
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    
    return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const filteredData = sortedData.filter((row) => {
    const searchStr = filter.toLowerCase();
    return (
      row.descripcion?.toLowerCase().includes(searchStr) ||
      row.centro_gestor.includes(searchStr) ||
      row.partida_economico.includes(searchStr)
    );
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleEdit = (row: Operacion) => {
    setEditingId(row.id);
    setEditForm({ ...row });
    setShowForm(false);
  };

  const handleSave = () => {
    if (editingId && editForm) {
      const updatedData = data.map((row) =>
        row.id === editingId ? { ...row, ...editForm } : row
      );
      onSave(updatedData);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Eliminar este registro?")) {
      const updatedData = data.filter((row) => row.id !== id);
      onSave(updatedData);
    }
  };

  const handleAdd = () => {
    const newRecord: Operacion = {
      id: crypto.randomUUID(),
      fecha: newForm.fecha || new Date().toISOString().split("T")[0],
      ejercicio: newForm.ejercicio || ejercicioDefault,
      centro_gestor: newForm.centro_gestor || "",
      partida_economico: newForm.partida_economico || "",
      descripcion: newForm.descripcion || null,
      tipo_operacion: tipoOperacion,
      importe_total: Math.abs(newForm.importe_total || 0),
      empresa: newForm.empresa || null,
      cif_nif: newForm.cif_nif || null,
      base_imponible: newForm.base_imponible || null,
      importe_iva: newForm.importe_iva || null,
      operacion_previa: newForm.operacion_previa || null,
      operacion_definitiva: newForm.operacion_definitiva || null,
      expte_contratacion: newForm.expte_contratacion || null,
      observaciones: newForm.observaciones || null,
      link_placsp: newForm.link_placsp || null,
    };
    onSave([...data, newRecord]);
    setShowForm(false);
    setNewForm({
      tipo_operacion: tipoOperacion,
      ejercicio: ejercicioDefault,
      centro_gestor: "",
      partida_economico: "",
      importe_total: 0,
      descripcion: "",
      fecha: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border-b flex justify-between items-center gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Filtrar..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-murcia-blue w-64"
        />
        <div className="flex gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Exportar a XLSX"
            >
              📥 XLSX
            </button>
          )}
          {onImport && (
            <button
              onClick={onImport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Importar desde CSV/XLSX"
            >
              📤 Importar
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {showForm ? "Cancelar" : "+ Nueva"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg border mb-4">
          <h3 className="font-semibold mb-3">Nueva Operación</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Fecha */}
            <input
              type="date"
              value={newForm.fecha || ""}
              onChange={(e) => setNewForm({ ...newForm, fecha: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="Fecha"
            />
            
            {/* Partida */}
            {partidas ? (
              <select
                value={newForm.partida_economico || ""}
                onChange={(e) => setNewForm({ ...newForm, partida_economico: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Partida</option>
                {partidas.map((p) => (
                  <option key={p.id} value={p.codigo}>
                    {p.codigo} - {p.descripcion}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={newForm.partida_economico || ""}
                onChange={(e) => setNewForm({ ...newForm, partida_economico: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded"
                placeholder="Partida"
              />
            )}
            
            {/* Descripción */}
            <input
              type="text"
              value={newForm.descripcion || ""}
              onChange={(e) => setNewForm({ ...newForm, descripcion: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="Descripción"
            />
            
            {/* Empresa */}
            <input
              type="text"
              value={newForm.empresa || ""}
              onChange={(e) => setNewForm({ ...newForm, empresa: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="Empresa"
            />
            
            {/* CIF/NIF */}
            <input
              type="text"
              value={newForm.cif_nif || ""}
              onChange={(e) => setNewForm({ ...newForm, cif_nif: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="CIF/NIF"
            />
            
            {/* Base imponible */}
            <input
              type="number"
              value={newForm.base_imponible || ""}
              onChange={(e) => setNewForm({ ...newForm, base_imponible: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="Base imponible"
            />
            
            {/* Importe IVA */}
            <input
              type="number"
              value={newForm.importe_iva || ""}
              onChange={(e) => setNewForm({ ...newForm, importe_iva: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="IVA"
            />
            
            {/* Importe total */}
            <input
              type="number"
              value={newForm.importe_total || ""}
              onChange={(e) => setNewForm({ ...newForm, importe_total: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="Importe total"
            />
            
            {/* Operación previa */}
            <input
              type="text"
              value={newForm.operacion_previa || ""}
              onChange={(e) => setNewForm({ ...newForm, operacion_previa: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="Op. Previa"
            />
            
            {/* Operación definitiva */}
            <input
              type="text"
              value={newForm.operacion_definitiva || ""}
              onChange={(e) => setNewForm({ ...newForm, operacion_definitiva: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="Op. Definitiva"
            />
            
            {/* Expte. contratación */}
            <input
              type="text"
              value={newForm.expte_contratacion || ""}
              onChange={(e) => setNewForm({ ...newForm, expte_contratacion: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="Expte."
            />
            
            {/* Link PLACSP */}
            <input
              type="url"
              value={newForm.link_placsp || ""}
              onChange={(e) => setNewForm({ ...newForm, link_placsp: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded"
              placeholder="Link PLACSP"
            />
            
            {/* Observaciones */}
            <input
              type="text"
              value={newForm.observaciones || ""}
              onChange={(e) => setNewForm({ ...newForm, observaciones: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded col-span-2"
              placeholder="Observaciones"
            />
            
            {/* Botón Guardar */}
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
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className="table-header cursor-pointer hover:bg-blue-600"
                  style={{ width: col.width }}
                  onClick={() => handleSort(col.key as string)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    {sortKey === col.key && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
              <th className="table-header" style={{ width: "120px" }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={`${row.id}-${col.key as string}`} className="table-cell">
                    {editingId === row.id && col.editable ? (
                      col.type === "number" ? (
                        <input
                          type="number"
                          value={editForm[col.key] ?? ""}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              [col.key]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="px-2 py-1 border border-gray-300 rounded w-full"
                        />
                      ) : col.type === "select" && col.options ? (
                        <select
                          value={(editForm[col.key] as string) ?? ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, [col.key]: e.target.value })
                          }
                          className="px-2 py-1 border border-gray-300 rounded w-full"
                        >
                          <option value="">Seleccionar...</option>
                          {col.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : col.type === "select" && partidas ? (
                        <select
                          value={(editForm[col.key] as string) ?? ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, [col.key]: e.target.value })
                          }
                          className="px-2 py-1 border border-gray-300 rounded w-full"
                        >
                          <option value="">Partida...</option>
                          {partidas.map((p) => (
                            <option key={p.id} value={p.codigo}>
                              {p.codigo} - {p.descripcion}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={(editForm[col.key] as string) ?? ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, [col.key]: e.target.value })
                          }
                          className="px-2 py-1 border border-gray-300 rounded w-full"
                        />
                      )
                    ) : col.key === "importe_total" ? (
                      <span className="font-mono">
                        {(Math.abs(row.importe_total as number)).toLocaleString("es-ES", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </span>
                    ) : col.key === "fecha" ? (
                      <span>{row.fecha ? String(row.fecha).split("T")[0] : "-"}</span>
                    ) : col.key === "ejercicio" ? (
                      <span className="font-mono">{String(row.ejercicio)}</span>
                    ) : (
                      <span>{String(row[col.key] ?? "-")}</span>
                    )}
                  </td>
                ))}
                <td className="table-cell">
                  <div className="flex space-x-2">
                    {editingId === row.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="px-2 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-2 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(row)}
                          className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron registros
        </div>
      )}

      <div className="text-gray-600 text-sm">
        {filteredData.length} registros
      </div>
    </div>
  );
}
