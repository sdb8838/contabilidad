import fs from "fs";
import path from "path";
import { PresupuestoData, Operacion } from "./data";

// Rutas de datos
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "data.json");

// Cargar datos desde archivo JSON (sólo para uso del servidor)
export function loadData(): PresupuestoData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(fileContent) as PresupuestoData;
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }
  
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
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
