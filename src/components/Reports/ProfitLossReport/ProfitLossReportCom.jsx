import React, { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
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

const ProfitLossReportCom = () => {
  // State for filters, data, UI, and expanded rows
  const [storeData, setStoreData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [filters, setFilters] = useState({
    store: [],
    brands: [],
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
  const [amountData, setAmountData] = useState({});
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // 10 orders per page
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [expandedRows, setExpandedRows] = useState({});

  // Load stores, brands, and initial data
  useEffect(() => {
    getStores();
    getBrands();
  }, []);

  const getStores = async () => {
    try {
      setLoading(true);
      const res = await reportService.getStores();
      if (res.success) {
        const stores = res.data.data;
        console.log("[ProfitLoss] Stores fetched:", stores);
        setStoreData(stores);

        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.stores?.length) {
          const defaultStores = stores
            .filter((s) => user.stores.includes(s._id))
            .map((s) => ({ value: s._id, label: s.name }));
          console.log("[ProfitLoss] Default stores set:", defaultStores);
          setFilters((prev) => ({ ...prev, store: defaultStores }));
          fetchData(1, { ...filters, store: defaultStores });
          fetchAmount(1, { ...filters, store: defaultStores });
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

  const getBrands = async () => {
    try {
      setLoading(true);
      const res = await reportService.getBrands();
      if (res.success) {
        console.log("[ProfitLoss] Brands fetched:", res.data.data);
        setBrandData(res.data.data);
      } else {
        toast.error(res.message || "Failed to load brands");
      }
    } catch (e) {
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  // Fetch profit and loss data
  const fetchData = async (
    page = 1,
    filtersOverride = filters,
    search = debouncedSearch
  ) => {
    setLoading(true);
    try {
      const payload = {
        page,
        limit: pagination.limit, // Ensure limit is 10
        stores: filtersOverride.store?.map((s) => s.value) || [],
        brands: filtersOverride.brands?.map((b) => b.value) || [],
        search: search || "",
      };

      if (filtersOverride.from && filtersOverride.to) {
        const fromStart = new Date(filtersOverride.from);
        fromStart.setHours(0, 0, 0, 0);
        const toEnd = new Date(filtersOverride.to);
        toEnd.setHours(23, 59, 59, 999);
        payload.fromDate = fromStart.getTime();
        payload.toDate = toEnd.getTime();
      }

      console.log("[ProfitLoss] fetchData payload:", {
        ...payload,
        fromLocal: payload.fromDate
          ? new Date(payload.fromDate).toLocaleString()
          : null,
        toLocal: payload.toDate
          ? new Date(payload.toDate).toLocaleString()
          : null,
      });

      const res = await reportService.fetchOrders(payload);
      if (res.success) {
        const rawDocs = res.data.data.docs || [];
        console.log(
          "[ProfitLoss] Raw API response docs:",
          rawDocs.length,
          rawDocs
        );
        const formattedData = processData(rawDocs);
        console.log(
          "[ProfitLoss] Formatted data rows:",
          formattedData.length,
          formattedData
        );
        setOrders(formattedData);
        setPagination({
          page: res.data.data.page || 1,
          limit: res.data.data.limit || pagination.limit,
          totalDocs: res.data.data.totalDocs || 0,
          totalPages: res.data.data.totalPages || 0,
          hasNextPage: res.data.data.hasNextPage || false,
          hasPrevPage: res.data.data.hasPrevPage || false,
        });
      } else {
        toast.error(res.message || "Failed to fetch profit/loss data");
      }
    } catch (e) {
      console.error("[ProfitLoss] fetchData error:", e);
      toast.error("Failed to fetch profit/loss data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch amount data
  const fetchAmount = async (page = 1, filtersOverride = filters) => {
    try {
      const payload = {
        page,
        limit: pagination.limit,
        stores: filtersOverride.store?.map((s) => s.value) || [],
        brands: filtersOverride.brands?.map((b) => b.value) || [],
      };

      if (filtersOverride.from && filtersOverride.to) {
        const fromStart = new Date(filtersOverride.from);
        fromStart.setHours(0, 0, 0, 0);
        const toEnd = new Date(filtersOverride.to);
        toEnd.setHours(23, 59, 59, 999);
        payload.fromDate = fromStart.getTime();
        payload.toDate = toEnd.getTime();
      }

      console.log("[ProfitLoss] fetchAmount payload:", {
        ...payload,
        fromLocal: payload.fromDate
          ? new Date(payload.fromDate).toLocaleString()
          : null,
        toLocal: payload.toDate
          ? new Date(payload.toDate).toLocaleString()
          : null,
      });

      const res = await reportService.getAmount(payload);
      if (res.success) {
        console.log("[ProfitLoss] Amount data:", res.data.data.docs?.[0]);
        setAmountData(res.data.data.docs?.[0] || {});
      } else {
        toast.error(res.message || "Failed to fetch amount data");
      }
    } catch (e) {
      console.error("[ProfitLoss] fetchAmount error:", e);
      toast.error("Failed to fetch amount data");
    }
  };

  // Process data for table (single row per order)
  const processData = (rawData) => {
    const processed = rawData.map((item, index) => {
      const date = moment(item.createdAt).format("DD/MM/YYYY");
      const billNumber = item.billNumber || "-";
      const storeName = item.store?.name || "-";
      const custName = item.sale?.customerName || "-";

      // Aggregate data from product, rightLens, leftLens
      const primaryItem = item.product || item.rightLens || item.leftLens || {};
      const barcode = primaryItem.barcode || "-";
      const sku = primaryItem.sku || "-";
      const brand =
        primaryItem.item?.brand?.name || primaryItem.item?.__t || "Unknown";
      const mrp = [item.product, item.rightLens, item.leftLens]
        .filter(Boolean)
        .reduce((sum, i) => sum + (Number(i.mrp) || 0), 0);
      const discount = [item.product, item.rightLens, item.leftLens]
        .filter(Boolean)
        .reduce((sum, i) => sum + (Number(i.perPieceDiscount) || 0), 0);
      const netAmount = [item.product, item.rightLens, item.leftLens]
        .filter(Boolean)
        .reduce((sum, i) => sum + (Number(i.perPieceAmount) || 0), 0);
      const costPrice = [item.product, item.rightLens, item.leftLens]
        .filter(Boolean)
        .reduce((sum, i) => sum + (Number(i.item?.costPrice) || 0), 0);
      const profitLoss = netAmount - costPrice;

      // Store lens details for dropdown
      const lensDetails = [];
      if (item.rightLens?.displayName) {
        lensDetails.push({
          type: "Right Lens",
          displayName: item.rightLens.displayName,
          barcode: item.rightLens.barcode || "-",
          sku: item.rightLens.sku || "-",
          brand: item.rightLens.item?.brand?.name || "Lens",
          mrp: item.rightLens.mrp || 0,
          discount: item.rightLens.perPieceDiscount || 0,
          netAmount: item.rightLens.perPieceAmount || 0,
          costPrice: item.rightLens.item?.costPrice || 0,
          profitLoss:
            (Number(item.rightLens.perPieceAmount) || 0) -
            (Number(item.rightLens.item?.costPrice) || 0),
        });
      }
      if (item.leftLens?.displayName) {
        lensDetails.push({
          type: "Left Lens",
          displayName: item.leftLens.displayName,
          barcode: item.leftLens.barcode || "-",
          sku: item.leftLens.sku || "-",
          brand: item.leftLens.item?.brand?.name || "Lens",
          mrp: item.leftLens.mrp || 0,
          discount: item.leftLens.perPieceDiscount || 0,
          netAmount: item.leftLens.perPieceAmount || 0,
          costPrice: item.leftLens.item?.costPrice || 0,
          profitLoss:
            (Number(item.leftLens.perPieceAmount) || 0) -
            (Number(item.leftLens.item?.costPrice) || 0),
        });
      }

      return {
        id: `${index}`,
        date,
        billNumber,
        storeName,
        custName,
        barcode,
        sku,
        brand,
        mrp,
        discount,
        netAmount,
        costPrice,
        profitLoss,
        lensDetails, // For dropdown
      };
    });
    console.log(
      "[ProfitLoss] Processed data rows:",
      processed.length,
      processed
    );
    return processed;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters);
    fetchAmount(1, filters);
  };

  // Trigger API on debounced search
  useEffect(() => {
    if (debouncedSearch.trim()) {
      fetchData(1, { ...filters, from: null, to: null }, debouncedSearch);
    } else {
      fetchData(1, filters, debouncedSearch);
      fetchAmount(1, filters);
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
        brands: filters.brands?.map((b) => b.value) || [],
        search: debouncedSearch || "",
      };

      if (filters.from && filters.to) {
        const fromStart = new Date(filters.from);
        fromStart.setHours(0, 0, 0, 0);
        const toEnd = new Date(filters.to);
        toEnd.setHours(23, 59, 59, 999);
        payload.fromDate = fromStart.getTime();
        payload.toDate = toEnd.getTime();
      }

      console.log("[ProfitLoss] Export payload:", {
        ...payload,
        fromLocal: payload.fromDate
          ? new Date(payload.fromDate).toLocaleString()
          : null,
        toLocal: payload.toDate
          ? new Date(payload.toDate).toLocaleString()
          : null,
      });

      const res = await reportService.fetchOrders(payload);
      if (!res.success || !res.data?.data?.docs?.length) {
        toast.error("No profit/loss data found to export");
        return;
      }

      const formattedData = processData(res.data.data.docs);
      console.log("[ProfitLoss] Export data rows:", formattedData.length);
      const finalData = formattedData.map((item, index) => ({
        SRNO: index + 1,
        Store_Name: item.storeName,
        Date: item.date,
        Order_No: item.billNumber,
        Customer_Name: item.custName,
        Barcode: item.barcode,
        SKU: item.sku,
        Brand: item.brand,
        MRP: item.mrp,
        Discount: item.discount,
        Net_Amount: item.netAmount,
        Cost_Price: item.costPrice,
        Profit_Loss: item.profitLoss,
      }));

      const response = await reportService.exportCsv({ data: finalData });
      if (response.success) {
        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `ProfitLossReport_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Profit/loss report downloaded!");
      } else {
        toast.error(response.message || "Failed to export CSV");
      }
    } catch (error) {
      console.error("[ProfitLoss] Export error:", error);
      toast.error("Failed to export profit/loss report");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        header: "Expand",
        size: 50,
        cell: ({ row }) => (
          <div className="text-left">
            {row.original.lensDetails?.length > 0 && (
              <button
                className="btn btn-link p-0"
                onClick={() =>
                  setExpandedRows((prev) => ({
                    ...prev,
                    [row.id]: !prev[row.id],
                  }))
                }
              >
                {expandedRows[row.id] ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            )}
          </div>
        ),
      },

      {
        accessorKey: "storeName",
        header: "Store Name",
        size: 120,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
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
        accessorKey: "billNumber",
        header: "Order No",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "custName",
        header: "Name",
        size: 150,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "barcode",
        header: "Barcode",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "sku",
        header: "SKU",
        size: 450,
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
        accessorKey: "netAmount",
        header: "Net Amount",
        size: 120,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || 0}</div>
        ),
      },
      {
        accessorKey: "costPrice",
        header: "Cost Price",
        size: 120,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || 0}</div>
        ),
      },
      {
        accessorKey: "profitLoss",
        header: "Profit Loss",
        size: 120,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.toFixed(2) || 0}</div>
        ),
      },
    ],
    [expandedRows]
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
      <h2 className="fw-bold mb-4">Profit Loss Report</h2>

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
          <label className="form-label">Select Brand</label>
          <Select
            isMulti
            options={brandData.map((b) => ({ value: b._id, label: b.name }))}
            value={filters.brands}
            onChange={(opt) => setFilters({ ...filters, brands: opt || [] })}
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
            Apply Filters
          </button>
        </div>
      </form>

      {/* Top Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
        <div className="d-flex flex-column flex-md-row align-items-center gap-3 mb-2 mb-md-0">
          <p className="mb-0">
            Total Amount: {amountData?.totalAmount?.toFixed(2) || 0}
          </p>
          <p className="mb-0">
            Total Cost: {amountData?.totalCost?.toFixed(2) || 0}
          </p>
          <p className="mb-0">
            Profit-Loss: {amountData?.ProfitLoss?.toFixed(2) || 0}
          </p>
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
          Download Profit/Loss Report
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
                <td colSpan="14" className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                  {expandedRows[row.id] &&
                    row.original.lensDetails?.length > 0 && (
                      <tr>
                        <td colSpan="14" className="p-3">
                          <div className="bg-light p-3">
                            <h6>Lens Details</h6>
                            <table className="table table-bordered table-sm">
                              <thead>
                                <tr>
                                  <th>Type</th>
                                  <th>Display Name</th>
                                  <th>Barcode</th>
                                  <th>SKU</th>
                                  <th>Brand</th>
                                  <th>MRP</th>
                                  <th>Discount</th>
                                  <th>Net Amount</th>
                                  <th>Cost Price</th>
                                  <th>Profit Loss</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.original.lensDetails.map((lens, index) => (
                                  <tr key={`${row.id}-lens-${index}`}>
                                    <td>{lens.type}</td>
                                    <td>{lens.displayName || "-"}</td>
                                    <td>{lens.barcode}</td>
                                    <td>{lens.sku}</td>
                                    <td>{lens.brand}</td>
                                    <td>{lens.mrp || 0}</td>
                                    <td>{lens.discount || 0}</td>
                                    <td>{lens.netAmount || 0}</td>
                                    <td>{lens.costPrice || 0}</td>
                                    <td>{lens.profitLoss?.toFixed(2) || 0}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="14" className="text-center">
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
            onClick={() => {
              fetchData(pagination.page - 1);
              fetchAmount(pagination.page - 1);
            }}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              fetchData(pagination.page + 1);
              fetchAmount(pagination.page + 1);
            }}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReportCom;
