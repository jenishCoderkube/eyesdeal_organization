import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useFormik } from "formik";
import * as Yup from "yup";
import EditReferenceModal from "../../../components/Users/Marketing/EditReferenceModal";
import { userService } from "../../../services/userService";
import { toast } from "react-toastify";
// import EditReferenceModal from "./EditReferenceModal";

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
  const [filteredData, setFilteredData] = useState(null);
  const [references, setReferences] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReference, setEditReference] = useState(null);

  // Custom global filter function
  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter((item) =>
        [item.id, item.name].some((field) =>
          field.toLowerCase().includes(lowerQuery)
        )
      );
    },
    []
  );

  useEffect(() => {
    fetchMarketingReferences();
  }, []);

  const fetchMarketingReferences = () => {
    userService
      .getMarketingReferences()
      .then((res) => setReferences(res.data?.data))
      .catch((e) => console.log("Failed to fetch marketing references: ", e));
  };

  // Debounced filter logic
  useEffect(() => {
    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(references, query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, references, filterGlobally]);

  // Handle search input change
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Use filtered data if available, otherwise use full dataset
  const tableData = filteredData || references;

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
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

  // Handle edit
  const handleEdit = (reference) => {
    setEditReference(reference);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    alert("Are you sure you want to delete?");
    console.log(`Delete reference with id: ${id}`);
    const response = await userService.deleteMarketingReference(id);
    if (response.success) {
      fetchMarketingReferences();
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  // Formik for create form
  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema,
    onSubmit: (values) => {
      addMarketingReference(values);
    },
  });

  const addMarketingReference = async (data) => {
    const response = await userService.addMarketingReference(data);
    if (response.success) {
      toast.success(response.message);
      formik.resetForm();
      fetchMarketingReferences();
    } else {
      toast.error(response.message);
    }
  };

  const updateMarketingReference = async (data) => {
    const response = await userService.updateMarketingReference(data);
    if (response.success) {
      toast.success(response.message);
      setShowEditModal(false);
      fetchMarketingReferences();
    } else {
      toast.error(response.message);
    }
  };

  // Calculate the range of displayed rows
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, tableData?.length);
  const totalRows = tableData?.length;

  return (
    <div className="container-fluid px-4 py-8">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11 ">
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
                    onBlur={() => {
                      if (formik.values.name) {
                        userService
                          .isMarketingRefernceExists(formik.values.name)
                          .then((res) => {
                            if (res.data?.data?._id) {
                              formik.setFieldError(
                                "name",
                                "Marketing Reference with this name already exists"
                              );
                            } else {
                              formik.setFieldError("name", "");
                            }
                          })
                          .catch((e) =>
                            console.log(
                              "Failed to check if reference exists: ",
                              e
                            )
                          );
                      }
                      formik.handleBlur();
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
                  Submit
                </button>
              </form>
            </div>
          </div>

          <div
            className="card shadow-sm "
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
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
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
                            <div className="font-semibold text-left  break-words">
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
                <div className="btn-group">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditReferenceModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSubmit={updateMarketingReference}
        editReference={editReference}
      />
    </div>
  );
};

export default ViewReferences;
