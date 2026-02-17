import { NextRequest, NextResponse } from "next/server";
import { operacionesQueries, partidasQueries } from "@/lib/db";
import { Operacion, Partida } from "@/lib/data";

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    if (type === "operaciones") {
      const operaciones = data as Operacion[];
      
      // Get unique combinations of centro_gestor and tipo_operacion in the incoming data
      const uniqueTypes = new Set<string>();
      const uniqueCentroGestores = new Set<string>();
      
      for (const op of operaciones) {
        uniqueTypes.add(op.tipo_operacion);
        uniqueCentroGestores.add(op.centro_gestor);
      }
      
      // Delete only operaciones that match the types and centro_gestores being saved
      // This preserves operaciones of other centro_gestores or other tipos
      const placeholders = Array.from(uniqueCentroGestores).map(() => '?').join(',');
      const tipoPlaceholders = Array.from(uniqueTypes).map(() => '?').join(',');
      
      const deleteStmt = (await import("@/lib/db")).default.prepare(`
        DELETE FROM operaciones 
        WHERE centro_gestor IN (${placeholders}) 
        AND tipo_operacion IN (${tipoPlaceholders})
      `);
      
      const deleteParams = [
        ...Array.from(uniqueCentroGestores),
        ...Array.from(uniqueTypes)
      ];
      deleteStmt.run(...deleteParams);
      
      const insertStmt = (await import("@/lib/db")).default.prepare(`
        INSERT INTO operaciones (id, fecha, ejercicio, centro_gestor, partida_economico, descripcion, tipo_operacion, importe_total, empresa, cif_nif, base_imponible, importe_iva, operacion_previa, operacion_definitiva, expte_contratacion, observaciones, link_placsp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const op of operaciones) {
        insertStmt.run(
          op.id, op.fecha, op.ejercicio, op.centro_gestor, op.partida_economico,
          op.descripcion, op.tipo_operacion, op.importe_total, op.empresa, op.cif_nif,
          op.base_imponible, op.importe_iva, op.operacion_previa,
          op.operacion_definitiva, op.expte_contratacion, op.observaciones, op.link_placsp
        );
      }
    } else if (type === "partidas") {
      const partidas = data as Partida[];
      
      // Get unique centro_gestores in the incoming data
      const uniqueCentroGestores = new Set<string>();
      for (const p of partidas) {
        uniqueCentroGestores.add(p.centro_gestor);
      }
      
      // Delete only partidas that match the centro_gestores being saved
      const placeholders = Array.from(uniqueCentroGestores).map(() => '?').join(',');
      const deleteStmt = (await import("@/lib/db")).default.prepare(`
        DELETE FROM partidas WHERE centro_gestor IN (${placeholders})
      `);
      deleteStmt.run(...Array.from(uniqueCentroGestores));
      
      const insertStmt = (await import("@/lib/db")).default.prepare(`
        INSERT INTO partidas (id, ejercicio, centro_gestor, codigo, descripcion)
        VALUES (?, ?, ?, ?, ?)
      `);
      
      for (const p of partidas) {
        insertStmt.run(p.id, p.ejercicio, p.centro_gestor, p.codigo, p.descripcion);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json({ success: false, error: "Error al guardar" }, { status: 500 });
  }
}
