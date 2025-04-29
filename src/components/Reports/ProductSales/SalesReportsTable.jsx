import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment/moment";
import { reportService } from "../../../services/reportService";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const SalesReportsTable = ({ data, amountData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  // // Custom global filter function
  // const filterGlobally = useMemo(
  //   () => (data, query) => {
  //     if (!query) return data;
  //     const lowerQuery = query.toLowerCase();
  //     return data.filter((item) =>
  //       [
  //         item.store,
  //         item.date,
  //         item.orderNo,
  //         item.customerName,
  //         item.brand,
  //         item.barcode,
  //         item.sku,
  //         String(item.mrp),
  //         String(item.discount),
  //         String(item.netAmount),
  //       ].some((field) => field.toLowerCase().includes(lowerQuery))
  //     );
  //   },
  //   []
  // );

  // // Debounced filter logic in useEffect
  // useEffect(() => {
  //   const debouncedFilter = debounce((query) => {
  //     setFilteredData(filterGlobally(data, query));
  //   }, 200);

  //   debouncedFilter(searchQuery);

  //   return () => clearTimeout(debouncedFilter.timeout);
  // }, [searchQuery, data, filterGlobally]);

  // Handle search input change
  const handleSearch = async (value) => {
    setSearchQuery(value);

    try {
      const response = await reportService.getOrdersBySearch(value);

      if (response.success) {
          console.log(response.data)
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching searched data:", error);
    }

  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        header: "SRNO",
        size: 10,
        cell: ({ row }) => (<div className="text-left">{row.index + 1}</div>
        ),
      },
      {
        accessorKey: "store",
        header: "Store Name",
        size: 270,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.name}</div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ getValue }) => (
          <div className="text-left">
            {moment(getValue()).format("DD/MM/YYYY")}
          </div>
        ),
      },
      {
        accessorKey: "billNumber",
        header: "Order No",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "sale",
        header: "Customer Name",
        size: 220,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.customerName}</div>
        ),
      },
      {
        id: "product",
        accessorKey: "product",
        header: "Brand",
        size: 210,
        cell: ({ getValue }) => (
          <div className="text-left">
            {(getValue()?.item?.brand?.name ?? "") +
              " " +
              (getValue()?.item?.__t ?? "")}
          </div>
        ),
      },
      {
        id: "productBarcode",
        accessorKey: "product",
        header: "Barcode",
        cell: ({ getValue }) => <div className="text-left">{getValue()?.barcode}</div>,
      },
      {
        id: "productSKU",
        accessorKey: "product",
        header: "SKU",
        size: 300,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.sku}</div>,
      },
      {
        id: "productMRP",
        accessorKey: "product",
        header: "MRP",
        size: 80,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.mrp}</div>,
      },
      {
        id: "productDiscount",
        accessorKey: "product",
        header: "Discount",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.perPieceDiscount}</div>,
      },
      {
        id: "productNetAmount",
        accessorKey: "product",
        header: "Net Amount",
        size: 120,
        cell: ({ getValue }) => <div className="text-left">{getValue()?.perPieceAmount}</div>,
      },
    ],
    []
  );

  // @tanstack/react-table setup
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

  // Export to Excel functions
  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Store_Name: item.store,
        Brand: item.brand,
        Customer_Name: item.customerName,
        SKU: item.sku,
        "Order No": item.orderNo,
        Barcode: item.barcode,
        MRP: item.mrp,
        Discount: item.discount,
        Net_Amount: item.netAmount,
      }))
    );
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

  // Calculate total amount
  const totalAmount = filteredData.reduce(
    (sum, item) => sum + item.netAmount,
    0
  );

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
