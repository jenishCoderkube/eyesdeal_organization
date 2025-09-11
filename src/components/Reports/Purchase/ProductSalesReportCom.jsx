import React, { useState, useEffect, useMemo, useRef } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch } from "react-icons/fa";
import { useDebounce } from "use-debounce";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment";
import { toast } from "react-toastify";
import { reportService } from "../../../services/reportService";
import { purchaseService } from "../../../services/purchaseService";
import * as XLSX from "xlsx";

const PurchaseReport = () => {
  const [data, setData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [amountData, setAmountData] = useState(null);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);
  const [filters, setFilters] = useState({
    store: [],
    vendor: [],
    from: new Date(),
    to: new Date(),
    search: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 500);

  // 👉 Get stores + vendors
  useEffect(() => {
    getStores();
    getVendors();
  }, []);

  // 👉 Set default store from localStorage once stores loaded
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.stores?.[0] && storeData.length > 0) {
      const defaultStore = storeData.find((s) => s._id === user.stores[0]);
      if (defaultStore) {
        const newFilters = {
          ...filters,
          store: [{ value: defaultStore._id, label: defaultStore.name }],
        };
        setFilters(newFilters);
        fetchData(1, newFilters);
      }
    }
  }, [storeData]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debouncedQuery !== undefined) {
      // Only send search, stores and vendors remain as they are
      const payload = {
        page: 1,
        limit: pagination.limit,
        search: debouncedQuery,
        stores: filters.store?.map((s) => s.value),
        vendors: filters.vendor?.map((v) => v.value),
        // DON'T include from/to dates
      };

      fetchData(1, payload);
    }
  }, [debouncedQuery]);

  const getStores = async () => {
    try {
      const res = await reportService.getStores();
      if (res.success) {
        setStoreData(res.data?.data || []);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to load stores");
    }
  };

  const getVendors = async () => {
    try {
      const res = await purchaseService.getVendorsByType("purchase_vendor");
      if (res.success) {
        setVendorData(res.data?.docs || []);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to load vendors");
    }
  };

  const fetchData = async (page = 1, filterValues = {}) => {
    setLoading(true);
    try {
      const {
        from,
        to,
        vendor = [],
        store = [],
        search,
        limit = pagination.limit,
      } = filterValues;

      // 🔹 Fetch purchase logs
      const res = await reportService.getPurchaseLog({
        page,
        limit,
        fromDate: from ? new Date(from).getTime() : undefined,
        toDate: to ? new Date(to).getTime() : undefined,
        vendors: vendor.map?.((v) => v.value) || [],
        stores: store.map?.((s) => s.value) || [],
        search,
      });

      if (res.success) {
        setData(res.data?.data?.docs || []);
        setPagination((prev) => ({ ...prev, ...res.data?.data }));
      } else {
        toast.error(res.message);
      }

      // 🔹 Fetch total amount separately
      const amountRes = await reportService.getAmountBySearch(
        from ? new Date(from).getTime() : undefined,
        to ? new Date(to).getTime() : undefined,
        search || ""
      );

      if (amountRes.success) {
        console.log(
          "Total Amount:",
          amountRes.data?.data?.docs[0]?.totalAmount
        );

        setAmountData({
          ...amountRes.data?.data?.docs[0],
        });
      } else {
        setAmountData(0);
      }
    } catch (err) {
      toast.error("Failed to fetch purchase logs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters);
  };

  const handleDownloadReport = async () => {
    try {
      // 🔹 Always fetch all purchases
      const payload = {
        page: 1,
        limit: 100000, // big enough to get all records
        fromDate: new Date(filters.from).getTime(),
        toDate: new Date(filters.to).getTime(),
        stores: filters.store?.map((s) => s.value),
        vendors: filters.vendor?.map((v) => v.value),
        search: filters.search || "",
      };

      const res = await reportService.getPurchaseLog(payload);

      if (!res.success || !res.data?.data?.docs?.length) {
        toast.error("No purchase data found to export");
        return;
      }

      const purchases = res.data.data.docs;

      // 🔹 Format into clean array for CSV
      const finalData = purchases.map((p) => ({
        Store_Name: p?.store?.name || "",
        Date: moment(p.createdAt).format("DD/MM/YYYY"),
        "Bill Number": p.invoiceNumber || "",
        "Vendor Name": p?.vendor?.companyName || "",
        Amount: p.totalAmount || 0,
        "Total Piece": p.totalQuantity || 0,
      }));

      if (!finalData.length) {
        toast.error("No valid data to export");
        return;
      }

      // 🔹 Call backend CSV API
      const response = await reportService.exportCsv({ data: finalData });

      if (response.success) {
        const csvData = response.data;
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `PurchaseReport_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Purchase report downloaded!");
      } else {
        toast.error(response.message || "Failed to export CSV");
      }
    } catch (error) {
      console.error("Export CSV error:", error);
      toast.error("Failed to export purchase report");
    }
  };

  const storeOptions = storeData.map((s) => ({
    value: s._id,
    label: s.name,
  }));

  const vendorOptions = vendorData.map((v) => ({
    value: v._id,
    label: v.companyName,
  }));

  // 👉 Table
  const columns = useMemo(
    () => [
      {
        header: "SRNO",
        cell: ({ row }) => (
          <div>
            {pagination.page * pagination.limit -
              pagination.limit +
              row.index +
              1}
          </div>
        ),
      },
      {
        accessorKey: "store",
        header: "Store Name",
        cell: ({ getValue }) => getValue()?.name,
      },
      {
        accessorKey: "vendor",
        header: "Vendor Name",
        cell: ({ getValue }) => getValue()?.companyName,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ getValue }) => moment(getValue()).format("DD/MM/YYYY"),
      },
      {
        accessorKey: "invoiceNumber",
        header: "Bill No",
      },
      {
        accessorKey: "netAmount",
        header: "Amount",
      },
      {
        accessorKey: "totalQuantity",
        header: "Total Piece",
      },
      {
        accessorKey: "totalAmount",
        header: "Total Amount",
      },
    ],
    [pagination]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <h1 className="h2 fw-bold">Purchase Report</h1>

      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="row g-3 mt-4">
        <div className="col-md-3">
          <label className="form-label">Store</label>
          <Select
            isMulti
            options={storeOptions}
            value={filters.store}
            onChange={(val) => setFilters({ ...filters, store: val })}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Vendor</label>
          <Select
            isMulti
            options={vendorOptions}
            value={filters.vendor}
            onChange={(val) => setFilters({ ...filters, vendor: val })}
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

        <div className="col-12 d-flex gap-2 mt-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Loading..." : "Submit"}
          </button>
        </div>
      </form>

      {/* Actions */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="d-flex flex-column flex-md-row align-items-center gap-3 mb-2 mb-md-0">
          <p className="mb-0">Total Amount: {amountData?.totalAmount}</p>
          <p className="mb-0">Profit Loss: {amountData?.ProfitLoss}</p>
          <p className="mb-0">Total Cost: {amountData?.totalCost}</p>
        </div>
        <div className="d-flex gap-2">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="search"
              className="form-control border-start-0"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDownloadReport}
          >
            Download
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive mt-3">
        <table className="table table-sm">
          <thead className="bg-light">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="p-2">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
          {Math.min(pagination.page * pagination.limit, pagination.totalDocs)}{" "}
          of {pagination.totalDocs} results
        </div>
        <div className="btn-group">
          <button
            className="btn btn-outline-primary"
            disabled={!pagination.hasPrevPage}
            onClick={() => fetchData(pagination.page - 1, filters)}
          >
            Previous
          </button>
          <button
            className="btn btn-outline-primary"
            disabled={!pagination.hasNextPage}
            onClick={() => fetchData(pagination.page + 1, filters)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReport;
