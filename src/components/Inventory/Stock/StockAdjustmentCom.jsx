import React, { useState, useMemo } from "react";
import Select from "react-select";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "bootstrap/dist/css/bootstrap.min.css";

// Custom styles for react-select to match Bootstrap
const selectStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: "0.25rem",
    borderColor: "#ced4da",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#adb5bd",
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 1050, // Ensure dropdown appears above Bootstrap components
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#007bff"
      : state.isFocused
      ? "#f8f9fa"
      : null,
    color: state.isSelected ? "#fff" : "#212529",
    "&:hover": {
      backgroundColor: "#f8f9fa",
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#212529",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#6c757d",
  }),
};

const StockAdjustmentCom = () => {
  // State for form fields
  const [from, setFrom] = useState({
    value: "27",
    label: "ELITE HOSPITAL / 27",
  });
  const [to, setTo] = useState(null);
  const [product, setProduct] = useState(null);

  // Dummy data for dropdowns
  const storeOptions = [
    { value: "1", label: "ED HO / 1" },
    { value: "28", label: "CITY OPTICS / 28" },
  ];

  const productOptions = [
    { value: "1", label: "I-gog Frames" },
    { value: "2", label: "Fizan Frames" },
  ];

  // Dummy data for table
  const tableData = useMemo(
    () => [
      {
        id: 1,
        barcode: "6246",
        stock: 10,
        quantity: 2,
        sku: "IG-FR-KIDS-FLX-1253-C9",
      },
      {
        id: 2,
        barcode: "6100",
        stock: 15,
        quantity: 1,
        sku: "FZ-FR-ADULT-2000-C1",
      },
    ],
    []
  );

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "barcode",
        header: "Barcode",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
    ],
    []
  );

  // Tanstack table setup
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ from, to, product, tableData });
    // Add API call or further logic here
  };

  return (
    <div className="container-fluid px-md-5 px-2 py-5">
      <h1 className="h2 text-dark fw-bold mb-4 px-md-5 px-2">
        Stock Adjustment
      </h1>
      <div className="card border-0 px-md-5">
        <div className="card-body ">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 ">
                <div className="">
                  <label htmlFor="to" className="form-label fw-semibold">
                    Select Store
                  </label>
                  <Select
                    id="Select Store"
                    value={to}
                    onChange={setTo}
                    options={storeOptions}
                    placeholder="Select..."
                    styles={selectStyles}
                    className="w-100"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="">
                  <label htmlFor="product" className="form-label fw-semibold">
                    Product
                  </label>
                  <Select
                    id="product"
                    value={product}
                    onChange={setProduct}
                    options={productOptions}
                    placeholder="Select..."
                    styles={selectStyles}
                    className="w-100"
                  />
                </div>
              </div>
              <div className="col-12">
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
                            <td key={cell.id} className="p-3">
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
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustmentCom;
