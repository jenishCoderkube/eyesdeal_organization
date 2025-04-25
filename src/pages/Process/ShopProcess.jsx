import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaAngleRight, FaAngleDown } from "react-icons/fa6";
import BillModel from "../../components/Process/BillModel";
import PrescriptionModel from "../../components/Process/PrescriptionModel";
import RAModel from "../../components/Process/RAModel";
import NotesModel from "../../components/Process/NotesModel";
import AssignPowerModel from "../../components/Process/AssignPowerModel";
import { useNavigate } from "react-router-dom";
import CustomerNameModal from "../../components/Process/Vendor/CustomerNameModal";
import { toast } from "react-toastify";
import { shopProcessService } from "../../services/Process/shopProcessService";
import { useFormik } from "formik";
import * as Yup from "yup";
import generateInvoicePDF from "../../components/Process/generateInvoicePDF";

// Debounce utility to prevent rapid API calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

function ShopProcess() {
  const [activeStatus, setActiveStatus] = useState("Pending");
  const [expandedRows, setExpandedRows] = useState([]);
  const [BillModalVisible, setBillModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [PrescriptionModelVisible, setPrescriptionModelVisible] =
    useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [RAModalVisible, setRAModalVisible] = useState(false);
  const [selectedRA, setSelectedRA] = useState(null);
  const [NotesModalVisible, setNotesModalVisible] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState(null);
  const [APModalVisible, setAPModalVisible] = useState(false);
  const [selectedAP, setSelectedAP] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [productTableData, setProductTableData] = useState([]);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    inProcess: 0,
    ready: 0,
    delivered: 0,
    returned: 0,
  });
  const navigate = useNavigate();

  const users = useMemo(
    () =>
      JSON.parse(localStorage.getItem("user")) || {
        _id: "638b1a079f67a63ea1e1ba01",
        phone: "917777900910",
        name: "Rizwan",
        role: "admin",
        stores: ["64e30076c68b7b37a98b4b4c"],
      },
    []
  );

  const isInitialLoad = useRef(true);
  const currentFilters = useRef({
    stores: [],
    startDate: null,
    endDate: null,
    search: "",
    status: "pending",
  });
  const lastSalesCallParams = useRef(null);
  const lastCountsCallParams = useRef(null);

  const formik = useFormik({
    initialValues: {
      startDate: null,
      endDate: null,
      stores: [],
      search: "",
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      const newFilters = {
        stores: values.stores.length
          ? values.stores.map((store) => store.value)
          : users.stores,
        startDate: values.startDate,
        endDate: values.endDate,
        search: values.search,
        status: getStatusForTab(activeStatus),
      };
      isInitialLoad.current = false;
      currentFilters.current = newFilters;
      fetchSalesAndCounts(newFilters);
    },
  });

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await shopProcessService.getStores();
      if (response.success) {
        setStoreData(response.data.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching stores");
    } finally {
      setLoading(false);
    }
  };

  const getStatusForTab = useCallback((status) => {
    switch (status) {
      case "In Process":
        return ["inWorkshop", "inLab", "inFitting"];
      case "Ready":
        return "ready";
      case "Delivered":
        return "delivered";
      case "Returned":
        return "returned";
      case "Pending":
      default:
        return "pending";
    }
  }, []);

  const clearTableData = useCallback(() => {
    setTableData([]);
    setProductTableData([]);
    setExpandedRows([]);
    lastSalesCallParams.current = null;
    lastCountsCallParams.current = null;
  }, []);

  const fetchSalesData = useCallback(
    async (filters, forceRefresh = false) => {
      const callKey = JSON.stringify({
        stores: filters.stores,
        status: filters.status,
        search: filters.search,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        createdAtGte:
          filters.status === "delivered" ? "1742841000000" : undefined,
        createdAtLte:
          filters.status === "delivered" ? "1745519399999" : undefined,
        populate: isInitialLoad.current ? true : undefined,
      });

      if (!forceRefresh && lastSalesCallParams.current === callKey) {
        console.log("Skipping sales API call due to identical parameters");
        return;
      }

      setLoading(true);
      lastSalesCallParams.current = callKey;
      console.log("Fetching sales data with filters:", filters);

      try {
        const params = {
          status: filters.status,
          search: filters.search || "",
          startDate: filters.startDate,
          endDate: filters.endDate,
          createdAtGte:
            filters.status === "delivered" ? "1742841000000" : undefined,
          createdAtLte:
            filters.status === "delivered" ? "1745519399999" : undefined,
          populate: isInitialLoad.current ? true : undefined,
        };
        if (!isInitialLoad.current) {
          params.stores = filters.stores.length ? filters.stores : users.stores;
        }

        const response = await shopProcessService.getSales(params);
        if (response.success) {
          console.log("Sales API response:", response);
          const sales = response.data.data.docs;
          setTableData(
            sales.map((sale) => ({
              _id: sale._id,
              date: new Date(sale.createdAt).toISOString().split("T")[0],
              billNumber: sale.saleNumber,
              customerName: sale.customerName,
              phone: sale.customerPhone,
              totalItems: sale.totalQuantity,
              receivedAmount: sale.receivedAmount?.length
                ? sale.receivedAmount.reduce(
                    (sum, amt) => sum + (amt.amount || 0),
                    0
                  )
                : 0,
              remainingAmount:
                sale.netAmount -
                (sale.receivedAmount?.length
                  ? sale.receivedAmount.reduce(
                      (sum, amt) => sum + (amt.amount || 0),
                      0
                    )
                  : 0),
              notes: sale.note || "N/A",
              action: "Edit",
              fullSale: sale,
            }))
          );
          setProductTableData(
            sales.flatMap((sale) =>
              sale.orders.map((order, index) => ({
                id: `${sale._id}-${index + 1}`,
                saleId: sale._id,
                selected: false,
                productSku: order.product?.sku || "N/A",
                lensSku: order.lens?.sku || "N/A",
                status: order.status || "N/A",
                barcode: order.product?.barcode || order.lens?.barcode || "N/A",
                srp:
                  order.product?.srp ||
                  order.lens?.srp ||
                  order.perPieceAmount ||
                  0,
                orderId: order._id,
              }))
            )
          );
        } else {
          toast.error(response.data.message);
          setTableData([]);
          setProductTableData([]);
        }
      } catch (error) {
        toast.error("Error fetching sales data");
        console.error("Sales API error:", error);
        setTableData([]);
        setProductTableData([]);
      } finally {
        setLoading(false);
      }
    },
    [users.stores]
  );

  const fetchCounts = useCallback(
    async (filters) => {
      const callKey = JSON.stringify({
        stores: filters.stores,
        search: filters.search,
      });

      if (lastCountsCallParams.current === callKey) {
        return;
      }

      lastCountsCallParams.current = callKey;

      try {
        const params = isInitialLoad.current
          ? {}
          : {
              stores: filters.stores.length ? filters.stores : null,
              search: filters.search || "",
            };

        const [orderResponse, returnResponse] = await Promise.all([
          shopProcessService.getOrderCount(params),
          shopProcessService.getSaleReturnCount(params),
        ]);

        if (orderResponse.success && orderResponse.data.data.docs[0]) {
          const orderCounts = orderResponse.data.data.docs[0];
          setStatusCounts((prev) => ({
            ...prev,
            pending: orderCounts.pendingCount || 0,
            inProcess:
              (orderCounts.inWorkshopCount || 0) +
              (orderCounts.inLabCount || 0) +
              (orderCounts.inFittingCount || 0),
            ready: orderCounts.readyCount || 0,
            delivered: orderCounts.deliveredCount || 0,
          }));
        }

        if (returnResponse.success) {
          setStatusCounts((prev) => ({
            ...prev,
            returned: returnResponse.data.data.docs[0]?.returnedCount || 0,
          }));
        }
      } catch (error) {
        toast.error("Error fetching counts");
      }
    },
    [users.stores]
  );

  const fetchSalesAndCounts = useCallback(
    debounce((filters, forceRefresh = false) => {
      console.log(
        "fetchSalesAndCounts called with filters:",
        filters,
        "forceRefresh:",
        forceRefresh
      );
      setTabLoading(true);
      Promise.all([
        fetchSalesData(filters, forceRefresh),
        fetchCounts(filters),
      ]).finally(() => {
        setTabLoading(false);
      });
    }, 300),
    [fetchSalesData, fetchCounts]
  );

  useEffect(() => {
    clearTableData();
    setTabLoading(true);

    if (isInitialLoad.current) {
      getStores();
    }

    const filters = {
      ...currentFilters.current,
      status: getStatusForTab(activeStatus),
    };
    fetchSalesAndCounts(filters);

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }
  }, [activeStatus, getStatusForTab, fetchSalesAndCounts, clearTableData]);

  const refreshSalesData = useCallback(async () => {
    try {
      console.log(
        "refreshSalesData called with currentFilters:",
        currentFilters.current
      );
      lastSalesCallParams.current = null;
      await fetchSalesAndCounts(currentFilters.current, true);
    } catch (error) {
      console.error("Error in refreshSalesData:", error);
      toast.error("Failed to refresh sales data");
    }
  }, [fetchSalesAndCounts]);

  const storeOptions = storeData.map((store) => ({
    value: store._id,
    label: store.name,
  }));

  const statuses = [
    { name: "Pending", count: statusCounts.pending },
    { name: "In Process", count: statusCounts.inProcess },
    { name: "Ready", count: statusCounts.ready },
    { name: "Delivered", count: statusCounts.delivered },
    { name: "Returned", count: statusCounts.returned },
  ];

  const toggleSplit = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleSelect = (id) => {
    setProductTableData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, selected: !row.selected } : row
      )
    );
  };

  const openBillModal = (row) => {
    setSelectedBill(row.fullSale);
    setBillModalVisible(true);
  };

  const closeBillModal = () => {
    setBillModalVisible(false);
    setSelectedBill(null);
  };

  const openCustomerNameModal = (row) => {
    setSelectedRow(row.fullSale);
    setShowCustomerModal(true);
  };

  const closeCustomerNameModal = () => {
    setShowCustomerModal(false);
    setSelectedRow(null);
  };

  const openRAModal = (RA) => {
    setSelectedRA(RA);
    setRAModalVisible(true);
  };

  const closeRAModal = () => {
    setRAModalVisible(false);
    setSelectedRA(null);
  };

  const openNotesModal = (Notes) => {
    setSelectedNotes(Notes);
    setNotesModalVisible(true);
  };

  const closeNotesModal = () => {
    setNotesModalVisible(false);
    setSelectedNotes(null);
  };

  const openAPModal = (AP) => {
    setSelectedAP(AP);
    setAPModalVisible(true);
  };

  const closeAPModal = () => {
    setAPModalVisible(false);
    setSelectedAP(null);
  };

  const handleSendToWorkshop = async () => {
    const selectedOrders = productTableData
      .filter((row) => row.selected)
      .map((row) => ({ id: row.id, orderId: row.orderId }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }

    setLoading(true);
    let successCount = 0;

    for (const order of selectedOrders) {
      const response = await shopProcessService.updateOrderStatus(
        order.orderId,
        "inWorkshop"
      );
      if (response.success) {
        successCount++;
        setProductTableData((prev) =>
          prev.map((row) =>
            row.id === order.id
              ? { ...row, status: "inWorkshop", selected: false }
              : row
          )
        );
      } else {
        toast.error(
          `Failed to send order ${order.id} to workshop: ${response.message}`
        );
      }
    }

    setLoading(false);
    if (successCount > 0) {
      toast.success(`${successCount} order(s) sent to workshop successfully`);
      fetchSalesAndCounts(currentFilters.current);
    }
  };

  const handleSendToReady = async () => {
    const selectedOrders = productTableData
      .filter((row) => row.selected)
      .map((row) => ({ id: row.id, orderId: row.orderId }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }

    setLoading(true);
    let successCount = 0;

    for (const order of selectedOrders) {
      const response = await shopProcessService.updateOrderStatus(
        order.orderId,
        "ready"
      );
      if (response.success) {
        successCount++;
        setProductTableData((prev) =>
          prev.map((row) =>
            row.id === order.id
              ? { ...row, status: "ready", selected: false }
              : row
          )
        );
      } else {
        toast.error(
          `Failed to send order ${order.id} to Ready: ${response.message}`
        );
      }
    }

    setLoading(false);
    if (successCount > 0) {
      toast.success(`${successCount} order(s) sent to Ready successfully`);
      fetchSalesAndCounts(currentFilters.current);
    }
  };

  const handleDeliver = async () => {
    const selectedOrders = productTableData
      .filter((row) => row.selected)
      .map((row) => ({ id: row.id, orderId: row.orderId }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }

    setLoading(true);
    let successCount = 0;

    for (const order of selectedOrders) {
      const response = await shopProcessService.updateOrderStatus(
        order.orderId,
        "delivered"
      );
      if (response.success) {
        successCount++;
        setProductTableData((prev) =>
          prev.map((row) =>
            row.id === order.id
              ? { ...row, status: "delivered", selected: false }
              : row
          )
        );
      } else {
        toast.error(`Failed to deliver order ${order.id}: ${response.message}`);
      }
    }

    setLoading(false);
    if (successCount > 0) {
      toast.success(`${successCount} order(s) delivered successfully`);
      fetchSalesAndCounts(currentFilters.current);
    }
  };
  const handleDeleteSale = async (saleId) => {
    setLoading(true);
    try {
      const response = await shopProcessService.deleteSale(saleId);
      if (response.success) {
        toast.success("Sale deleted successfully");
        await refreshSalesData(); // Refresh sales data
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to delete sale");
      console.error("deleteSale API Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const hasSelectedProducts = productTableData.some((row) => row.selected);
  const openBillInNewTab = (row) => {
    const pdfUrl = generateInvoicePDF(row.fullSale);
    window.open(pdfUrl, "_blank");
  };
  return (
    <div className="mt-4 px-3">
      <form onSubmit={formik.handleSubmit}>
        <div className="row g-1 align-items-end">
          <div className="col-12 col-md-6 d-flex flex-nowrap gap-3 align-items-end pe-3">
            <div className="col-6 col-md-4">
              <label htmlFor="startDate" className="form-label fw-semibold">
                Start Date
              </label>
              <DatePicker
                selected={formik.values.startDate}
                onChange={(date) => formik.setFieldValue("startDate", date)}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                isClearable
                autoComplete="off"
              />
            </div>
            <div className="col-6 col-md-4">
              <label htmlFor="endDate" className="form-label fw-semibold">
                End Date
              </label>
              <DatePicker
                selected={formik.values.endDate}
                onChange={(date) => formik.setFieldValue("endDate", date)}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                isClearable
                autoComplete="off"
              />
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="row g-3 align-items-end">
              <div className="col-6">
                <input
                  type="text"
                  id="search"
                  name="search"
                  className="form-control"
                  placeholder="Search..."
                  value={formik.values.search}
                  onChange={formik.handleChange}
                />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold">Stores</label>
                <Select
                  options={storeOptions}
                  value={formik.values.stores}
                  onChange={(selected) =>
                    formik.setFieldValue("stores", selected || [])
                  }
                  isMulti
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select stores..."
                />
                {formik.touched.stores && formik.errors.stores && (
                  <div className="text-danger">{formik.errors.stores}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-4">
          Submit
        </button>
      </form>

      <div className="overflow-x-auto mt-4">
        <div className="d-flex gap-3 pb-2" style={{ minWidth: "600px" }}>
          {statuses.map((status) => (
            <button
              key={status.name}
              onClick={() => setActiveStatus(status.name)}
              className={`bg-transparent border-0 pb-2 px-1 fw-medium ${
                activeStatus === status.name
                  ? "text-primary border-bottom border-primary"
                  : "text-secondary"
              } hover:text-dark focus:outline-none`}
              style={{ boxShadow: "none", outline: "none" }}
            >
              {status.name} ({status.count})
            </button>
          ))}
        </div>
      </div>

      <div
        className="border-bottom"
        style={{ margin: "-9px 0px 33px 0px" }}
      ></div>

      {hasSelectedProducts &&
        activeStatus !== "Returned" &&
        activeStatus !== "In Process" && (
          <div className="mb-3">
            {activeStatus === "Pending" && (
              <button
                className="btn btn-outline-primary me-2"
                onClick={handleSendToWorkshop}
                disabled={loading}
              >
                {loading ? "Processing..." : "Send To Workshop"}
              </button>
            )}
            <button
              className="btn btn-outline-success mx-3"
              onClick={handleDeliver}
              disabled={loading}
            >
              {loading ? "Processing..." : "Deliver"}
            </button>
            {activeStatus === "Ready" && (
              <button
                className="btn btn-outline-primary me-2"
                onClick={handleSendToReady}
                disabled={loading}
              >
                {loading ? "Processing..." : "Ready"}
              </button>
            )}
          </div>
        )}

      <div className="table-responsive overflow-x-auto">
        {loading || tabLoading ? (
          <div
            style={{
              width: "100%",
              height: "300px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="spinner-border m-5" role="status">
              <span className="sr-only"></span>
            </div>
          </div>
        ) : tableData.length === 0 ? (
          <div
            style={{
              width: "100%",
              height: "300px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p>No data available for {activeStatus} status.</p>
          </div>
        ) : (
          <table
            className="table"
            style={{ minWidth: "900px", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                {activeStatus === "Returned"
                  ? [
                      "DATE",
                      "CUSTOMER NAME",
                      "PHONE",
                      "TOTAL ITEMS",
                      "RECEIVED AMOUNT",
                      "",
                    ]
                  : [
                      "DATE",
                      "BILL NUMBER",
                      "CUSTOMER NAME",
                      "PHONE",
                      "TOTAL ITEMS",
                      "RECEIVED AMOUNT",
                      "REMAINING AMOUNT",
                      "NOTES",
                      "",
                      "ACTION",
                    ].map((heading, idx) => (
                      <th
                        key={idx}
                        className="border-top border-bottom text-uppercase small fw-semibold"
                        style={{
                          backgroundColor: "#f2f7fc",
                          color: "#64748b",
                          padding: "12px",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <React.Fragment key={row._id}>
                  <tr style={{ borderTop: "1px solid #dee2e6" }}>
                    <td
                      style={{
                        minWidth: "100px",
                        paddingTop: "12px",
                        paddingBottom: "12px",
                      }}
                    >
                      {row.date}
                    </td>
                    {activeStatus !== "Returned" && (
                      <>
                        <td
                          style={{
                            minWidth: "110px",
                            cursor: "pointer",
                            color: "#0d6efd",
                            textDecoration: "underline",
                          }}
                          onClick={() => openBillModal(row)}
                        >
                          {row.billNumber}
                        </td>
                        <td
                          style={{
                            minWidth: "160px",
                            cursor: "pointer",
                            color: "#0d6efd",
                            textDecoration: "underline",
                          }}
                          onClick={() => openCustomerNameModal(row)}
                        >
                          {row.customerName}
                        </td>
                        <td
                          style={{
                            minWidth: "102px",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                          }}
                        >
                          {row.phone}
                        </td>
                        <td
                          style={{
                            minWidth: "105px",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                          }}
                        >
                          {row.totalItems}
                        </td>
                        <td
                          style={{
                            minWidth: "150px",
                            cursor: "pointer",
                            color: "#0d6efd",
                            textDecoration: "underline",
                          }}
                          onClick={() => openRAModal(row)}
                        >
                          {row.receivedAmount}
                        </td>
                        <td
                          style={{
                            minWidth: "165px",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                          }}
                        >
                          {row.remainingAmount}
                        </td>
                        <td
                          style={{
                            minWidth: "250px",
                            maxWidth: "250px",
                            cursor: "pointer",
                            color: "#0d6efd",
                            textDecoration: "underline",
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                          }}
                          onClick={() => openNotesModal(row)}
                        >
                          {row.notes}
                        </td>
                      </>
                    )}
                    {activeStatus === "Returned" && (
                      <>
                        <td style={{ minWidth: "160px" }}>
                          {row.customerName}
                        </td>
                        <td
                          style={{
                            minWidth: "102px",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                          }}
                        >
                          {row.phone}
                        </td>
                        <td
                          style={{
                            minWidth: "105px",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                          }}
                        >
                          {row.totalItems}
                        </td>
                        <td style={{ minWidth: "150px" }}>
                          {row.receivedAmount}
                        </td>
                      </>
                    )}
                    <td
                      style={{
                        minWidth: "20px",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                      onClick={() => toggleSplit(index)}
                    >
                      {expandedRows.includes(index) ? (
                        <FaAngleDown />
                      ) : (
                        <FaAngleRight />
                      )}
                    </td>
                    {activeStatus !== "Returned" && (
                      <td className="text-center align-middle">
                        {activeStatus === "Pending" && (
                          <div className="d-flex flex-column align-items-center justify-content-center">
                            <button
                              className="btn btn-sm btn-danger border px-0 py-2 mb-2"
                              style={{ minWidth: "60px", width: "80px" }}
                              onClick={() => handleDeleteSale(row._id)}
                              disabled={loading}
                            >
                              {loading ? "Deleting..." : "Delete"}
                            </button>
                            <button
                              className="btn btn-sm border px-2 py-2 mb-2"
                              style={{ minWidth: "80px", width: "100px" }}
                              onClick={() => openAPModal(row)}
                            >
                              Assign Power
                            </button>
                            <button
                              className="btn btn-sm border px-2 py-2"
                              style={{ minWidth: "60px", width: "80px" }}
                              onClick={() => openBillInNewTab(row)}
                            >
                              View Bill
                            </button>
                          </div>
                        )}
                        {activeStatus === "In Process" && (
                          <button
                            className="btn btn-sm border px-2 py-2"
                            style={{ minWidth: "60px", width: "80px" }}
                            onClick={() => openBillInNewTab(row)}
                          >
                            View Bill
                          </button>
                        )}
                        {(activeStatus === "Ready" ||
                          activeStatus === "Delivered") && (
                          <div className="d-flex flex-column align-items-center justify-content-center">
                            <button
                              className="btn btn-sm border px-2 py-2 mb-2 btn-primary"
                              style={{ minWidth: "40px", width: "60px" }}
                              onClick={() =>
                                navigate(`/process/shop/${row._id}`)
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm border px-2 py-2"
                              style={{ minWidth: "60px", width: "80px" }}
                              onClick={() => openBillInNewTab(row)}
                            >
                              View Bill
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                  {expandedRows.includes(index) && (
                    <tr>
                      <td
                        colSpan={activeStatus === "Returned" ? 6 : 10}
                        className="p-0"
                      >
                        <div className="table-responsive overflow-x-auto">
                          <table className="table mb-0">
                            <thead>
                              <tr className="small fw-semibold text-primary-emphasis bg-light">
                                {activeStatus !== "Returned" ? (
                                  <>
                                    <th className="py-3 px-2">Select</th>
                                    <th className="py-3 px-2">Product Sku</th>
                                    <th className="py-3 px-2">Lens Sku</th>``
                                    <th className="py-3 px-2">Status</th>
                                  </>
                                ) : (
                                  <>
                                    <th className="py-3 px-2">Sr No.</th>
                                    <th className="py-3 px-2">Product Sku</th>
                                    <th className="py-3 px-2">Barcode</th>
                                    <th className="py-3 px-2">Srp</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {productTableData
                                .filter((prod) => prod.saleId === row._id)
                                .map((prodRow, prodIndex) => (
                                  <tr key={prodRow.id}>
                                    {activeStatus !== "Returned" ? (
                                      <>
                                        <td>
                                          <input
                                            type="checkbox"
                                            checked={prodRow.selected}
                                            onChange={() =>
                                              handleSelect(prodRow.id)
                                            }
                                          />
                                        </td>
                                        <td style={{ minWidth: "110px" }}>
                                          {prodRow.productSku}
                                        </td>
                                        <td style={{ minWidth: "200px" }}>
                                          {prodRow.lensSku}
                                        </td>
                                        <td style={{ minWidth: "70px" }}>
                                          {prodRow.status}
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td style={{ minWidth: "110px" }}>
                                          {prodIndex + 1}
                                        </td>
                                        <td style={{ minWidth: "110px" }}>
                                          {prodRow.productSku}
                                        </td>
                                        <td style={{ minWidth: "200px" }}>
                                          {prodRow.barcode}
                                        </td>
                                        <td style={{ minWidth: "70px" }}>
                                          {prodRow.srp}
                                        </td>
                                      </>
                                    )}
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
        )}
      </div>

      {BillModalVisible && selectedBill && (
        <BillModel
          selectedBill={selectedBill}
          closeBillModal={closeBillModal}
        />
      )}
      {PrescriptionModelVisible && selectedCust && (
        <PrescriptionModel
          closePrescriptionModel={() => {
            setPrescriptionModelVisible(false);
            setSelectedCust(null);
          }}
          selectedCust={selectedCust}
        />
      )}
      {RAModalVisible && selectedRA && (
        <RAModel
          closeRAModal={closeRAModal}
          selectedRA={selectedRA}
          refreshSalesData={refreshSalesData}
        />
      )}
      {NotesModalVisible && selectedNotes && (
        <NotesModel
          closeNotesModal={closeNotesModal}
          selectedNotes={selectedNotes}
          refreshSalesData={refreshSalesData}
        />
      )}
      {APModalVisible && selectedAP && (
        <AssignPowerModel
          closeAPModal={closeAPModal}
          selectedAP={selectedAP}
          refreshSalesData={refreshSalesData} // Added refreshSalesData prop
        />
      )}
      {showCustomerModal && selectedRow && (
        <CustomerNameModal
          show={showCustomerModal}
          onHide={closeCustomerNameModal}
          selectedRow={selectedRow}
        />
      )}
    </div>
  );
}

export default ShopProcess;
