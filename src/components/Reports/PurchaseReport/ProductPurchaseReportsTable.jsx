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
import moment from "moment";

const ProductPurchaseReportsTable = ({ data, amountData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [newamountData, setNewAmountData] = useState(amountData);

  useEffect(() => {
    setNewAmountData(amountData);
  }, [amountData]);

  useEffect(() => {
    if (Array.isArray(data)) {
      setFilteredData(data);
    }
  }, [data]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      if (query) {
        const filtered = data.filter((item) => {
          return (
            item?.vendor?.companyName?.toLowerCase().includes(query) ||
            item?.store?.name?.toLowerCase().includes(query) ||
            item?.invoiceNumber?.toLowerCase().includes(query) ||
            item?.products[0]?.product.sku.toLowerCase().includes(query) ||
            String(item?.products[0]?.product.newBarcode).includes(query) ||
            String(item?.products[0]?.tax).includes(query) ||
            String(item?.products[0]?.totalAmount).includes(query) ||
            String(item?.products[0]?.quantity).includes(query) ||
            String(item?.products[0]?.purchaseRate).includes(query)
          );
        });
        setFilteredData(filtered);
      } else {
        setFilteredData(data);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const columns = useMemo(
    () => [
      {
        header: "SRNO",
        size: 10,
        cell: ({ row }) => <div className="text-left">{row.index + 1}</div>,
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
        accessorKey: "store",
        header: "Store Name",
        size: 200,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.name}</div>
        ),
      },
      {
        accessorKey: "vendor",
        header: "Vendor Name",
        size: 200,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.companyName}</div>
        ),
      },
      {
        id: "productnewBarcode",
        accessorKey: "products",
        header: "Barcode",
        size: 80,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0].product.newBarcode}</div>
        ),
      },
      {
        accessorKey: "invoiceNumber",
        header: "Bill No",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        id: "productsku",
        accessorKey: "products",
        header: "SKU",
        size: 200,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0].product.sku}</div>
        ),
      },
      {
        id: "productquantity",
        accessorKey: "products",
        header: "QUANTITY",
        size: 30,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0].quantity}</div>
        ),
      },
      {
        id: "productpurchaseRate",
        accessorKey: "products",
        header: "PURCHASE RATE",
        size: 140,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0].purchaseRate}</div>
        ),
      },
      {
        id: "producttax",
        accessorKey: "products",
        header: "Tax",
        size: 90,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0].tax}</div>
        ),
      },
      {
        id: "producttotalAmount",
        accessorKey: "products",
        header: "TOTAL AMOUNT",
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0].totalAmount}</div>
        ),
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
        Date: moment(item.createdAt).format("YYYY-MM-DD"),
        Store: item.store.name,
        Vendor: item.vendor.companyName,
        Barcode: item.products?.[0].product.newBarcode,
        Bill_Number: item.invoiceNumber,
        SKU: item.products?.[0].product.sku,
        Quantity: item.products?.[0].quantity,
        Purchase_Rate: item.products?.[0].purchaseRate,
        Tax: item.products?.[0].tax,
        Total_Amount: item.products?.[0].totalAmount,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProductPurchaseReport");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(filteredData, "ProductPurchaseReport");
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
        <p className="mb-0 fw-normal text-black">
          Total Amount: {newamountData}
        </p>
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

export default ProductPurchaseReportsTable;
