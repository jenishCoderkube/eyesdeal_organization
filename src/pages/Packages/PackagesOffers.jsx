import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { packageService } from "../../services/packageService";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import AssetSelector from "../../components/Products/AddProducts/EyeGlasses/AssetSelector"; // Adjust path as needed

const BASE_URL =
  "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/";

const PackageModal = ({ show, onHide, onSubmit, initialData }) => {
  const [packageName, setPackageName] = useState(
    initialData?.packageName || ""
  );
  const [description, setDescription] = useState(
    initialData?.Description || ""
  );
  const [isBogo, setIsBogo] = useState(initialData?.isBogo || false);
  const [selectedLogo, setSelectedLogo] = useState(
    initialData?.logoImage || ""
  );
  const [selectedBanner, setSelectedBanner] = useState(
    initialData?.bannerImage || ""
  );
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPackageName(initialData?.packageName || "");
    setDescription(initialData?.Description || "");
    setIsBogo(initialData?.isBogo || false);
    setSelectedLogo(initialData?.logoImage || "");
    setSelectedBanner(initialData?.bannerImage || "");
  }, [initialData, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      packageName,
      Description: description,
      isBogo,
      logoImage: selectedLogo,
      bannerImage: selectedBanner,
    };

    if (initialData?._id) payload._id = initialData._id;

    await onSubmit(payload);
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
            <Form.Label>Package Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Logo Image</Form.Label>
            <div className="row">
              <div className="col-2">
                <Button
                  type="button"
                  variant="primary"
                  className="py-2 px-3"
                  onClick={() => setShowLogoModal(true)}
                >
                  Select Logo
                </Button>
              </div>
              <div className="col-10">
                <Form.Control
                  type="text"
                  value={selectedLogo}
                  disabled
                  placeholder="e.g. /eyesdeal/EyesO_1.png"
                />
                <small className="form-text text-muted">
                  Use the Select Logo button to choose an image from the media
                  library.
                </small>
              </div>
            </div>
            {selectedLogo && (
              <div className="row mt-4 g-3">
                <div className="col-12 col-md-6 col-lg-3">
                  <div className="position-relative border text-center border-black rounded p-2">
                    <img
                      src={`${BASE_URL}${selectedLogo}`}
                      alt="Logo"
                      className="img-fluid rounded w-50 h-auto object-fit-cover"
                      style={{ maxHeight: "100px", objectFit: "cover" }}
                    />
                    <button
                      className="position-absolute top-0 start-0 translate-middle bg-white rounded-circle border border-light p-1"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedLogo("")}
                      aria-label="Remove logo"
                    >
                      <IoClose size={16} className="text-dark" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Banner Image</Form.Label>
            <div className="row">
              <div className="col-2">
                <Button
                  type="button"
                  variant="primary"
                  className="py-2 px-3"
                  onClick={() => setShowBannerModal(true)}
                >
                  Select Banner
                </Button>
              </div>
              <div className="col-10">
                <Form.Control
                  type="text"
                  value={selectedBanner}
                  disabled
                  placeholder="e.g. /eyesdeal/EyesO_1.png"
                />
                <small className="form-text text-muted">
                  Use the Select Banner button to choose an image from the media
                  library.
                </small>
              </div>
            </div>
            {selectedBanner && (
              <div className="row mt-4 g-3">
                <div className="col-12 col-md-6 col-lg-3">
                  <div className="position-relative border text-center border-black rounded p-2">
                    <img
                      src={`${BASE_URL}${selectedBanner}`}
                      alt="Banner"
                      className="img-fluid rounded w-50 h-auto object-fit-cover"
                      style={{ maxHeight: "100px", objectFit: "cover" }}
                    />
                    <button
                      className="position-absolute top-0 start-0 translate-middle bg-white rounded-circle border border-light p-1"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedBanner("")}
                      aria-label="Remove banner"
                    >
                      <IoClose size={16} className="text-dark" />
                    </button>
                  </div>
                </div>
              </div>
            )}
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
      <AssetSelector
        show={showLogoModal}
        onHide={() => setShowLogoModal(false)}
        onSelectImage={(imageSrc) => {
          setSelectedLogo(imageSrc[0]);
          setShowLogoModal(false);
        }}
      />
      <AssetSelector
        show={showBannerModal}
        onHide={() => setShowBannerModal(false)}
        onSelectImage={(imageSrc) => {
          setSelectedBanner(imageSrc[0]);
          setShowBannerModal(false);
        }}
      />
    </Modal>
  );
};

const PackagesOffers = () => {
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
  const navigate = useNavigate();

  const fetchPackages = async (page = 1, limit = 10) => {
    setLoading(true);
    const res = await packageService.getPackages(page, limit);
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

  const handleModalSubmit = async (payload) => {
    let res;
    if (payload._id) {
      res = await packageService.updatePackage(payload);
    } else {
      res = await packageService.createPackage(payload);
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
        accessorKey: "Description",
        header: "Package Description",
        cell: ({ getValue }) => <span>{getValue()}</span>,
      },
      {
        accessorKey: "logoImage",
        header: "Logo Image",
        cell: ({ getValue }) =>
          getValue() ? (
            <img
              src={`${BASE_URL}${getValue()}`}
              alt="logo"
              style={{ width: 50, height: "auto" }}
            />
          ) : (
            "No image"
          ),
      },
      {
        accessorKey: "bannerImage",
        header: "Banner Image",
        cell: ({ getValue }) =>
          getValue() ? (
            <img
              src={`${BASE_URL}${getValue()}`}
              alt="banner"
              style={{ width: 50, height: "auto" }}
            />
          ) : (
            "No image"
          ),
      },
      {
        accessorKey: "isBogo",
        header: "Is Bogo",
        cell: ({ getValue }) => <span>{getValue() ? "Yes" : "No"}</span>,
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                navigate(`/products/add-package-product/${row.original._id}`);
              }}
            >
              Add Product
            </Button>
            {!row?.original?.isBogo && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  navigate(`/products/add-package-offers/${row.original._id}`);
                }}
              >
                Add Offer
              </Button>
            )}
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
