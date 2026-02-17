"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import EditableTable, { ColumnConfig } from "@/components/EditableTable";
import { TIPOS_PRESUPUESTO, Operacion, Partida, CENTROS_GESTORES_INICIALES, PARTIDAS_INICIALES, EJERCICIO_DEFAULT, EJERCICIOS } from "@/lib/data";
import { exportToXlsx, importFromCsv, importFromXlsx } from "@/components/CsvXlsxUtils";

const presupuestoColumns: ColumnConfig[] = [
  { key: "partida_economico", label: "Partida", width: "200px", editable: true, type: "select" },
  { key: "importe_total", label: "Importe", width: "150px", editable: true, type: "number" },
];

export default function PresupuestoPage() {
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [allOperaciones, setAllOperaciones] = useState<Operacion[]>([]);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);
  const [centroGestorFilter, setCentroGestorFilter] = useState<string>(CENTROS_GESTORES_INICIALES[0]?.codigo || "");
  const [ejercicioFilter, setEjercicioFilter] = useState<number>(EJERCICIO_DEFAULT);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/data")
      .then(res => res.json())
      .then(data => {
        const ops = (data.records || []).filter((op: Operacion) => TIPOS_PRESUPUESTO.includes(op.tipo_operacion));
        setOperaciones(ops);
        setAllOperaciones(data.records || []);
        setPartidas(data.partidas || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filtrar partidas por centro_gestor y ejercicio y ordenar por código
  const filteredPartidas = partidas
    .filter(p => p.ejercicio === ejercicioFilter && p.centro_gestor === centroGestorFilter)
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  const filteredOps = operaciones.filter(op => 
    op.centro_gestor === centroGestorFilter && op.ejercicio === ejercicioFilter
  );

  const totalPresupuesto = filteredOps.reduce((sum, op) => sum + op.importe_total, 0);

  const handleSave = async (updatedData: Operacion[]) => {
    const normalizedData = updatedData.map(op => ({
      ...op,
      importe_total: Math.abs(op.importe_total),
      centro_gestor: centroGestorFilter,
      ejercicio: ejercicioFilter
    }));
    
    // Mantener operaciones de otros centros gestores, solo reemplazar las del centro actual
    const updatedOperaciones = [
      ...operaciones.filter(op => op.centro_gestor !== centroGestorFilter || op.ejercicio !== ejercicioFilter),
      ...normalizedData
    ];
    
    setOperaciones(updatedOperaciones);
    
    // Mantener todas las operaciones no-PPTO2026 y agregar las actualizadas
    const newAllOps = [
      ...allOperaciones.filter(op => op.tipo_operacion !== "PPTO2026"),
      ...normalizedData.map(op => ({ ...op, tipo_operacion: "PPTO2026" }))
    ];
    setAllOperaciones(newAllOps);

    try {
      await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "operaciones", data: newAllOps }),
      });
      
      // Recargar datos del servidor para asegurar consistencia
      // Mantener las partidas existentes de otros centros gestores
      const data = await fetch("/api/data").then(res => res.json());
      const serverPartidas = data.partidas || [];
      const serverPartidasKeys = new Set(serverPartidas.map((p: Partida) => `${p.centro_gestor}-${p.codigo}`));
      const mergedPartidas = [...partidas.filter((p: Partida) => !serverPartidasKeys.has(`${p.centro_gestor}-${p.codigo}`)), ...serverPartidas];
      
      const ops = (data.records || []).filter((op: Operacion) => TIPOS_PRESUPUESTO.includes(op.tipo_operacion));
      setOperaciones(ops);
      setAllOperaciones(data.records || []);
      setPartidas(mergedPartidas);
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleExport = () => {
    const exportData = filteredOps.map(op => ({
      Ejercicio: op.ejercicio,
      CentroGestor: op.centro_gestor,
      Partida: op.partida_economico,
      Importe: op.importe_total,
      Descripcion: op.descripcion || "",
    }));
    exportToXlsx(exportData, `presupuesto_${centroGestorFilter}_${ejercicioFilter}`, "Presupuesto");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.endsWith(".csv");
    
    const onComplete = (data: Record<string, unknown>[]) => {
      const newOps = data.map((row) => ({
        id: crypto.randomUUID(),
        fecha: null,
        ejercicio: ejercicioFilter,
        centro_gestor: centroGestorFilter,
        partida_economico: String(row.partida_economico || row.Partida || ""),
        descripcion: String(row.descripcion || row.Descripcion || ""),
        tipo_operacion: "PPTO2026",
        importe_total: Math.abs(Number(row.importe_total || row.Importe || 0)),
        empresa: null,
        cif_nif: null,
        base_imponible: null,
        importe_iva: null,
        operacion_previa: null,
        operacion_definitiva: null,
        expte_contratacion: null,
        observaciones: null,
        link_placsp: null,
      }));

      // Usar allOperaciones (todas las operaciones PPTO2026) en lugar de operaciones (solo del centro actual)
      const pptoOps = allOperaciones.filter(op => op.tipo_operacion === "PPTO2026");
      const updatedOps = [...pptoOps, ...newOps];
      handleSave(updatedOps);
      alert(`Importados ${newOps.length} registros`);
    };

    const onError = (error: string) => {
      alert(error);
    };

    if (isCsv) {
      importFromCsv(file, onComplete, onError);
    } else {
      importFromXlsx(file, onComplete, onError);
    }

    event.target.value = "";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-murcia-blue">
          Presupuesto PPTO2026
        </h1>
        
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Centro Gestor</label>
            <select
              value={centroGestorFilter}
              onChange={(e) => setCentroGestorFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-murcia-blue w-full"
            >
              {CENTROS_GESTORES_INICIALES.map((cg) => (
                <option key={cg.id} value={cg.codigo}>{cg.codigo} - {cg.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ejercicio</label>
            <select
              value={ejercicioFilter}
              onChange={(e) => setEjercicioFilter(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-murcia-blue w-full"
            >
              {EJERCICIOS.map((ej) => <option key={ej} value={ej}>{ej}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-green-800">Total Presupuesto</span>
            <span className="text-2xl font-bold text-green-700">
              {totalPresupuesto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
          </div>
        </div>

        <div className="card">
          <EditableTable 
            data={filteredOps}
            columns={presupuestoColumns}
            onSave={handleSave}
            tipoOperacion="PPTO2026"
            partidas={filteredPartidas}
            centrosGestores={CENTROS_GESTORES_INICIALES}
            ejercicioDefault={ejercicioFilter}
            centroGestorDefault={centroGestorFilter}
            onExport={handleExport}
            onImport={() => fileInputRef.current?.click()}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
        </div>
      </div>
    </main>
  );
}
