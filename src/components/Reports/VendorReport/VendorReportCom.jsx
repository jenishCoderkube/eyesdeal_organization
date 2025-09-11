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
import { purchaseService } from "../../../services/purchaseService";
import moment from "moment";

const VendorReportCom = () => {
  // State for filters, data, and UI
  const [storeData, setStoreData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [filters, setFilters] = useState({
    store: [],
    vendor: [],
    status: [
      { value: "received", label: "Received" },
      { value: "damaged", label: "Damaged" },
    ],
    from: new Date(new Date().setDate(new Date().getDate() - 1)),
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

  const statusOptions = [
    { value: "received", label: "Received" },
    { value: "damaged", label: "Damaged" },
    { value: "pending", label: "Pending" },
  ];

  // Load stores, vendors, and set default store
  useEffect(() => {
    getStores();
    getVendorsByType();
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

  const getVendorsByType = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getVendorsByType("lens_vendor");
      if (res.success) {
        setVendorData(res.data.docs);
      } else {
        toast.error(res.message || "Failed to load vendors");
      }
    } catch (e) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  // Fetch job works data
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
        vendor: filtersOverride.vendor?.map((v) => v.value) || [],
        status: filtersOverride.status?.map((s) => s.value) || [],
        search: search || "",
      };

      // Only include date filters if provided
      if (filtersOverride.from && filtersOverride.to) {
        payload.fromDate = new Date(filtersOverride.from).getTime();
        payload.toDate = new Date(filtersOverride.to).getTime();
      }

      const res = await reportService.getJobWorksData(payload);
      if (res.success) {
        setOrders(res.data.data.docs);
        setPagination({
          page: res.data.data.page,
          limit: res.data.data.limit,
          totalDocs: res.data.data.totalDocs,
          totalPages: res.data.data.totalPages,
          hasNextPage: res.data.data.hasNextPage,
          hasPrevPage: res.data.data.hasPrevPage,
        });
      } else {
        toast.error(res.message || "Failed to fetch vendor data");
      }
    } catch (e) {
      toast.error("Failed to fetch vendor data");
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
    if (debouncedSearch.trim()) {
      // Exclude dates when search has a value
      fetchData(1, { ...filters, from: null, to: null }, debouncedSearch);
    } else {
      // Include dates when search is empty
      fetchData(1, filters, debouncedSearch);
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
        vendor: filters.vendor?.map((v) => v.value) || [],
        status: filters.status?.map((s) => s.value) || [],
        search: debouncedSearch || "",
      };

      // Include date filters for export
      if (filters.from && filters.to) {
        payload.fromDate = new Date(filters.from).getTime();
        payload.toDate = new Date(filters.to).getTime();
      }

      const res = await reportService.getJobWorksData(payload);
      if (!res.success || !res.data?.data?.docs?.length) {
        toast.error("No vendor data found to export");
        return;
      }

      const vendorData = res.data.data.docs;
      const finalData = vendorData.map((item, index) => ({
        SRNO: index + 1,
        Store_Name: item.store?.name || "-",
        Vendor_Name: `${item.vendor?.companyName || "-"} ${
          item.lens?.item?.__t || ""
        }`,
        Date: item.createdAt,
        Bill_No: item.order?.billNumber || "-",
        SKU: item.lens?.sku || "-",
        Status: item.status || "-",
        Cost_Price: item.lens?.item?.costPrice || 0,
      }));

      const response = await reportService.exportCsv({ data: finalData });
      if (response.success) {
        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `VendorReport_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Vendor report downloaded!");
      } else {
        toast.error(response.message || "Failed to export CSV");
      }
    } catch (error) {
      toast.error("Failed to export vendor report");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "store",
        header: "Store Name",
        size: 140,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.name || "-"}</div>
        ),
      },
      {
        accessorKey: "vendor",
        header: "Vendor Name",
        size: 200,
        cell: ({ row }) => {
          const vendor = row.original?.vendor?.companyName || "-";
          const lens = row.original?.lens?.item?.__t || "";
          return <div className="text-left">{`${vendor} ${lens}`}</div>;
        },
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
        accessorKey: "order",
        header: "Bill No",
        size: 80,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.billNumber || "-"}</div>
        ),
      },
      {
        accessorKey: "lens",
        header: "SKU",
        size: 300,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.sku || "-"}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "lens",
        header: "Cost Price",
        size: 90,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.item?.costPrice || 0}</div>
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
      <h2 className="fw-bold mb-4">Vendor Report</h2>

      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
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
          <label className="form-label">Vendor Name</label>
          <Select
            isMulti
            options={vendorData.map((v) => ({
              value: v._id,
              label: v.companyName,
            }))}
            value={filters.vendor}
            onChange={(opt) => setFilters({ ...filters, vendor: opt || [] })}
            placeholder="Select..."
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Select Status</label>
          <Select
            isMulti
            options={statusOptions}
            value={filters.status}
            onChange={(opt) => setFilters({ ...filters, status: opt || [] })}
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
          {/* No total amount or other summary data in original code */}
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
          Download Vendor Report
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

export default VendorReportCom;
