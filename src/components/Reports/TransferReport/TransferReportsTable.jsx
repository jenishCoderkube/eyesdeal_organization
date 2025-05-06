import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment";
import { reportService } from "../../../services/reportService";
import { toast } from "react-toastify";

const TransferReportsTable = ({ data, fromDate, toDate, StoreFrom, Storeto }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (Array.isArray(data)) {
      const formattedData = processData(data);
      setFilteredData(formattedData);
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
      fetchTransferStockWithFilter({
        search: debouncedQuery,
        fromDate: fromDate,
        toDate: toDate,
        storeFromid: StoreFrom.value,
        storeToid: Storeto.value,
      });
    }
  }, [debouncedQuery]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const fetchTransferStockWithFilter = async ({ search, fromDate, toDate, storeFromid, storeToid }) => {
    try {
      const payload = {
        fromDate,
        toDate,
        ...(storeFromid && storeFromid.length && { storeFromid }),
        ...(storeToid && storeToid.length && { storeToid }),
        search
      };
      const response = await reportService.getTransferStock(payload)
      
      if (response.success) {
        const formattedData = processData(response?.data?.data?.docs);
        setFilteredData(formattedData);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  }

  const processData = (rawData) => {
    const processed = [];

    rawData.forEach((item) => {
      const date = moment(item.createdAt).format("YYYY-MM-DD");
      const fromName = item.from?.name || "";
      const toName = item.to?.name || "";
      const Qty = item.products?.stockQuantity || "";

      if (Array.isArray(item.string)) {
        item.string.forEach((entry) => {
          processed.push({
            date,
            from: fromName,
            to: toName,
            sku: entry.sku || "",
            stockQty: Qty
          });
        });
      }
    });
    return processed;
  };

  const columns = useMemo(
    () => [
      {
        header: "SRNO",
        size: 10,
        cell: ({ row }) => (<div className="text-left">{row.index + 1}</div>),
      },
      {
        accessorKey: "date",
        header: "Date",
        size: 120,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "from",
        header: "From Store",
        size: 200,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "to",
        header: "To Store",
        size: 200,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "sku",
        header: "SKU",
        size: 200,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "stockQty",
        header: "Stock Quantity",
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
        Date: item.date,
        From_Store: item.from,
        To_Store: item.to,
        SKU: item.sku,
        Stock_Quantity: item.stockQty,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TransferReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(filteredData, "TransferReport");
  };

  // Pagination info
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, filteredData?.length);
  const totalRows = filteredData?.length;

  return (
    <div className="card-body p-0">
      <div className="d-flex flex-column px-3 flex-md-row gap-3 mb-4">

        <div className="ms-md-auto d-flex gap-2">
          <button className="btn btn-primary" onClick={exportProduct}>
            Download
          </button>
        </div>
      </div>
      <div className="mb-4 col-md-6 ">
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
      <div className="table-responsive ">
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
          <span class="fw-medium">{endRow}</span> of{" "}
          <span class="fw-medium">{totalRows}</span> results
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

export default TransferReportsTable;
