import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { User } from '../types/user';

async function fetchUsers(): Promise<User[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/users');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as unknown;
  // 最低限の型ガード
  const users = Array.isArray(json) ? (json as any[]) : [];
  return users.map((u) => ({
    id: Number(u.id),
    name: String(u.name),
    email: String(u.email),
    company: { name: String(u?.company?.name) },
  }));
}

export default function Users() {
  const { data, isLoading, isError, error } = useQuery<User[], Error>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Company',
        id: 'companyName',
        accessorFn: (row) => row.company.name,
      },
    ],
    []
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  // フックの呼び出し順を安定させるため、
  // ローディング中でも常に useReactTable を呼ぶ
  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <main>
      <h1>Users</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p role="alert">Error: {error.message}</p>
      ) : (
        <table role="table" aria-label="users">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDir = header.column.getIsSorted();
                const label =
                  sortDir === 'asc' ? ' ▲' : sortDir === 'desc' ? ' ▼' : '';
                return (
                  <th key={header.id}>
                    {canSort ? (
                      <button onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {label}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        </table>
      )}
    </main>
  );
}

// テスト用に個別エクスポート
export { fetchUsers };
