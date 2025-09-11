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

const ProductPurchaseReportCom = () => {
  // State for filters, data, and UI
  const [storeData, setStoreData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [filters, setFilters] = useState({
    store: [],
    vendor: [],
    from: new Date(new Date().setDate(new Date().getDate() - 1)),
    to: new Date(),
  });
  const [orders, setOrders] = useState([]);
  const [amountData, setAmountData] = useState({ totalAmount: 0 });
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

  // Load stores, vendors, and set default store
  useEffect(() => {
    getStores();
    getVendors();
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
            fetchAmount({ ...filters, store: [defaultStore] });
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

  const getVendors = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getVendors();
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

  // Fetch purchase logs and amount
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
        fromDate: new Date(filtersOverride.from).getTime(),
        toDate: new Date(filtersOverride.to).getTime(),
        stores: filtersOverride.store?.map((s) => s.value) || [],
        vendors: filtersOverride.vendor?.map((v) => v.value) || [],
        search: search || "",
      };

      const res = await reportService.getPurchaseLog(payload);
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
        toast.error(res.message || "Failed to fetch purchase data");
      }
    } catch (e) {
      toast.error("Failed to fetch purchase data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAmount = async (filtersOverride = filters) => {
    try {
      const payload = {
        fromDate: new Date(filtersOverride.from).getTime(),
        toDate: new Date(filtersOverride.to).getTime(),
        stores: filtersOverride.store?.map((s) => s.value) || [],
        vendors: filtersOverride.vendor?.map((v) => v.value) || [],
      };

      const res = await reportService.getAmount(payload);
      if (res.success) {
        setAmountData({
          totalAmount: res.data.data?.docs?.[0]?.totalAmount || 0,
        });
      } else {
        toast.error(res.message || "Failed to fetch amount data");
      }
    } catch (e) {
      toast.error("Failed to fetch amount data");
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(1, filters);
    fetchAmount(filters);
  };

  // Trigger API on debounced search
  useEffect(() => {
    fetchData(1, { ...filters, from: null, to: null }, debouncedSearch);
  }, [debouncedSearch]);

  // CSV Export
  const handleDownloadReport = async () => {
    setDownloadLoading(true);
    try {
      const payload = {
        page: 1,
        limit: 100000,
        fromDate: new Date(filters.from).getTime(),
        toDate: new Date(filters.to).getTime(),
        stores: filters.store?.map((s) => s.value) || [],
        vendors: filters.vendor?.map((v) => v.value) || [],
        search: debouncedSearch || "",
      };

      const res = await reportService.getPurchaseLog(payload);
      if (!res.success || !res.data?.data?.docs?.length) {
        toast.error("No purchase data found to export");
        return;
      }

      const purchaseData = res.data.data.docs;
      const finalData = purchaseData.map((item) => ({
        Date: item.createdAt,
        Store: item.store?.name || "",
        Vendor: item.vendor?.companyName || "",
        Barcode: item.products?.[0]?.product?.newBarcode || "",
        Bill_Number: item.invoiceNumber || "",
        SKU: item.products?.[0]?.product?.sku || "",
        Quantity: item.products?.[0]?.quantity || 0,
        Purchase_Rate: item.products?.[0]?.purchaseRate || 0,
        Tax: item.products?.[0]?.tax || 0,
        Total_Amount: item.products?.[0]?.totalAmount || 0,
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
          `ProductPurchaseReport_${Date.now()}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Purchase report downloaded!");
      } else {
        toast.error(response.message || "Failed to export CSV");
      }
    } catch (error) {
      toast.error("Failed to export purchase report");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
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
        size: 200,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.name}</div>
        ),
      },
      {
        accessorKey: "vendor",
        header: "Vendor Name",
        size: 200,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.companyName}</div>
        ),
      },
      {
        id: "productnewBarcode",
        accessorKey: "products",
        header: "Barcode",
        size: 120,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0]?.product?.newBarcode}</div>
        ),
      },
      {
        accessorKey: "invoiceNumber",
        header: "Bill No",
        size: 100,
        cell: ({ getValue }) => <div className="text-left">{getValue()}</div>,
      },
      {
        id: "productsku",
        accessorKey: "products",
        header: "SKU",
        size: 150,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0]?.product?.sku}</div>
        ),
      },
      {
        id: "productquantity",
        accessorKey: "products",
        header: "Quantity",
        size: 80,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0]?.quantity}</div>
        ),
      },
      {
        id: "productpurchaseRate",
        accessorKey: "products",
        header: "Purchase Rate",
        size: 120,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0]?.purchaseRate}</div>
        ),
      },
      {
        id: "producttax",
        accessorKey: "products",
        header: "Tax",
        size: 80,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0]?.tax}</div>
        ),
      },
      {
        id: "producttotalAmount",
        accessorKey: "products",
        header: "Total Amount",
        size: 120,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()[0]?.totalAmount}</div>
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
      <h2 className="fw-bold mb-4">Product Purchase Report</h2>

      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">Select Store</label>
          <Select
            isMulti
            options={storeData.map((s) => ({ value: s._id, label: s.name }))}
            value={filters.store}
            onChange={(opt) => setFilters({ ...filters, store: opt })}
            placeholder="Select..."
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Select Vendor</label>
          <Select
            isMulti
            options={vendorData.map((v) => ({
              value: v._id,
              label: v.companyName,
            }))}
            value={filters.vendor}
            onChange={(opt) => setFilters({ ...filters, vendor: opt })}
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
          <p className="mb-2 mb-md-0">Total Amount: {amountData.totalAmount}</p>
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
          Download Purchase Report
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
                <td colSpan="11" className="text-center">
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

export default ProductPurchaseReportCom;
