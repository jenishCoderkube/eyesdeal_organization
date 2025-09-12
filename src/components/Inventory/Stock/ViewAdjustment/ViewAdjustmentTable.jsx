import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ViewAdjustmentTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [modalImages, setModalImages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Dummy product data
  const products = useMemo(
    () => [
      {
        id: 1,
        adjustmentId: "77QX74GE",
        store: "ED HO",
        barcode: "618801",
        sku: "40PLUS-1935+1.75-BL",
        oldStock: 0,
        newStock: 2,
        reason: "Product More than Actual",
      },
    ],
    []
  );

  // Custom global filter function
  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter((item) =>
        [
          item.adjustmentId,
          item.store,
          item.barcode,
          item.sku,
          String(item.oldStock),
          String(item.newStock),
          item.reason,
        ].some((field) => field.toLowerCase().includes(lowerQuery))
      );
    },
    []
  );

  // Debounced filter logic in useEffect
  useEffect(() => {
    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(products, query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, products, filterGlobally]);

  // Handle search input change
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Use filtered data if available, otherwise use full dataset
  const tableData = filteredData || products;

  // Define table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "adjustmentId",
        header: "Adjustment ID",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "store",
        header: "Store",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "barcode",
        header: "Barcode",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "oldStock",
        header: "Old Stock",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "newStock",
        header: "New Stock",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
    ],
    []
  );

  // @tanstack/react-table setup
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, tableData.length);
  const totalRows = tableData.length;

  return (
    <>
      <div className="card-body p-0">
        <div className="mb-4 col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <FaSearch
                className="text-muted custom-search-icon"
                style={{ color: "#94a3b8" }}
              />
            </span>
            <input
              type="search"
              className="form-control border-start-0"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive px-2">
          <table className="table table-sm">
            <thead className="text-xs text-uppercase text-muted bg-light border-top border-bottom">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-3 text-left custom-perchase-th"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="text-sm">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 text-left">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex px-3 pb-3 flex-column flex-sm-row justify-content-between align-items-center mt-3">
          <div className="text-sm text-muted mb-3 mb-sm-0">
            Showing <span className="fw-medium">{startRow}</span> to{" "}
            <span className="fw-medium">{endRow}</span> of{" "}
            <span className="fw-medium">{totalRows}</span> results
          </div>
          <div className="btn-group">
            <button
              className="btn btn-outline-primary"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <button
              className="btn btn-outline-primary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewAdjustmentTable;
