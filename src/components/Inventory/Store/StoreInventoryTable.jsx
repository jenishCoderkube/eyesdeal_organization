import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import ImageSliderModal from "../ImageSliderModal";
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

const InventoryTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [modalImages, setModalImages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Dummy product data with photos, updated with new fields
  const products = useMemo(
    () => [
      {
        id: 1,
        barcode: "6104",
        date: "22/01/2025",
        photos: [
          "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/eyesdeal/FRAMES/FIZAN BABY ATTACHMENT/6104_1.JPEG",
          "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/eyesdeal/FRAMES/FIZAN BABY ATTACHMENT/6104_2.JPEG",
        ],
        store: "ELITE HOSPITAL",
        sku: "FZ-FR-BABY-19988-C2-ATT",
        brand: "Fizan eyeGlasses",
        mrp: 1950,
        stock: 1,
        sold: 0,
      },
      {
        id: 2,
        barcode: "6097",
        date: "22/01/2025",
        photos: [],
        store: "ELITE HOSPITAL",
        sku: "FZ-FR-BABY-19987-C6-ATT",
        brand: "Fizan eyeGlasses",
        mrp: 1750,
        stock: 1,
        sold: 0,
      },
      {
        id: 3,
        barcode: "616577",
        date: "23/01/2025",
        photos: [
          "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/eyesdeal/FRAMES/IGOG KIDS FRAME/616577_1.JPEG",
          "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/eyesdeal/FRAMES/IGOG KIDS FRAME/616577_2.JPEG",
          "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/eyesdeal/FRAMES/IGOG KIDS FRAME/616577_3.JPEG",
        ],
        store: "CITY OPTICS",
        sku: "IG-FR-KIDS-2307-C7",
        brand: "IGOG eyeGlasses",
        mrp: 870,
        stock: 0,
        sold: 0,
      },
      // Additional dummy data
      ...Array.from({ length: 10 }, (_, index) => ({
        id: index + 4,
        barcode: `BAR${1000 + index}`,
        date: `0${(index % 9) + 1}/02/2025`,
        photos:
          index % 2 === 0
            ? [
                `https://placehold.co/100x100?text=Product${index + 4}_1`,
                `https://placehold.co/100x100?text=Product${index + 4}_2`,
              ]
            : [],
        store: index % 2 === 0 ? "ELITE HOSPITAL" : "CITY OPTICS",
        sku: `SKU-${index + 4}`,
        brand: index % 2 === 0 ? "Fizan eyeGlasses" : "IGOG eyeGlasses",
        mrp: Math.floor(Math.random() * 1000) + 500,
        stock: Math.floor(Math.random() * 50),
        sold: Math.floor(Math.random() * 10),
      })),
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
          item.barcode,
          item.date,
          item.store,
          item.sku,
          item.brand,
          String(item.mrp),
          String(item.stock),
          String(item.sold),
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
        accessorKey: "barcode",
        header: "Barcode",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "photos",
        header: "Photo",
        cell: ({ getValue }) => {
          const photos = getValue();
          return photos.length > 0 ? (
            <div
              className="border border-bottom-0"
              style={{ position: "relative" }}
            >
              <img
                src={photos[0]}
                alt="Product"
                style={{ width: "50px", height: "50px" }}
                className="border"
              />
              {photos.length > 1 && (
                <div
                  style={{
                    textDecoration: "underline",
                    color: "blue",
                    cursor: "pointer",
                  }}
                  onClick={() => openImageModal(photos)}
                >
                  View More
                </div>
              )}
            </div>
          ) : (
            <div>-</div>
          );
        },
      },
      {
        accessorKey: "store",
        header: "Store",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "brand",
        header: "Brand",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "mrp",
        header: "MRP",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "sold",
        header: "Sold",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
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

  // Export to Excel functions
  const exportToExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(
      data.map((item) => ({
        Barcode: item.barcode,
        Date: item.date,
        Store: item.store,
        SKU: item.sku,
        Brand: item.brand,
        MRP: item.mrp,
        Stock: item.stock,
        Sold: item.sold,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportProduct = () => {
    exportToExcel(tableData, "Products");
  };

  const exportProductCP = () => {
    const dataWithCP = tableData.map((item) => ({
      ...item,
      costPrice: item.mrp * 0.8,
    }));
    const worksheet = XLSX.utils.json_to_sheet(
      dataWithCP.map((item) => ({
        Barcode: item.barcode,
        Date: item.date,
        Store: item.store,
        SKU: item.sku,
        Brand: item.brand,
        MRP: item.mrp,
        CostPrice: item.costPrice,
        Stock: item.stock,
        Sold: item.sold,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProductsCP");
    XLSX.writeFile(workbook, "ProductsCP.xlsx");
  };

  // Modal handling
  const openImageModal = (photos) => {
    setModalImages(photos);
    setShowModal(true);
  };

  const closeImageModal = () => {
    setShowModal(false);
    setModalImages([]);
  };

  // Calculate total quantity and sold
  const totalQuantity = tableData.reduce((sum, item) => sum + item.stock, 0);
  const totalSold = tableData.reduce((sum, item) => sum + item.sold, 0);

  // Pagination info
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, tableData.length);
  const totalRows = tableData.length;

  return (
    <>
      <div className="card-body p-0">
        <div className="d-flex flex-column px-3  flex-md-row gap-3 mb-4">
          <p className="mb-0 fw-normal text-black">
            Total Quantity: {totalQuantity}
          </p>
          <p className="mb-0 fw-normal text-black">Total Sold: {totalSold}</p>
          <button
            className="btn btn-primary ms-md-auto"
            onClick={exportProduct}
          >
            Export Product
          </button>
          <button className="btn btn-primary" onClick={exportProductCP}>
            Export Product CP
          </button>
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
        <div className="d-flex px-3 pb-3  flex-column flex-sm-row justify-content-between align-items-center mt-3">
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
      <ImageSliderModal
        show={showModal}
        onHide={closeImageModal}
        images={modalImages}
      />
    </>
  );
};

export default InventoryTable;
