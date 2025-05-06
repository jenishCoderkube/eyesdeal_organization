import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment/moment";
import { reportService } from "../../../services/reportService";

const PurchaseReportsTable = ({ data, amountData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [newamountData, setNewAmountData] = useState(amountData);

  useEffect(() => {
    setNewAmountData(amountData)
  }, [amountData])

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
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (debouncedQuery.trim()) {
      fetchPurchaseLog(debouncedQuery);
    }
  }, [debouncedQuery]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const fetchPurchaseLog = (search) => {
    reportService.getPurchaseLogBySearch(search)
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }

  // const fetchAmount = (dateFrom, dateTo, search) => {
  //   reportService.getAmountBySearch(dateFrom, dateTo, search)
  //     .then(res => {
  //       // setNewAmountData(res.data?.data?.docs);
  //     })
  //     .catch(e => console.log("Failed to get amount: ", e))
  // }
  
  const columns = useMemo(
    () => [
      {
        header: "SRNO",
        size: 10,
        cell: ({ row }) => (<div className="text-left">{row.index + 1}</div>),
      },
      {
        accessorKey: "store",
        header: "Store Name",
        size: 200,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.name}</div>,
      },
      {
        accessorKey: "vendor",
        header: "Vendor Name",
        size: 200,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.companyName}</div>,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">
            {moment(getValue()).format("DD/MM/YYYY")}
          </div>
        ),
      },
      {
        accessorKey: "invoiceNumber",
        header: "Bill No",
        size: 130,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "netAmount",
        header: "Amount",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "totalQuantity",
        header: "Total Piece",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "totalAmount",
        header: "Total Amount",
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
      data.map((item) => ({
        Store_Name: item.store.name,
        Vendor_Name: item.vendor.companyName,
        Date: moment(item.createdAt).format("YYYY-MM-DD"),
        Bill_No: item.invoiceNumber,
        Amount: item.totalAmount,
        Total_Piece: item.totalQuantity,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PurchaseReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(filteredData, "PurchaseReport");
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
        <p className="mb-0 fw-normal text-black">Total Amount: {newamountData}</p>
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

export default PurchaseReportsTable;
