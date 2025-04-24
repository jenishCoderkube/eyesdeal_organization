import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button, Form } from "react-bootstrap";
import VendorNoteModal from "./VendorNoteModal";
import CustomerNameModal from "./CustomerNameModal";

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const VendorListTable = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);
  const [pageSize, setPageSize] = useState(10);

  // Filter function
  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter((item) =>
        Object.values(item).some(
          (field) =>
            field && field.toString().toLowerCase().includes(lowerQuery)
        )
      );
    },
    []
  );

  // Debounced filter
  useEffect(() => {
    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(data, query));
    }, 200);
    debouncedFilter(searchQuery);
    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, data, filterGlobally]);

  // Handle checkbox selection
  const handleCheckboxChange = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
  };

  // Handle Receive All
  const handleReceiveAll = () => {
    console.log("Receiving all selected rows:", selectedRows);
    setSelectedRows([]);
  };

  // Handle Vendor Note click
  const handleVendorNoteClick = (row) => {
    setSelectedRow(row);
    setShowVendorModal(true);
  };
  const handleCustomerNoteClick = (row) => {
    setSelectedRow(row);
    setShowCustomerModal(true);
  };
  // Handle Vendor Note submit
  const handleVendorNoteSubmit = (updatedRow) => {
    setFilteredData((prev) =>
      prev.map((row) =>
        row._id === updatedRow._id
          ? { ...row, vendorNote: updatedRow.vendorNote }
          : row
      )
    );
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "Select",
        cell: ({ row }) => (
          <Form.Check
            type="checkbox"
            checked={selectedRows.includes(row.original._id)}
            onChange={() => handleCheckboxChange(row.original._id)}
            className="form-check-input-lg"
          />
        ),
      },
      {
        accessorKey: "date",
        header: "Process Date",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
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
        accessorKey: "billNo",
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
        accessorKey: "vendorNote",
        header: "Vendor Note",
        cell: ({ row }) => (
          <div
            className="table-vendor-data-size"
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "#6366f1",
            }}
            onClick={() => handleVendorNoteClick(row.original)}
          >
            {row.original.vendorNote || "Add Note"}
          </div>
        ),
      },
      {
        accessorKey: "lensSKU",
        header: "Lens SKU",
        cell: ({ getValue }) => (
          <div className="max-w-[150px] table-vendor-data-size">
            {getValue()}
          </div>
        ),
      },
      {
        accessorKey: "side",
        header: "Side",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "power",
        header: "Power",
        cell: ({ row }) => (
          <div className="text-xs">
            <div
              className="d-grid gap-0"
              style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
            >
              {["Specs", "SPH", "CYL", "Axis", "ADD"].map((label, idx) => (
                <div
                  key={idx}
                  className="border border-dark p-1 fw-bold table-vendor-data-size"
                >
                  {label}
                </div>
              ))}
              <div className="border border-dark p-1 fw-bold">Dist</div>
              {["-2.25", "-0.75", "5", ""].map((value, idx) => (
                <div
                  key={idx}
                  className="border border-dark p-1 table-vendor-data-size"
                >
                  {value}
                </div>
              ))}
              <div className="border border-dark p-1 fw-bold">Near</div>
              {["-2.25", "-0.75", "5", ""].map((value, idx) => (
                <div
                  key={idx}
                  className="border border-dark p-1 table-vendor-data-size"
                >
                  {value}
                </div>
              ))}
            </div>
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
        accessorKey: "action",
        header: "Action",
        cell: () => (
          <Button
            variant="primary"
            className="table-vendor-data-size"
            size="sm"
          >
            Receive
          </Button>
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

  // Export to Excel
  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "VendorList");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const pageIndex = table.getState().pagination.pageIndex;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, filteredData.length);
  const totalRows = filteredData.length;

  return (
    <div className="card-body p-0">
      <div className="d-flex flex-column flex-md-row gap-3 mb-3 px-3">
        <div className="ms-md-auto">
          <Button onClick={() => exportToExcel(filteredData, "VendorList")}>
            Download
          </Button>
        </div>
      </div>
      <div className="mb-4 col-md-4">
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
        <div className="d-flex gap-2 mt-2">
          {selectedRows.length > 0 && (
            <Button variant="primary" onClick={handleReceiveAll}>
              Receive All
            </Button>
          )}
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-sm ">
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
      <VendorNoteModal
        show={showVendorModal}
        onHide={() => setShowVendorModal(false)}
        selectedRow={selectedRow}
        onSubmit={handleVendorNoteSubmit}
      />
      <CustomerNameModal
        show={showCustomerModal}
        onHide={() => setShowCustomerModal(false)}
        selectedRow={selectedRow}
        // onSubmit={handleVendorNoteSubmit}
      />
    </div>
  );
};

export default VendorListTable;
