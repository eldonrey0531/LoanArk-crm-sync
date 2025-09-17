import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { HubSpotContact } from '../types/hubspot';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

/**
 * Manual pagination configuration for server-side pagination
 */
interface ManualPaginationProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages available */
  totalPages: number;
  /** Number of items per page */
  pageSize: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Callback function called when user changes page */
  onPageChange: (page: number) => void;
  /** Optional callback function called when user changes page size */
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Props for the ContactsTable component
 */
interface ContactsTableProps {
  /** Array of HubSpot contacts to display */
  contacts: HubSpotContact[];
  /** Whether the table is in a loading state */
  isLoading?: boolean;
  /** Whether data is currently being fetched (for pagination transitions) */
  isFetching?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Manual pagination configuration (enables server-side pagination) */
  manualPagination?: ManualPaginationProps;
}

/**
 * ContactsTable - A comprehensive table component for displaying HubSpot contacts
 *
 * Features:
 * - Sortable columns (client-side sorting)
 * - Server-side pagination support
 * - Loading and error states
 * - Accessibility-compliant pagination controls
 * - Responsive design
 *
 * @example
 * ```tsx
 * // Client-side pagination (default)
 * <ContactsTable contacts={contacts} isLoading={loading} error={error} />
 *
 * // Server-side pagination
 * <ContactsTable
 *   contacts={contacts}
 *   isLoading={loading}
 *   isFetching={fetching}
 *   error={error}
 *   manualPagination={{
 *     currentPage: 1,
 *     totalPages: 10,
 *     pageSize: 25,
 *     totalItems: 250,
 *     onPageChange: (page) => setCurrentPage(page),
 *     onPageSizeChange: (size) => setPageSize(size),
 *   }}
 * />
 * ```
 */

const columns: ColumnDef<HubSpotContact>[] = [
  {
    accessorKey: 'hs_object_id',
    header: 'HubSpot ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => (
      <span className="text-blue-600">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: 'email_verification_status',
    header: 'Email Status',
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return <span className="capitalize">{value || 'N/A'}</span>;
    },
  },
  {
    accessorKey: 'firstname',
    header: 'First Name',
  },
  {
    accessorKey: 'lastname',
    header: 'Last Name',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'mobilephone',
    header: 'Mobile Phone',
  },
  {
    accessorKey: 'client_type_vip_status',
    header: 'VIP Status',
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return <span className="capitalize">{value || 'N/A'}</span>;
    },
  },
  {
    accessorKey: 'client_type_prospects',
    header: 'Prospect Type',
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return <span className="capitalize">{value || 'N/A'}</span>;
    },
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: 'zip',
    header: 'ZIP Code',
  },
  {
    accessorKey: 'createdate',
    header: 'Created',
    cell: ({ getValue }) => {
      const value = getValue<string>();
      if (!value) return 'N/A';
      return new Date(value).toLocaleDateString();
    },
  },
  {
    accessorKey: 'lastmodifieddate',
    header: 'Last Modified',
    cell: ({ getValue }) => {
      const value = getValue<string>();
      if (!value) return 'N/A';
      return new Date(value).toLocaleDateString();
    },
  },
];

export const ContactsTable: React.FC<ContactsTableProps> = ({
  contacts,
  isLoading = false,
  isFetching = false,
  error = null,
  manualPagination,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: contacts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Only use pagination row model if not using manual pagination
    ...(manualPagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    onSortingChange: setSorting,
    state: {
      sorting,
      // Only set pagination state if not using manual pagination
      ...(manualPagination ? {} : {
        pagination: {
          pageIndex: 0,
          pageSize: 25,
        },
      }),
    },
  });

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4">
        <div className="text-red-800">
          <strong>Error loading contacts:</strong> {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading contacts...</div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center">
        <div className="text-gray-500">No contacts found</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border relative">
        {isFetching && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-gray-500">Loading...</div>
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        onClick={header.column.getToggleSortingHandler()}
                        className="h-auto p-0 font-semibold hover:bg-transparent"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ChevronUp className="ml-2 h-4 w-4" />,
                          desc: <ChevronDown className="ml-2 h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </Button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <nav
        aria-label="Contacts table pagination"
        className="flex items-center justify-between"
        role="navigation"
      >
        {manualPagination ? (
          <>
            <div className="text-sm text-gray-500" aria-live="polite">
              Page {manualPagination.currentPage} of {manualPagination.totalPages} ({manualPagination.totalItems} total contacts)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Pagination: Previous page clicked', {
                    currentPage: manualPagination.currentPage,
                    totalPages: manualPagination.totalPages
                  });
                  manualPagination.onPageChange(manualPagination.currentPage - 1);
                }}
                disabled={manualPagination.currentPage <= 1}
                aria-label={`Go to previous page. Current page is ${manualPagination.currentPage}`}
                aria-disabled={manualPagination.currentPage <= 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500" aria-current="page">
                Page {manualPagination.currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Pagination: Next page clicked', {
                    currentPage: manualPagination.currentPage,
                    totalPages: manualPagination.totalPages
                  });
                  manualPagination.onPageChange(manualPagination.currentPage + 1);
                }}
                disabled={manualPagination.currentPage >= manualPagination.totalPages}
                aria-label={`Go to next page. Current page is ${manualPagination.currentPage}`}
                aria-disabled={manualPagination.currentPage >= manualPagination.totalPages}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-500">
              Showing {table.getRowModel().rows.length} of {contacts.length} contacts
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Go to previous page"
                aria-disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Go to next page"
                aria-disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </nav>
    </div>
  );
};