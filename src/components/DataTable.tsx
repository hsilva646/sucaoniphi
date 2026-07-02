import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, Search, Edit2, Trash2, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface Column<T> {
  id: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (row: T) => void;
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  title?: string;
  actionButton?: React.ReactNode;
  emptyState?: React.ReactNode;
}

function DataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  onDuplicate,
  onRowClick,
  searchable = true,
  paginated = true,
  pageSize = 10,
  title,
  actionButton,
  emptyState,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filtro
    if (searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Ordenação
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;

        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  const paginatedData = useMemo(() => {
    if (!paginated) return filteredAndSortedData;
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(start, start + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);

  const handleSort = (columnId: keyof T) => {
    setSortConfig((current) => {
      if (current?.key === columnId) {
        return {
          key: columnId,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  return (
    <Card>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {actionButton}
        </CardHeader>
      )}
      <CardContent>
        {searchable && (
          <div className="mb-4">
            <Input
              placeholder="Pesquisar..."
              icon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        )}

        {paginatedData.length === 0 ? (
          emptyState || (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum dado disponível'}
            </div>
          )
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border">
                    {columns.map((column) => (
                      <th
                        key={String(column.id)}
                        className={cn(
                          'px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300',
                          column.sortable && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border'
                        )}
                        onClick={() => column.sortable && handleSort(column.id)}
                        style={{ width: column.width }}
                      >
                        <div className="flex items-center gap-2">
                          {column.label}
                          {column.sortable && sortConfig?.key === column.id && (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          )}
                        </div>
                      </th>
                    ))}
                    {(onEdit || onDelete || onDuplicate) && (
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors"
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((column) => (
                        <td
                          key={String(column.id)}
                          className="px-4 py-3 text-gray-900 dark:text-white"
                          style={{ width: column.width }}
                        >
                          {column.render ? column.render(row[column.id], row) : String(row[column.id])}
                        </td>
                      ))}
                      {(onEdit || onDelete || onDuplicate) && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(row);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            {onDuplicate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDuplicate(row);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(row.id);
                                }}
                                className="h-8 w-8 p-0 text-financial-red hover:text-financial-red hover:bg-financial-red/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {paginated && totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {paginatedData.length} de {filteredAndSortedData.length} registros
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export { DataTable };
export type { Column, DataTableProps };
