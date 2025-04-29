import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { userService } from "../../../services/userService";
import { toast } from "react-toastify";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ViewCustomer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    userService
      .getCustomers()
      .then((res) => setCustomers(res.data?.data?.docs))
      .catch((e) => console.log("Failed to fetch customers: ", e));
  };

  // Custom global filter function
  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter((item) =>
        [
          String(item.id),
          item.Name,
          String(item.Phone),
          String(item.Prescriptions),
        ].some((field) => field.toLowerCase().includes(lowerQuery))
      );
    },
    []
  );

  // Debounced filter logic in useEffect
  useEffect(() => {
    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(customers, query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, customers, filterGlobally]);

  // Handle search input change
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Use filtered data if available, otherwise use full dataset
  const tableData = filteredData || customers;

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "SRNO",
        cell: ({ getValue, table, row }) => (
          <div className="text-left">
            {table?.getSortedRowModel()?.flatRows?.indexOf(row) + 1}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        accessorKey: "prescriptions",
        header: "Prescriptions",
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.length}</div>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="d-flex gap-2 align-items-center">
            <FiEdit2
              size={18}
              className="text-primary cursor-pointer"
              onClick={() => handleEdit(row.original)}
            />
            <MdDeleteOutline
              size={24}
              className="text-danger cursor-pointer"
              onClick={() => handleDelete(row.original._id)}
            />
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

  const handleEdit = (store) => {
    navigate(`/customer/${store?._id}`);
  };

  const handleDelete = async (id) => {
    alert("Are you sure you want to delete?");
    console.log(`Delete store with id: ${id}`);
    const response = await userService.deleteCustomer(id);
    if (response.success) {
      fetchCustomers();
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  // Calculate the range of displayed rows
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, tableData.length);
  const totalRows = tableData.length;

  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">View Customers</h1>
          </div>
          <div
            className="card shadow-sm mt-5"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">Customers</h6>
            <div className="card-body px-2 py-3">
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
              <div className="table-responsive ">
                <table className="table table-sm">
                  <thead className="text-xs text-uppercase text-muted bg-light border-top border-bottom">
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
    </div>
  );
};

export default ViewCustomer;
