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

const ProfitLossReportsTable = ({ data, amountData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [formattedData, setFormattedData] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (Array.isArray(data)) {
      const formattedData = processData(data);
      setFormattedData(formattedData);
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
      fetchOrders({
        search: debouncedQuery,
      });
    }
  }, [debouncedQuery]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const fetchOrders = ({ search }) => {
    reportService
      .fetchOrders({ search })
      .then((res) => {
        const formattedData = processData(res.data?.data?.docs);
        setFormattedData(formattedData);
      })
      .catch((e) => console.log("Failed to get pruchaselog: ", e));
  };

  const processData = (rawData) => {
    const processed = [];
    rawData.forEach((item) => {
      const date = moment(item.createdAt).format("YYYY-MM-DD");
      const billNumber = item.billNumber;
      const storeName = item.store?.name || "";
      const custName = item.sale?.customerName || "";

      if (item.product?.item.displayName) {
        processed.push({
          type: "Product",
          date,
          billNumber,
          storeName,
          custName,
          barcode: item.product.barcode || "",
          sku: item.product.sku || "",
          brand:
            [item.product.item.brand?.name, item.product.item.__t]
              .filter(Boolean)
              .join(" ") || "",
          mrp: item.product.mrp || "",
          discount: item.product.perPieceDiscount || "",
          netAmount: item.product.perPieceAmount || "",
          costPrice: item.product.item.costPrice || "",
          profitLoss:
            (Number(item.product.perPieceAmount) || 0) -
            (Number(item.product.item.costPrice) || 0),
        });
      }

      if (item.lens?.item.displayName) {
        processed.push({
          type: "Lens",
          date,
          billNumber,
          storeName,
          custName,
          barcode: item.lens.barcode || "",
          sku: item.lens.sku || "",
          brand:
            [item.lens.item.brand?.name, item.lens.item.__t]
              .filter(Boolean)
              .join(" ") || "",
          mrp: item.lens.mrp || "",
          discount: item.lens.perPieceDiscount || "",
          netAmount: item.lens.perPieceAmount || "",
          costPrice: item.lens.item.costPrice || "",
          profitLoss:
            (Number(item.lens.perPieceAmount) || 0) -
            (Number(item.lens.item.costPrice) || 0),
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
        cell: ({ row }) => <div className="text-left">{row.index + 1}</div>,
      },
      {
        accessorKey: "storeName",
        header: "Store Name",
        size: 220,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "date",
        header: "Date",
        size: 120,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "billNumber",
        header: "Order No",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "custName",
        header: "Customer Name",
        size: 200,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "barcode",
        header: "Barcode",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "sku",
        header: "SKU",
        size: 450,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "brand",
        header: "Brand",
        size: 220,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "mrp",
        header: "MRP",
        size: 80,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "discount",
        header: "Discount",
        size: 80,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "netAmount",
        header: "Net Amount",
        size: 120,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "costPrice",
        header: "Cost Price",
        size: 120,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "profitLoss",
        header: "Profit Loss",
        size: 120,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: formattedData,
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
        Store_Name: item.storeName,
        Date: item.date,
        Order_No: item.billNumber,
        Customer_Name: item.custName,
        Barcode: item.barcode,
        SKU: item.sku,
        Brand: item.brand,
        MRP: item.mrp,
        Discount: item.discount,
        Net_Amount: item.netAmount,
        Cost_Price: item.costPrice,
        Profit_Loss: item.profitLoss,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProfitLossReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(formattedData, "ProfitLossReport");
  };

  // Pagination info
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, formattedData.length);
  const totalRows = formattedData.length;

  return (
    <div className="card-body p-0">
      <div className="d-flex flex-column px-3 flex-md-row gap-3 mb-4">
        <p className="mb-0 fw-normal text-black">
          Total Amount: {amountData?.totalAmount}
        </p>
        <p className="mb-0 fw-normal text-black">
          Total Cost: {amountData?.totalCost}
        </p>
        <p className="mb-0 fw-normal text-black">
          Profit-Loss: {amountData?.ProfitLoss?.toFixed(2)}
        </p>
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

export default ProfitLossReportsTable;
