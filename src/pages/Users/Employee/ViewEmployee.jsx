import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const ViewEmployees = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const navigate = useNavigate();

  // Memoized dummy employee data (100 records)
  const employees = useMemo(
    () => [
      {
        id: 1,
        Name: "John Doe",
        Phone: 919898540501,
        Role: "store_manager",
        Store: ["EYESDEAL ADAJAN", "EYESDEAL UDHANA"],
        JoiningDate: "15/01/2023",
        ActiveEmployee: "Yes",
      },
      {
        id: 2,
        Name: "Jane Smith",
        Phone: 919712083356,
        Role: "sales_associate",
        Store: ["SAFENT"],
        JoiningDate: "22/03/2023",
        ActiveEmployee: "No",
      },
      {
        id: 3,
        Name: "Imran Poptani",
        Phone: 912000033333,
        Role: "purchase_manager",
        Store: ["EYESDEAL UDHANA", "EYESDEAL ADAJAN"],
        JoiningDate: "20/08/2024",
        ActiveEmployee: "Yes",
      },
      {
        id: 4,
        Name: "Emily Brown",
        Phone: 917096780267,
        Role: "optician",
        Store: ["CLOSED NIKOL"],
        JoiningDate: "10/11/2022",
        ActiveEmployee: "Yes",
      },
      {
        id: 5,
        Name: "Michael Lee",
        Phone: 918017286274,
        Role: "store_manager",
        Store: ["ELITE HOSPITAL"],
        JoiningDate: "05/06/2023",
        ActiveEmployee: "No",
      },
      // Additional data to reach 100 records
      ...Array.from({ length: 95 }, (_, index) => {
        const possibleStores = [
          "EYESDEAL ADAJAN",
          "EYESDEAL UDHANA",
          "SAFENT",
          "CLOSED NIKOL",
          "ELITE HOSPITAL",
        ];
        // Randomly select 1 to 3 stores
        const numStores = Math.floor(Math.random() * 3) + 1;
        const selectedStores = [];
        for (let i = 0; i < numStores; i++) {
          const randomStore =
            possibleStores[Math.floor(Math.random() * possibleStores.length)];
          if (!selectedStores.includes(randomStore)) {
            selectedStores.push(randomStore);
          }
        }
        return {
          id: index + 6,
          Name: `Employee ${index + 6}`,
          Phone: 910000000000 + index,
          Role: [
            "store_manager",
            "sales",
            "sales_associate",
            "optician",
            "purchase_manager",
          ][Math.floor(Math.random() * 5)],
          Store:
            selectedStores.length > 0 ? selectedStores : [possibleStores[0]],
          JoiningDate: `01/${String((index % 12) + 1).padStart(2, "0")}/202${
            Math.floor(Math.random() * 3) + 2
          }`,
          ActiveEmployee: Math.random() > 0.5 ? "Yes" : "No",
        };
      }),
    ],
    []
  );

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
          item.Role,
          Array.isArray(item.Store)
            ? item.Store.join(", ")
            : String(item.Store),
          item.JoiningDate,
          item.ActiveEmployee,
        ].some((field) => field.toLowerCase().includes(lowerQuery))
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

  // Handle search input change
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Use filtered data if available, otherwise use full dataset
  const tableData = filteredData || employees;

  // Define columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "SRNO",
        cell: ({ getValue }) => (
          <div className="text-left  break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "Name",
        header: "Name",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "Phone",
        header: "Phone",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "Role",
        header: "Role",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "Store",
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
                    {store}
                  </p>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "JoiningDate",
        header: "Joining Date",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "ActiveEmployee",
        header: "Active Employee",
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
                onClick={() => handleDelete(row.original.id)}
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

  const handleEdit = (employee) => {
    navigate("/users/editEmployee", { state: { user: employee } });
  };

  const handleDelete = (id) => {
    alert("Are you sure you want to delete?");
    console.log(`Delete employee with id: ${id}`);
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
            <h1 className="h2 text-dark fw-bold">View Employees</h1>
          </div>
          <div
            className="card shadow-sm mt-5"
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
                    className="form-control border-start-0"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-responsive">
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
                            className="px-2 first:pl-5 last:pr-5 py-3"
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
    </div>
  );
};

export default ViewEmployees;
