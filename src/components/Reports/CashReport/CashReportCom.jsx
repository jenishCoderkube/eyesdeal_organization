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

const MODE_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "UPI" },
  { value: "card", label: "Card" },
];

const TYPE_OPTIONS = [
  { value: "credit", label: "Credit(+)" },
  { value: "debit", label: "Debit(-)" },
];

const CashReportCom = () => {
  // State for filters, data, and UI
  const [storeData, setStoreData] = useState([]);
  const [filters, setFilters] = useState({
    store: [],
    type: [{ value: "credit", label: "Credit(+)" }],
    mode: [
      { value: "cash", label: "Cash" },
      { value: "bank", label: "UPI" },
      { value: "card", label: "Card" },
    ],
    from: (() => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      return now;
    })(),
    to: (() => {
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      return now;
    })(),
  });
  const [orders, setOrders] = useState([]);
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

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return orders.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [orders]);

  // Load stores and set default store
  useEffect(() => {
    getStores();
  }, []);

  const getStores = async () => {
    try {
      setLoading(true);
      const res = await reportService.getStores();
      if (res.success) {
        const stores = res.data.data;
        setStoreData(stores);

        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.stores?.[0]) {
          const defaultStoreId = user.stores[0];
          const matchedStore = stores.find((s) => s._id === defaultStoreId);
          if (matchedStore) {
            const defaultStore = {
              value: matchedStore._id,
              label: matchedStore.name,
            };
            setFilters((prev) => ({ ...prev, store: [defaultStore] }));
            fetchData(1, { ...filters, store: [defaultStore] });
          }
        }
      } else {
        toast.error(res.message || "Failed to load stores");
      }
    } catch (e) {
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cashbook data
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
        stores: filtersOverride.store?.map((s) => s.value) || [],
        type: filtersOverride.type?.map((t) => t.value) || [],
        mode: filtersOverride.mode?.map((m) => m.value) || [],
        search: search || "",
      };

      // Only include date filters if provided
      if (filtersOverride.from && filtersOverride.to && !search) {
        const fromStart = new Date(filtersOverride.from);
        fromStart.setHours(0, 0, 0, 0);
        const toEnd = new Date(filtersOverride.to);
        toEnd.setHours(23, 59, 59, 999);
        payload.fromDate = fromStart.getTime();
        payload.toDate = toEnd.getTime();
      }

      if (!payload.mode.length) {
        setOrders([]);
        toast.warn("Mode is required. Please select at least one mode.");
        return;
      }

      const res = await reportService.getCashbook(payload);
      if (res.success) {
        const combinedDocs = res.data?.flatMap((entry) => {
          const docs = entry?.data?.data?.docs || [];
          return docs.map((doc) => ({ ...doc, mode: entry.mode }));
        });
        setOrders(combinedDocs || []);
        setPagination({
          page: res.data[0]?.data?.data?.page || 1,
          limit: res.data[0]?.data?.data?.limit || pagination.limit,
          totalDocs: res.data[0]?.data?.data?.totalDocs || 0,
          totalPages: res.data[0]?.data?.data?.totalPages || 0,
          hasNextPage: res.data[0]?.data?.data?.hasNextPage || false,
          hasPrevPage: res.data[0]?.data?.data?.hasPrevPage || false,
        });
      } else {
        toast.error(res.message || "Failed to fetch cashbook data");
      }
    } catch (e) {
      toast.error("Failed to fetch cashbook data");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters);
  };

  // Trigger API on debounced search
  useEffect(() => {
    if (filters.mode.length > 0) {
      if (debouncedSearch.trim()) {
        // Exclude dates when search has a value
        fetchData(1, { ...filters, from: null, to: null }, debouncedSearch);
      } else {
        // Include dates when search is empty
        fetchData(1, filters, debouncedSearch);
      }
    }
  }, [debouncedSearch]);

  // CSV Export
  const handleDownloadReport = async () => {
    setDownloadLoading(true);
    try {
      const payload = {
        page: 1,
        limit: 100000,
        stores: filters.store?.map((s) => s.value) || [],
        type: filters.type?.map((t) => t.value) || [],
        mode: filters.mode?.map((m) => m.value) || [],
        search: debouncedSearch || "",
      };

      // Include date filters for export
      if (filters.from && filters.to) {
        const fromStart = new Date(filters.from);
        fromStart.setHours(0, 0, 0, 0);
        const toEnd = new Date(filters.to);
        toEnd.setHours(23, 59, 59, 999);
        payload.fromDate = fromStart.getTime();
        payload.toDate = toEnd.getTime();
      }

      if (!payload.mode.length) {
        toast.warn(
          "Mode is required for export. Please select at least one mode."
        );
        return;
      }

      const res = await reportService.getCashbook(payload);
      if (!res.success || !res.data?.length) {
        toast.error("No cashbook data found to export");
        return;
      }

      const cashbookData = res.data.flatMap((entry) => {
        const docs = entry?.data?.data?.docs || [];
        return docs.map((doc) => ({ ...doc, mode: entry.mode }));
      });

      const finalData = cashbookData.map((item, index) => ({
        SRNO: index + 1,
        Date: item.createdAt,
        Store_Name: item.store?.name || "-",
        Mode: item.mode || "-",
        Expense_Category: item.expenseCategory || "-",
        Type: item.type || "-",
        Amount: item.amount || 0,
        Note: item.notes || "-",
      }));

      const response = await reportService.exportCsv({ data: finalData });
      if (response.success) {
        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `CashReport_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Cash report downloaded!");
      } else {
        toast.error(response.message || "Failed to export CSV");
      }
    } catch (error) {
      toast.error("Failed to export cash report");
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
        accessorKey: "createdAt",
        header: "Date",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">
            {moment(getValue()).format("DD/MM/YYYY")}
          </div>
        ),
      },
      {
        accessorKey: "store",
        header: "Store Name",
        size: 230,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.name || "-"}</div>
        ),
      },
      {
        accessorKey: "mode",
        header: "Mode",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "expenseCategory",
        header: "Expense Category",
        size: 200,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || 0}</div>
        ),
      },
      {
        accessorKey: "notes",
        header: "Note",
        size: 250,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
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
      <h2 className="fw-bold mb-4">Cash Report</h2>

      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Mode</label>
          <Select
            isMulti
            options={MODE_OPTIONS}
            value={filters.mode}
            onChange={(opt) => setFilters({ ...filters, mode: opt || [] })}
            placeholder="Select..."
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Select Store</label>
          <Select
            isMulti
            options={storeData.map((s) => ({ value: s._id, label: s.name }))}
            value={filters.store}
            onChange={(opt) => setFilters({ ...filters, store: opt || [] })}
            placeholder="Select..."
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Type</label>
          <Select
            isMulti
            options={TYPE_OPTIONS}
            value={filters.type}
            onChange={(opt) => setFilters({ ...filters, type: opt || [] })}
            placeholder="Select..."
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">From</label>
          <DatePicker
            className="form-control"
            selected={filters.from}
            onChange={(date) => setFilters({ ...filters, from: date })}
            dateFormat="dd-MM-yyyy"
          />
        </div>
        <div className="col-md-3">
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
            Submit
          </button>
        </div>
      </form>

      {/* Top Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <div className="d-flex flex-column flex-md-row align-items-center gap-3 mb-2 mb-md-0">
          <p className="mb-0">Total Amount: {totalAmount}</p>
        </div>
        <button
          className="btn btn-sm btn-primary"
          onClick={handleDownloadReport}
          disabled={downloadLoading}
        >
          {downloadLoading && (
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            ></span>
          )}
          Download Cash Report
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
                <td colSpan="8" className="text-center">
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
                <td colSpan="8" className="text-center">
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

export default CashReportCom;
