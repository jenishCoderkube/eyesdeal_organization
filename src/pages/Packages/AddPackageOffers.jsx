import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import AsyncSelect from "react-select/async";
import { packageService } from "../../services/packageService"; // Adjust path as needed
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal"; // Adjust path as needed
import { useParams } from "react-router-dom";

const PackageModal = ({ show, onHide, onSubmit, initialData, packageId }) => {
  console.log(":initialData", initialData);

  const [lens, setLens] = useState(initialData?.lens || null);
  const [pairNumber, setPairNumber] = useState(initialData?.pairNumber || 1);
  const [lensPrice, setLensPrice] = useState(initialData?.lensPrice || "");
  const [framePrice, setFramePrice] = useState(initialData?.framePrice || "");
  const [totalPrice, setTotalPrice] = useState(initialData?.totalPrice || "");
  const [submitting, setSubmitting] = useState(false);

  // Calculate total price whenever lensPrice or framePrice changes
  useEffect(() => {
    const lens = parseFloat(lensPrice) || 0;
    const frame = parseFloat(framePrice) || 0;
    setTotalPrice((lens + frame).toFixed(2));
  }, [lensPrice, framePrice]);

  // Reset form when initialData or show changes
  useEffect(() => {
    if (initialData?.lens) {
      if (typeof initialData.lens === "string") {
        // Case: lens is just an ID
        setLens({ value: initialData.lens, label: initialData.lens });
      } else if (typeof initialData.lens === "object") {
        // Case: lens is populated object
        setLens({
          value: initialData.lens._id,
          label: initialData.lens.sku || initialData.lens.productName,
          ...initialData.lens,
        });
      }
    } else {
      setLens(null);
    }

    setPairNumber(initialData?.quantity || 1);
    setLensPrice(initialData?.lensPrice || "");
    setFramePrice(initialData?.framePrice || "");
    setTotalPrice(initialData?.totalPrice || "");
  }, [initialData, show]);

  // Async lens options loader
  const loadLensOptions = async (inputValue) => {
    try {
      const response = await packageService.getLenses(inputValue);

      // API returns docs as array of product objects
      const docs = response.data?.docs || [];
      console.log("docs", docs);

      // Map to { value, label } format
      return docs?.map((lens) => ({
        value: lens._id,
        label: lens.sku || lens?.productName, // 👈 label is sku
        ...lens, // keep full object if you need later (price, brand, etc.)
      }));
    } catch (error) {
      toast.error("Error loading lenses");
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Build plain JSON payload
    const payload = {
      package: packageId, // 👈 make sure you have this from props/state
      lens: lens?.value || lens, // lens._id if from react-select
      quantity: Number(pairNumber) || 0,
      framePrice: Number(framePrice) || 0,
      lensPrice: Number(lensPrice) || 0,
      totalPrice: Number(totalPrice) || 0,
    };

    // If updating an existing record
    if (initialData?._id) {
      payload._id = initialData._id;
    }

    await onSubmit(payload); // send JSON
    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? "Edit Package" : "Create Package Offer"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Lens</Form.Label>
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadLensOptions}
              value={lens}
              onChange={setLens}
              placeholder="Select lens..."
              isClearable
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Pair (1-5)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="5"
              value={pairNumber}
              onChange={(e) => {
                const val = e.target.value;
                setPairNumber(val === "" ? "" : parseInt(val));
              }}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Lens Price</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={lensPrice}
              onChange={(e) => setLensPrice(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Frame Price</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={framePrice}
              onChange={(e) => setFramePrice(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Total Price</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={totalPrice}
              readOnly
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

const AddPackageOffers = () => {
  const [packages, setPackages] = useState([]);
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
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { id: packageId } = useParams(); // Get package ID from URL
  const fetchPackages = async (page = 1, limit = 10) => {
    setLoading(true);
    const res = await packageService.getPackagesProducs(page, limit, packageId);
    if (res.success) {
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

  useEffect(() => {
    fetchPackages(1, pagination.limit);
  }, []);

  const handlePageChange = (page) => {
    if (page && page !== pagination.page) {
      fetchPackages(page, pagination.limit);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "srno",
        header: "SRNO",
        cell: ({ row }) =>
          (pagination.page - 1) * pagination.limit + row.index + 1,
      },
      {
        accessorKey: "lens",
        header: "Lens",
        cell: ({ getValue }) => <span>{getValue()?.sku || "N/A"}</span>,
      },
      {
        accessorKey: "quantity",
        header: "Pair",
        cell: ({ getValue }) => <span>{getValue() || "N/A"}</span>,
      },
      {
        accessorKey: "lensPrice",
        header: "Lens Price",
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span>{typeof value === "number" ? value.toFixed(2) : "0.00"}</span>
          );
        },
      },
      {
        accessorKey: "framePrice",
        header: "Frame Price",
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span>{typeof value === "number" ? value.toFixed(2) : "0.00"}</span>
          );
        },
      },
      {
        accessorKey: "totalPrice",
        header: "Total Price",
        cell: ({ getValue }) => {
          const value = getValue();
          return (
            <span>{typeof value === "number" ? value.toFixed(2) : "0.00"}</span>
          );
        },
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
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

  const handleModalSubmit = async (formData) => {
    let res;
    if (formData._id) {
      res = await packageService.updatePackageOffers(formData);
    } else {
      res = await packageService.createPackageProduct(formData);
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
        <h2>Package Offers List</h2>
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
        initialData={editData}
        packageId={packageId}
      />
      <DeleteConfirmationModal
        show={deleteModalShow}
        onHide={() => {
          setDeleteModalShow(false);
          setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setLoading(true);
          const res = await packageService.deletePackageProduct(
            deleteTarget._id
          );
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
        message={`Are you sure you want to delete the package with lens ${
          deleteTarget?.lens?.label || ""
        }?`}
      />
    </div>
  );
};

export default AddPackageOffers;
