import fs from "fs";
import path from "path";
import { PresupuestoData, Operacion } from "./data";

// Rutas de datos
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "data.json");

// Cargar datos desde archivo JSON
export function loadData(): PresupuestoData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(fileContent) as PresupuestoData;
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }
  
  // Return empty structure if no data found
  return {
    source_file: "",
    sheet: "",
    generated_at: new Date().toISOString().split("T")[0],
    records: [],
    domains: {
      centro_gestor: [],
      tipo_operacion: [],
      partida_economico: [],
    },
  };
}

// Obtener solo las operaciones (para poder filtrar directamente)
export function loadOperaciones(): Operacion[] {
  const data = loadData();
  return data.records;
}

// Filtrar operaciones por tipo de operación
export function filterByTipoOperacion(
  records: Operacion[],
  tipos: string[]
): Operacion[] {
  return records.filter((r) => tipos.includes(r.tipo_operacion));
}

// Filtrar por centro gestor
export function filterByCentroGestor(
  records: Operacion[],
  centro: string
): Operacion[] {
  return records.filter((r) => r.centro_gestor === centro);
}

// Filtrar por partida económica
export function filterByPartida(
  records: Operacion[],
  partida: string
): Operacion[] {
  return records.filter((r) => r.partida_economico === partida);
}

// Calcular total de una lista de operaciones
export function calculateTotal(records: Operacion[]): number {
  return records.reduce((sum, r) => sum + r.importe_total, 0);
}

// Agrupar por campo
export function groupBy<T>(
  records: T[],
  key: keyof T
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  
  for (const record of records) {
    const value = String(record[key]);
    if (!groups.has(value)) {
      groups.set(value, []);
    }
    groups.get(value)!.push(record);
  }
  
  return groups;
}

// Calcular estadísticas por grupo
export function calculateStatsByGroup(
  records: Operacion[],
  groupKey: keyof Operacion
): { key: string; count: number; total: number }[] {
  const groups = groupBy(records, groupKey);
  
  return Array.from(groups.entries()).map(([key, items]) => ({
    key,
    count: items.length,
    total: calculateTotal(items),
  }));
}

// Guardar operaciones al archivo JSON (para uso del servidor)
export function saveOperacionesToFile(operaciones: Operacion[]): void {
  const data: PresupuestoData = {
    source_file: "ejecucion_ppto_gastos_app.json",
    sheet: "operaciones",
    generated_at: new Date().toISOString().split("T")[0],
    records: operaciones,
    domains: {
      centro_gestor: Array.from(new Set(operaciones.map(op => op.centro_gestor))),
      tipo_operacion: Array.from(new Set(operaciones.map(op => op.tipo_operacion))),
      partida_economico: Array.from(new Set(operaciones.map(op => op.partida_economico))),
    },
  };
  
  // Ensure directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
