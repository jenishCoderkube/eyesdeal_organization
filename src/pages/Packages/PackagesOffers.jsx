import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { packageService } from "../../services/packageService";
import productViewService from "../../services/Products/productViewService";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import Select from "react-select";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal";

const PackageModal = ({ show, onHide, onSubmit, products, initialData }) => {
  const [packageName, setPackageName] = useState(
    initialData?.packageName || ""
  );
  const [selectedProducts, setSelectedProducts] = useState(
    initialData?.products?.map((p) => (typeof p === "string" ? p : p._id)) || []
  );
  const [isBogo, setIsBogo] = useState(initialData?.isBogo || false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPackageName(initialData?.packageName || "");
    setSelectedProducts(
      initialData?.products?.map((p) => (typeof p === "string" ? p : p._id)) ||
        []
    );
    setIsBogo(initialData?.isBogo || false);
  }, [initialData, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({
      packageName,
      products: selectedProducts,
      isBogo,
      _id: initialData?._id,
    });
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? "Edit Package" : "Create Package"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Package Name</Form.Label>
            <Form.Control
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Products</Form.Label>
            <Select
              isMulti
              options={products.map((p) => ({
                value: p._id,
                label: `${p.displayName} (${p.modelNumber} ${p.colorNumber})`,
              }))}
              value={products
                .filter((p) => selectedProducts.includes(p._id))
                .map((p) => ({
                  value: p._id,
                  label: `${p.displayName} (${p.modelNumber} ${p.colorNumber})`,
                }))}
              onChange={(opts) => setSelectedProducts(opts.map((o) => o.value))}
              classNamePrefix="react-select"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="isBogoCheckbox">
            <Form.Check
              type="checkbox"
              label="Is Bogo"
              checked={isBogo}
              onChange={(e) => setIsBogo(e.target.checked)}
            />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving..." : initialData ? "Update" : "Create"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const PackagesOffers = () => {
  const [packages, setPackages] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [editData, setEditData] = useState(null);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  });
  // Delete modal state
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch packages
  const fetchPackages = async (page = 1, limit = 10) => {
    setLoading(true);
    const res = await packageService.getPackages(page, limit);
    if (res.success) {
      // API returns { data, totalRecords, totalCount, currentPage, limit, totalPages }
      setPackages(res.data?.data || []);
      setPagination({
        totalDocs: res.data?.totalRecords || 0,
        limit: res.data?.limit || limit,
        page: res.data?.currentPage || page,
        totalPages: res.data?.totalPages || 1,
        hasPrevPage: (res.data?.currentPage || page) > 1,
        hasNextPage:
          (res.data?.currentPage || page) < (res.data?.totalPages || 1),
        prevPage:
          (res.data?.currentPage || page) > 1
            ? (res.data?.currentPage || page) - 1
            : null,
        nextPage:
          (res.data?.currentPage || page) < (res.data?.totalPages || 1)
            ? (res.data?.currentPage || page) + 1
            : null,
      });
    } else {
      toast.error(res.message);
      setPackages([]);
      setPagination((prev) => ({ ...prev, totalDocs: 0 }));
    }
    setLoading(false);
  };

  // Fetch products (eyeGlasses)
  const fetchProducts = async () => {
    const res = await productViewService.getProducts("eyeGlasses", {}, 1, 1000);
    if (res.success) {
      setProducts(res.data || []);
    } else {
      toast.error(res.message);
    }
  };

  useEffect(() => {
    fetchPackages(1, pagination.limit);
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  // Pagination controls
  const handlePageChange = (page) => {
    if (page && page !== pagination.page) {
      fetchPackages(page, pagination.limit);
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "srno",
        header: "SRNO",
        cell: ({ row }) =>
          (pagination.page - 1) * pagination.limit + row.index + 1,
      },
      {
        accessorKey: "packageName",
        header: "Package Name",
        cell: ({ getValue }) => <span>{getValue()}</span>,
      },
      {
        accessorKey: "products",
        header: "Products",
        cell: ({ getValue }) => (
          <span>
            {getValue()
              .map(
                (p, idx) =>
                  `(${idx + 1}) ` +
                  (typeof p === "string"
                    ? p
                    : p.displayName || p.modelNumber || p._id)
              )
              .join(", ")}
          </span>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <span style={{ display: "flex", gap: 12 }}>
            <span
              style={{ cursor: "pointer", color: "#007bff" }}
              title="Edit"
              onClick={() => {
                setEditData(row.original);
                setModalShow(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                stroke="blue"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </span>
            <span
              style={{
                cursor: loading ? "not-allowed" : "pointer",
                color: "#dc3545",
                opacity: loading ? 0.5 : 1,
              }}
              title="Delete"
              onClick={() => {
                if (loading) return;
                setDeleteTarget(row.original);
                setDeleteModalShow(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                stroke="red"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </span>
          </span>
        ),
      },
    ],
    [pagination.page, pagination.limit, loading]
  );

  const table = useReactTable({
    data: packages,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
  });

  // Handle create/edit submit
  const handleModalSubmit = async (data) => {
    let res;
    if (data._id) {
      // Edit: products should be array of product objects (with _id and details if available)
      const updatedProducts = data.products.map((pid) => {
        const found = products.find((p) => p._id === pid || p._id === pid._id);
        if (found) {
          // Only include the fields required by the API (as in your example)
          const {
            _id,
            modelNumber,
            colorNumber,
            frameType,
            frameShape,
            frameStyle,
            templeMaterial,
            frameMaterial,
            templeColor,
            frameColor,
            gender,
            frameSize,
            frameWidth,
            frameDimensions,
            weight,
            prescriptionType,
            frameCollection,
            features,
            oldBarcode,
            sku,
            displayName,
            HSNCode,
            brand,
            unit,
            warranty,
            tax,
            description,
            costPrice,
            resellerPrice,
            MRP,
            discount,
            sellPrice,
            manageStock,
            inclusiveTax,
            incentiveAmount,
            photos,
            __t,
            createdAt,
            updatedAt,
            newBarcode,
            __v,
            activeInERP,
            activeInWebsite,
            storeFront,
            seoDescription,
            seoImage,
            seoTitle,
          } = found;
          return {
            _id,
            modelNumber,
            colorNumber,
            frameType,
            frameShape,
            frameStyle,
            templeMaterial,
            frameMaterial,
            templeColor,
            frameColor,
            gender,
            frameSize,
            frameWidth,
            frameDimensions,
            weight,
            prescriptionType,
            frameCollection,
            features,
            oldBarcode,
            sku,
            displayName,
            HSNCode,
            brand: brand?._id || brand,
            unit: unit?._id || unit,
            warranty,
            tax,
            description,
            costPrice,
            resellerPrice,
            MRP,
            discount,
            sellPrice,
            manageStock,
            inclusiveTax,
            incentiveAmount,
            photos,
            __t,
            createdAt,
            updatedAt,
            newBarcode,
            __v,
            activeInERP,
            activeInWebsite,
            storeFront,
            seoDescription,
            seoImage,
            seoTitle,
          };
        }
        // fallback: just _id
        return { _id: typeof pid === "object" ? pid._id : pid };
      });
      res = await packageService.updatePackage({
        _id: data._id,
        packageName: data.packageName,
        products: updatedProducts,
        isBogo: data.isBogo,
      });
    } else {
      // Create: products is array of IDs
      res = await packageService.createPackage({
        packageName: data.packageName,
        products: data.products,
        isBogo: data.isBogo,
      });
    }
    if (res.success) {
      toast.success(res.message || "Success");
      setModalShow(false);
      setEditData(null);
      fetchPackages(pagination.page, pagination.limit);
    } else {
      toast.error(res.message);
    }
  };

  // Pagination range
  const startRow =
    pagination.totalDocs > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const endRow =
    pagination.totalDocs > 0
      ? Math.min(pagination.page * pagination.limit, pagination.totalDocs)
      : 0;
  const totalRows = pagination.totalDocs;

  return (
    <div className="container-fluid max-width-90 mx-auto mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Packages</h2>
        <Button
          variant="primary"
          onClick={() => {
            setEditData(null);
            setModalShow(true);
          }}
        >
          Create Package
        </Button>
      </div>
      <div className="table-responsive">
        <table className="table table-sm">
          <thead className="text-xs text-uppercase text-muted bg-light border-top border-bottom">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3 text-left">
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  No packages found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalRows > 0 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
          <div className="text-muted mb-3 mb-md-0">
            Showing <strong>{startRow}</strong> to <strong>{endRow}</strong> of{" "}
            <strong>{totalRows}</strong> results
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li
                className={`page-item ${
                  !pagination.hasPrevPage ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.prevPage)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </button>
              </li>
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((pageNum) => (
                <li
                  key={pageNum}
                  className={`page-item ${
                    pagination.page === pageNum ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  !pagination.hasNextPage ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(pagination.nextPage)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
      <PackageModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setEditData(null);
        }}
        onSubmit={handleModalSubmit}
        products={products}
        initialData={editData}
      />
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModalShow}
        onHide={() => {
          setDeleteModalShow(false);
          setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setLoading(true);
          const res = await packageService.deletePackage(deleteTarget._id);
          setLoading(false);
          setDeleteModalShow(false);
          setDeleteTarget(null);
          if (res.success) {
            toast.success(res.message || "Package deleted successfully");
            fetchPackages(pagination.page, pagination.limit);
          } else {
            toast.error(res.message || "Failed to delete package");
          }
        }}
        message={`Are you sure you want to delete the package "${
          deleteTarget?.packageName || ""
        }"?`}
      />
    </div>
  );
};

export default PackagesOffers;
