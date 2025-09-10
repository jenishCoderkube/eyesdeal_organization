import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import AsyncSelect from "react-select/async";
import { packageService } from "../../services/packageService";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal/DeleteConfirmationModal";
import { useParams } from "react-router-dom";

const PackageModal = ({ show, onHide, onSubmit, initialData, packageId }) => {
  const [lens, setLens] = useState(null);
  const [pairs, setPairs] = useState(
    initialData?.pairs || [
      { pairNumber: 1, lensPrice: "", framePrice: "", totalPrice: "" },
    ]
  );
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with initialData
  useEffect(() => {
    if (show) {
      if (initialData) {
        // Handle edit case
        setLens(
          initialData.lens
            ? {
                value:
                  typeof initialData.lens === "string"
                    ? initialData.lens
                    : initialData.lens._id,
                label:
                  typeof initialData.lens === "string"
                    ? initialData.lens
                    : initialData.lens.sku || initialData.lens.productName,
                ...initialData.lens,
              }
            : null
        );
        setPairs(
          initialData.pairs
            ? initialData.pairs.map((pair, index) => ({
                ...pair,
                pairNumber: index + 1, // Ensure pair numbers are sequential
              }))
            : [{ pairNumber: 1, lensPrice: "", framePrice: "", totalPrice: "" }]
        );
      } else {
        // Reset for new package
        setLens(null);
        setPairs([
          { pairNumber: 1, lensPrice: "", framePrice: "", totalPrice: "" },
        ]);
      }
    }
  }, [initialData, show]);

  // // Calculate total price for each pair
  // useEffect(() => {
  //   setPairs((prevPairs) =>
  //     prevPairs.map((pair) => {
  //       const lensPrice = parseFloat(pair.lensPrice) || 0;
  //       const framePrice = parseFloat(pair.framePrice) || 0;
  //       return { ...pair, totalPrice: (lensPrice + framePrice).toFixed(2) };
  //     })
  //   );
  // }, [pairs]);

  const loadLensOptions = async (inputValue) => {
    try {
      const response = await packageService.getLenses(inputValue);
      const docs = response.data?.docs || [];
      return docs.map((lens) => ({
        value: lens._id,
        label: lens.sku || lens.productName,
        ...lens,
      }));
    } catch (error) {
      toast.error("Error loading lenses");
      return [];
    }
  };

  const handlePairChange = (index, field, value) => {
    setPairs((prevPairs) => {
      const newPairs = [...prevPairs];
      newPairs[index] = { ...newPairs[index], [field]: value };
      return newPairs;
    });
  };

  const addPair = () => {
    if (pairs.length < 5) {
      setPairs([
        ...pairs,
        {
          pairNumber: pairs.length + 1,
          lensPrice: "",
          framePrice: "",
          totalPrice: "",
        },
      ]);
    }
  };

  const removePair = (index) => {
    if (pairs.length > 1) {
      setPairs(
        (prevPairs) =>
          prevPairs
            .filter((_, i) => i !== index)
            .map((pair, i) => ({ ...pair, pairNumber: i + 1 })) // Reindex pair numbers
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lens) {
      toast.error("Please select a lens");
      return;
    }

    setSubmitting(true);
    const payload = {
      package: packageId,
      lens: lens.value,
      pairs: pairs.map((pair) => ({
        quantity: pair.pairNumber,
        lensPrice: Number(pair.lensPrice) || 0,
        framePrice: Number(pair.framePrice) || 0,
        totalPrice: Number(pair.totalPrice) || 0,
      })),
    };

    if (initialData?._id) {
      payload._id = initialData._id;
    }

    try {
      await onSubmit(payload);
      setSubmitting(false);
      onHide();
    } catch (error) {
      setSubmitting(false);
      toast.error("Error submitting package");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? "Edit Package Offer" : "Create Package Offer"}
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
          {pairs.length < 5 && (
            <Button
              variant="outline-primary mb-3"
              type="button"
              onClick={addPair}
            >
              Add Pair
            </Button>
          )}
          {pairs.map((pair, index) => (
            <div key={index} className="border p-3 mb-3 rounded">
              <h5>Pair {pair.pairNumber}</h5>
              <div className="row">
                <Form.Group className="col-md-4 mb-3">
                  <Form.Label>Lens Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={pair.lensPrice}
                    onChange={(e) =>
                      handlePairChange(index, "lensPrice", e.target.value)
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="col-md-4 mb-3">
                  <Form.Label>Frame Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={pair.framePrice}
                    onChange={(e) =>
                      handlePairChange(index, "framePrice", e.target.value)
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="col-md-3 mb-3">
                  <Form.Label>Total Price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={pair.totalPrice}
                    readOnly
                  />
                </Form.Group>
                {pairs.length > 1 && (
                  <div className="col-md-1 d-flex align-items-end mb-3">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removePair(index)}
                    >
                      X
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

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
  const { id: packageId } = useParams();

  const fetchPackages = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await packageService.getPackagesProducs(
        page,
        limit,
        packageId
      );
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
        setPackages([]);
        setPagination((prev) => ({ ...prev, totalDocs: 0 }));
      }
    } catch (error) {
      toast.error("Error fetching packages");
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
        accessorKey: "pairs",
        header: "Pairs",
        cell: ({ getValue }) => <span>{getValue()?.length || 1} Pair(s)</span>,
      },
      {
        accessorKey: "pairs",
        header: "Details",
        cell: ({ getValue }) => (
          <div>
            {getValue()?.map((pair, index) => (
              <div key={index}>
                Pair {pair?.quantity} | Lens ₹{pair.lensPrice?.toFixed(2)} |
                Frame ₹{pair.framePrice?.toFixed(2)} | Total ₹
                {pair.totalPrice?.toFixed(2)}
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
          </div>
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
    try {
      const res = formData._id
        ? await packageService.updatePackageOffers(formData)
        : await packageService.createPackageProduct(formData);
      if (res.success) {
        toast.success(res.message || "Success");
        setModalShow(false);
        setEditData(null);
        fetchPackages(pagination.page, pagination.limit);
      } else {
        toast.error(res.message || "Failed to save package");
      }
    } catch (error) {
      toast.error("Error saving package");
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
          Create Package Offer
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
                  <Spinner animation="border" size="sm" /> Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center">
                  No package offers found.
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
          try {
            const res = await packageService.deletePackageProduct(
              deleteTarget._id
            );
            if (res.success) {
              toast.success(res.message || "Package deleted successfully");
              fetchPackages(pagination.page, pagination.limit);
            } else {
              toast.error(res.message || "Failed to delete package");
            }
          } catch (error) {
            toast.error("Error deleting package");
          }
          setLoading(false);
          setDeleteModalShow(false);
          setDeleteTarget(null);
        }}
        message={`Are you sure you want to delete the package with lens ${
          deleteTarget?.lens?.sku || "N/A"
        }?`}
      />
    </div>
  );
};

export default AddPackageOffers;
