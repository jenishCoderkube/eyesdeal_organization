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

const GstReportsTable = ({ data, storesIdsData }) => {
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
        stores: storesIdsData,
      });
    }
  }, [debouncedQuery]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const fetchOrders = ({ search, stores }) => {
    const payload = {
      search,
      ...(stores && stores.length && { stores }),
    };
    reportService
      .fetchOrders(payload)
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
      const godownName = item.store?.name || "";
      const totalQty = item.sale?.totalQuantity || "";
      const netAmount = item.sale?.netAmount || "";

      let paymentSummary = {
        cash: 0,
        upi: 0,
        card: 0,
      };

      item.sale?.receivedAmount.forEach((entry) => {
        const method = entry.method?.toLowerCase();
        if (method == "cash") {
          paymentSummary.cash += entry.amount;
        }
        if (method == "bank") {
          paymentSummary.upi += entry.amount;
        }
        if (method == "card") {
          paymentSummary.card += entry.amount;
        }
      });

      if (item.product?.item.displayName) {
        processed.push({
          type: "Product",
          date,
          billNumber,
          godownName,
          totalQty,
          netAmount,
          sku: item.product.sku || "",
          item:
            [item.product.item.brand?.name, item.product.item.__t]
              .filter(Boolean)
              .join(" ") || "",
          rate:
            (Number(item.product.perPieceAmount) || 0) -
            (Number(item.product.item.perPieceTax) || 0),
          cgst:
            ((Number(item.product.perPieceAmount) || 0) -
              (Number(item.product.item.perPieceTax) || 0)) *
            0.06,
          sgst:
            ((Number(item.product.perPieceAmount) || 0) -
              (Number(item.product.item.perPieceTax) || 0)) *
            0.06,
          narration:
            ` ${item.store?.name}-${item.sale?.customerName}-${item.billNumber}-${item.product.sku} ` ||
            "",
          cash: paymentSummary.cash,
          upi: paymentSummary.upi,
          card: paymentSummary.card,
        });
      }

      if (item.lens?.item.displayName) {
        processed.push({
          type: "Lens",
          date,
          billNumber,
          godownName,
          totalQty,
          netAmount,
          sku: item.lens.sku || "",
          item:
            [item.lens.item.brand?.name, item.lens.item.__t]
              .filter(Boolean)
              .join(" ") || "",
          rate:
            (Number(item.lens.perPieceAmount) || 0) -
            (Number(item.lens.item.perPieceTax) || 0),
          cgst:
            ((Number(item.product.perPieceAmount) || 0) -
              (Number(item.product.item.perPieceTax) || 0)) *
            0.06,
          sgst:
            ((Number(item.product.perPieceAmount) || 0) -
              (Number(item.product.item.perPieceTax) || 0)) *
            0.06,
          narration:
            ` ${item.store?.name}-${item.sale?.customerName}-${item.billNumber}-${item.lens.sku} ` ||
            "",
          cash: paymentSummary.cash,
          upi: paymentSummary.upi,
          card: paymentSummary.card,
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
        accessorKey: "sku",
        header: "SKU",
        size: 500,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "item",
        header: "Item",
        size: 230,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "godownName",
        header: "Godown",
        size: 200,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "totalQty",
        header: "QTY",
        size: 30,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "rate",
        header: "Rate",
        size: 40,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "cgst",
        header: "CGST",
        size: 40,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "sgst",
        header: "SGST",
        size: 40,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "netAmount",
        header: "Net Amount",
        size: 120,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "narration",
        header: "Narration",
        size: 850,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "cash",
        header: "CASH",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "upi",
        header: "UPI",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "card",
        header: "Card",
        size: 100,
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
        Date: item.date,
        Order_No: item.billNumber,
        SKU: item.sku,
        Item: item.item,
        Godown: item.godownName,
        QTY: item.totalQty,
        Rate: item.rate,
        CGST: item.cgst,
        SGST: item.sgst,
        Net_Amount: item.netAmount,
        Narration: item.narration,
        CASH: item.cash,
        UPI: item.upi,
        Card: item.card,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GstReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(formattedData, "GstReport");
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
        <div className="ms-md-auto d-flex gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={exportProduct}
          >
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

export default GstReportsTable;
