import React, { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { FaSearch } from "react-icons/fa";
import moment from "moment";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDebounce } from "use-debounce";
import { reportService } from "../../../services/reportService";

const ProductSalesReportPage = () => {
  const [storeData, setStoreData] = useState([]);
  const [brandData, setBrandData] = useState([]);
  const [filters, setFilters] = useState({
    store: [],
    brand: [],
    from: new Date(),
    to: new Date(),
  });

  const [orders, setOrders] = useState([]);
  const [amountData, setAmountData] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);

  // ✅ Load stores & brands + set default store
  useEffect(() => {
    getStores();
    getBrands();
  }, []);

  const getStores = async () => {
    try {
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

            // fetch immediately
            fetchData(1, {
              ...filters,
              store: [defaultStore],
            });
          }
        }
      }
    } catch (e) {
      toast.error("Failed to load stores");
    }
  };

  const getBrands = async () => {
    try {
      const res = await reportService.getBrands();
      if (res.success) {
        setBrandData(res.data.data);
      }
    } catch (e) {
      toast.error("Failed to load brands");
    }
  };

  // ✅ Fetch orders + amount
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
        fromDate: new Date(filtersOverride.from).getTime(), // ✅ Unix timestamp
        toDate: new Date(filtersOverride.to).getTime(),
        brands: filtersOverride.brand?.map((b) => b.value),
        stores: filtersOverride.store?.map((s) => s.value),
        search: search || "",
      };

      const res = await reportService.fetchOrders(payload);
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
      }

      const amtRes = await reportService.getAmount(payload);
      if (amtRes.success) {
        setAmountData({
          totalAmount: amtRes.data.data?.docs?.[0]?.totalAmount || 0,
          ProfitLoss: amtRes.data.data?.docs?.[0]?.ProfitLoss || 0,
          totalCost: amtRes.data.data?.docs?.[0]?.totalCost || 0,
        });
      }
    } catch (e) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Apply filters
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters);
  };

  // ✅ Trigger API when debounced search changes
  useEffect(() => {
    if (filters.store.length > 0) {
      fetchData(1, filters, debouncedSearch);
    }
  }, [debouncedSearch]);

  // ✅ Download Sales Report using API
  // ✅ Download Sales Report via API
  const handleDownloadReport = async () => {
    try {
      // 🔹 Always fetch all orders (ignore pagination)
      const payload = {
        page: 1,
        limit: 100000, // big enough to get all records
        fromDate: new Date(filters.from).getTime(),
        toDate: new Date(filters.to).getTime(),
        brands: filters.brand?.map((b) => b.value),
        stores: filters.store?.map((s) => s.value),
        search: debouncedSearch || "",
      };

      const res = await reportService.fetchOrders(payload);

      if (!res.success || !res.data?.data?.docs?.length) {
        toast.error("No sales data found to export");
        return;
      }

      const orders = res.data.data.docs;

      // 🔹 Format into clean array
      const finalData = orders.map((o) => ({
        Store_Name: o?.store?.name || "",
        Brand:
          o?.product?.item?.brand?.name || o?.lens?.item?.brand?.name || "N/A",
        "Customer Name": o?.sale?.customerName || "",
        Date: moment(o?.createdAt).format("DD/MM/YYYY"),
        SKU: o?.product?.sku || o?.lens?.sku || "",
        "Order No": o?.billNumber || "",
        Barcode: o?.product?.barcode || o?.lens?.barcode || "",
        MRP: o?.product?.mrp || o?.lens?.mrp || 0,
        Discount:
          o?.product?.perPieceDiscount || o?.lens?.perPieceDiscount || 0,
        "Net Amount":
          o?.product?.perPieceAmount || o?.lens?.perPieceAmount || 0,
      }));

      if (!finalData.length) {
        toast.error("No valid data to export");
        return;
      }

      const result = { data: finalData };

      // 🔹 Call backend CSV API
      const response = await reportService.exportCsv(result);

      if (response.success) {
        const csvData = response.data;
        const blob = new Blob([csvData], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `SalesReport_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Sales report downloaded!");
      } else {
        toast.error(response.message || "Failed to export CSV");
      }
    } catch (error) {
      console.error("Export CSV error:", error);
      toast.error("Failed to export sales report");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Product Sales Report</h2>

      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Select Store</label>
          <Select
            isMulti
            options={storeData.map((s) => ({ value: s._id, label: s.name }))}
            value={filters.store}
            onChange={(opt) => setFilters({ ...filters, store: opt })}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Select Brand</label>
          <Select
            isMulti
            options={brandData.map((b) => ({ value: b._id, label: b.name }))}
            value={filters.brand}
            onChange={(opt) => setFilters({ ...filters, brand: opt })}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">From</label>
          <DatePicker
            className="form-control"
            selected={filters.from}
            onChange={(date) => setFilters({ ...filters, from: date })}
            dateFormat="dd-MM-yyyy" // ✅ Show as day-month-year
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">To</label>
          <DatePicker
            className="form-control"
            selected={filters.to}
            onChange={(date) => setFilters({ ...filters, to: date })}
            dateFormat="dd-MM-yyyy" // ✅ Show as day-month-year
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
          <p className="mb-2 mb-md-0">
            Total Amount: {amountData?.totalAmount}
          </p>
          <p className="mb-2 mb-md-0">Profit Loss: {amountData?.ProfitLoss}</p>
          <p className="mb-2 mb-md-0">Total Cost: {amountData?.totalCost}</p>
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
          Download Sales Report
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
            <tr>
              <th>SRNO</th>
              <th>Store</th>
              <th>Date</th>
              <th>Order No</th>
              <th>Customer</th>
              <th>Brand</th>
              <th>Barcode</th>
              <th>SKU</th>
              <th>MRP</th>
              <th>Discount</th>
              <th>Net Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((o, idx) => (
                <tr key={o._id || idx}>
                  <td>{idx + 1}</td>
                  <td>{o?.store?.name}</td>
                  <td>{moment(o?.createdAt).format("DD/MM/YYYY")}</td>
                  <td>{o?.billNumber}</td>
                  <td>{o?.sale?.customerName}</td>
                  <td>
                    {o.product?.item?.brand?.name || o.lens?.item?.brand?.name}{" "}
                    {o.product?.item?.__t || o.lens?.item?.__t}
                  </td>
                  <td>{o.product?.barcode || o.lens?.barcode}</td>
                  <td>{o.product?.sku || o.lens?.sku}</td>
                  <td>{o.product?.mrp || o.lens?.mrp}</td>
                  <td>
                    {o.product?.perPieceDiscount || o.lens?.perPieceDiscount}
                  </td>
                  <td>{o.product?.perPieceAmount || o.lens?.perPieceAmount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center">
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
          Page {pagination.page} of {pagination.totalPages} |{" "}
          {pagination.totalDocs} results
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

export default ProductSalesReportPage;
