"use client";

import { useState, useMemo } from "react";
import { Operacion } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

interface DataTableProps {
  data: Operacion[];
  columns?: Column[];
}

export interface Column {
  key: keyof Operacion | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: Operacion) => React.ReactNode;
  width?: string;
}

const defaultColumns: Column[] = [
  { key: "centro_gestor", label: "Centro", sortable: true, width: "80px" },
  { key: "partida_economico", label: "Partida", sortable: true, width: "100px" },
  { key: "tipo_operacion", label: "Tipo", sortable: true, width: "140px" },
  { key: "descripcion", label: "Descripción", width: "auto" },
  { key: "empresa", label: "Empresa", width: "180px" },
  { key: "importe_total", label: "Importe", sortable: true, width: "120px" },
];

export default function DataTable({ data, columns = defaultColumns }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string>("importe_total");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState("");

  const sortedData = useMemo(() => {
    const filtered = data.filter((row) => {
      const searchStr = filter.toLowerCase();
      return (
        row.descripcion?.toLowerCase().includes(searchStr) ||
        row.empresa?.toLowerCase().includes(searchStr) ||
        row.tipo_operacion.toLowerCase().includes(searchStr) ||
        row.centro_gestor.includes(searchStr) ||
        row.partida_economico.includes(searchStr)
      );
    });

    return [...filtered].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortKey];
      const bVal = (b as unknown as Record<string, unknown>)[sortKey];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      
      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  }, [data, filter, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Filtrar..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-murcia-blue w-64"
        />
        <span className="text-gray-600">
          {sortedData.length} registros
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className="table-header cursor-pointer hover:bg-blue-600"
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.label}</span>
                    {col.sortable && sortKey === col.key && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={`${row.id}-${col.key as string}`} className="table-cell">
                  {col.render
                      ? col.render((row as unknown as Record<string, unknown>)[col.key], row)
                      : col.key === "importe_total"
                      ? (
                        <span className={row.importe_total < 0 ? "text-red-600" : "text-green-600"}>
                          {formatCurrency(row.importe_total)}
                        </span>
                      )
                      : String((row as unknown as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron registros
        </div>
      )}
    </div>
  );
}
