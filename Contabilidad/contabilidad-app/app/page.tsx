"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { TIPOS_PRESUPUESTO, TIPOS_EJECUTADO, TIPOS_PREVISION, Operacion, CENTROS_GESTORES_INICIALES, EJERCICIO_DEFAULT, EJERCICIOS } from "@/lib/data";

export default function Home() {
  const [incluirPrevision, setIncluirPrevision] = useState(true);
  const [centroGestorFilter, setCentroGestorFilter] = useState<string>(CENTROS_GESTORES_INICIALES[0]?.codigo || "");
  const [ejercicioFilter, setEjercicioFilter] = useState<number>(EJERCICIO_DEFAULT);
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedAt, setGeneratedAt] = useState("");

  useEffect(() => {
    fetch("/api/data")
      .then(res => res.json())
      .then(data => {
        setOperaciones(data.records || []);
        setGeneratedAt(data.generated_at || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredOps = operaciones.filter(op => 
    op.centro_gestor === centroGestorFilter && op.ejercicio === ejercicioFilter
  );

  const presupuesto = filteredOps.filter(r => TIPOS_PRESUPUESTO.includes(r.tipo_operacion));
  const ejecutado = filteredOps.filter(r => TIPOS_EJECUTADO.includes(r.tipo_operacion));
  const prevision = filteredOps.filter(r => TIPOS_PREVISION.includes(r.tipo_operacion));

  const totalPresupuesto = presupuesto.reduce((sum, r) => sum + r.importe_total, 0);
  const totalEjecutado = Math.abs(ejecutado.reduce((sum, r) => sum + r.importe_total, 0));
  const totalPrevision = Math.abs(prevision.reduce((sum, r) => sum + r.importe_total, 0));

  const disponibleContabilidad = totalPresupuesto - totalEjecutado;
  const disponiblePrevisto = totalPresupuesto - totalEjecutado - totalPrevision;

  const partidas = Array.from(new Set(filteredOps.map(r => r.partida_economico)));
  const partidasData = partidas.map(p => {
    const presupuestoPartida = presupuesto
      .filter(r => r.partida_economico === p)
      .reduce((sum, r) => sum + r.importe_total, 0);
    const ejecutadoPartida = Math.abs(ejecutado
      .filter(r => r.partida_economico === p)
      .reduce((sum, r) => sum + r.importe_total, 0));
    const previsionPartida = Math.abs(prevision
      .filter(r => r.partida_economico === p)
      .reduce((sum, r) => sum + r.importe_total, 0));
    
    const saldo = presupuestoPartida - ejecutadoPartida - (incluirPrevision ? previsionPartida : 0);
    
    return {
      codigo: p,
      presupuesto: presupuestoPartida,
      ejecutado: ejecutadoPartida,
      prevision: previsionPartida,
      saldo: saldo,
    };
  }).sort((a, b) => b.saldo - a.saldo);

  const porcentajeEjecutado = totalPresupuesto > 0 ? (totalEjecutado / totalPresupuesto) * 100 : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">📊 Ejecución Presupuestaria</h1>
          <p className="text-gray-600 mt-2">Datos actualizados: {generatedAt}</p>
        </div>

        {/* Filtros */}
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

        {/* Resumen Ejecutivo y Partidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="card-header">Resumen Ejecutivo</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Presupuesto:</span>
                <span className="font-bold text-lg text-green-700">
                  {totalPresupuesto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ejecutado:</span>
                <span className="font-bold text-lg text-red-600">
                  {totalEjecutado.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Previsión:</span>
                <span className="font-bold text-lg text-yellow-600">
                  {totalPrevision.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-semibold">Disponible contabilidad:</span>
                  <span className={`font-bold text-lg ${disponibleContabilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {disponibleContabilidad.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-semibold">Disponible previsto:</span>
                  <span className={`font-bold text-lg ${disponiblePrevisto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {disponiblePrevisto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>% Ejecutado</span>
                  <span className="font-semibold">{porcentajeEjecutado.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-murcia-blue h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(porcentajeEjecutado, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-header">Por Partida Económica</h2>
            <div className="flex items-center space-x-2 py-2 border-b">
              <input
                type="checkbox"
                id="incluirPrevision"
                checked={incluirPrevision}
                onChange={(e) => setIncluirPrevision(e.target.checked)}
                className="w-4 h-4 text-murcia-blue rounded"
              />
              <label htmlFor="incluirPrevision" className="text-sm text-gray-700">
                Restar previsión del disponible
              </label>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {partidasData.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay datos</p>
              ) : (
                partidasData.map(p => (
                  <div key={p.codigo} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{p.codigo}</span>
                      <span className={`font-bold ${p.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {p.saldo.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Ppto: {p.presupuesto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
                      <span>|</span>
                      <span>Ejec: {p.ejecutado.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
                      {incluirPrevision && (
                        <>
                          <span>|</span>
                          <span>Prev: {p.prevision.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
                        </>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${p.presupuesto > 0 ? '' : 'bg-red-500'}`}
                        style={{ width: `${p.presupuesto > 0 ? 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
