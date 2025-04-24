import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { Button, Form } from "react-bootstrap";
import CustomerNameModal from "../Vendor/CustomerNameModal";
import SelectVendorModal from "./SelectVendorModal";

const NewOrderTable = () => {
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
      productsku: "DJ-FR-0334-C2-49",
      lenssku: "SV-BLUE-CUT UV 400 1.56 -6.00/-4.00",
      vendor: "",
      notes: "",
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
          <div className="table-vendor-data-size">{getValue()}</div>
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
      <div className="mb-4 col-12 px-3">
        {hasSelectedRows && (
          <div className="d-flex justify-content-between flex-wrap gap-3 mt-2">
            <div>
              <button
                className="btn btn-outline-primary border-light-subtle"
                type="button"
                onClick={handleProcessOrder}
              >
                Process Order
              </button>
              <button
                className="btn btn-outline-primary border-light-subtle"
                type="button"
              >
                Send for Fitting
              </button>
            </div>
            <div>
              <button
                className="btn btn-outline-primary border-light-subtle"
                type="button"
              >
                Revert Order
              </button>
              <button
                className="btn btn-outline-primary border-light-subtle"
                type="button"
              >
                Force Ahead
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
        <SelectVendorModal
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

export default NewOrderTable;
