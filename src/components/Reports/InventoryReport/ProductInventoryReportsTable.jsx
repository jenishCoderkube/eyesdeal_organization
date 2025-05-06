import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { reportService } from "../../../services/reportService";

const ProductInventoryReportsTable = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (Array.isArray(data)) {
      setFilteredData(data);
    }
  }, [data]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchInventoryReport({ page: 1, manageStock: true, search: debouncedQuery });
    }
  }, [debouncedQuery]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const fetchInventoryReport = ({ page, manageStock, search }) => {
    const payload = {
      ...(page && { page }),
      manageStock,
      search
    };
    reportService.fetchInventoryReport(payload)
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get orders: ", e))
  }

  const columns = useMemo(
    () => [
      {
        header: "SRNO",
        size: 10,
        cell: ({ row }) => (<div className="text-left">{row.index + 1}</div>),
      },
      {
        id: "ProductName",
        accessorKey: "product",
        header: "Name",
        size: 700,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.displayName}</div>,
      },
      {
        id: "ProductSku",
        accessorKey: "product",
        header: "Sku",
        size: 250,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.sku}</div>,
      },
      {
        id: "ProductMrp",
        accessorKey: "product",
        header: "MRP",
        size: 50,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.MRP}</div>,
      },
      {
        id: "ProductSellprice",
        accessorKey: "product",
        header: "Sell Price",
        size: 120,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.sellPrice}</div>,
      },
      {
        id: "ProductBrand",
        accessorKey: "product",
        header: "Brand",
        size: 150,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.brand?.name}</div>,
      },
      {
        id: "ProductBarcode",
        accessorKey: "product",
        header: "Barcode",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.newBarcode}</div>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item, index) => ({
        SRNO: index + 1,
        Name: item?.product?.displayName,
        Sku: item?.product?.sku,
        MRP: item?.product?.MRP,
        Sell_Price: item?.product?.sellPrice,
        Brand: item?.product?.brand?.name,
        Barcode: item?.product?.newBarcode,
        Stock: item.stock,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProductInventoryReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(filteredData, "ProductInventoryReport");
  };

  // Pagination info
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, filteredData.length);
  const totalRows = filteredData.length;

  return (
    <div className="card-body p-0">
      <div className="d-flex flex-column px-3 flex-md-row gap-3 mb-4">
        <div className="ms-md-auto d-flex gap-2">
          <button className="btn btn-primary" onClick={exportProduct}>
            Download
          </button>
        </div>
      </div>
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
            className="form-control border-start-0 py-2q"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive px-2">
        <table className="table table-sm">
          <thead className="text-xs text-uppercase text-muted bg-light border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 text-left custom-perchase-th"
                    style={{ minWidth: `${header.getSize()}px` }}
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
                  <td key={cell.id} className="p-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  );
};

export default ProductInventoryReportsTable;
