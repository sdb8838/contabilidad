// Ejercicio actual por defecto
export const EJERCICIO_DEFAULT = 2026;

// Lista de ejercicios disponibles
export const EJERCICIOS = [2024, 2025, 2026, 2027];

// Tipos para los datos de ejecución presupuestaria
export interface Operacion {
  id: string;
  fecha: string | null;
  ejercicio: number;
  centro_gestor: string;
  partida_economico: string;
  descripcion: string | null;
  tipo_operacion: string;
  importe_total: number;
  empresa: string | null;
  cif_nif: string | null;
  base_imponible: number | null;
  importe_iva: number | null;
  operacion_previa: string | null;
  operacion_definitiva: string | null;
  expte_contratacion: string | null;
  observaciones: string | null;
  link_placsp: string | null;
}

export interface Partida {
  id: string;
  ejercicio: number;
  centro_gestor: string;
  codigo: string;
  descripcion: string;
}

export interface CentroGestor {
  id: string;
  codigo: string;
  nombre: string;
}

export interface DomainData {
  centro_gestor: string[];
  tipo_operacion: string[];
  partida_economico: string[];
}

export interface PresupuestoData {
  source_file: string;
  sheet: string;
  generated_at: string;
  records: Operacion[];
  domains: DomainData;
  partidas?: Partida[];
  centros_gestores?: CentroGestor[];
}

// Constantes para tipos de operación
export const TIPOS_PRESUPUESTO = ['PPTO2026'];
export const TIPOS_EJECUTADO = ['AD', 'AD FUTURA', 'AD FUTURA BARRADA', 'A FUTURA DEFINITIVA'];
export const TIPOS_PREVISION = ['Previsión', 'Previsión-I'];

// Partidas iniciales (023 Informática)
export const PARTIDAS_INICIALES: Partida[] = [
  { id: '1', ejercicio: 2026, centro_gestor: '023', codigo: '22002', descripcion: 'Material de oficina' },
  { id: '2', ejercicio: 2026, centro_gestor: '023', codigo: '21600', descripcion: 'Equipos informáticos' },
  { id: '3', ejercicio: 2026, centro_gestor: '023', codigo: '22799', descripcion: 'Otros trabajos empresas' },
  { id: '4', ejercicio: 2026, centro_gestor: '023', codigo: '22100', descripcion: 'Energía eléctrica' },
  { id: '5', ejercicio: 2026, centro_gestor: '023', codigo: '22101', descripcion: 'Agua' },
  { id: '6', ejercicio: 2026, centro_gestor: '023', codigo: '22200', descripcion: 'Telecomunicaciones' },
  { id: '7', ejercicio: 2026, centro_gestor: '023', codigo: '22699', descripcion: 'Otros gastos diversos' },
  { id: '8', ejercicio: 2026, centro_gestor: '023', codigo: '21200', descripcion: 'Edificios y construcciones' },
  { id: '9', ejercicio: 2026, centro_gestor: '023', codigo: '21300', descripcion: 'Maquinaria y instalaciones' },
  { id: '10', ejercicio: 2026, centro_gestor: '023', codigo: '21400', descripcion: 'Elementos de transporte' },
];

// Centros gestores iniciales
export const CENTROS_GESTORES_INICIALES: CentroGestor[] = [
  { id: '1', codigo: '023', nombre: 'Informática' },
  { id: '2', codigo: '081', nombre: 'Telecomunicaciones' },
  { id: '3', codigo: '711', nombre: 'Smart City' },
];
