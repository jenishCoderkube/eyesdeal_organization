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

const TransferReportCom = () => {
  // State for filters, data, and UI
  const [storeData, setStoreData] = useState([]);
  const [filters, setFilters] = useState({
    storeFrom: [],
    storeTo: [],
    from: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    })(),
    to: new Date(),
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

  // Calculate total stock quantity
  const totalStockQty = useMemo(() => {
    return orders.reduce((sum, item) => sum + (item.stockQty || 0), 0);
  }, [orders]);

  // Load stores and set default storeFrom
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
            setFilters((prev) => ({ ...prev, storeFrom: [defaultStore] }));
            fetchData(1, { ...filters, storeFrom: [defaultStore] });
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

  // Fetch transfer stock data
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
        storeFrom: filtersOverride.storeFrom?.map((s) => s.value) || [],
        storeTo: filtersOverride.storeTo?.map((s) => s.value) || [],
        search: search || "",
      };

      // Only include date filters if provided
      if (filtersOverride.from && filtersOverride.to && !search) {
        payload.fromDate = new Date(filtersOverride.from).getTime();
        payload.toDate = new Date(filtersOverride.to).getTime();
      }

      if (!payload.storeFrom.length && !payload.storeTo.length) {
        setOrders([]);
        toast.warn("At least one store (From or To) must be selected.");
        return;
      }

      const res = await reportService.getTransferStock(payload);
      if (res.success) {
        const formattedData = processData(res.data.data.docs);
        setOrders(formattedData || []);
        setPagination({
          page: res.data.data.page || 1,
          limit: res.data.data.limit || pagination.limit,
          totalDocs: res.data.data.totalDocs || 0,
          totalPages: res.data.data.totalPages || 0,
          hasNextPage: res.data.data.hasNextPage || false,
          hasPrevPage: res.data.data.hasPrevPage || false,
        });
      } else {
        toast.error(res.message || "Failed to fetch transfer data");
      }
    } catch (e) {
      toast.error("Failed to fetch transfer data");
    } finally {
      setLoading(false);
    }
  };

  // Process data for table
  const processData = (rawData) => {
    const processed = [];
    rawData.forEach((item, index) => {
      const date = moment(item.createdAt).format("DD/MM/YYYY");
      const fromName = item.from?.name || "-";
      const toName = item.to?.name || "-";
      const qty = item.products?.stockQuantity || 0;

      if (Array.isArray(item.string)) {
        item.string.forEach((entry, entryIndex) => {
          processed.push({
            id: `${index}-${entryIndex}`,
            date,
            from: fromName,
            to: toName,
            sku: entry.sku || "-",
            stockQty: qty,
          });
        });
      }
    });
    return processed;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters);
  };

  // Trigger API on debounced search
  useEffect(() => {
    if (filters.storeFrom.length > 0 || filters.storeTo.length > 0) {
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
        storeFrom: filters.storeFrom?.map((s) => s.value) || [],
        storeTo: filters.storeTo?.map((s) => s.value) || [],
      };

      // Include date filters for export
      if (filters.from && filters.to) {
        payload.fromDate = new Date(filters.from).getTime();
        payload.toDate = new Date(filters.to).getTime();
      }

      if (!payload.storeFrom.length && !payload.storeTo.length) {
        toast.warn(
          "At least one store (From or To) must be selected for export."
        );
        return;
      }

      const res = await reportService.getTransferStock(payload);
      if (!res.success || !res.data?.data?.docs?.length) {
        toast.error("No transfer data found to export");
        return;
      }

      const formattedData = processData(res.data.data.docs);
      const finalData = formattedData.map((item, index) => ({
        SRNO: index + 1,
        Date: new Date(item.date),
        From_Store: item.from,
        To_Store: item.to,
        SKU: item.sku,
        Stock_Quantity: item.stockQty,
      }));

      const response = await reportService.exportCsv({ data: finalData });
      if (response.success) {
        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `TransferReport_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Transfer report downloaded!");
      } else {
        toast.error(response.message || "Failed to export CSV");
      }
    } catch (error) {
      toast.error("Failed to export transfer report");
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
        size: 120,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "from",
        header: "From Store",
        size: 200,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "to",
        header: "To Store",
        size: 200,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "sku",
        header: "SKU",
        size: 200,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "stockQty",
        header: "Stock Quantity",
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
      <h2 className="fw-bold mb-4">Transfer Report</h2>

      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Store From</label>
          <Select
            isMulti
            options={storeData.map((s) => ({ value: s._id, label: s.name }))}
            value={filters.storeFrom}
            onChange={(opt) => setFilters({ ...filters, storeFrom: opt || [] })}
            placeholder="Select..."
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Store To</label>
          <Select
            isMulti
            options={storeData.map((s) => ({ value: s._id, label: s.name }))}
            value={filters.storeTo}
            onChange={(opt) => setFilters({ ...filters, storeTo: opt || [] })}
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
          <p className="mb-0">Total Stock Quantity: {totalStockQty}</p>
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
          Download Transfer Report
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
                <td colSpan="6" className="text-center">
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
                <td colSpan="6" className="text-center">
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

export default TransferReportCom;
