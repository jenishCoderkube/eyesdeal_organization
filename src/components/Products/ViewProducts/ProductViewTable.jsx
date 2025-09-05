import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ProductDetailsModal from "./ProductDetailsModal";
import ImageSliderModalProduct from "./ImageSliderModalProduct";
import productViewService from "../../../services/Products/productViewService";
import { toast } from "react-toastify";
import {
  defalutImageBasePath,
  parseRange,
  productRangesByType,
} from "../../../utils/constants";
import { Range } from "react-range";
import { inventoryService } from "../../../services/inventoryService";
import { Modal, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

function ProductTable({
  filters,
  isDownloadButtonVisible,
  setIsDownloadButtonVisible,
}) {
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({
    totalDocs: 0,
    limit: 100,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFetchingPhotos, setIsFetchingPhotos] = useState(false);
  const [photoFetchProgress, setPhotoFetchProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [maxVal, setMaxVal] = useState(0);
  const [minVal, setMinVal] = useState(0);
  // Update the state declarations
  const [startRange, setStartRange] = useState(null); // Initialize as null
  const [endRange, setEndRange] = useState(null);
  const [range, setRange] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false); // New state for download modal
  // Add new state

  useEffect(() => {
    if (range?.length > 0 && filteredData.length > 0) {
      const firstRange = parseRange(range[0]);
      const lastRange = parseRange(range[range.length - 1]);

      if (firstRange && lastRange) {
        const min = firstRange.min ?? 0;
        const max = lastRange.max ?? 0;

        setMinVal(min);
        setMaxVal(max);
        setStartRange(min);
        setEndRange(max);
      }
    } else {
      // ✅ handle blank array case
      setMinVal(0);
      setMaxVal(0);
      setStartRange(0);
      setEndRange(0);
    }
  }, [range, filteredData]);

  const getRange = async (filters) => {
    try {
      console.log("Fetching product count with filters:", filters);

      const result = await inventoryService.getProductCount(
        filters?.model ? filters?.model : "eyeGlasses",
        filters,
        filters?.status == "active" ? true : false
      );
      if (result.success) {
        console.log("result?.data?.data", result?.data?.data);

        setRange(result?.data?.data || []);
      } else {
        console.error("Error:", result.message);
      }
    } catch (error) {
      console.log("err", error);
    }
  };

  // Existing fetchProducts, handleFetchSinglePhoto, handleFetchAllPhotos, handleDelete, handleViewMoreImages, and columns unchanged
  const fetchProducts = useMemo(
    () =>
      debounce(async (model, filters, page) => {
        setLoading(true);
        try {
          console.log("Fetching products with payload:", {
            model,
            filters,
            page,
          });
          getRange(filters);
          const response = await productViewService.getProducts(
            model,
            filters,
            page
          );
          console.log("API response:", response);
          if (response.success && response.other) {
            setFilteredData(response.other.docs || []);
            setPaginationMeta({
              totalDocs: response.other.totalDocs || 0,
              limit: response.other.limit || 100,
              totalPages: response.other.totalPages || 1,
              hasPrevPage: response.other.hasPrevPage || false,
              hasNextPage: response.other.hasNextPage || false,
            });

            setError(null);
          } else {
            setError(response.message || "Failed to fetch products");
            setFilteredData([]);
            setPaginationMeta({
              totalDocs: 0,
              limit: 100,
              totalPages: 1,
              hasPrevPage: false,
              hasNextPage: false,
            });
          }
        } catch (err) {
          console.error("Error fetching products:", err);
          setError("An error occurred while fetching products");
          setFilteredData([]);
          setPaginationMeta({
            totalDocs: 0,
            limit: 100,
            totalPages: 1,
            hasPrevPage: false,
            hasNextPage: false,
          });
        }
        setLoading(false);
      }, 200),
    []
  );

  useEffect(() => {
    const model = filters.model || "eyeGlasses";

    fetchProducts(model, filters, page);
    return () => clearTimeout(fetchProducts.timeout);
  }, [filters, page, fetchProducts]);

  const handleFetchSinglePhoto = async (product) => {
    setIsFetchingPhotos(true);
    setPhotoFetchProgress(0);
    setCompletedCount(0);
    try {
      const response = await productViewService.fetchAndUpdateProductPhotos(
        product._id,
        product.oldBarcode
      );
      if (response.success) {
        toast.success("Photo fetched and updated.");
        setFilteredData((prev) =>
          prev.map((item) =>
            item._id === product._id
              ? { ...item, photos: response.data.photos }
              : item
          )
        );
      } else {
        setError(response.message || "Failed to fetch photos");
      }
    } catch (err) {
      setError("An error occurred while fetching photos");
    }
    setIsFetchingPhotos(false);
    setPhotoFetchProgress(100);
    setCompletedCount(1);
    const model = filters.model || "eyeGlasses";
    fetchProducts(model, filters, page);
    getRange(filters);
  };

  const handleFetchAllPhotos = async () => {
    setIsFetchingPhotos(true);
    setPhotoFetchProgress(0);
    setCompletedCount(0);
    const totalProducts = filteredData.length;
    let completed = 0;
    for (const product of filteredData) {
      try {
        const response = await productViewService.fetchAndUpdateProductPhotos(
          product._id,
          product.oldBarcode
        );
        if (response.success) {
          setFilteredData((prev) =>
            prev.map((item) =>
              item._id === product._id
                ? { ...item, photos: response.data.photos }
                : item
            )
          );
        }
      } catch (err) {
        console.error("Error fetching photos for product:", product._id, err);
      }
      completed += 1;
      setCompletedCount(completed);
      setPhotoFetchProgress((completed / totalProducts) * 100);
    }
    setIsFetchingPhotos(false);
    toast.success("Photos fetched and updated.");
    const model = filters.model || "eyeGlasses";
    fetchProducts(model, filters, page);
    getRange(filters);
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this product (ID: ${productId})?`
    );
    const productModel = filters.model || "eyeGlasses";
    if (confirmDelete) {
      try {
        const response = await productViewService.deleteProductById(
          productModel,
          productId
        );
        const model = filters.model || "eyeGlasses";
        fetchProducts(model, filters, page);
        getRange(filters);
        if (response) {
          toast.success(response?.message || "Product deleted successfully");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the product");
      }
    }
  };
  const handleViewMoreImages = (photos) => {
    const fullImageUrls = photos.map(
      (photo) => `${defalutImageBasePath}${photo}`
    );
    setSelectedImages(fullImageUrls);
    setShowImageModal(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "SRNO",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "photos",
        header: "Photo",
        cell: ({ getValue }) => {
          const photos = getValue();
          return (
            <div className="text-center">
              {photos.length > 0 ? (
                <>
                  <img
                    src={`https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/${photos[0]}`}
                    alt=""
                    className="img-fluid rounded"
                    style={{ width: "50px", height: "50px" }}
                  />
                  <div>
                    <a
                      href="#"
                      className="text-primary text-decoration-underline"
                      onClick={(e) => {
                        e.preventDefault();
                        handleViewMoreImages(photos);
                      }}
                    >
                      View More
                    </a>
                  </div>
                </>
              ) : (
                <div>-</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "newBarcode",
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
        accessorKey: "MRP",
        header: "MRP",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "photos",
        header: "Photos",
        cell: ({ row }) => (
          <button
            className="btn custom-button-bgcolor btn-sm"
            onClick={() => handleFetchSinglePhoto(row.original)}
            disabled={isFetchingPhotos}
          >
            Fetch Photos
          </button>
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
              onClick={() =>
                navigate(
                  `/products/edit/${row.original._id}/${row.original?.__t}`
                )
              }
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
              onClick={() => handleDelete(row.original._id)}
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

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleNextPage = () => {
    console.log("Next clicked, current page:", page);
    if (paginationMeta.hasNextPage) {
      setPage((prev) => {
        const newPage = prev + 1;
        console.log("Setting new page:", newPage);
        return newPage;
      });
    }
  };

  const handlePreviousPage = () => {
    console.log("Previous clicked, current page:", page);
    if (paginationMeta.hasPrevPage) {
      setPage((prev) => {
        const newPage = prev - 1;
        console.log("Setting new page:", newPage);
        return newPage;
      });
    }
  };

  const exportToExcel = () => {
    navigate("/products/exportProducts");
  };

  // Update downloadExcel to handle default values
  const downloadExcel = async () => {
    try {
      const effectiveStartRange = startRange !== null ? startRange : minVal;
      const effectiveEndRange = endRange !== null ? endRange : maxVal;
      await inventoryService.exportProductExcel(
        filters?.model,
        effectiveStartRange,
        effectiveEndRange,
        filters?.status === "active" ? true : false
      );
      toast.success("Excel download initiated successfully");
    } catch (error) {
      console.log("err", error);
      toast.error("Failed to download Excel");
    }
  };

  const startRow = (page - 1) * paginationMeta.limit + 1;
  const endRow = Math.min(
    page * paginationMeta.limit,
    paginationMeta.totalDocs
  );
  const totalRows = paginationMeta.totalDocs;

  return (
    <div className="card shadow-none border">
      <div className="card-body p-3">
        <div className="d-flex flex-column flex-md-row gap-3 mb-4">
          <h5>{filters?.model || "eyeGlasses"}</h5>

          {/* <button
            className="btn custom-button-bgcolor ms-md-auto"
            onClick={exportToExcel}
            disabled={isFetchingPhotos}
          >
            Export Products
          </button>
          <button
            className="btn custom-button-bgcolor"
            onClick={handleFetchAllPhotos}
            disabled={isFetchingPhotos}
          >
            Fetch Photos
          </button> */}
          {isDownloadButtonVisible && (
            <button
              className="btn custom-button-bgcolor  ms-md-auto"
              onClick={() => setShowDownloadModal(true)} // Always show button, open modal
            >
              Download
            </button>
          )}
        </div>
        {isFetchingPhotos ? (
          <div className="card shadow-sm p-4 text-center">
            <h5>Fetching Photos</h5>
            <div className="progress mb-3">
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${photoFetchProgress}%` }}
                aria-valuenow={photoFetchProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {Math.round(photoFetchProgress)}%
              </div>
            </div>
            <p>
              Completed: {completedCount} / {filteredData.length}
            </p>
          </div>
        ) : (
          <>
            {loading && (
              <div className="w-full d-flex justify-content-center align-items-center">
                <div className="spinner-border" role="status">
                  <span className="sr-only"></span>
                </div>
              </div>
            )}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && (
              <div className="table-responsive px-2">
                <table className="table table-sm">
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
            )}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3">
              <div className="text-sm text-muted mb-3 mb-sm-0">
                Showing <span className="fw-medium">{startRow}</span> to{" "}
                <span className="fw-medium">{endRow}</span> of{" "}
                <span className="fw-medium">{totalRows}</span> results
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-outline-primary"
                  onClick={handlePreviousPage}
                  disabled={!paginationMeta.hasPrevPage || isFetchingPhotos}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={handleNextPage}
                  disabled={!paginationMeta.hasNextPage || isFetchingPhotos}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
        <ProductDetailsModal
          show={showModal}
          onHide={() => setShowModal(false)}
          product={selectedProduct}
        />
        <ImageSliderModalProduct
          show={showImageModal}
          onHide={() => setShowImageModal(false)}
          images={selectedImages}
        />
        <Modal
          show={showDownloadModal}
          onHide={() => setShowDownloadModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Select Download Range</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="d-flex flex-column gap-3">
              {minVal !== null && maxVal !== null && minVal < maxVal ? (
                <>
                  <label className="form-label">
                    Range: {startRange} - {endRange}
                  </label>

                  <Range
                    step={1}
                    min={minVal}
                    max={maxVal}
                    values={[startRange, endRange]}
                    onChange={(values) => {
                      setStartRange(values[0]);
                      setEndRange(values[1]);
                    }}
                    renderTrack={({ props, children }) => (
                      <div
                        {...props}
                        style={{
                          ...props.style,
                          height: "6px",
                          background: "#ddd",
                          borderRadius: "4px",
                        }}
                      >
                        {children}
                      </div>
                    )}
                    renderThumb={({ props }) => (
                      <div
                        {...props}
                        style={{
                          ...props.style,
                          height: "16px",
                          width: "16px",
                          backgroundColor: "#0d6efd",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  />
                </>
              ) : minVal !== null && maxVal !== null && minVal === maxVal ? (
                <label className="form-label">range available: {minVal}</label>
              ) : (
                <label className="form-label text-danger">
                  No ranges available
                </label>
              )}
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDownloadModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={minVal === 0 || maxVal === 0} // disable when no range
              onClick={() => {
                downloadExcel();
                setShowDownloadModal(false);
                setIsDownloadButtonVisible(true);
              }}
            >
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ProductTable;
