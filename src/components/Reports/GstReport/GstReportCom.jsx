import React, { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { reportService } from "../../../services/reportService";
import { toast } from "react-toastify";
import moment from "moment";

const GstReportCom = () => {
  // State for data and UI
  const [filteredData, setFilteredData] = useState({
    docs: [],
    totalDocs: 0,
    totalPages: 0,
    page: 1,
  });
  const [storeData, setStoreData] = useState([]);
  const [storesIdsData, setStoresIdsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  // Initial fetch for default date range
  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    fetchOrders({
      fromDate: yesterday.getTime(),
      toDate: today.getTime(),
      page: 1,
    });
    getStores();
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch orders on search change
  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchOrders({ search: debouncedQuery, stores: storesIdsData, page: 1 });
    } else {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      fetchOrders({
        fromDate: formik.values.from?.getTime() || yesterday.getTime(),
        toDate: formik.values.to?.getTime() || today.getTime(),
        page: 1,
        stores: storesIdsData,
      });
    }
  }, [debouncedQuery, storesIdsData]);

  // Fetch stores
  const getStores = async () => {
    setLoading(true);
    try {
      const response = await reportService.getStores();
      if (response.success) {
        console.log("[GST] Stores fetched:", response.data?.data?.length);
        setStoreData(response?.data?.data || []);
      } else {
        toast.error(response.message || "Failed to load stores");
      }
    } catch (error) {
      console.error("[GST] getStores error:", error);
      toast.error("Failed to load stores");
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = ({ fromDate, toDate, page, stores, search }) => {
    setLoading(true);
    const payload = {
      fromDate,
      toDate,
      page,
      limit: 10,
      ...(stores && stores.length && { stores }),
      ...(search && { search }),
    };
    reportService
      .fetchOrders(payload)
      .then((res) => {
        console.log(
          "[GST] fetchOrders response:",
          res.data?.data?.docs?.length,
          res.data?.data?.docs
        );
        setFilteredData({
          docs: res.data?.data?.docs || [],
          totalDocs: res.data?.data?.totalDocs || 0,
          totalPages: res.data?.data?.totalPages || 0,
          page: res.data?.data?.page || 1,
          hasNextPage: res.data?.data?.hasNextPage || false,
          hasPrevPage: res.data?.data?.hasPrevPage || false,
        });
      })
      .catch((e) => {
        console.error("[GST] Failed to get orders:", e);
        toast.error("Failed to fetch orders");
      })
      .finally(() => setLoading(false));
  };

  // Formik for form handling
  const formik = useFormik({
    initialValues: {
      store: [],
      from: new Date(),
      to: new Date(),
    },
    onSubmit: (values) => {
      const fromTimestamp = new Date(values.from).getTime();
      const toTimestamp = new Date(values.to).getTime();
      const storeIds = values.store.map((s) => s.value);
      fetchOrders({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
        page: 1,
        stores: storeIds,
      });
    },
  });

  // Set default store from user data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const storedStoreId = user?.stores?.[0];
    if (storedStoreId && storeData.length > 0) {
      const defaultStore = storeData.find(
        (store) => store._id === storedStoreId
      );
      if (defaultStore) {
        formik.setFieldValue("store", [
          { value: defaultStore._id, label: defaultStore.name },
        ]);
      }
    }
  }, [storeData]);

  // Update storesIdsData on store selection change
  useEffect(() => {
    const ids = formik.values.store;
    const transformed = ids.map((item) => item.value);
    setStoresIdsData(transformed);
  }, [formik.values.store]);

  // Process data for single row per order
  const processData = (rawData) => {
    const processed = rawData.map((item, index) => {
      const date = moment(item.createdAt).format("YYYY-MM-DD");
      const billNumber = item.billNumber || "-";
      const godownName = item.store?.name || "-";
      const totalQty = item.sale?.totalQuantity || 0;
      const netAmount = item.sale?.netAmount || 0;

      // Payment summary
      let paymentSummary = { cash: 0, upi: 0, card: 0 };
      item.sale?.receivedAmount?.forEach((entry) => {
        const method = entry.method?.toLowerCase();
        if (method === "cash") paymentSummary.cash += entry.amount;
        if (method === "bank") paymentSummary.upi += entry.amount;
        if (method === "card") paymentSummary.card += entry.amount;
      });

      // Aggregate data from product, rightLens, leftLens, lens
      const primaryItem =
        item.product || item.rightLens || item.leftLens || item.lens || {};
      const sku = primaryItem.sku || "-";
      const itemName =
        [
          primaryItem.item?.brand?.name,
          primaryItem.item?.__t,
          primaryItem.item?.displayName,
        ]
          .filter(Boolean)
          .join(" ") || "-";
      const rate = [item.product, item.rightLens, item.leftLens, item.lens]
        .filter(Boolean)
        .reduce(
          (sum, i) =>
            sum +
            ((Number(i.perPieceAmount) || 0) -
              (Number(i.item?.perPieceTax) || 0)),
          0
        );
      const cgst = rate * 0.06;
      const sgst = rate * 0.06;

      // Narration: Use store name, customer name, bill number, and primary SKU
      const narration = `${item.store?.name || "-"}-${
        item.sale?.customerName || "-"
      }-${item.billNumber || "-"}-${sku}`;

      // Store details for dropdown
      const details = [];
      if (item.product?.item?.displayName) {
        details.push({
          type: "Product",
          displayName: item.product.item.displayName,
          sku: item.product.sku || "-",
          item:
            [item.product.item.brand?.name, item.product.item.__t]
              .filter(Boolean)
              .join(" ") || "-",
          rate:
            (Number(item.product.perPieceAmount) || 0) -
            (Number(item.product.item.perPieceTax) || 0),
          cgst:
            ((Number(item.product.perPieceAmount) || 0) -
              (Number(item.product.item.perPieceTax) || 0)) *
            0.06,
          sgst:
            ((Number(item.product.perPieceAmount) || 0) -
              (Number(item.product.item.perPieceTax) || 0)) *
            0.06,
          narration: `${item.store?.name || "-"}-${
            item.sale?.customerName || "-"
          }-${item.billNumber || "-"}-${item.product.sku || "-"}`,
        });
      }
      if (item.rightLens?.displayName) {
        details.push({
          type: "Right Lens",
          displayName: item.rightLens.displayName,
          sku: item.rightLens.sku || "-",
          item: item.rightLens.item?.brand?.name || "Lens",
          rate:
            (Number(item.rightLens.perPieceAmount) || 0) -
            (Number(item.rightLens.item?.perPieceTax) || 0),
          cgst:
            ((Number(item.rightLens.perPieceAmount) || 0) -
              (Number(item.rightLens.item?.perPieceTax) || 0)) *
            0.06,
          sgst:
            ((Number(item.rightLens.perPieceAmount) || 0) -
              (Number(item.rightLens.item?.perPieceTax) || 0)) *
            0.06,
          narration: `${item.store?.name || "-"}-${
            item.sale?.customerName || "-"
          }-${item.billNumber || "-"}-${item.rightLens.sku || "-"}`,
        });
      }
      if (item.leftLens?.displayName) {
        details.push({
          type: "Left Lens",
          displayName: item.leftLens.displayName,
          sku: item.leftLens.sku || "-",
          item: item.leftLens.item?.brand?.name || "Lens",
          rate:
            (Number(item.leftLens.perPieceAmount) || 0) -
            (Number(item.leftLens.item?.perPieceTax) || 0),
          cgst:
            ((Number(item.leftLens.perPieceAmount) || 0) -
              (Number(item.leftLens.item?.perPieceTax) || 0)) *
            0.06,
          sgst:
            ((Number(item.leftLens.perPieceAmount) || 0) -
              (Number(item.leftLens.item?.perPieceTax) || 0)) *
            0.06,
          narration: `${item.store?.name || "-"}-${
            item.sale?.customerName || "-"
          }-${item.billNumber || "-"}-${item.leftLens.sku || "-"}`,
        });
      }
      if (item.lens?.item?.displayName) {
        details.push({
          type: "Lens",
          displayName: item.lens.item.displayName,
          sku: item.lens.sku || "-",
          item:
            [item.lens.item.brand?.name, item.lens.item.__t]
              .filter(Boolean)
              .join(" ") || "-",
          rate:
            (Number(item.lens.perPieceAmount) || 0) -
            (Number(item.lens.item.perPieceTax) || 0),
          cgst:
            ((Number(item.lens.perPieceAmount) || 0) -
              (Number(item.lens.item.perPieceTax) || 0)) *
            0.06,
          sgst:
            ((Number(item.lens.perPieceAmount) || 0) -
              (Number(item.lens.item.perPieceTax) || 0)) *
            0.06,
          narration: `${item.store?.name || "-"}-${
            item.sale?.customerName || "-"
          }-${item.billNumber || "-"}-${item.lens.sku || "-"}`,
        });
      }

      return {
        id: `${index}`,
        date,
        billNumber,
        sku,
        item: itemName,
        godownName,
        totalQty,
        rate,
        cgst,
        sgst,
        netAmount,
        narration,
        cash: paymentSummary.cash,
        upi: paymentSummary.upi,
        card: paymentSummary.card,
        details,
      };
    });
    console.log("[GST] Processed data rows:", processed.length, processed);
    return processed;
  };

  // Export to Excel
  const exportToExcel = async (filename) => {
    setLoadingDownload(true);
    try {
      const payload = {
        page: 1,
        limit: 100000,
        fromDate: formik.values.from?.getTime(),
        toDate: formik.values.to?.getTime(),
        stores: storesIdsData,
        ...(debouncedQuery && { search: debouncedQuery }),
      };

      console.log("[GST] Export payload:", {
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
        toast.error("No data found to export");
        return;
      }

      const formattedData = processData(res.data.data.docs);

      const finalData = formattedData.map((item, index) => ({
        SRNO: index + 1,
        Date: item.date && new Date(item.date),
        Order_No: item.billNumber,
        SKU: item.sku,
        Item: item.item,
        Godown: item.godownName,
        QTY: item.totalQty,
        Rate: item.rate?.toFixed(2),
        CGST: item.cgst?.toFixed(2),
        SGST: item.sgst?.toFixed(2),
        Net_Amount: item.netAmount,
        Narration: item.narration,
        CASH: item.cash,
        UPI: item.upi,
        Card: item.card,
      }));

      const response = await reportService.exportCsv({ data: finalData });
      if (response.success) {
        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${filename}_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("GST report downloaded!");
      } else {
        toast.error(response.message || "Failed to export CSV");
      }
    } catch (error) {
      console.error("[GST] Export error:", error);
      toast.error("Failed to export GST report");
    } finally {
      setLoadingDownload(false);
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        header: "Ex",
        size: 50,
        cell: ({ row }) => (
          <div className="text-left">
            {row.original.details?.length > 0 && (
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
        accessorKey: "sku",
        header: "SKU",
        size: 200,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },

      {
        accessorKey: "godownName",
        header: "Store",
        size: 200,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || "-"}</div>
        ),
      },
      {
        accessorKey: "totalQty",
        header: "QTY",
        size: 50,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || 0}</div>
        ),
      },
      {
        accessorKey: "rate",
        header: "Rate",
        size: 80,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.toFixed(2) || 0}</div>
        ),
      },
      {
        accessorKey: "cgst",
        header: "CGST",
        size: 80,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.toFixed(2) || 0}</div>
        ),
      },
      {
        accessorKey: "sgst",
        header: "SGST",
        size: 80,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue()?.toFixed(2) || 0}</div>
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
        accessorKey: "cash",
        header: "CASH",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || 0}</div>
        ),
      },
      {
        accessorKey: "upi",
        header: "UPI",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || 0}</div>
        ),
      },
      {
        accessorKey: "card",
        header: "Card",
        size: 100,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() || 0}</div>
        ),
      },
    ],
    [expandedRows]
  );

  // Process formatted data
  const formattedData = useMemo(
    () => processData(filteredData.docs),
    [filteredData.docs]
  );

  // React Table setup
  const table = useReactTable({
    data: formattedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Use server-side pagination
    state: { pagination: { pageIndex: filteredData.page - 1, pageSize: 10 } },
  });

  // Pagination info
  const startRow = (filteredData.page - 1) * 10 + 1;
  const endRow = Math.min(filteredData.page * 10, filteredData.totalDocs);
  const totalRows = filteredData.totalDocs;

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">GST Report</h1>
          </div>
          <div className="mt-5">
            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="mt-3">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label htmlFor="store" className="form-label font-weight-500">
                    Select Store
                  </label>
                  <Select
                    options={storeData.map((vendor) => ({
                      value: vendor._id,
                      label: `${vendor.name}`,
                    }))}
                    value={formik.values.store}
                    onChange={(options) =>
                      formik.setFieldValue("store", options || [])
                    }
                    onBlur={() => formik.setFieldTouched("store", true)}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                    id="store"
                    isMulti
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label htmlFor="from" className="form-label font-weight-500">
                    Date From
                  </label>
                  <DatePicker
                    selected={formik.values.from}
                    onChange={(date) => formik.setFieldValue("from", date)}
                    onBlur={() => formik.setFieldTouched("from", true)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    id="from"
                    name="from"
                    autoComplete="off"
                    placeholderText="Select date"
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label htmlFor="to" className="form-label font-weight-500">
                    Date To
                  </label>
                  <DatePicker
                    selected={formik.values.to}
                    onChange={(date) => formik.setFieldValue("to", date)}
                    onBlur={() => formik.setFieldTouched("to", true)}
                    dateFormat="dd/MM/yyyy"
                    className="form-control"
                    id="to"
                    name="to"
                    autoComplete="off"
                    placeholderText="Select date"
                  />
                </div>
                <div className="col-12 d-flex gap-2 mt-3">
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading && (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                    )}
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">GST Report</h6>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center px-3 mt-3">
              <div className="mb-4 col-md-6">
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="btn btn-primary"
                type="submit"
                onClick={() => exportToExcel("GstReport")}
                disabled={loadingDownload || !formattedData.length}
              >
                {loadingDownload && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                )}
                Download
              </button>
            </div>
            <div className="card-body p-0">
              {/* Search */}

              {/* Table */}
              <div className="table-responsive px-2">
                <table className="table table-sm">
                  <thead className="text-xs text-uppercase text-muted bg-light border">
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
                  <tbody className="text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan="16" className="text-center">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : formattedData.length > 0 ? (
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
                            row.original.details?.length > 0 && (
                              <tr>
                                <td colSpan="16" className="p-3">
                                  <div className="bg-light p-3">
                                    <h6>Order Details</h6>
                                    <table className="table table-bordered table-sm">
                                      <thead>
                                        <tr>
                                          <th>Type</th>
                                          <th>Display Name</th>
                                          <th>SKU</th>
                                          <th>Item</th>
                                          <th>Rate</th>
                                          <th>CGST</th>
                                          <th>SGST</th>
                                          <th>Narration</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {row.original.details.map(
                                          (detail, index) => (
                                            <tr
                                              key={`${row.id}-detail-${index}`}
                                            >
                                              <td>{detail.type}</td>
                                              <td>
                                                {detail.displayName || "-"}
                                              </td>
                                              <td>{detail.sku}</td>
                                              <td>{detail.item}</td>
                                              <td>
                                                {detail.rate?.toFixed(2) || 0}
                                              </td>
                                              <td>
                                                {detail.cgst?.toFixed(2) || 0}
                                              </td>
                                              <td>
                                                {detail.sgst?.toFixed(2) || 0}
                                              </td>
                                              <td>{detail.narration}</td>
                                            </tr>
                                          )
                                        )}
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
                        <td colSpan="16" className="text-center">
                          No results found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="d-flex px-3 pb-3 flex-column flex-sm-row justify-content-between align-items-center mt-3">
                <div className="text-sm text-muted mb-3 mb-sm-0">
                  Showing <span className="fw-medium">{startRow}</span> to{" "}
                  <span className="fw-medium">{endRow}</span> of{" "}
                  <span className="fw-medium">{totalRows}</span> results
                </div>
                <div className="btn-group">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() =>
                      fetchOrders({
                        fromDate: formik.values.from?.getTime(),
                        toDate: formik.values.to?.getTime(),
                        page: filteredData.page - 1,
                        stores: storesIdsData,
                        search: debouncedQuery,
                      })
                    }
                    disabled={!filteredData.hasPrevPage}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() =>
                      fetchOrders({
                        fromDate: formik.values.from?.getTime(),
                        toDate: formik.values.to?.getTime(),
                        page: filteredData.page + 1,
                        stores: storesIdsData,
                        search: debouncedQuery,
                      })
                    }
                    disabled={!filteredData.hasNextPage}
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

export default GstReportCom;
