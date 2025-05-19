import { ReactNode } from 'react';
import { Link } from '@remix-run/react';
import { ArrowRight } from 'lucide-react';

// Generic column definition that works with both direct properties and function accessors
export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => unknown);
  cell?: (value: unknown) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  idField?: keyof T; // Field to use for row ID
  linkBaseUrl?: string;
  showViewButton?: boolean;
}

export function Table<T>({
  data,
  columns,
  idField,
  linkBaseUrl,
  showViewButton = true,
}: TableProps<T>) {
  return (
    <div className='overflow-hidden rounded-t-xl border border-mpsi'>
      <table className='w-full border-collapse'>
        <thead>
          <tr className='border-b border-mpsi bg-mpsi'>
            {columns.map((column, index) => (
              <th
                key={index}
                className='p-4 text-left text-sm font-semibold text-white'
              >
                {column.header}
              </th>
            ))}
            {showViewButton && idField && linkBaseUrl && (
              <th className='p-4 text-center text-sm font-semibold text-white'>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => {
            // Create row link if we have both idField and linkBaseUrl
            const detailUrl =
              idField && linkBaseUrl
                ? `${linkBaseUrl}/${String(item[idField])}`
                : undefined;

            return (
              <tr
                key={rowIndex}
                className='border-b border-mpsi hover:bg-gray-50'
              >
                {columns.map((column, colIndex) => {
                  const value =
                    typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : item[column.accessor];

                  const cellContent = column.cell
                    ? column.cell(value)
                    : String(value);

                  return (
                    <td
                      key={colIndex}
                      className='px-4 py-6 text-sm text-gray-700'
                    >
                      {cellContent}
                    </td>
                  );
                })}
                {showViewButton && detailUrl && (
                  <td className='px-4 py-6 text-center'>
                    <Link
                      to={detailUrl}
                      className='inline-flex size-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-600 hover:text-white'
                      aria-label='View details'
                    >
                      <ArrowRight size={18} />
                    </Link>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
