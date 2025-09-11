import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { reportService } from "../../../services/reportService";
import { recallService } from "../../../services/recallService";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const RecallReportForm = () => {
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [expandedRows, setExpandedRows] = useState([]); // New state for expanded rows
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalDocs: 0,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const user = JSON.parse(localStorage.getItem("user"));

  // Static data for folders
  const folders = [
    "Demo Pictures",
    "Demo%20Pictures",
    "Sale",
    "Testing",
    "glasses",
    "invoice",
    "photos",
    "store",
  ];

  // Formik setup
  const formik = useFormik({
    initialValues: {
      store: [],
      from: new Date(),
      to: new Date(),
    },
    onSubmit: (values) => {
      // Reset to first page on filter submit
      setPagination((p) => ({ ...p, page: 1 }));
      fetchReportData(values, 1, pagination.limit);
    },
  });

  // Fetch today's report on mount

  // Options for Select Store
  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  // Options for Select Status
  const statusOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  useEffect(() => {
    const storedStoreId = user?.stores?.[0];
    if (storedStoreId && storeData.length > 0) {
      const defaultStore = storeData.find(
        (store) => store._id === storedStoreId
      );
      if (defaultStore) {
        formik.setFieldValue("store", [
          {
            value: defaultStore._id,
            label: defaultStore.name,
          },
        ]);
      }
    }
  }, [storeData, formik, user]);

  useEffect(() => {
    getStores();
  }, []);

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await reportService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
        console.log(response, "jhvhjvjhvjghv");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async (
    formValues,
    page = pagination.page,
    limit = pagination.limit
  ) => {
    setLoading(true);
    try {
      const body = {
        stores:
          Array.isArray(formValues.store) && formValues.store.length > 0
            ? formValues.store.map((store) => store.value)
            : ["638b1a079f67a63ea1e1ba01"],
        // stores: ["638b1a079f67a63ea1e1ba01"],

        status:
          selectedStatus.length > 0 ? selectedStatus[0].value === "yes" : true,
        startDate: formValues.from
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-"),
        endDate: formValues.to.toLocaleDateString("en-GB").replace(/\//g, "-"),
        page,
        limit,
      };

      const result = await recallService.getRecallReport(body);
      if (result.success) {
        // Normalize response and docs for both paginated and non-paginated shapes
        const raw = result.data;
        const dataNode = raw?.data ?? raw;
        const sourceArray = Array.isArray(dataNode?.docs)
          ? dataNode.docs
          : Array.isArray(dataNode)
          ? dataNode
          : Array.isArray(raw)
          ? raw
          : [];

        const mappedData = sourceArray.map((item, index) => ({
          id: index + 1,
          lastInvoiceDate: item?.createdAt
            ? new Date(item.createdAt).toISOString().split("T")[0]
            : "N/A",
          customerName: item?.salesId?.customerName || "N/A",
          customerNumber: item?.salesId?.customerPhone || "N/A",
          totalInvoiceValue:
            typeof item?.salesId?.netAmount === "number"
              ? `$${item.salesId.netAmount.toFixed(2)}`
              : "$0.00",
          recallDate: item?.recallDate
            ? new Date(item.recallDate).toISOString().split("T")[0]
            : "N/A",
          previousNotes: item?.updateNotes || "No notes",
          orders: Array.isArray(item?.salesId?.orders)
            ? item.salesId.orders.map((order, orderIndex) => ({
                id: `${item?._id || "row"}-${orderIndex + 1}`,
                lensSku: order?.lens?.sku || "N/A",
                leftlensSku: order?.leftLens?.sku || "N/A",
                rightlensSku: order?.rightLens?.sku || "N/A",
                status: order?.status || "N/A",
                productSku: order?.product?.sku || "N/A",
              }))
            : [], // Map orders for nested table
        }));
        setReportData(mappedData);
        // Compute pagination even if flags are missing
        const totalDocs =
          (dataNode && (dataNode.totalDocs ?? dataNode.total)) ??
          sourceArray.length;
        const currentPage = dataNode?.page ?? page;
        const currentLimit = dataNode?.limit ?? limit;
        const totalPages =
          dataNode?.totalPages ??
          Math.ceil((totalDocs || 0) / (currentLimit || 1));
        const hasPrevPage =
          typeof dataNode?.hasPrevPage === "boolean"
            ? dataNode.hasPrevPage
            : currentPage > 1;
        const hasNextPage =
          typeof dataNode?.hasNextPage === "boolean"
            ? dataNode.hasNextPage
            : currentPage < totalPages;

        setPagination({
          page: currentPage,
          limit: currentLimit,
          totalDocs,
          totalPages,
          hasPrevPage,
          hasNextPage,
        });
      } else {
        toast.error(result.message);
        setReportData([]);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to fetch report data");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchOnMountRef = useRef(fetchReportData);
  useEffect(() => {
    const today = new Date();
    fetchOnMountRef.current({ store: [], from: today, to: today });
  }, []);
  // Toggle row expansion
  const toggleSplit = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <main>
      {/* Asset Selection Modal */}
      <div
        className={`modal fade ${showAssetModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        aria-hidden={!showAssetModal}
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Select Assets</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAssetModal(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="container-fluid">
                <div className="row mb-4">
                  <div className="col">
                    <h6>Folders</h6>
                    <div className="row mt-3">
                      <div className="col-auto">
                        <button type="button" className="btn btn-primary">
                          Back
                        </button>
                      </div>
                      {folders.map((folder, index) => (
                        <div key={index} className="col-3 text-center mb-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="70"
                            height="70"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="cursor-pointer"
                          >
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0  1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                          </svg>
                          <p className="truncate">{folder}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <h6>Assets</h6>
                    <div className="row">{/* Empty grid for assets */}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowAssetModal(false)}
              >
                Select
              </button>
            </div>
          </div>
        </div>
      </div>
      {showAssetModal && <div className="modal-backdrop fade show"></div>}

      {/* Main Content */}
      <div className="container-fluid py-4 px-5">
        <h1 className="mb-4">Recall Report</h1>
        <div className="card">
          <div className="card-body">
            <form className="mb-4" onSubmit={formik.handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label htmlFor="store" className="form-label">
                    Select Store
                  </label>
                  <Select
                    isMulti
                    isLoading={loading}
                    options={storeOptions}
                    value={formik.values.store}
                    onChange={(option) => formik.setFieldValue("store", option)}
                    onBlur={() => formik.setFieldTouched("store", true)}
                    placeholder="Select..."
                    classNamePrefix="react-select"
                    id="store"
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="isRecall" className="form-label">
                    Select Status
                  </label>
                  <Select
                    id="isRecall"
                    isMulti
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    classNamePrefix="react-select"
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="from" className="form-label">
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
                <div className="col-md-3">
                  <label htmlFor="to" className="form-label">
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
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </form>

            {/* Table */}
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <h4>Loading Data...</h4>
              </div>
            ) : (
              <div className="table-responsive">
                <table
                  className="table custom-table1"
                  style={{ minWidth: "900px", borderCollapse: "collapse" }}
                >
                  <thead className="custom-th">
                    <tr>
                      <th>Last Invoice Date</th>
                      <th>Customer Name</th>
                      <th>Customer Number</th>
                      <th>Total Invoice Value</th>
                      <th>Recall Date</th>
                      <th>Previous Notes</th>
                      <th></th> {/* Column for expand arrow */}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <tr style={{ borderTop: "1px solid #dee2e6" }}>
                          <td>{item.lastInvoiceDate}</td>
                          <td>{item.customerName}</td>
                          <td>{item.customerNumber}</td>
                          <td style={{ color: "blue", cursor: "pointer" }}>
                            {item.totalInvoiceValue}
                          </td>
                          <td>{item.recallDate}</td>
                          <td>
                            <span
                              style={{
                                textDecoration: "underline",
                                color: "blue",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setSelectedNotes(item.previousNotes);
                                setShowNotesModal(true);
                              }}
                            >
                              View Notes
                            </span>
                          </td>
                          <td
                            className="text-center cursor-pointer"
                            onClick={() => toggleSplit(index)}
                          >
                            {expandedRows.includes(index) ? (
                              <FaAngleDown />
                            ) : (
                              <FaAngleRight />
                            )}
                          </td>
                          <td></td>
                        </tr>
                        {expandedRows.includes(index) && (
                          <tr>
                            <td colSpan={8} className="p-0">
                              <div className="table-responsive">
                                <table
                                  className="table mb-0"
                                  style={{
                                    minWidth: "900px",
                                    borderCollapse: "collapse",
                                    border: "none",
                                  }}
                                >
                                  <thead>
                                    <tr
                                      className="small text-primary-emphasis bg-light"
                                      style={{
                                        fontWeight: "bold",
                                        border: "none",
                                      }}
                                    >
                                      <th
                                        className="py-2 px-2"
                                        style={{ border: "none" }}
                                      >
                                        Product Sku
                                      </th>
                                      <th
                                        className="py-2 px-2"
                                        style={{ border: "none" }}
                                      >
                                        Left Lens SKU
                                      </th>
                                      <th
                                        className="py-2 px-2"
                                        style={{ border: "none" }}
                                      >
                                        Right Lens SKU
                                      </th>
                                      <th
                                        className="py-2 px-2"
                                        style={{ border: "none" }}
                                      >
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.orders.map((order) => (
                                      <tr
                                        key={order.id}
                                        style={{ border: "none" }}
                                      >
                                        <td
                                          className="py-1 px-2"
                                          style={{ border: "none" }}
                                        >
                                          {order.productSku || order.lensSku}
                                        </td>
                                        <td
                                          className="py-1 px-2"
                                          style={{ border: "none" }}
                                        >
                                          {order.leftlensSku}
                                        </td>
                                        <td
                                          className="py-1 px-2"
                                          style={{ border: "none" }}
                                        >
                                          {order.rightlensSku}
                                        </td>
                                        <td
                                          className="py-1 px-2"
                                          style={{ border: "none" }}
                                        >
                                          {order.status}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination Footer */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              {(() => {
                const startRow =
                  pagination.totalDocs === 0
                    ? 0
                    : (pagination.page - 1) * pagination.limit + 1;
                const endRow = Math.min(
                  pagination.page * pagination.limit,
                  pagination.totalDocs
                );
                return (
                  <p className="mb-0">
                    Showing <span className="fw-medium">{startRow}</span> to{" "}
                    <span className="fw-medium">{endRow}</span> of{" "}
                    <span className="fw-medium">{pagination.totalDocs}</span>{" "}
                    results
                  </p>
                );
              })()}
              <div className="btn-group">
                <button
                  className="btn btn-outline-primary"
                  onClick={() =>
                    fetchReportData(
                      formik.values,
                      pagination.page - 1,
                      pagination.limit
                    )
                  }
                  disabled={!pagination.hasPrevPage || loading}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() =>
                    fetchReportData(
                      formik.values,
                      pagination.page + 1,
                      pagination.limit
                    )
                  }
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      <div
        className={`modal fade ${showNotesModal ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        aria-hidden={!showNotesModal}
      >
        <div
          className="modal-dialog modal-lg"
          style={{ marginTop: "15%", width: "30%" }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div className="font-weight-bold text-dark modal-title h4">
                Notes
              </div>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowNotesModal(false)}
              ></button>
            </div>
            <div className="p-3 modal-body">
              <form>
                <div className="mb-3">
                  <h6 className="font-weight-bold">Recall Update Notes</h6>
                  <input
                    placeholder="No recall update notes available"
                    disabled
                    className="mt-2 form-control"
                    type="text"
                    value={selectedNotes || ""}
                  />
                </div>
                <div className="mb-3">
                  <h6 className="font-weight-bold mt-2">Reschedule Notes</h6>
                  <input
                    placeholder="No reschedule notes available"
                    disabled
                    className="mt-2 form-control"
                    type="text"
                    value="No notes available" // Replace with actual reschedule notes if available
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {showNotesModal && <div className="modal-backdrop fade show"></div>}
    </main>
  );
};

export default RecallReportForm;
