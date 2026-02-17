"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import EditableTable, { ColumnConfig } from "@/components/EditableTable";
import { TIPOS_EJECUTADO, Operacion, Partida, CENTROS_GESTORES_INICIALES, PARTIDAS_INICIALES, EJERCICIO_DEFAULT, EJERCICIOS } from "@/lib/data";
import { exportToXlsx, importFromCsv, importFromXlsx } from "@/components/CsvXlsxUtils";

const columns: ColumnConfig[] = [
  { key: "ejercicio", label: "Ej.", width: "60px" },
  { key: "fecha", label: "Fecha", width: "120px", editable: true },
  { key: "partida_economico", label: "Partida", width: "150px", editable: true },
  { key: "importe_total", label: "Importe", width: "150px", editable: true, type: "number" },
];

export default function Page() {
  const [data, setData] = useState<Operacion[]>([]);
  const [allData, setAllData] = useState<Operacion[]>([]);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [loading, setLoading] = useState(true);
  const [cg, setCg] = useState(CENTROS_GESTORES_INICIALES[0]?.codigo || "");
  const [ej, setEj] = useState(EJERCICIO_DEFAULT);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/data").then(r => r.json()).then(d => {
      setData((d.records || []).filter((op: Operacion) => TIPOS_EJECUTADO.includes(op.tipo_operacion)));
      setAllData(d.records || []);
      setPartidas(d.partidas || []);
      setLoading(false);
    });
  }, []);

  const filteredPartidas = partidas
    .filter(p => p.ejercicio === ej && p.centro_gestor === cg)
    .sort((a, b) => a.codigo.localeCompare(b.codigo));

  const filtered = data.filter(op => op.centro_gestor === cg && op.ejercicio === ej);
  const total = Math.abs(filtered.reduce((s, o) => s + o.importe_total, 0));

  const save = async (updated: Operacion[]) => {
    const normalized = updated.map(op => ({ ...op, importe_total: Math.abs(op.importe_total), centro_gestor: cg, ejercicio: ej }));
    // Mantener operaciones de otros centros gestores
    const updatedData = [
      ...data.filter(op => op.centro_gestor !== cg || op.ejercicio !== ej),
      ...normalized
    ];
    setData(updatedData);
    // Mantener operaciones no-AD
    const newAll = [
      ...allData.filter(op => !TIPOS_EJECUTADO.includes(op.tipo_operacion)),
      ...normalized
    ];
    setAllData(newAll);
    await fetch("/api/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "operaciones", data: newAll }) });
    // Recargar datos del servidor para asegurar consistencia
    const d = await fetch("/api/data").then(r => r.json());
    setData((d.records || []).filter((op: Operacion) => TIPOS_EJECUTADO.includes(op.tipo_operacion)));
    setAllData(d.records || []);
  };

  const exportData = () => {
    exportToXlsx(filtered.map(op => ({ Ejercicio: op.ejercicio, CentroGestor: op.centro_gestor, Partida: op.partida_economico, Importe: op.importe_total, Descripcion: op.descripcion || "" })), `ejecutado_${cg}_${ej}`, "Ejecutado");
  };

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isCsv = file.name.endsWith(".csv");
    const onComplete = (rows: Record<string, unknown>[]) => {
      const newOps = rows.map(row => ({
        id: crypto.randomUUID(), fecha: String(row.fecha || ""), ejercicio: ej, centro_gestor: cg,
        partida_economico: String(row.partida_economico || row.Partida || ""), descripcion: String(row.descripcion || ""),
        tipo_operacion: "AD", importe_total: Math.abs(Number(row.importe_total || row.Importe || 0)),
        empresa: null, cif_nif: null, base_imponible: null, importe_iva: null,
        operacion_previa: null, operacion_definitiva: null, expte_contratacion: null, observaciones: null, link_placsp: null,
      }));
      // Usar todas las operaciones AD (no solo del centro actual)
      const adOps = allData.filter(op => TIPOS_EJECUTADO.includes(op.tipo_operacion));
      save([...adOps, ...newOps]);
      alert(`Importados ${newOps.length} registros`);
    };
    if (isCsv) importFromCsv(file, onComplete, alert);
    else importFromXlsx(file, onComplete, alert);
    e.target.value = "";
  };

  if (loading) return <main className="min-h-screen bg-gray-50"><Navbar /><div className="flex justify-center h-64"><p className="text-gray-500">Cargando...</p></div></main>;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-murcia-red">Ejecutado (AD / AD FUTURA)</h1>
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center"><span className="text-lg font-semibold text-red-800">Total Ejecutado</span>
            <span className="text-2xl font-bold text-red-700">{total.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</span>
          </div>
        </div>
        <div className="card">
          <EditableTable data={filtered} columns={columns} onSave={save} tipoOperacion="AD" partidas={filteredPartidas} centrosGestores={CENTROS_GESTORES_INICIALES} ejercicioDefault={ej} centroGestorDefault={cg} onExport={exportData} onImport={() => fileRef.current?.click()} />
          <input type="file" ref={fileRef} onChange={importFile} accept=".csv,.xlsx,.xls" className="hidden" />
        </div>
      </div>
    </main>
  );
}
