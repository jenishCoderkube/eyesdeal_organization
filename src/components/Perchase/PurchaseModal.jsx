import React, { useState, useMemo, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";
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

const PurchaseModal = ({ show, onHide, purchase }) => {
  console.log("get data from modelpurchase<<<", purchase);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(null);

  // Custom global filter function
  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter((item) =>
        [
          item.product.newBarcode.toString(),
          item.product.sku,
          item.quantity.toString(),
          item.purchaseRate.toString(),
          item.product.tax.toString(),
          item.tax.toString(),
          item.totalDiscount.toString(),
          item.totalAmount.toString(),
        ].some((field) => field.toLowerCase().includes(lowerQuery))
      );
    },
    []
  );

  // Debounced filter logic
  useEffect(() => {
    if (!purchase) return; // Skip filtering if no purchase
    const debouncedFilter = debounce((query) => {
      setFilteredProducts(filterGlobally(purchase.products, query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, purchase, filterGlobally]);

  // Use filtered data if available, otherwise use full dataset
  const tableData = filteredProducts || (purchase ? purchase.products : []);

  // Calculate totals for display
  const totalQuantity = tableData.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = tableData
    .reduce((sum, item) => sum + item.totalAmount, 0)
    .toFixed(2);

  // Define table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "product.newBarcode",
        header: "BARCODE",
        cell: ({ getValue }) => <div className="text-left ">{getValue()}</div>,
      },
      {
        accessorKey: "product.sku",
        header: "SKU",
        cell: ({ getValue }) => <div className="text-left ">{getValue()}</div>,
      },
      {
        accessorKey: "quantity",
        header: "QTY",
        cell: ({ getValue }) => <div className="text-left ">{getValue()}</div>,
      },
      {
        accessorKey: "purchaseRate",
        header: "PUR RATE",
        cell: ({ getValue }) => <div className="text-left ">{getValue()}</div>,
      },
      {
        accessorKey: "product.tax",
        header: "TAX",
        cell: ({ getValue }) => <div className="text-left ">{getValue()}</div>,
      },
      {
        accessorKey: "tax",
        header: "TAX AMOUNT",
        cell: ({ getValue }) => <div className="text-left ">{getValue()}</div>,
      },
      {
        accessorKey: "totalDiscount",
        header: "DISCOUNT",
        cell: ({ getValue }) => <div className="text-left ">{getValue()}</div>,
      },
      {
        accessorKey: "totalAmount",
        header: "TOTAL",
        cell: ({ getValue }) => <div className="text-left ">{getValue()}</div>,
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
        pageSize: 20, // Larger page size for "big model"
      },
    },
  });

  // Export to Excel
  const exportToExcel = () => {
    if (!purchase) return;
    const worksheet = XLSX.utils.json_to_sheet(
      tableData.map((item) => ({
        Barcode: item.product.newBarcode,
        SKU: item.product.sku,
        Quantity: item.quantity,
        "Purchase Rate": item.purchaseRate,
        Tax: item.product.tax,
        "Tax Amount": item.tax,
        Discount: item.totalDiscount,
        Total: item.totalAmount,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Products");
    XLSX.writeFile(workbook, `Purchase_${purchase.invoiceNumber}.xlsx`);
  };

  // Pagination info
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, tableData.length);
  const totalRows = tableData.length;

  // Early return after hooks
  if (!purchase) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      dialogClassName="modal-90w"
      className="overflow-auto"
    >
      <Modal.Body className="p-0">
        <div className="bg-white rounded shadow-lg w-100 max-w-5xl max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="px-4 py-3 border-bottom border-slate-200">
            <div className="d-flex justify-content-between align-items-center">
              <div className="font-semibold fs-5">
                Store: {purchase.store.name}
              </div>
              <button variant="link" className="p-0" onClick={onHide}>
                <i class="bi bi-x fs-1"></i>
              </button>
            </div>
          </div>

          {/* Purchase Info */}
          <div className="px-4 py-4">
            {/* Vendor, Bill No, Bill Date */}
            <div className=" d-flex flex-wrap justify-content-around gap-5 mx-auto mb-4">
              <div className=" mb-3 mb-md-0">
                <p className=" mb-0 font-size-normal font-size-normal">
                  VENDOR:{" "}
                  <span className="font-size-normal ">
                    {purchase.vendor.companyName}
                  </span>
                </p>
              </div>
              <div className=" mb-3 mb-md-0">
                <p className=" mb-0 font-size-normal font-size-normal">
                  Bill No:{" "}
                  <span className="font-size-normal">
                    {purchase.invoiceNumber}
                  </span>
                </p>
              </div>
              <div className=" mb-3 mb-md-0">
                <p className=" mb-0 font-size-normal">
                  BILL DATE:{" "}
                  <span className="font-size-normal">
                    {moment(purchase.invoiceDate).format("DD/MM/YYYY")}
                  </span>
                </p>
              </div>
            </div>

            {/* Totals */}
            <div className="w-full ms-md-5 mx-auto">
              <div className="row  row-cols-1 ms-md-4 row-cols-sm-2 row-cols-md-5 justify-content-start  gap-2 text-start mb-4">
                <div className="col mb-2">
                  <p className=" mb-0 font-size-normal">
                    TOTAL QTY:{" "}
                    <span className="font-size-normal">
                      {purchase.totalQuantity}
                    </span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className=" mb-0 font-size-normal">
                    TOTAL AMT:{" "}
                    <span className="font-size-normal">
                      {purchase.totalAmount}
                    </span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className=" mb-0 font-size-normal">
                    TOTAL TAX:{" "}
                    <span className="font-size-normal">
                      {purchase.totalTax}
                    </span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className=" mb-0 font-size-normal">
                    TOTAL DISC:{" "}
                    <span className="font-size-normal">
                      {purchase.totalDiscount}
                    </span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className=" mb-0 font-size-normal">
                    OTHER CHARGE:{" "}
                    <span className="font-size-normal">
                      {purchase.otherCharges}
                    </span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className=" mb-0 font-size-normal">
                    FLAT DISC:{" "}
                    <span className="font-size-normal">
                      {purchase.flatDiscount}
                    </span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className=" mb-0 font-size-normal">
                    NET AMT:{" "}
                    <span className="font-size-normal">
                      {purchase.netAmount}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* Products Table */}
            <div className="bg-white  rounded-sm border border-slate-200">
              <div className="px-4 py-4">
                <div className="d-flex flex-column flex-md-row gap-3 mb-4">
                  <p className="mb-0 font-size-normal fw-normal text-black">
                    Total Quantity: {totalQuantity}
                  </p>
                  <p className="mb-0 font-size-normal fw-normal text-black">
                    Total Amount: {totalAmount}
                  </p>
                  <button
                    className="btn btn-primary ms-md-auto"
                    onClick={exportToExcel}
                  >
                    Export to Excel
                  </button>
                </div>
                <div className="mb-4 col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <FaSearch
                        className="text-muted"
                        style={{ color: "#94a3b8" }}
                      />
                    </span>
                    <input
                      type="search"
                      className="form-control border-start-0"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead className="text-xs text-uppercase text-muted bg-light border">
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
                            <td key={cell.id} className="p-3 fw-normal">
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
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3 px-3">
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
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PurchaseModal;
