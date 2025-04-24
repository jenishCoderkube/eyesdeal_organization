// src/components/ProductTable.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ProductDetailsModal from "./ProductDetailsModal";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

function ProductTable({ filters }) {
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Dummy product data (10 entries with varied model types)
  const products = useMemo(
    () => [
      {
        id: 1,
        model: "eyeGlasses",
        barcode: "10027",
        sku: "7STAR-9005-46",
        costPrice: 400,
        mrp: 1350,
        photos: [
          "https://placehold.co/100x100?text=Eyeglasses1",
          "https://placehold.co/100x100?text=Eyeglasses2",
        ],
        brand: "brand1",
        frameType: "fullRim",
        frameShape: "rectangle",
        gender: "unisex",
        frameMaterial: "metal",
        frameColor: "black",
        frameSize: "medium",
        prescriptionType: "singleVision",
        frameCollection: "classic",
      },
      {
        id: 2,
        model: "contactSolutions",
        barcode: "20001",
        sku: "CS-SALINE-001",
        costPrice: 50,
        mrp: 70,
        photos: [],
        brand: "brand2",
        material: "Saline",
      },
      {
        id: 3,
        model: "sunGlasses",
        barcode: "30015",
        sku: "SUN-RAY-123",
        costPrice: 600,
        mrp: 1500,
        photos: ["https://placehold.co/100x100?text=Sunglasses1"],
        brand: "brand3",
        frameType: "fullRim",
        frameShape: "round",
        gender: "male",
        frameMaterial: "plastic",
        frameColor: "blue",
        frameSize: "large",
        prescriptionType: "none",
        frameCollection: "trendy",
      },
      {
        id: 4,
        model: "accessories",
        barcode: "40022",
        sku: "ACC-CASE-001",
        costPrice: 100,
        mrp: 200,
        photos: [],
        brand: "brand1",
      },
      {
        id: 5,
        model: "spectacleLens",
        barcode: "50033",
        sku: "LENS-BLUECUT-01",
        costPrice: 300,
        mrp: 800,
        photos: ["https://placehold.co/100x100?text=Lens1"],
        brand: "brand2",
        prescriptionType: "progressive",
      },
      {
        id: 6,
        model: "contactLens",
        barcode: "60044",
        sku: "CL-DAILY-001",
        costPrice: 200,
        mrp: 500,
        photos: [],
        brand: "brand3",
        disposability: "daily",
        prescriptionType: "singleVision",
      },
      {
        id: 7,
        model: "readingGlasses",
        barcode: "70055",
        sku: "RG-READ-001",
        costPrice: 350,
        mrp: 900,
        photos: ["https://placehold.co/100x100?text=Reading1"],
        brand: "brand1",
        frameType: "halfRim",
        frameShape: "rectangle",
        gender: "female",
        frameMaterial: "acetate",
        frameColor: "red",
        frameSize: "small",
        prescriptionType: "bifocal",
        frameCollection: "premium",
      },
      {
        id: 8,
        model: "eyeGlasses",
        barcode: "80066",
        sku: "EG-MODERN-002",
        costPrice: 450,
        mrp: 1400,
        photos: ["https://placehold.co/100x100?text=Eyeglasses3"],
        brand: "brand2",
        frameType: "rimless",
        frameShape: "catEye",
        gender: "unisex",
        frameMaterial: "metal",
        frameColor: "black",
        frameSize: "medium",
        prescriptionType: "progressive",
        frameCollection: "trendy",
      },
      {
        id: 9,
        model: "contactSolutions",
        barcode: "90077",
        sku: "CS-MULTI-002",
        costPrice: 60,
        mrp: 80,
        photos: [],
        brand: "brand3",
        material: "Hydrogen Peroxide",
      },
      {
        id: 10,
        model: "sunGlasses",
        barcode: "10088",
        sku: "SUN-CLASSIC-456",
        costPrice: 700,
        mrp: 1600,
        photos: ["https://placehold.co/100x100?text=Sunglasses2"],
        brand: "brand1",
        frameType: "fullRim",
        frameShape: "round",
        gender: "female",
        frameMaterial: "plastic",
        frameColor: "red",
        frameSize: "large",
        prescriptionType: "none",
        frameCollection: "classic",
      },
    ],
    []
  );

  // Filter function
  const filterProducts = useMemo(
    () => (data, filters) => {
      return data.filter((item) => {
        const matchesSearch = filters.search
          ? [item.barcode, item.sku, String(item.mrp), String(item.costPrice)]
              .join(" ")
              .toLowerCase()
              .includes(filters.search.toLowerCase())
          : true;
        const matchesModel = filters.model
          ? item.model === filters.model
          : true;
        const matchesBrand = filters.brand
          ? item.brand === filters.brand
          : true;
        const matchesFrameType = filters.frameType
          ? item.frameType === filters.frameType
          : true;
        const matchesFrameShape = filters.frameShape
          ? item.frameShape === filters.frameShape
          : true;
        const matchesGender = filters.gender
          ? item.gender === filters.gender
          : true;
        const matchesFrameMaterial = filters.frameMaterial
          ? item.frameMaterial === filters.frameMaterial
          : true;
        const matchesFrameColor = filters.frameColor
          ? item.frameColor === filters.frameColor
          : true;
        const matchesFrameSize = filters.frameSize
          ? item.frameSize === filters.frameSize
          : true;
        const matchesPrescriptionType = filters.prescriptionType
          ? item.prescriptionType === filters.prescriptionType
          : true;
        const matchesFrameCollection = filters.frameCollection
          ? item.frameCollection === filters.frameCollection
          : true;

        return (
          matchesSearch &&
          matchesModel &&
          matchesBrand &&
          matchesFrameType &&
          matchesFrameShape &&
          matchesGender &&
          matchesFrameMaterial &&
          matchesFrameColor &&
          matchesFrameSize &&
          matchesPrescriptionType &&
          matchesFrameCollection
        );
      });
    },
    []
  );

  // Apply filters with debounce
  useEffect(() => {
    const debouncedFilter = debounce(() => {
      setFilteredData(filterProducts(products, filters));
    }, 200);
    debouncedFilter();
    return () => clearTimeout(debouncedFilter.timeout);
  }, [filters, products, filterProducts]);

  const tableData = filteredData || products;

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "SRNO",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "photos",
        header: "Photo",
        cell: ({ getValue }) => {
          const photos = getValue();
          return photos.length > 0 ? (
            <img
              src={photos[0]}
              alt="Product"
              className="img-fluid rounded"
              style={{ width: "50px", height: "50px" }}
            />
          ) : (
            <div>-</div>
          );
        },
      },
      {
        accessorKey: "barcode",
        header: "Barcode",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "costPrice",
        header: "Cost Price",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "mrp",
        header: "MRP",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "photos",
        header: "Photos",
        cell: ({ getValue }) => (
          <button className="btn btn-primary btn-sm">Fetch Photos</button>
        ),
      },
      {
        accessorKey: "actions",
        header: "Action",
        cell: ({ row }) => (
          <div className="d-flex gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="blue"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedProduct(row.original);
                setShowModal(true);
              }}
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="blue"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/products/edit/${row.original.id}`)}
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="red"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ cursor: "pointer" }}
              onClick={() => alert("Delete: " + row.original.id)}
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
        ),
      },
    ],
    [navigate]
  );

  // Tanstack table setup
  const table = useReactTable({
    data: tableData,
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

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      tableData.map((item) => ({
        SRNO: item.id,
        Barcode: item.barcode,
        SKU: item.sku,
        CostPrice: item.costPrice,
        MRP: item.mrp,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "Products.xlsx");
  };

  // Pagination info
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, tableData.length);
  const totalRows = tableData.length;

  return (
    <div className="card shadow-none border">
      <div className="card-body p-3">
        <div className="d-flex flex-column flex-md-row gap-3 mb-4">
          <h5>{filters?.model || "eyeGlasses"}</h5>
          <button
            className="btn btn-primary ms-md-auto"
            onClick={exportToExcel}
          >
            Export Products
          </button>
          <button className="btn btn-primary">Fetch Photos</button>
        </div>
        <div className="table-responsive">
          <table className="table table-sm ">
            <thead className="text-xs text-uppercase text-muted bg-light">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <th
                      key={index}
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
                  {row.getVisibleCells().map((cell, index) => (
                    <td key={index} className="p-3">
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
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3">
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
        <ProductDetailsModal
          show={showModal}
          onHide={() => setShowModal(false)}
          product={selectedProduct}
        />
      </div>
    </div>
  );
}

export default ProductTable;
