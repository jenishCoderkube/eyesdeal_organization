import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { userService } from "../../../services/userService";
import moment from "moment/moment";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ViewOtp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [otps, setOtps] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOTP();
  }, []);

  const fetchOTP = async () => {
    userService
      .getOTP(currentPage)
      .then((res) => setOtps(res.data?.data?.docs))
      .catch((e) => console.log("Failed to fetch OTP: ", e));
  };

  // Custom global filter function
  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter((item) =>
        [String(item.id), item.Date, String(item.Phone), String(item.Otp)].some(
          (field) => field.toLowerCase().includes(lowerQuery)
        )
      );
    },
    []
  );

  // Debounced filter logic in useEffect
  useEffect(() => {
    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(otps, query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, otps, filterGlobally]);

  // Handle search input change
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Use filtered data if available, otherwise use full dataset
  const tableData = filteredData || otps;

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "SRNO",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ getValue }) => (
          <div className="text-left break-words">
            {moment(getValue()).format("DD/MM/YYYY hh:mm:ss a")}
          </div>
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
        accessorKey: "otp",
        header: "Otp",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
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
            <h1 className="h2 text-dark fw-bold">View Otp</h1>
          </div>
          <div className="card shadow-sm px-2 mt-5 border">
            <h6 className="fw-bold px-3 pt-3">Otp</h6>
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
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead className="text-xs text-uppercase text-muted bg-light border-top border-bottom border">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} role="row">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="p-3 text-left custom-perchase-th"
                            role="columnheader"
                          >
                            <div className="fw-semibold text-left break-words">
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
                          <td key={cell.id} className="p-3" role="cell">
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

export default ViewOtp;
