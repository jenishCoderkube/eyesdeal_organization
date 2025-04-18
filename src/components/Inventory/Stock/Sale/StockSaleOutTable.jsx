import React, { useState, useMemo, useEffect } from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import * as XLSX from "xlsx";
import { Offcanvas } from "react-bootstrap";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import "bootstrap/dist/css/bootstrap.min.css";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const StockSaleOutTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState([]);

  // Dummy product data
  const products = useMemo(
    () => [
      // {
      //   id: 1,
      //   srno: 1,
      //   date: "10/03/2025",
      //   from: "1/ED HO",
      //   to: "27/ELITE HOSPITAL",
      //   numberOfProducts: 6,
      //   stockQuantity: 6,
      //   status: "Approved",
      //   productDetails: [
      //     {
      //       productName: "I-gog Frames",
      //       productSku: "IG-FR-KIDS-FLX-1253-C9",
      //       barcode: "6246",
      //       stockQuantity: 1,
      //     },
      //     {
      //       productName: "I-gog Frames",
      //       productSku: "IG-FR-KIDS-FLX-1153-C6",
      //       barcode: "6189",
      //       stockQuantity: 1,
      //     },
      //     ...Array.from({ length: 4 }, (_, i) => ({
      //       productName: `I-gog Frames ${i + 1}`,
      //       productSku: `IG-FR-KIDS-${1000 + i}-C${i + 1}`,
      //       barcode: `${6000 + i}`,
      //       stockQuantity: 1,
      //     })),
      //   ],
      // },
      // {
      //   id: 2,
      //   srno: 2,
      //   date: "04/03/2025",
      //   from: "1/ED HO",
      //   to: "27/ELITE HOSPITAL",
      //   numberOfProducts: 1,
      //   stockQuantity: 36,
      //   status: "Approved",
      //   productDetails: [
      //     {
      //       productName: "Fizan Frames",
      //       productSku: "FZ-FR-ADULT-2000-C1",
      //       barcode: "6100",
      //       stockQuantity: 36,
      //     },
      //   ],
      // },
      // {
      //   id: 3,
      //   srno: 3,
      //   date: "22/01/2025",
      //   from: "1/ED HO",
      //   to: "27/ELITE HOSPITAL",
      //   numberOfProducts: 14,
      //   stockQuantity: 15,
      //   status: "Approved",
      //   productDetails: [
      //     {
      //       productName: "I-gog Frames",
      //       productSku: "IG-FR-KIDS-2307-C7",
      //       barcode: "616577",
      //       stockQuantity: 1,
      //     },
      //     ...Array.from({ length: 13 }, (_, i) => ({
      //       productName: `I-gog Frames ${i + 2}`,
      //       productSku: `IG-FR-KIDS-${2000 + i}-C${i + 2}`,
      //       barcode: `${6100 + i + 1}`,
      //       stockQuantity: 1,
      //     })),
      //   ],
      // },
      // {
      //   id: 4,
      //   srno: 4,
      //   date: "24/12/2024",
      //   from: "1/ED HO",
      //   to: "27/ELITE HOSPITAL",
      //   numberOfProducts: 1,
      //   stockQuantity: 30,
      //   status: "Approved",
      //   productDetails: [
      //     {
      //       productName: "Fizan Frames",
      //       productSku: "FZ-FR-ADULT-2100-C2",
      //       barcode: "6200",
      //       stockQuantity: 30,
      //     },
      //   ],
      // },
      // {
      //   id: 5,
      //   srno: 5,
      //   date: "23/12/2024",
      //   from: "1/ED HO",
      //   to: "27/ELITE HOSPITAL",
      //   numberOfProducts: 16,
      //   stockQuantity: 22,
      //   status: "Pending",
      //   productDetails: [
      //     {
      //       productName: "I-gog Frames",
      //       productSku: "IG-FR-KIDS-2200-C3",
      //       barcode: "6300",
      //       stockQuantity: 1,
      //     },
      //     ...Array.from({ length: 15 }, (_, i) => ({
      //       productName: `I-gog Frames ${i + 3}`,
      //       productSku: `IG-FR-KIDS-${2200 + i}-C${i + 3}`,
      //       barcode: `${6301 + i}`,
      //       stockQuantity: 1,
      //     })),
      //   ],
      // },
      // {
      //   id: 6,
      //   srno: 6,
      //   date: "07/12/2024",
      //   from: "1/ED HO",
      //   to: "27/ELITE HOSPITAL",
      //   numberOfProducts: 3,
      //   stockQuantity: 3,
      //   status: "Pending",
      //   productDetails: [
      //     {
      //       productName: "Fizan Frames",
      //       productSku: "FZ-FR-ADULT-2300-C4",
      //       barcode: "6400",
      //       stockQuantity: 1,
      //     },
      //     ...Array.from({ length: 2 }, (_, i) => ({
      //       productName: `Fizan Frames ${i + 1}`,
      //       productSku: `FZ-FR-ADULT-${2300 + i}-C${i + 5}`,
      //       barcode: `${6401 + i}`,
      //       stockQuantity: 1,
      //     })),
      //   ],
      // },
      // {
      //   id: 7,
      //   srno: 7,
      //   date: "30/10/2024",
      //   from: "1/ED HO",
      //   to: "27/ELITE HOSPITAL",
      //   numberOfProducts: 2,
      //   stockQuantity: 2,
      //   status: "Pending",
      //   productDetails: [
      //     {
      //       productName: "I-gog Frames",
      //       productSku: "IG-FR-KIDS-2400-C5",
      //       barcode: "6500",
      //       stockQuantity: 1,
      //     },
      //     {
      //       productName: "I-gog Frames",
      //       productSku: "IG-FR-KIDS-2401-C6",
      //       barcode: "6501",
      //       stockQuantity: 1,
      //     },
      //   ],
      // },
      // {
      //   id: 8,
      //   srno: 8,
      //   date: "30/10/2024",
      //   from: "1/ED HO",
      //   to: "27/ELITE HOSPITAL",
      //   numberOfProducts: 38,
      //   stockQuantity: 38,
      //   status: "Pending",
      //   productDetails: [
      //     {
      //       productName: "Fizan Frames",
      //       productSku: "FZ-FR-ADULT-2500-C7",
      //       barcode: "6600",
      //       stockQuantity: 1,
      //     },
      //     ...Array.from({ length: 37 }, (_, i) => ({
      //       productName: `Fizan Frames ${i + 2}`,
      //       productSku: `FZ-FR-ADULT-${2500 + i}-C${i + 8}`,
      //       barcode: `${6601 + i}`,
      //       stockQuantity: 1,
      //     })),
      //   ],
      // },
      // {
      //   id: 9,
      //   srno: 9,
      //   date: "06/07/2024",
      //   from: "1/ED HO",
      //   to: "27/ELITE HOSPITAL",
      //   numberOfProducts: 1,
      //   stockQuantity: 20,
      //   status: "Approved",
      //   productDetails: [
      //     {
      //       productName: "I-gog Frames",
      //       productSku: "IG-FR-KIDS-2600-C8",
      //       barcode: "6700",
      //       stockQuantity: 20,
      //     },
      //   ],
      // },
    ],
    []
  );

  // Custom global filter function
  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter((item) =>
        [
          String(item.srno),
          item.date,
          item.from,
          item.to,
          String(item.numberOfProducts),
          String(item.stockQuantity),
          item.status,
        ].some((field) => field.toLowerCase().includes(lowerQuery))
      );
    },
    []
  );

  // Debounced filter logic in useEffect
  useEffect(() => {
    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(products, query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, products, filterGlobally]);

  // Handle search input change
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Use filtered data if available, otherwise use full dataset
  const tableData = filteredData || products;

  // Define table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "srno",
        header: "SRNO",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "from",
        header: "From",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "to",
        header: "To",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "numberOfProducts",
        header: "Number Of Products",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },

      {
        accessorKey: "stockQuantity",
        header: "Stock Quantity",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "totalAmount",
        header: "Total Amount",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "status",
        header: "Change Status",
        cell: ({ getValue }) =>
          getValue() === "Approved" ? (
            <div className="text-left">{getValue()}</div>
          ) : (
            <div className="text-left">
              <button className="btn btn-sm btn-primary">Approve</button>
            </div>
          ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="text-left d-flex gap-2 align-items-center">
            <FaEye
              className="text-primary"
              style={{ cursor: "pointer", width: "18px", height: "18px" }}
              onClick={() => {
                setSelectedProductDetails(row.original.productDetails);
                setShowOffcanvas(true);
              }}
            />
            <button
              className="btn btn-sm btn-primary"
              onClick={() => exportProduct(row.original.productDetails)}
            >
              Download
            </button>
          </div>
        ),
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
        pageSize: 100,
      },
    },
  });

  // Export to Excel function
  const exportProduct = (productDetails) => {
    const worksheet = XLSX.utils.json_to_sheet(
      productDetails.map((item) => ({
        "Product Name": item.productName,
        "Product SKU": item.productSku,
        Barcode: item.barcode,
        "Stock Quantity": item.stockQuantity,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, `StockIn_Products_${Date.now()}.xlsx`);
  };

  // Handle offcanvas close
  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
    setSelectedProductDetails([]);
  };

  // Pagination info
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, tableData.length);
  const totalRows = tableData.length;

  return (
    <>
      <div className="card-body p-0">
        <div className="mb-4 col-md-6">
          <div className="input-group mt-2">
            <span className="input-group-text bg-white border-end-0">
              <FaSearch className="text-muted" style={{ color: "#94a3b8" }} />
            </span>
            <input
              type="search"
              className="form-control border-start-0"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-sm ">
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
        <div className="d-flex flex-column px-3 pb-2 flex-sm-row justify-content-between align-items-center mt-3">
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

      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffcanvas}
        placement="end"
        style={{ width: "420px" }}
      >
        <Offcanvas.Header className="bg-light border-bottom">
          <Offcanvas.Title className="text-dark font-semibold">
            Products
          </Offcanvas.Title>
          <button
            type="button"
            className="btn-close text-reset"
            onClick={handleCloseOffcanvas}
          />
        </Offcanvas.Header>
        <Offcanvas.Body className="p-4">
          <div className="text-xs d-inline-flex font-medium bg-secondary-subtle text-secondary rounded-pill text-black text-center px-2 py-1 mb-4">
            Number Of Products: {selectedProductDetails.length}
          </div>
          {selectedProductDetails.map((product, index) => (
            <div
              key={index}
              className="p-3 mb-2 border rounded"
              style={{ borderColor: "rgb(214, 199, 199)" }}
            >
              <p className="my-1">
                <span className="text-muted ">Product Name: </span>
                {product.productName}
              </p>
              <p className="my-1">
                <span className="text-muted">Product SKU: </span>
                {product.productSku}
              </p>
              <p className="my-1">
                <span className="text-muted">Barcode: </span>
                {product.barcode}
              </p>
              <p className="my-1">
                <span className="text-muted">Stock Quantity: </span>
                {product.stockQuantity}
              </p>
            </div>
          ))}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default StockSaleOutTable;
