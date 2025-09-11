import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { FaSearch } from "react-icons/fa";
import { useDebounce } from "use-debounce";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { reportService } from "../../../services/reportService";
import moment from "moment";

const EmployeeIncentiveReportCom = () => {
  // State for filters, data, and UI
  const [employeeData, setEmployeeData] = useState([]);
  const [filters, setFilters] = useState({
    employee: null,
    from: new Date(new Date().setDate(new Date().getDate() - 1)),
    to: new Date(),
  });
  const [orders, setOrders] = useState([]);
  const [amountData, setAmountData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Load employee data
  useEffect(() => {
    getEmployees();
  }, []);

  const getEmployees = async () => {
    try {
      setLoading(true);
      const role = ["sales", "store_manager", "individual_store"];
      const payload = { role, limit: 300 };
      const res = await reportService.getEmployeeData(payload);
      if (res.success) {
        setEmployeeData(res.data.data.docs);
      } else {
        toast.error(res.message || "Failed to load employees");
      }
    } catch (e) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // Fetch incentive data and amount
  const fetchData = async (
    page = 1,
    filtersOverride = filters,
    search = debouncedSearch
  ) => {
    setLoading(true);
    try {
      const payload = {
        page,
        limit: pagination.limit,
        salesRep: filtersOverride.employee?.value || "",
        search: search || "",
      };

      // Only include date filters if provided
      if (filtersOverride.from && filtersOverride.to && !search) {
        payload.fromDate = new Date(filtersOverride.from).getTime();
        payload.toDate = new Date(filtersOverride.to).getTime();
      }

      const res = await reportService.getIncentiveData(payload);
      if (res.success) {
        const formattedData = processData(res.data.data.docs);
        setOrders(formattedData);
        setPagination({
          page: res.data.data.page,
          limit: res.data.data.limit,
          totalDocs: res.data.data.totalDocs,
          totalPages: res.data.data.totalPages,
          hasNextPage: res.data.data.hasNextPage,
          hasPrevPage: res.data.data.hasPrevPage,
        });
      } else {
        toast.error(res.message || "Failed to fetch incentive data");
      }
    } catch (e) {
      toast.error("Failed to fetch incentive data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAmount = async (filtersOverride = filters) => {
    try {
      const payload = {
        salesRep: filtersOverride.employee?.value || "",
      };

      // Only include date filters if provided
      if (filtersOverride.from && filtersOverride.to) {
        payload.fromDate = new Date(filtersOverride.from).getTime();
        payload.toDate = new Date(filtersOverride.to).getTime();
      }

      const res = await reportService.getIncentiveAmount(payload);
      if (res.success) {
        setAmountData(res.data.data?.docs?.[0]?.totalIncentiveAmount || 0);
      } else {
        toast.error(res.message || "Failed to fetch incentive amount");
      }
    } catch (e) {
      toast.error("Failed to fetch incentive amount");
    }
  };

  // Process data for product and lens entries
  const processData = (rawData) => {
    const processed = [];
    rawData.forEach((item, index) => {
      if (item.lens && item.product) {
        const date = moment(item.createdAt).format("DD/MM/YYYY");
        const billNumber = item.billNumber;

        processed.push({
          id: `${index}-product`,
          type: "Product",
          date,
          billNumber,
          brand:
            [item.product?.item?.brand?.name, item.product?.item?.__t]
              .filter(Boolean)
              .join(" ") || "-",
          sku: item.product?.sku || "-",
          mrp: item.product?.mrp || 0,
          discount: item.product?.perPieceDiscount || 0,
          percentage: item.product?.mrp
            ? (
                ((item.product?.perPieceDiscount || 0) / item.product.mrp) *
                100
              ).toFixed(2) + "%"
            : "-",
          incentiveAmount: item.product?.incentiveAmount || 0,
        });

        processed.push({
          id: `${index}-lens`,
          type: "Lens",
          date,
          billNumber,
          brand:
            [item.lens?.item?.brand?.name, item.lens?.item?.__t]
              .filter(Boolean)
              .join(" ") || "-",
          sku: item.lens?.sku || "-",
          mrp: item.lens?.mrp || 0,
          discount: item.lens?.perPieceDiscount || 0,
          percentage: item.lens?.mrp
            ? (
                ((item.lens?.perPieceDiscount || 0) / item.lens.mrp) *
                100
              ).toFixed(2) + "%"
            : "-",
          incentiveAmount: item.lens?.incentiveAmount || 0,
        });
      }
    });
    return processed;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters);
    fetchAmount(filters);
  };

  // Trigger API on debounced search
  useEffect(() => {
    if (debouncedSearch.trim()) {
      // Exclude dates when search has a value
      fetchData(1, { ...filters, from: null, to: null }, debouncedSearch);
      fetchAmount({ ...filters, from: null, to: null });
    } else {
      // Include dates when search is empty
      fetchData(1, filters, debouncedSearch);
      fetchAmount(filters);
    }
  }, [debouncedSearch]);

  // CSV Export
  const handleDownloadReport = async () => {
    setDownloadLoading(true);
    try {
      const payload = {
        page: 1,
        limit: 100000,
        salesRep: filters.employee?.value || "",
        // search: debouncedSearch || "",
      };

      // Include date filters for export
      if (filters.from && filters.to) {
        payload.fromDate = new Date(filters.from).getTime();
        payload.toDate = new Date(filters.to).getTime();
      }

      const res = await reportService.getIncentiveData(payload);
      if (!res.success || !res.data?.data?.docs?.length) {
        toast.error("No incentive data found to export");
        return;
      }

      const formattedData = processData(res.data.data.docs);
      const finalData = formattedData.map((item, index) => ({
        SRNO: index + 1,
        Date: item.date,
        Order_No: item.billNumber,
        Brand: item.brand,
        SKU: item.sku,
        MRP: item.mrp,
        Discount: item.discount,
        Percentage: item.percentage,
        Incentive_Amount: item.incentiveAmount,
      }));

      const response = await reportService.exportCsv({ data: finalData });
      if (response.success) {
        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `EmployeeIncentiveReport_${Date.now()}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Incentive report downloaded!");
      } else {
        toast.error(response.message || "Failed to export CSV");
      }
    } catch (error) {
      toast.error("Failed to export incentive report");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        header: "SRNO",
        size: 50,
        cell: ({ row }) => <div className="text-left">{row.index + 1}</div>,
      },
      {
        accessorKey: "date",
        header: "Date",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "billNumber",
        header: "Order No",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "brand",
        header: "Brand",
        size: 210,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "sku",
        header: "SKU",
        size: 500,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "mrp",
        header: "MRP",
        size: 80,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || 0}</div>
        ),
      },
      {
        accessorKey: "discount",
        header: "Discount",
        size: 80,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || 0}</div>
        ),
      },
      {
        accessorKey: "percentage",
        header: "Percentage",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "incentiveAmount",
        header: "Incentive Amount",
        size: 150,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || 0}</div>
        ),
      },
    ],
    []
  );

  // React Table setup
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Pagination info
  const startRow = (pagination.page - 1) * pagination.limit + 1;
  const endRow = Math.min(
    pagination.page * pagination.limit,
    pagination.totalDocs
  );
  const totalRows = pagination.totalDocs;

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Employee Incentive Report</h2>

      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-4">
          <label className="form-label">Select Employee</label>
          <Select
            options={employeeData.map((emp) => ({
              value: emp._id,
              label: emp.name,
            }))}
            value={filters.employee}
            onChange={(opt) => setFilters({ ...filters, employee: opt })}
            placeholder="Select..."
            isClearable
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">From</label>
          <DatePicker
            className="form-control"
            selected={filters.from}
            onChange={(date) => setFilters({ ...filters, from: date })}
            dateFormat="dd-MM-yyyy"
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">To</label>
          <DatePicker
            className="form-control"
            selected={filters.to}
            onChange={(date) => setFilters({ ...filters, to: date })}
            dateFormat="dd-MM-yyyy"
          />
        </div>
        <div className="col-12">
          <button className="btn btn-primary" disabled={loading}>
            {loading && (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
            )}
            Apply Filters
          </button>
        </div>
      </form>

      {/* Top Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <div className="d-flex flex-column flex-md-row align-items-center gap-3 mb-2 mb-md-0">
          <p className="mb-0">Total Incentive Amount: {amountData}</p>
        </div>
        <button
          className="btn btn-sm btn-success"
          onClick={handleDownloadReport}
          disabled={downloadLoading}
        >
          {downloadLoading && (
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            ></span>
          )}
          Download Incentive Report
        </button>
      </div>

      {/* Search */}
      <div className="input-group mb-3">
        <span className="input-group-text">
          <FaSearch />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-sm">
          <thead className="table-light">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-3 text-left"
                    style={{ minWidth: `${header.getSize()}px` }}
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
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length > 0 ? (
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
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <p className="mb-0">
          Showing <span className="fw-medium">{startRow}</span> to{" "}
          <span className="fw-medium">{endRow}</span> of{" "}
          <span className="fw-medium">{totalRows}</span> results
        </p>
        <div className="btn-group">
          <button
            className="btn btn-outline-primary"
            onClick={() => fetchData(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => fetchData(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeIncentiveReportCom;
