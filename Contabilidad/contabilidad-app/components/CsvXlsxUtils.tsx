"use client";

import Papa from "papaparse";
import * as XLSX from "xlsx";

export function exportToXlsx<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName: string = "Datos"
): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function importFromCsv(
  file: File,
  onComplete: (data: Record<string, unknown>[]) => void,
  onError: (error: string) => void
): void {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      if (results.errors.length > 0) {
        onError(`Errores al procesar CSV: ${results.errors.map(e => e.message).join(", ")}`);
      } else {
        onComplete(results.data as Record<string, unknown>[]);
      }
    },
    error: (error) => {
      onError(`Error al leer archivo: ${error.message}`);
    },
  });
}

export function importFromXlsx(
  file: File,
  onComplete: (data: Record<string, unknown>[]) => void,
  onError: (error: string) => void
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
      onComplete(jsonData);
    } catch (error) {
      onError(`Error al procesar XLSX: ${(error as Error).message}`);
    }
  };
  reader.onerror = () => {
    onError("Error al leer archivo");
  };
  reader.readAsArrayBuffer(file);
}
