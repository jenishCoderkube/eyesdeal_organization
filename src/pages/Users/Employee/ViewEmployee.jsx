import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { userService } from "../../../services/userService";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { useDebounce } from "use-debounce";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ViewEmployees = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
    pagingCounter: 1,
  });

  const [debouncedSearch] = useDebounce(searchQuery, 1300);

  useEffect(() => {
    fetchEmployees(pagination.page, debouncedSearch);
  }, [pagination.page, debouncedSearch]);

  const fetchEmployees = async (page, search) => {
    setLoading(true);
    try {
      const response = await userService.getEmployees({
        page,
        limit: pagination.limit,
        search,
      });

      if (response.success) {
        const {
          docs,
          totalDocs,
          totalPages,
          page,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
          pagingCounter,
        } = response.data.data;
        setEmployees(docs || []);
        setPagination((prev) => ({
          ...prev,
          page,
          totalDocs,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage,
          prevPage,
          pagingCounter,
        }));
      }
    } catch (error) {
      console.error("Error fetching customers", error);
    } finally {
      setLoading(false);
    }
  };

  // Custom global filter function
  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      console.log("datkfdhfjkdhfa", data);
      return data.filter((item) =>
        [
          String(item._id),
          item.name,
          item.email,
          String(item.phone),
          item.role,
          item.city,
          item.state,
          item.country,
          item.pincode,
          Array.isArray(item.storesData)
            ? item.storesData.map((s) => s.name).join(", ")
            : "",
          item.joiningDate,
          String(item.isActive),
        ]
          .filter(Boolean) // remove null/undefined
          .some((field) => field.toLowerCase().includes(lowerQuery))
      );
    },
    []
  );

  // Debounced filter logic in useEffect
  useEffect(() => {
    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(employees, query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, employees, filterGlobally]);
  console.log("filterdata", filteredData);

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on search
  };

  // Use filtered data if available, otherwise use full dataset
  const tableData = filteredData || employees;

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "SRNO",
        cell: ({ table, row }) => (
          <div className="text-left">
            {(pagination.page - 1) * pagination.limit +
              table?.getSortedRowModel()?.flatRows?.indexOf(row) +
              1}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "stores",
        header: "Store",
        cell: ({ getValue }) => {
          const stores = Array.isArray(getValue())
            ? getValue()
            : [String(getValue())];
          return (
            <div className="text-left break-words">
              <div className="d-flex flex-column">
                {stores.map((store, index) => (
                  <p
                    style={{
                      fontSize: "15px",
                      padding: "0px",
                      margin: "5px",
                      fontWeight: "400",
                    }}
                    key={index}
                  >
                    {store?.name}
                  </p>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "joiningDate",
        header: "Joining Date",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Active Employee",
        cell: ({ getValue }) => (
          <div className="text-left break-words">
            {getValue() ? "Yes" : "No"}
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
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="blue"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cursor-pointer"
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
    [loading, pagination.page, pagination.limit]
  );

  // @tanstack/react-table setup
  console.log("kfjhkdjshfjksdhfjkdshf", tableData);
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: pagination.limit,
      },
    },
  });

  const handleEdit = (employee) => {
    navigate(`/employee/${employee?._id}`, { state: { user: employee } });
  };

  const handleDelete = async (id) => {
    alert("Are you sure you want to delete?");
    console.log(`Delete employee with id: ${id}`);
    const response = await userService.deleteCustomer(id);
    if (response.success) {
      fetchEmployees();
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  const handlePageClick = ({ selected }) => {
    const selectedPage = selected + 1; // react-paginate is 0-based
    setPagination((prev) => ({ ...prev, page: selectedPage }));
  };

  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">View Employees</h1>
          </div>
          <div
            className="card shadow-sm px-2 mt-5"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">Employees</h6>
            <div className="card-body px-0 py-3">
              <div className="mb-4 col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch
                      className="text-muted"
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
              {loading ? (
                <div className="text-center my-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive ">
                    <table className="table table-sm">
                      <thead className="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-t border-b border-slate-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                              <th
                                key={header.id}
                                className="p-3 text-left custom-perchase-th"
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
                  <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                    <div>
                      Showing {pagination.pagingCounter} to{" "}
                      {Math.min(
                        pagination.pagingCounter + pagination.limit - 1,
                        pagination.totalDocs
                      )}{" "}
                      of {pagination.totalDocs} entries
                    </div>
                    <ReactPaginate
                      previousLabel={pagination.hasPrevPage ? "Previous" : ""}
                      nextLabel={pagination.hasNextPage ? "Next" : ""}
                      breakLabel="..."
                      pageCount={pagination.totalPages}
                      onPageChange={handlePageClick}
                      containerClassName="pagination mb-0"
                      pageClassName="page-item"
                      pageLinkClassName="page-link"
                      previousClassName="page-item"
                      previousLinkClassName="page-link"
                      nextClassName="page-item"
                      nextLinkClassName="page-link"
                      breakClassName="page-item"
                      breakLinkClassName="page-link"
                      activeClassName="active"
                      disabledClassName="disabled"
                      forcePage={pagination.page - 1}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployees;
