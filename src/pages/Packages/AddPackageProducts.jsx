import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import AsyncSelect from "react-select/async";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal"; // Adjust path as needed
import { productService } from "../../services/productService"; // Adjust path as needed
import { packageService } from "../../services/packageService"; // Adjust path as needed
import api from "../../services/api"; // Adjust path as needed
const PackageProductsModal = ({
  show,
  onHide,
  onSubmit,
  initialData,
  packageId,
}) => {
  console.log("initialData", initialData);

  const [selectedProducts, setSelectedProducts] = useState(
    initialData?.product ? [initialData.product] : []
  );
  const [submitting, setSubmitting] = useState(false);

  // Reset form when initialData or show changes
  useEffect(() => {
    setSelectedProducts(initialData?.product ? [initialData.product] : []);
  }, [initialData, show]);
  useEffect(() => {
    if (initialData?.product) {
      const prod = initialData.product;
      setSelectedProducts([
        {
          value: prod._id,
          label: prod.sku || prod.displayName,
          ...prod,
        },
      ]);
    } else {
      setSelectedProducts([]);
    }
  }, [initialData, show]);

  const loadProductOptions = async (inputValue) => {
    try {
      const response = await productService.getProducts1("EYEGLASSES", {
        search: inputValue,
      });
      console.log("response", response);

      if (response.success) {
        const options = response.data.docs?.map((product) => ({
          value: product._id,
          label: product.sku || product.model || "Unnamed Product",
        }));
        return options;
      }
      return [];
    } catch (error) {
      console.log("error", error);

      toast.error("Error loading products");
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      package: packageId,
      products: selectedProducts.map((product) => product.value),
    };
    console.log("payloaodsss<<", payload);

    await onSubmit(payload);
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? "Edit Package Products" : "Add Package Products"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Select Products</Form.Label>
            <AsyncSelect
              isMulti
              cacheOptions
              defaultOptions
              loadOptions={loadProductOptions}
              value={selectedProducts}
              onChange={setSelectedProducts}
              placeholder="Search and select products..."
              isClearable
              required
            />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Saving..." : initialData ? "Update" : "Add"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

const AddPackageProducts = () => {
  const { id: packageId } = useParams(); // Get package ID from URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const fetchPackageProducts = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/package/product/${packageId}?page=${page}&limit=${limit}`
      );

      if (res?.data) {
        setProducts(res.data?.message?.data || []);

        setPagination({
          totalDocs: res.data?.message?.totalRecords || 0,
          limit: res.data?.message?.limit || limit,
          page: res.data?.message?.currentPage || page,
          totalPages: res.data?.message?.totalPages || 1,
          hasPrevPage: (res.data?.message?.currentPage || page) > 1,
          hasNextPage:
            (res.data?.message?.currentPage || page) <
            (res.data?.message?.totalPages || 1),
          prevPage:
            (res.data?.message?.currentPage || page) > 1
              ? (res.data?.message?.currentPage || page) - 1
              : null,
          nextPage:
            (res.data?.message?.currentPage || page) <
            (res.data?.message?.totalPages || 1)
              ? (res.data?.message?.currentPage || page) + 1
              : null,
        });
      } else {
        toast.error(res?.data?.message || "Failed to load package products");
        setProducts([]);
        setPagination((prev) => ({ ...prev, totalDocs: 0 }));
      }
    } catch (error) {
      console.error("Error fetching package products:", error);
      toast.error("Error fetching package products");
      setProducts([]);
      setPagination((prev) => ({ ...prev, totalDocs: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackageProducts(1, pagination.limit);
  }, [packageId]);

  const handlePageChange = (page) => {
    if (page && page !== pagination.page) {
      fetchPackageProducts(page, pagination.limit);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "srno",
        header: "Index",
        cell: ({ row }) =>
          (pagination.page - 1) * pagination.limit + row.index + 1,
      },
      {
        accessorKey: "productName",
        header: "Product Name",
        cell: ({ row }) => (
          <span>{row.original.product?.displayName || "N/A"}</span>
        ),
      },

      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* <span
              style={{ cursor: "pointer", color: "#007bff" }}
              title="Edit"
              onClick={() => {
                setEditData({
                  ...row.original,
                  products: row.original.products?.map((product) => ({
                    value: product._id,
                    label:
                      product.displayName || product.model || "Unnamed Product",
                  })),
                });
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
            </span> */}
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
    data: products,
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

  const handleModalSubmit = async (payload) => {
    try {
      if (payload?._id) {
        const res = await packageService.addPackageProducts(payload);
        if (res.success) {
          toast.success(res.message || "Products added successfully");
          setModalShow(false);
          setEditData(null);
          fetchPackageProducts(pagination.page, pagination.limit);
        } else {
          toast.error(res.message || "Failed to add products");
        }
      } else {
        const res = await packageService.addPackageProducts(payload);
        if (res.success) {
          toast.success(res.message || "Products added successfully");
          setModalShow(false);
          setEditData(null);
          fetchPackageProducts(pagination.page, pagination.limit);
        } else {
          toast.error(res.message || "Failed to add products");
        }
      }
    } catch (error) {
      toast.error("Error adding products");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await api.delete(`/package/product/${deleteTarget._id}`);
      console.log("res", res);

      if (res?.data.success) {
        toast.success(res.message || "Product removed successfully");
        fetchPackageProducts(pagination.page, pagination.limit);
      } else {
        toast.error(res.message || "Failed to remove product");
      }
    } catch (error) {
      toast.error("Error removing product");
    }
    setLoading(false);
    setDeleteModalShow(false);
    setDeleteTarget(null);
  };

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
        <h2>Package Products List</h2>
        <Button
          variant="primary"
          onClick={() => {
            setEditData(null);
            setModalShow(true);
          }}
        >
          Add Products
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
                  No products found.
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
      <PackageProductsModal
        show={modalShow}
        onHide={() => {
          setModalShow(false);
          setEditData(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editData}
        packageId={packageId}
      />
      <DeleteConfirmationModal
        show={deleteModalShow}
        onHide={() => {
          setDeleteModalShow(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        message={`Are you sure you want to remove the product "${
          deleteTarget?.product?.displayName || ""
        }" from the package?`}
      />
    </div>
  );
};

export default AddPackageProducts;
