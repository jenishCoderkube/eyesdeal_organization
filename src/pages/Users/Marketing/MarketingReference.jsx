import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import EditReferenceModal from "../../../components/Users/Marketing/EditReferenceModal";
import { userService } from "../../../services/userService";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Validation schema for create form
const validationSchema = Yup.object({
  name: Yup.string().trim().required("Reference Name is required"),
});

const ViewReferences = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [references, setReferences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReference, setEditReference] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch marketing references
  const fetchMarketingReferences = async (
    page = 1,
    limit = 10,
    search = ""
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getMarketingReferences({
        page,
        limit,
        search,
      });
      if (res.success) {
        setReferences(res?.data?.data?.docs || []);
        setPagination({
          page: res?.data?.data?.page,
          limit: res?.data?.data?.limit,
          totalDocs: res?.data?.data?.totalDocs,
          totalPages: res?.data?.data?.totalPages,
          hasNextPage: res?.data?.data?.hasNextPage,
          hasPrevPage: res?.data?.data?.hasPrevPage,
        });
      } else {
        throw new Error(
          res?.data?.data?.message || "Failed to fetch references"
        );
      }
    } catch (e) {
      console.error("Failed to fetch marketing references: ", e);
      setError("Failed to load references. Please try again.");
      toast.error("Failed to load references.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount and when page, limit, or search changes
  useEffect(() => {
    const debouncedFetch = debounce(() => {
      fetchMarketingReferences(pagination.page, pagination.limit, searchQuery);
    }, 300);

    debouncedFetch();

    return () => clearTimeout(debouncedFetch.timeout);
  }, [pagination.page, pagination.limit, searchQuery]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on search
  };

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "SRNO",
        cell: ({ row }) => (
          <div className="text-left break-words">{row.index + 1}</div>
        ),
      },
      {
        accessorKey: "name",
        header: "Reference Name",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ getValue }) => (
          <div className="text-left break-words">
            {new Date(getValue()).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="text-left break-words">
            <div className="d-flex" style={{ gap: "0.5rem" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cursor-pointer text-secondary text-black"
                onClick={() => handleEdit(row.original)}
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
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
                className="cursor-pointer"
                onClick={() => handleDelete(row.original._id)}
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>
          </div>
        ),
      },
    ],
    []
  );

  // TanStack table setup
  const table = useReactTable({
    data: references,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Enable manual pagination
    state: {
      pagination: {
        pageIndex: pagination.page - 1, // TanStack uses 0-based index, API uses 1-based
        pageSize: pagination.limit,
      },
    },
    pageCount: pagination.totalPages,
    onPaginationChange: (updater) => {
      const newPagination = updater({
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      });
      setPagination((prev) => ({
        ...prev,
        page: newPagination.pageIndex + 1,
        limit: newPagination.pageSize,
      }));
    },
  });

  // Handle edit
  const handleEdit = (reference) => {
    setEditReference(reference);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    try {
      const response = await userService.deleteMarketingReference(id);
      if (response.success) {
        toast.success(response.message);
        fetchMarketingReferences(
          pagination.page,
          pagination.limit,
          searchQuery
        );
      } else {
        toast.error(response.message);
      }
    } catch (e) {
      toast.error("Failed to delete reference.");
    }
  };

  // Formik for create form
  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await userService.addMarketingReference(values);
        if (response.success) {
          toast.success(response.message);
          resetForm();
          fetchMarketingReferences(
            pagination.page,
            pagination.limit,
            searchQuery
          );
        } else {
          toast.error(response.message);
        }
      } catch (e) {
        toast.error("Failed to add reference.");
      }
    },
  });

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPagination((prev) => ({ ...prev, limit: newSize, page: 1 }));
  };

  // Calculate the range of displayed rows
  const startRow = (pagination.page - 1) * pagination.limit + 1;
  const endRow = Math.min(
    pagination.page * pagination.limit,
    pagination.totalDocs
  );
  const totalRows = pagination.totalDocs;

  return (
    <div className="container-fluid px-4 py-8">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold mt-3">Marketing Reference</h1>
          </div>

          {/* Create Form */}
          <div className="card shadow-none mt-3 border-0">
            <div className="card-body p-3">
              <form onSubmit={formik.handleSubmit}>
                <div className="mb-2">
                  <label className="form-label font-weight-500" htmlFor="name">
                    Reference <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${
                      formik.touched.name && formik.errors.name
                        ? "is-invalid"
                        : ""
                    }`}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={async (e) => {
                      formik.handleBlur(e);
                      if (formik.values.name && !formik.errors.name) {
                        try {
                          const res =
                            await userService.isMarketingRefernceExists(
                              formik.values.name
                            );
                          if (res.data?.data?._id) {
                            formik.setFieldError(
                              "name",
                              "Marketing Reference with this name already exists"
                            );
                          }
                        } catch (e) {
                          console.error(
                            "Failed to check if reference exists: ",
                            e
                          );
                        }
                      }
                    }}
                    placeholder="Enter reference name"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="invalid-feedback">{formik.errors.name}</div>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn custom-button-bgcolor"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>

          {/* References Table */}
          <div
            className="card shadow-sm"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">All References</h6>
            <div className="card-body px-2 py-3">
              <div className="mb-4 col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch
                      className="text-muted custom-search-icon"
                      style={{ color: "#94a3b8" }}
                    />
                  </span>
                  <input
                    type="search"
                    className="form-control border-start-0 py-2"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              {isLoading && <div className="text-center">Loading...</div>}
              {error && <div className="text-danger text-center">{error}</div>}
              {!isLoading && !error && references.length === 0 && (
                <div className="text-center">No references found.</div>
              )}

              {!isLoading && !error && references.length > 0 && (
                <>
                  <div className="table-responsive px-2">
                    <table className="table table-sm">
                      <thead className="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-t border-b border-slate-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id} role="row">
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="p-3 text-left custom-perchase-th"
                                role="columnheader"
                              >
                                <div className="font-semibold text-left break-words">
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </div>
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody className="text-sm">
                        {table.getRowModel().rows.map((row) => (
                          <tr key={row.id} role="row">
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="px-3 first:pl-5 last:pr-5 py-3"
                                role="cell"
                              >
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
                  <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                    <div>
                      Showing {startRow} to {endRow} of {totalRows} results
                    </div>
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "1rem" }}
                    >
                      <div className="btn-group">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page - 1,
                            }))
                          }
                          disabled={!pagination.hasPrevPage}
                        >
                          Previous
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page + 1,
                            }))
                          }
                          disabled={!pagination.hasNextPage}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <EditReferenceModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSubmit={async (data) => {
          try {
            const response = await userService.updateMarketingReference(data);
            if (response.success) {
              toast.success(response.message);
              setShowEditModal(false);
              fetchMarketingReferences(
                pagination.page,
                pagination.limit,
                searchQuery
              );
            } else {
              toast.error(response.message);
            }
          } catch (e) {
            toast.error("Failed to update reference.");
          }
        }}
        editReference={editReference}
      />
    </div>
  );
};

export default ViewReferences;
