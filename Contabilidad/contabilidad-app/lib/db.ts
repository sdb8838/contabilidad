import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "contabilidad.db");

// Ensure data directory exists
import fs from "fs";
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS operaciones (
    id TEXT PRIMARY KEY,
    fecha TEXT,
    ejercicio INTEGER,
    centro_gestor TEXT,
    partida_economico TEXT,
    descripcion TEXT,
    tipo_operacion TEXT,
    importe_total REAL,
    empresa TEXT,
    cif_nif TEXT,
    base_imponible REAL,
    importe_iva REAL,
    operacion_previa TEXT,
    operacion_definitiva TEXT,
    expte_contratacion TEXT,
    observaciones TEXT,
    link_placsp TEXT
  );

  CREATE TABLE IF NOT EXISTS partidas (
    id TEXT PRIMARY KEY,
    ejercicio INTEGER,
    centro_gestor TEXT,
    codigo TEXT,
    descripcion TEXT
  );

  CREATE TABLE IF NOT EXISTS centros_gestores (
    id TEXT PRIMARY KEY,
    codigo TEXT,
    nombre TEXT
  );

  CREATE TABLE IF NOT EXISTS usuarios_autorizados (
    username TEXT PRIMARY KEY,
    display_name TEXT,
    added_at TEXT
  );

  CREATE TABLE IF NOT EXISTS usuarios_admin (
    username TEXT PRIMARY KEY,
    password TEXT,
    display_name TEXT
  );
`);

// Initialize default admin user if not exists
const adminExists = db.prepare("SELECT 1 FROM usuarios_admin WHERE username = ?").get("admin");
if (!adminExists) {
  db.prepare("INSERT INTO usuarios_admin (username, password, display_name) VALUES (?, ?, ?)").run("admin", "admin", "Administrador");
}

// Initialize default centros gestores
const cgCount = db.prepare("SELECT COUNT(*) as count FROM centros_gestores").get() as { count: number };
if (cgCount.count === 0) {
  const insertCG = db.prepare("INSERT INTO centros_gestores (id, codigo, nombre) VALUES (?, ?, ?)");
  insertCG.run("1", "023", "Informática");
  insertCG.run("2", "081", "Telecomunicaciones");
  insertCG.run("3", "711", "Smart City");
}

// Initialize default partidas
const partidasCount = db.prepare("SELECT COUNT(*) as count FROM partidas").get() as { count: number };
if (partidasCount.count === 0) {
  const insertPartida = db.prepare("INSERT INTO partidas (id, ejercicio, centro_gestor, codigo, descripcion) VALUES (?, ?, ?, ?, ?)");
  insertPartida.run("1", 2026, "023", "22002", "Material de oficina");
  insertPartida.run("2", 2026, "023", "21600", "Equipos informáticos");
  insertPartida.run("3", 2026, "023", "22799", "Otros trabajos empresas");
  insertPartida.run("4", 2026, "023", "22100", "Energía eléctrica");
  insertPartida.run("5", 2026, "023", "22101", "Agua");
  insertPartida.run("6", 2026, "023", "22200", "Telecomunicaciones");
  insertPartida.run("7", 2026, "023", "22699", "Otros gastos diversos");
  insertPartida.run("8", 2026, "023", "21200", "Edificios y construcciones");
  insertPartida.run("9", 2026, "023", "21300", "Maquinaria y instalaciones");
  insertPartida.run("10", 2026, "023", "21400", "Elementos de transporte");
}

export default db;

// Prepared statements for operaciones
export const operacionesQueries = {
  getAll: () => db.prepare("SELECT * FROM operaciones ORDER BY fecha DESC").all(),
  getById: (id: string) => db.prepare("SELECT * FROM operaciones WHERE id = ?").get(id),
  getByTipo: (tipo: string) => db.prepare("SELECT * FROM operaciones WHERE tipo_operacion = ? ORDER BY fecha DESC").all(tipo),
  getByEjercicioCG: (ejercicio: number, cg: string) => 
    db.prepare("SELECT * FROM operaciones WHERE ejercicio = ? AND centro_gestor = ? ORDER BY fecha DESC").all(ejercicio, cg),
  insert: (operacion: any) => {
    const stmt = db.prepare(`
      INSERT INTO operaciones (id, fecha, ejercicio, centro_gestor, partida_economico, descripcion, tipo_operacion, importe_total, empresa, cif_nif, base_imponible, importe_iva, operacion_previa, operacion_definitiva, expte_contratacion, observaciones, link_placsp)
      VALUES (@id, @fecha, @ejercicio, @centro_gestor, @partida_economico, @descripcion, @tipo_operacion, @importe_total, @empresa, @cif_nif, @base_imponible, @importe_iva, @operacion_previa, @operacion_definitiva, @expte_contratacion, @observaciones, @link_placsp)
    `);
    return stmt.run(operacion);
  },
  update: (operacion: any) => {
    const stmt = db.prepare(`
      UPDATE operaciones SET fecha=@fecha, ejercicio=@ejercicio, centro_gestor=@centro_gestor, partida_economico=@partida_economico, descripcion=@descripcion, tipo_operacion=@tipo_operacion, importe_total=@importe_total, empresa=@empresa, cif_nif=@cif_nif, base_imponible=@base_imponible, importe_iva=@importe_iva, operacion_previa=@operacion_previa, operacion_definitiva=@operacion_definitiva, expte_contratacion=@expte_contratacion, observaciones=@observaciones, link_placsp=@link_placsp
      WHERE id=@id
    `);
    return stmt.run(operacion);
  },
  delete: (id: string) => db.prepare("DELETE FROM operaciones WHERE id = ?").run(id),
};

// Prepared statements for partidas
export const partidasQueries = {
  getAll: () => db.prepare("SELECT * FROM partidas ORDER BY codigo ASC").all(),
  getById: (id: string) => db.prepare("SELECT * FROM partidas WHERE id = ?").get(id),
  getByEjercicioCG: (ejercicio: number, cg: string) => 
    db.prepare("SELECT * FROM partidas WHERE ejercicio = ? AND centro_gestor = ? ORDER BY codigo ASC").all(ejercicio, cg),
  insert: (partida: any) => {
    const stmt = db.prepare("INSERT INTO partidas (id, ejercicio, centro_gestor, codigo, descripcion) VALUES (@id, @ejercicio, @centro_gestor, @codigo, @descripcion)");
    return stmt.run(partida);
  },
  update: (partida: any) => {
    const stmt = db.prepare("UPDATE partidas SET codigo=@codigo, descripcion=@descripcion WHERE id=@id");
    return stmt.run(partida);
  },
  delete: (id: string) => db.prepare("DELETE FROM partidas WHERE id = ?").run(id),
};

// Prepared statements for centros gestores
export const centrosQueries = {
  getAll: () => db.prepare("SELECT * FROM centros_gestores ORDER BY codigo ASC").all(),
};

// Prepared statements for usuarios autorizados
export const usersQueries = {
  getAuthorized: () => db.prepare("SELECT * FROM usuarios_autorizados ORDER BY username ASC").all(),
  addAuthorized: (username: string, displayName: string) => 
    db.prepare("INSERT OR REPLACE INTO usuarios_autorizados (username, display_name, added_at) VALUES (?, ?, ?)").run(username, displayName, new Date().toISOString()),
  removeAuthorized: (username: string) => 
    db.prepare("DELETE FROM usuarios_autorizados WHERE username = ?").run(username),
  isAuthorized: (username: string) => {
    const result = db.prepare("SELECT 1 FROM usuarios_autorizados WHERE username = ?").get(username);
    return !!result;
  },
};

// Prepared statements for admin users
export const adminQueries = {
  getByUsername: (username: string) => db.prepare("SELECT * FROM usuarios_admin WHERE username = ?").get(username),
  updatePassword: (username: string, password: string) => 
    db.prepare("UPDATE usuarios_admin SET password = ? WHERE username = ?").run(password, username),
};
