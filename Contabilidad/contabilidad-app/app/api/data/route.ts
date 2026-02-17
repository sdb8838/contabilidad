import { NextResponse } from "next/server";
import { operacionesQueries, partidasQueries, centrosQueries } from "@/lib/db";

export async function GET() {
  try {
    const operaciones = operacionesQueries.getAll();
    const partidas = partidasQueries.getAll();
    const centros = centrosQueries.getAll();

    // Get unique values for filters
    const tiposOperacion = [...new Set(operaciones.map((op: any) => op.tipo_operacion))].sort();
    const centrosConDatos = [...new Set(operaciones.map((op: any) => op.centro_gestor))].sort();
    const partidasConDatos = [...new Set(operaciones.map((op: any) => op.partida_economico))].sort();

    return NextResponse.json({
      source_file: "SQLite Database",
      sheet: "contabilidad.db",
      generated_at: new Date().toISOString(),
      records: operaciones,
      domains: {
        tipo_operacion: tiposOperacion,
        centro_gestor: centrosConDatos,
        partida_economico: partidasConDatos,
      },
      partidas,
      centros_gestores: centros,
    });
  } catch (error) {
    console.error("Error loading data:", error);
    return NextResponse.json({ error: "Error al cargar datos" }, { status: 500 });
  }
}
