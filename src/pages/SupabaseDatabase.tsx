import React, { useState, useMemo } from 'react';
import { useHubSpotContacts } from '../hooks/useHubSpotContacts';
import { ContactsTable } from '../components/ContactsTable';

const SupabaseDatabase: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [paginationError, setPaginationError] = useState<string | null>(null);

  const offset = useMemo(
    () => (currentPage - 1) * pageSize,
    [currentPage, pageSize]
  );

  const { data, isLoading, isFetching, error, refetch } = useHubSpotContacts({
    type: 'sync',
    limit: pageSize,
    offset,
  });

  const contacts = data?.contacts || [];
  const errorMessage = error?.message || paginationError || null;
  const totalItems = data?.total || 0;
  const totalPages = useMemo(
    () => Math.ceil(totalItems / pageSize),
    [totalItems, pageSize]
  );

  const handlePageChange = (page: number) => {
    console.log('Pagination: Page change initiated (Supabase)', {
      fromPage: currentPage,
      toPage: page,
      pageSize,
      timestamp: new Date().toISOString(),
    });
    setPaginationError(null);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPaginationError(null);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  // Handle pagination errors
  React.useEffect(() => {
    if (error && currentPage > 1) {
      // If there's an error on a non-first page, it might be a pagination issue
      const errorMessage = `Failed to load page ${currentPage}. Please try again.`;
      setPaginationError(errorMessage);
      console.error('Pagination Error (Supabase):', {
        page: currentPage,
        pageSize,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } else {
      setPaginationError(null);
    }
  }, [error, currentPage]);

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Supabase Database
        </h1>
        <p className='text-gray-600'>
          View contacts synchronized from HubSpot to the Supabase database. This
          data may be slightly delayed from the live HubSpot data.
        </p>
      </div>

      <div className='mb-6 flex items-center justify-between'>
        <div className='text-sm text-gray-500'>
          {data ? `${data.total} total contacts` : 'Loading...'}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <ContactsTable
        contacts={contacts}
        isLoading={isLoading}
        isFetching={isFetching}
        error={errorMessage}
        manualPagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems,
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />
    </div>
  );
};

export default SupabaseDatabase;
