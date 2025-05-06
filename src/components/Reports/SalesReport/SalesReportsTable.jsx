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

const SalesReportsTable = ({ data, amountData }) => {
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
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (debouncedQuery.trim()) {
      fetchSalesData({ search: debouncedQuery, fromDate: yesterday.getTime(), toDate: today.getTime() });
      fetchAmount({ search: debouncedQuery, fromDate: yesterday.getTime(), toDate: today.getTime() });
    }
  }, [debouncedQuery]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const fetchSalesData = ({ search, fromDate, toDate }) => {
    const payload = {
      search,
      fromDate,
      toDate
    };
    reportService.getSalesData(payload)
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get pruchaselog: ", e))
  }

  const fetchAmount = ({ search, fromDate, toDate }) => {
    const payload = {
      search,
      fromDate,
      toDate
    };
    reportService.getAmount(payload)
      .then(res => {
        //  setAmountData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get amount: ", e))
  }

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
        size: 250,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.name}</div>,
      },
      {
        accessorKey: "customerName",
        header: "Customer Name",
        size: 200,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "salesRep",
        header: "Salesman Name",
        size: 200,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.name}</div>,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        size: 30,
        cell: ({ getValue }) => (
          <div className="text-left">
            {moment(getValue()).format("DD/MM/YYYY")}
          </div>
        ),
      },
      {
        accessorKey: "orders",
        header: "Bill No",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.[0].billNumber}</div>,
      },
      {
        accessorKey: "totalAmount",
        header: "Total Amount",
        size: 135,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        header: "Pending Amount",
        size: 150,
        cell: ({ row }) => {
          const total = row.original.totalAmount || 0;
          const receivedArray = row.original.receivedAmount || [];

          const receivedTotal = receivedArray.reduce((sum, entry) => sum + (entry.amount || 0), 0);
          const pending = total - receivedTotal;

          return <div className="text-left">{pending}</div>;
        },
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
    const transformedData = data.map((item, index) => {
      const total = item.totalAmount || 0;
      const receivedList = item.receivedAmount || [];
      const receivedTotal = receivedList.reduce((sum, entry) => sum + (entry.amount || 0), 0);
      const pending = total - receivedTotal;
  
      const billNumbers = (item.orders || [])
        .map(order => order.billNumber)
        .filter(Boolean)
        .join(", ");
  
      return {
        SRNO: index + 1,
        Store_Name: item.store?.name || "-",
        Customer_Name: item.customerName || "-",
        Salesman_Name: item.salesRep?.name || "-",
        Date: moment(item.createdAt).format("YYYY-MM-DD"),
        Bill_No: billNumbers,
        Total_Amount: total,
        Pending_Amount: pending,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(transformedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SalesReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(filteredData, "SalesReport");
  };

  const exportCustomerData = () => {
    exportToExcel(filteredData, "CustomerData");
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
        <p className="mb-0 fw-normal text-black">Total Amount: {amountData}</p>
        <div className="ms-md-auto d-flex gap-2">
          <button className="btn btn-primary" onClick={exportProduct}>
            Download
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={exportCustomerData}
          >
            Download Customer Data
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

export default SalesReportsTable;
