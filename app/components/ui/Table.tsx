import { ReactNode } from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T;
  cell?: (value: T[keyof T], item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void; // optional row click handler
}

export function Table<T>({ data, columns, onRowClick }: TableProps<T>) {
  return (
    <div className='overflow-x-auto rounded-xl border border-mpsi/20'>
      <table className='min-w-full text-center text-sm'>
        <thead className='bg-mpsi text-white'>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className='p-4 text-center'>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className='cursor-pointer border-b border-mpsi/10 hover:bg-mpsi/5'
              onClick={() => onRowClick?.(item)} // only triggers if onRowClick is provided
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className='p-4'>
                  {column.cell
                    ? column.cell(item[column.accessor], item)
                    : (item[column.accessor] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
