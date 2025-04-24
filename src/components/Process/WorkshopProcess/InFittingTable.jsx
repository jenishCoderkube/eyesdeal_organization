import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import CustomerNameModal from "../Vendor/CustomerNameModal";
import AddDamagedModal from "./AddDamagedModal";

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const InFittingTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [tableData, setTableData] = useState([
    {
      id: 1,
      selected: false,
      date: "24/04/2025",
      billNumber: "1955099",
      customerName: "SUJAL PATEL",
      store: "EYESDEAL BARDOLI",
      productsku: "I-GOG-FR-800",
      lenssku: "SV-BLUE-CUT UV 400 1.56 -6.00/-4.00",
      vendor: {
        right: "EYESDEAL STOCK",
        left: "EYESDEAL STOCK",
      },
      notes: "",
    },
    {
      id: 2,
      selected: false,
      date: "23/04/2025",
      billNumber: "255098",
      customerName: "BRAVISH DESAI",
      store: "EYESDEAL BHATAR",
      productsku: "EB-FR-57014K-C8",
      lenssku: "SEE LENS SAFE DRIVE SUN-MATIC 1.56 6.00/200",
      vendor: {
        right: "PRINCE LENSES",
        left: "PRINCE LENSES",
      },
      notes: "MOST URGENT KAL DENA HE",
    },
  ]);

  const hasSelectedRows = selectedRows.length > 0;

  // Debounced filter
  const [filteredData, setFilteredData] = useState(tableData);

  // Handle checkbox selection
  const handleCheckboxChange = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  // Handle customer name click
  const handleCustomerNoteClick = (row) => {
    setSelectedRow(row);
    setShowCustomerModal(true);
  };

  // Handle Process Order click
  const handleProcessOrder = () => {
    setShowVendorModal(true);
  };

  // Handle Download Photo click
  const handleDownloadPhoto = (row) => {
    console.log("Downloading photo for row:", row);
    // Implement actual download logic here (e.g., API call)
  };

  // Handle SelectVendorModal submit
  const handleVendorSubmit = (data) => {
    console.log("Vendor data submitted:", data);
    // Update tableData or perform API call as needed
    setShowVendorModal(false);
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Select",
        cell: ({ row }) => (
          <Form.Check
            type="checkbox"
            checked={selectedRows.includes(row.original.id)}
            onChange={() => handleCheckboxChange(row.original.id)}
            className="form-check-input-lg fs-5"
          />
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "billNumber",
        header: "Bill Number",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer Name",
        cell: ({ getValue, row }) => (
          <div
            className="table-vendor-data-size"
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "#6366f1",
            }}
            onClick={() => handleCustomerNoteClick(row.original)}
          >
            {getValue()}
          </div>
        ),
      },
      {
        accessorKey: "store",
        header: "Store",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "productsku",
        header: "Product SKU",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "lenssku",
        header: "Lens SKU",
        cell: ({ getValue }) => (
          <div className="max-w-[150px] table-vendor-data-size">
            {getValue()}
          </div>
        ),
      },
      {
        accessorKey: "vendor",
        header: "Vendor",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">
            <div className="d-flex flex-column">
              <span className="" style={{ color: "#198754" }}>
                Right: {getValue().right}
              </span>
              <span className="" style={{ color: "#198754" }}>
                Left: {getValue().left}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "notes",
        header: "Note",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
    ],
    [selectedRows]
  );

  // Table setup
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });

  // Pagination info
  const pageIndex = table.getState().pagination.pageIndex;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, filteredData.length);
  const totalRows = filteredData.length;

  return (
    <div className="card-body p-0">
      <div className="mb-4 col-12 ">
        {hasSelectedRows && (
          <div className="d-flex justify-content-between flex-wrap gap-3 mt-2">
            <div>
              <button
                className="btn btn-outline-primary border-light-subtle"
                type="button"
              >
                Ready
              </button>
              <button
                className="btn ms-3 btn-outline-primary border-light-subtle"
                type="button"
                onClick={handleProcessOrder}
              >
                Add Damaged
              </button>
            </div>
            <div>
              <button
                className="btn btn-outline-primary border-light-subtle"
                type="button"
              >
                Revert Order
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="table-responsive">
        <table className="table table-sm">
          <thead className="table-light border text-xs text-uppercase">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-3 text-left custom-perchase-th"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex p-2 flex-column flex-sm-row justify-content-between align-items-center mt-3 px-3">
        <div className="text-sm text-muted mb-3 mb-sm-0">
          Showing <span className="fw-medium">{startRow}</span> to{" "}
          <span className="fw-medium">{endRow}</span> of{" "}
          <span className="fw-medium">{totalRows}</span> results
        </div>
        <div className="btn-group">
          <Button
            variant="outline-primary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      {showCustomerModal && selectedRow && (
        <CustomerNameModal
          show={showCustomerModal}
          onHide={() => setShowCustomerModal(false)}
          selectedRow={selectedRow}
        />
      )}
      {showVendorModal && (
        <AddDamagedModal
          show={showVendorModal}
          onHide={() => setShowVendorModal(false)}
          selectedRows={tableData.filter((row) =>
            selectedRows.includes(row.id)
          )}
          onSubmit={handleVendorSubmit}
        />
      )}
    </div>
  );
};

export default InFittingTable;
