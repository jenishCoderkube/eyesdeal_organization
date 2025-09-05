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
import PrescriptionModel from "../../components/Process/PrescriptionModel";
import RAModel from "../../components/Process/RAModel";
import NotesModel from "../../components/Process/NotesModel";
import AssignPowerModel from "../../components/Process/AssignPowerModel";
import BillModel from "../../components/Process/BillModel";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { shopProcessService } from "../../services/Process/shopProcessService";
import { workshopService } from "../../services/Process/workshopService";
import { useFormik } from "formik";
import * as Yup from "yup";
import generateInvoicePDF from "../../components/Process/generateInvoicePDF";
import CustomerNameModal from "../../components/Process/Vendor/CustomerNameModal";
import SelectVendorModal from "../../components/Process/WorkshopProcess/SelectVendorModal";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button, Form } from "react-bootstrap";
import { SiWhatsapp } from "react-icons/si";
import WhatsAppModal from "../../components/ReCall/WhatsAppModal";
import OrderImageTemplate from "../../components/Process/WorkshopProcess/OrderImageTemplate";
import html2canvas from "html2canvas";
import EditVendorModal from "../../components/Process/WorkshopProcess/EditVendorModal";
import AddDamagedModal from "../../components/Process/WorkshopProcess/AddDamagedModal";
// Debounce utility to prevent rapid API calls
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

function ShopProcess() {
  const [activeStatus, setActiveStatus] = useState("New Order");
  const [expandedRows, setExpandedRows] = useState([]);
  const [PrescriptionModelVisible, setPrescriptionModelVisible] =
    useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [RAModalVisible, setRAModalVisible] = useState(false);
  const [selectedRA, setSelectedRA] = useState(null);
  const [NotesModalVisible, setNotesModalVisible] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState(null);
  const [APModalVisible, setAPModalVisible] = useState(false);
  const [selectedAP, setSelectedAP] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // New state to track fetch completion
  const [storeData, setStoreData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [productTableData, setProductTableData] = useState([]);
  const [salesReturnProductData, setSalesReturnProductData] = useState([]);
  const [BillModalVisible, setBillModalVisible] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [salesReturn, setSalesReturn] = useState({ returned: [] });
  const [pendingprocessOrder, setPendingVendorData] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false); // New state for WhatsApp modal
  const [downloadOrder, setDownloadOrder] = useState(null);
  const [showEditVendorModal, setShowEditVendorModal] = useState(false);
  const [showAddDamage, setShowAddDamage] = useState(false);
  const downloadRef = useRef(null);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    newOrder: 0,
    inProcess: 0,
    inFitting: 0,
    ready: 0,
    delivered: 0,
    returned: 0,
  });

  const [pagination, setPagination] = useState({
    totalDocs: 0,
    limit: 100,
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  });
  const [selectedRows, setSelectedRows] = useState([]);

  const navigate = useNavigate();
  const localStoreId = localStorage.getItem("store");
  const users = useMemo(
    () =>
      JSON.parse(localStorage.getItem("user")) || {
        _id: "638b1a079f67a63ea1e1ba01",
        phone: "917777900910",
        name: "Rizwan",
        role: "admin",
        stores: [localStoreId],
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
    page: 1,
    limit: 100,
  });
  const lastSalesCallParams = useRef(null);

  // Calculate default dates: today and one month ago
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const formik = useFormik({
    initialValues: {
      startDate: oneMonthAgo,
      endDate: today,
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
        page: 1,
        limit: 100,
      };
      isInitialLoad.current = false;
      currentFilters.current = newFilters;
      setSelectedRows([]); // Reset selected rows on new filter submission
      fetchSalesAndCounts(newFilters, true);
    },
  });

  const getStores = async () => {
    setLoading(true);
    setDataLoaded(false);
    try {
      const response = await shopProcessService.getStores();
      if (response.success) {
        setStoreData(response.data.data);
      } else {
        toast.error(response.message || "Failed to fetch stores");
      }
    } catch (error) {
      toast.error("Error fetching stores");
    } finally {
      // setLoading(false);
      // setDataLoaded(true);
    }
  };

  const getStatusForTab = useCallback((status) => {
    switch (status) {
      case "New Order":
        return "pending";
      case "In Process":
        return ["inWorkshop", "inLab"];
      case "In Fitting":
        return "inFitting";
      case "Ready":
        return "ready";
      case "Delivered":
        return "delivered";
      case "Returned":
        return "returned";

      default:
        return "pending";
    }
  }, []);

  const clearTableData = useCallback(() => {
    setTableData([]);
    setProductTableData([]);
    setSalesReturnProductData([]);
    setExpandedRows([]);
    setSelectedRows([]);
    setPagination({
      totalDocs: 0,
      limit: 100,
      page: 1,
      totalPages: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
    });
    lastSalesCallParams.current = null;
  }, []);

  const fetchSalesData = useCallback(
    async (filters, forceRefresh = false) => {
      const callKey = JSON.stringify({
        stores: filters.stores,
        status: filters.status,
        search: filters.search,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
        page: filters.page,
        limit: filters.limit,
        populate: true,
      });

      if (!forceRefresh && lastSalesCallParams.current === callKey) {
        return;
      }

      setLoading(true);
      setDataLoaded(false);
      lastSalesCallParams.current = callKey;

      try {
        const params = {
          status: filters.status,
          search: filters.search || "",
          startDate: filters.startDate
            ? new Date(filters.startDate).setUTCHours(0, 0, 0, 0) // start of day UTC
            : undefined,
          endDate: filters.endDate
            ? new Date(filters.endDate).setUTCHours(23, 59, 59, 999) // end of day UTC
            : undefined,
          page: filters.page,
          limit: filters.limit,
          populate: true,
        };

        if (!isInitialLoad.current && filters.stores.length) {
          params.stores = filters.stores;
        } else if (users.stores.length) {
          params.stores = users.stores;
        }

        let response;
        response = await shopProcessService.getSales(params); // Use shopProcessService for all statuses

        if (response.success && response.data.data) {
          const sales = response.data.data.docs || [];
          setTableData(
            sales.map((sale) => {
              const totalReceived = sale.receivedAmount?.length
                ? sale.receivedAmount.reduce(
                    (sum, amt) => sum + (amt.amount || 0),
                    0
                  )
                : 0;

              const remainingAmount = Math.max(
                (sale.netAmount || 0) - totalReceived,
                0
              );

              return {
                _id: sale._id,
                date: new Date(sale.createdAt).toISOString().split("T")[0],
                billNumber: sale.saleNumber || sale.billNumber || "N/A",
                customerName:
                  sale.customerName || sale.sale?.customerName || "N/A",
                phone: sale.customerPhone || sale.sale?.customerPhone || "N/A",
                storeName: sale.store?.name || "N/A",
                totalItems: sale.orders?.length || 0,
                receivedAmount: totalReceived,
                remainingAmount, // ✅ safe (no negatives)
                notes: sale.note || "N/A",
                action: "Edit",
                fullSale: sale,
              };
            })
          );

          setProductTableData(
            sales.flatMap((sale, index) =>
              (sale.orders || [sale]).map((order, idx) => ({
                id: `${sale._id}-${idx + 1}`,
                saleId: sale._id,
                selected: false,
                productSku: order.product?.sku || "N/A",
                leftLens: order?.leftLens?.sku || "N/A",
                rightLens: order?.rightLens?.sku || "N/A",
                status: order.status || "N/A",
                barcode: order.product?.barcode || order.lens?.barcode || "N/A",
                srp:
                  order.product?.srp ||
                  order.lens?.srp ||
                  order.perPieceAmount ||
                  0,
                orderId: order._id || sale._id,
                vendor: sale.vendor || "",
                fullOrder: order,
                sale: sale,
              }))
            )
          );
          setPagination({
            totalDocs: response.data.data.totalDocs || 0,
            limit: response.data.data.limit || 100,
            page: response.data.data.page || 1,
            totalPages: response.data.data.totalPages || 1,
            hasPrevPage: response.data.data.hasPrevPage || false,
            hasNextPage: response.data.data.hasNextPage || false,
            prevPage: response.data.data.prevPage || null,
            nextPage: response.data.data.nextPage || null,
          });
        } else {
          toast.error(response.data?.message || "Failed to fetch sales data");
          setTableData([]);
          setProductTableData([]);
        }
      } catch (error) {
        toast.error("Error fetching sales data: " + error.message);
        setTableData([]);
        setProductTableData([]);
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    },
    [users.stores]
  );

  const fetchCounts = useCallback(
    async (filters) => {
      try {
        const params = {
          stores: filters.stores.length ? filters.stores : users.stores,
          search: filters.search || "",

          startDate: filters.startDate
            ? new Date(filters.startDate).setUTCHours(0, 0, 0, 0) // start of day UTC
            : undefined,
          endDate: filters.endDate
            ? new Date(filters.endDate).setUTCHours(23, 59, 59, 999) // end of day UTC
            : undefined,
        };

        if (filters.status === "returned") {
          const [orderResponse, salesReturnResponse, returnResponse] =
            await Promise.all([
              shopProcessService.getOrderCount(params),
              shopProcessService.getSaleReturn(params),
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
              newOrder: orderCounts.pendingCount || 0,
              inFitting: orderCounts.inFittingCount || 0,
              ready: orderCounts.readyCount || 0,
              delivered: orderCounts.deliveredCount || 0,
            }));
          }

          if (salesReturnResponse.success) {
            setSalesReturn({
              returned: salesReturnResponse?.data?.data?.docs || [],
            });

            setSalesReturnProductData(
              salesReturnResponse?.data?.data?.docs.flatMap((doc, docIndex) =>
                (doc.products || []).map((product, prodIndex) => ({
                  id: `${doc._id}-${prodIndex + 1}`,
                  saleId: doc._id,
                  selected: false,
                  productSku: product.sku || "N/A",
                  lensSku: product.sku || "N/A",
                  barcode: product.barcode || "N/A",
                  srp: product.purchaseRate || product.totalAmount || 0,
                  orderId: product._id || doc._id,
                }))
              )
            );
          }

          if (returnResponse.success) {
            setStatusCounts((prev) => ({
              ...prev,
              returned: returnResponse.data.data.docs[0]?.returnedCount || 0,
            }));
          }
        } else {
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
              newOrder: orderCounts.pendingCount || 0,
              inFitting: orderCounts.inFittingCount || 0,
              delivered: orderCounts.deliveredCount || 0,
              ready: orderCounts.readyCount || 0,
            }));
          }

          if (returnResponse.success) {
            setStatusCounts((prev) => ({
              ...prev,
              returned: returnResponse.data.data.docs[0]?.returnedCount || 0,
            }));
          }
        }
      } catch (error) {
        toast.error("Error fetching counts: " + error.message);
      }
    },
    [users.stores]
  );

  const fetchSalesAndCounts = useCallback(
    debounce(async (filters, forceRefresh = false) => {
      setLoading(true);
      setDataLoaded(false);
      try {
        await Promise.all([
          fetchSalesData(filters, forceRefresh),
          fetchCounts(filters),
        ]);
      } catch (error) {
        toast.error("Failed to fetch data: " + error.message);
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    }, 300),
    [fetchSalesData, fetchCounts]
  );

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setDataLoaded(false);
      clearTableData();
      await getStores();
      const filters = {
        stores: users.stores,
        startDate: formik.values.startDate,
        endDate: formik.values.endDate,
        search: "",
        status: getStatusForTab(activeStatus),
        page: 1,
        limit: 100,
      };
      currentFilters.current = filters;
      await fetchSalesAndCounts(filters, true);
      isInitialLoad.current = false;
    };

    initialize();
  }, [
    activeStatus,
    getStatusForTab,
    fetchSalesAndCounts,
    clearTableData,
    users.stores,
  ]);

  const refreshSalesData = useCallback(async () => {
    try {
      lastSalesCallParams.current = null;
      await fetchSalesAndCounts(currentFilters.current, true);
    } catch (error) {
      toast.error("Failed to refresh sales data: " + error.message);
    }
  }, [fetchSalesAndCounts]);

  const handlePageChange = (page) => {
    if (page) {
      const newFilters = {
        ...currentFilters.current,
        page,
      };
      currentFilters.current = newFilters;
      fetchSalesData(newFilters, true);
    }
  };

  const storeOptions = useMemo(() => {
    return storeData.map((store) => ({
      value: store._id,
      label: `${store.name} / ${store.storeNumber}`,
    }));
  }, [storeData]);

  const [hasSetDefaultStore, setHasSetDefaultStore] = useState(false);

  useEffect(() => {
    if (
      !hasSetDefaultStore &&
      storeOptions.length > 0 &&
      users?.stores?.length > 0
    ) {
      const defaultOptions = storeOptions.filter((opt) =>
        users.stores.includes(opt.value)
      );
      if (defaultOptions.length > 0) {
        formik.setFieldValue("stores", defaultOptions);
        setHasSetDefaultStore(true);
      }
    }
  }, [storeOptions, users?.stores, hasSetDefaultStore, formik]);

  const statuses = [
    { name: "New Order", count: statusCounts.newOrder },
    { name: "In Process", count: statusCounts.inProcess },
    { name: "In Fitting", count: statusCounts.inFitting },
    { name: "Ready", count: statusCounts.ready },
    { name: "Delivered", count: statusCounts.delivered },
    { name: "Returned", count: statusCounts.returned },
  ];

  // New Order and In Fitting Table Logic
  const { newOrderTableData, newOrderProductTableData } = useMemo(() => {
    if (activeStatus !== "New Order" && activeStatus !== "In Fitting") {
      return { newOrderTableData: [], newOrderProductTableData: [] };
    }

    const newOrderTableData = tableData.map((order) => ({
      id: order._id,
      date: order.date,
      billNumber: order.billNumber,
      customerName: order.customerName,
      store: order.storeName,
      notes: order.notes,
      fullOrder: order.fullSale,
    }));

    const newOrderProductTableData = productTableData.map((order, index) => ({
      id: `${order.saleId}-${index + 1}`,
      saleId: order.saleId,
      selected: order.selected,
      productSku: order.productSku,
      leftLens: order.leftLens,
      rightLens: order.rightLens,
      status: order.status,
      vendor: order.vendor,
      orderId: order.orderId,
      fullOrder: order.fullOrder,
    }));

    return { newOrderTableData, newOrderProductTableData };
  }, [tableData, productTableData, activeStatus]);

  const [localProductTableData, setLocalProductTableData] = useState(
    newOrderProductTableData
  );

  useEffect(() => {
    setLocalProductTableData(newOrderProductTableData);
  }, [newOrderProductTableData]);

  const handleCheckboxChange = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId)
        ? prev.filter((id) => id !== rowId)
        : [...prev, rowId]
    );
    setLocalProductTableData((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, selected: !row.selected } : row
      )
    );
  };

  const handleCustomerNoteClick = (row) => {
    setSelectedRow(row?.fullOrder);
    setShowCustomerModal(true);
  };

  const handleProcessOrder = async () => {
    const selectedOrders = localProductTableData
      .filter((row) => row.selected)
      .map((row) => ({
        id: row.id,
        orderId: row.orderId,
        fullOrder: row.fullOrder,
      }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }

    setLoading(true);
    let successCount = 0;
    const failedOrders = [];

    for (const order of selectedOrders) {
      try {
        const response = await workshopService.updateOrderStatus(
          order.orderId,
          "inLab"
        );
        if (response.data.success && response.data.data.modifiedCount > 0) {
          successCount++;
          setLocalProductTableData((prev) =>
            prev.map((row) =>
              row.id === order.id
                ? { ...row, status: "inLab", selected: false }
                : row
            )
          );
        } else {
          failedOrders.push({
            orderId: order.orderId,
            message: response.message || "Failed to update status",
          });
        }
      } catch (error) {
        failedOrders.push({
          orderId: order.orderId,
          message: error.message || "Error updating order status",
        });
      }
    }

    setSelectedRows([]);
    setLoading(false);

    if (successCount > 0) {
      toast.success(`${successCount} order(s) sent for fitting successfully`);
      await refreshSalesData();
    }

    if (failedOrders.length > 0) {
      failedOrders.forEach(({ orderId, message }) => {
        toast.error(`Failed to send order ${orderId} for fitting: ${message}`);
      });
    }

    // setShowVendorModal(true);
  };

  const handleSendForFitting = async () => {
    const selectedOrders = productTableData
      .filter((row) => row.selected)
      .map((row) => ({ id: row.id, orderId: row.orderId, ...row }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }
    const order = selectedOrders[0]?.fullOrder;
    const hasLeftLens = !!order.leftLens;
    const hasRightLens = !!order.rightLens;

    // If left lens exists but not received
    if (hasLeftLens && order.currentLeftJobWork?.status !== "received") {
      toast.warning("Please first receive Left lens vendor jobwork");
      return;
    }

    // If right lens exists but not received
    if (hasRightLens && order.currentRightJobWork?.status !== "received") {
      toast.warning("Please first receive Right lens vendor jobwork");
      return;
    }
    setLoading(true);
    let successCount = 0;
    const failedOrders = [];

    for (const order of selectedOrders) {
      try {
        const response = await workshopService.updateOrderStatus(
          order.orderId,
          "inFitting"
        );
        if (response.data.success && response.data.data.modifiedCount > 0) {
          successCount++;
          setLocalProductTableData((prev) =>
            prev.map((row) =>
              row.id === order.id
                ? { ...row, status: "inFitting", selected: false }
                : row
            )
          );
        } else {
          failedOrders.push({
            orderId: order.orderId,
            message: response.message || "Failed to update status",
          });
        }
      } catch (error) {
        failedOrders.push({
          orderId: order.orderId,
          message: error.message || "Error updating order status",
        });
      }
    }

    setSelectedRows([]);
    setLoading(false);

    if (successCount > 0) {
      toast.success(`${successCount} order(s) sent for fitting successfully`);
      await refreshSalesData();
    }

    if (failedOrders.length > 0) {
      failedOrders.forEach(({ orderId, message }) => {
        toast.error(`Failed to send order ${orderId} for fitting: ${message}`);
      });
    }
  };

  const handleMarkAsReady = async () => {
    const selectedOrders = localProductTableData
      .filter((row) => row.selected)
      .map((row) => ({
        id: row.id,
        orderId: row.orderId,
        fullOrder: row.fullOrder,
      }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }
    if (
      selectedOrders[0]?.fullOrder?.currentLeftJobWork?.status !== "received" ||
      selectedOrders[0]?.fullOrder?.currentRightJobWork?.status !== "received"
    ) {
      toast.warning("Please first Receive Left and Right vendor list");
      return;
    }

    setLoading(true);
    let successCount = 0;
    const failedOrders = [];

    for (const order of selectedOrders) {
      try {
        const response = await workshopService.updateOrderStatus(
          order.orderId,
          "ready"
        );
        if (response.data.success && response.data.data.modifiedCount > 0) {
          successCount++;
          setLocalProductTableData((prev) =>
            prev.map((row) =>
              row.id === order.id
                ? { ...row, status: "ready", selected: false }
                : row
            )
          );
        } else {
          failedOrders.push({
            orderId: order.orderId,
            message: response.message || "Failed to update status",
          });
        }
      } catch (error) {
        failedOrders.push({
          orderId: order.orderId,
          message: error.message || "Error updating order status",
        });
      }
    }

    setSelectedRows([]);
    setLoading(false);

    if (successCount > 0) {
      toast.success(`${successCount} order(s) marked as ready successfully`);
      await refreshSalesData();
    }

    if (failedOrders.length > 0) {
      failedOrders.forEach(({ orderId, message }) => {
        toast.error(`Failed to mark order ${orderId} as ready: ${message}`);
      });
    }
  };

  const handleRevertOrder = async () => {
    const selectedOrders = (
      localProductTableData && localProductTableData.length > 0
        ? localProductTableData
        : productTableData
    )
      .filter((row) => row.selected)
      .map((row) => ({
        id: row.id,
        orderId: row.orderId,
        fullOrder: row.fullOrder,
      }));
    console.log("selectedOrders", selectedOrders, productTableData);

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }

    setLoading(true);
    let successCount = 0;
    const failedOrders = [];

    for (const order of selectedOrders) {
      try {
        const targetStatus =
          activeStatus === "New Order" || activeStatus === "In Process"
            ? "pending"
            : "inLab";
        const response = await workshopService.updateOrderStatus(
          order.orderId,
          targetStatus
        );
        if (response.data.success && response.data.data.modifiedCount > 0) {
          successCount++;
          setLocalProductTableData((prev) =>
            prev.map((row) =>
              row.id === order.id
                ? { ...row, status: targetStatus, selected: false }
                : row
            )
          );
        } else {
          failedOrders.push({
            orderId: order.orderId,
            message: response.message || "Failed to update status",
          });
        }
      } catch (error) {
        failedOrders.push({
          orderId: order.orderId,
          message: error.message || "Error updating order status",
        });
      }
    }

    setSelectedRows([]);
    setLoading(false);

    if (successCount > 0) {
      toast.success(`${successCount} order(s) reverted successfully`);
      await refreshSalesData();
    }

    if (failedOrders.length > 0) {
      failedOrders.forEach(({ orderId, message }) => {
        toast.error(`Failed to revert order ${orderId}: ${message}`);
      });
    }
  };

  const handleVendorSubmit = async (data) => {
    setLoading(true);
    try {
      // Implement your vendor submission logic here
      console.log("Vendor data submitted:", data);
      toast.success("Vendor assigned successfully");
      handleDownloadImage(data);
      await refreshSalesData();
    } catch (error) {
      toast.error("Failed to assign vendor: " + error.message);
    } finally {
      setShowVendorModal(false);
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Select",
        cell: ({ row }) => {
          const productRow = localProductTableData.find(
            (p) => p.saleId === row.original.id
          );
          return (
            <Form.Check
              type="checkbox"
              checked={productRow?.selected || false}
              onChange={() => handleCheckboxChange(productRow?.id)}
              className="form-check-input-lg fs-5"
            />
          );
        },
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "billNumber",
        header: "Bill Number",
        cell: ({ getValue, row }) => (
          <div
            className="table-vendor-data-size"
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "#6366f1",
            }}
            onClick={() => openBillModal(row.original)}
          >
            {getValue()}
          </div>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer Name",
        cell: ({ getValue, row }) => (
          <div
            className="table-vendor-data-size"
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              color: "#6366f1",
            }}
            onClick={() => handleCustomerNoteClick(row.original)}
          >
            {getValue()}
          </div>
        ),
      },
      {
        accessorKey: "store",
        header: "Store",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "productSku",
        header: "Product SKU",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size">{getValue()}</div>
        ),
      },
      {
        accessorKey: "rightLens",
        header: "Right Lens SKU",
        cell: ({ row }) => (
          <div className="table-vendor-data-size" style={{ maxWidth: "200px" }}>
            {row.original.rightLens || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "leftLens",
        header: "Left Lens SKU",
        cell: ({ row }) => (
          <div className="table-vendor-data-size" style={{ maxWidth: "200px" }}>
            {row.original.leftLens || "N/A"}
          </div>
        ),
      },

      {
        accessorKey: "notes",
        header: "Note",
        cell: ({ getValue }) => (
          <div className="table-vendor-data-size" style={{ maxWidth: "200px" }}>
            {getValue()}
          </div>
        ),
      },
    ],
    [localProductTableData]
  );
  console.log("newOrderTableData", newOrderTableData);

  const combinedData = useMemo(() => {
    return newOrderTableData.map((order) => {
      const matchingProduct = localProductTableData.find(
        (p) => p.saleId === order.id
      );
      return {
        ...order,
        productSku: matchingProduct?.productSku || "N/A",
        rightLens: matchingProduct?.rightLens || "",
        leftLens: matchingProduct?.leftLens || "",
        vendor: matchingProduct?.vendor || "",
      };
    });
  }, [newOrderTableData, localProductTableData]);

  const table = useReactTable({
    data: combinedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
    },
  });

  const startRow = (pagination.page - 1) * pagination.limit + 1;
  const endRow = Math.min(
    pagination.page * pagination.limit,
    pagination.totalDocs
  );
  const totalRows = pagination.totalDocs;

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
  const closeWhatsAppModal = () => {
    setShowWhatsAppModal(false);
    setSelectedRow(null);
  };
  const openBillModal = (row) => {
    setSelectedBill(row.fullSale ?? row?.fullOrder);
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
  // Handle Edit Vendor
  const handleEditVendor = () => {
    const selectedOrders = productTableData
      .filter((row) => row.selected)
      .map((row) => ({ id: row.id, orderId: row.orderId, ...row }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }
    setSelectedRow(selectedOrders);
    setShowEditVendorModal(true);
  };
  const handleAddDamagePiece = () => {
    const selectedOrders = localProductTableData
      .filter((row) => row.selected)
      .map((row) => ({
        id: row.id,
        orderId: row.orderId,
        fullOrder: row.fullOrder,
      }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }
    setSelectedRow(selectedOrders);
    setShowAddDamage(true);
  };
  // Handle EditVendorModal submit
  const handleEditVendorSubmit = async (data) => {
    console.log("Edit vendor data submitted:", data);
    setShowEditVendorModal(false);
    refreshSalesData();
  };
  const handleAddDamageSubmit = async (data) => {
    setShowAddDamage(false);
    refreshSalesData();
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
      await fetchSalesAndCounts(currentFilters.current, true);
    }
  };
  const openWhatsAppModal = (row) => {
    setSelectedRow(row);
    setShowWhatsAppModal(true);
  };
  const handleSendToPending = async () => {
    const selectedOrders = productTableData
      .filter((row) => row.selected)
      .map((row) => ({ id: row.id, orderId: row.orderId, ...row }));
    setPendingVendorData(selectedOrders);
    setShowVendorModal(true);
  };
  const handleSendToReady = async () => {
    const selectedOrders = productTableData
      .filter((row) => row.selected)
      .map((row) => ({ id: row.id, orderId: row.orderId, ...row }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }

    const order = selectedOrders[0]?.fullOrder;
    const hasLeftLens = !!order.leftLens;
    const hasRightLens = !!order.rightLens;

    // If left lens exists but not received
    if (hasLeftLens && order.currentLeftJobWork?.status !== "received") {
      toast.warning("Please first receive Left lens vendor jobwork");
      return;
    }

    // If right lens exists but not received
    if (hasRightLens && order.currentRightJobWork?.status !== "received") {
      toast.warning("Please first receive Right lens vendor jobwork");
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
      await fetchSalesAndCounts(currentFilters.current, true);
    }
  };

  const handleDeliver = async () => {
    const selectedOrders = productTableData
      .filter((row) => row.selected)
      .map((row) => ({ id: row.id, orderId: row.orderId, ...row }));

    if (selectedOrders.length === 0) {
      toast.warning("No orders selected");
      return;
    }

    const order = selectedOrders[0]?.fullOrder;
    const hasLeftLens = !!order.leftLens;
    const hasRightLens = !!order.rightLens;

    // If left lens exists but not received
    if (hasLeftLens && order.currentLeftJobWork?.status !== "received") {
      toast.warning("Please first receive Left lens vendor jobwork");
      return;
    }

    // If right lens exists but not received
    if (hasRightLens && order.currentRightJobWork?.status !== "received") {
      toast.warning("Please first receive Right lens vendor jobwork");
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
      await fetchSalesAndCounts(currentFilters.current, true);
    }
  };

  const handleDeleteSale = async (saleId) => {
    setLoading(true);
    try {
      const response = await shopProcessService.deleteSale(saleId);
      if (response.success) {
        toast.success("Sale deleted successfully");
        await refreshSalesData();
      } else {
        toast.error(response.message || "Failed to delete sale");
      }
    } catch (error) {
      toast.error("Failed to delete sale: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const hasSelectedProducts = productTableData.some((row) => row.selected);

  const openBillInNewTab = (row) => {
    const pdfUrl = generateInvoicePDF(row.fullSale);
    window.open(pdfUrl, "_blank");
  };
  const handleDownloadImage = async (order) => {
    try {
      setDownloadOrder({
        order: order?.selectedRows[0]?.sale,
        orderDetails: order,
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      const element = downloadRef.current;
      if (!element) {
        throw new Error("Template element not found");
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;

      link.download = `order_${
        order?.selectedRows[0]?.fullOrder?.billNumber ||
        order?.selectedRows[0]?.fullOrder?.barcode
      }.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Image downloaded successfully");
      setDownloadOrder(null);
    } catch (error) {
      setDownloadOrder(null);
      toast.error("Error downloading image");
    }
  };
  // Centralized rendering function for table content
  const renderTableContent = () => {
    if (loading || !dataLoaded) {
      return (
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
      );
    }

    const dataToRender =
      activeStatus === "Returned" ? salesReturn.returned : tableData;

    if (dataToRender.length === 0) {
      return (
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
      );
    }

    // if (activeStatus === "New Order" || activeStatus === "In Fitting") {
    //   return (
    //     <>
    //       <table className="table table-sm">
    //         <thead className="table-light border text-xs text-uppercase">
    //           {table.getHeaderGroups().map((headerGroup) => (
    //             <tr key={headerGroup.id}>
    //               {headerGroup.headers.map((header) => (
    //                 <th
    //                   key={header.id}
    //                   className="py-3 text-left custom-perchase-th"
    //                 >
    //                   {flexRender(
    //                     header.column.columnDef.header,
    //                     header.getContext()
    //                   )}
    //                 </th>
    //               ))}
    //             </tr>
    //           ))}
    //         </thead>
    //         <tbody>
    //           {table.getRowModel().rows.map((row) => (
    //             <tr key={row.id}>
    //               {row.getVisibleCells().map((cell) => (
    //                 <td key={cell.id}>
    //                   {flexRender(
    //                     cell.column.columnDef.cell,
    //                     cell.getContext()
    //                   )}
    //                 </td>
    //               ))}
    //             </tr>
    //           ))}
    //         </tbody>
    //       </table>
    //       {combinedData.length !== 0 && (
    //         <div className="d-flex p-2 flex-column flex-sm-row justify-content-between align-items-center mt-3 px-3">
    //           <div className="text-sm text-muted mb-3 mb-sm-0">
    //             Showing <span className="fw-medium">{startRow}</span> to{" "}
    //             <span className="fw-medium">{endRow}</span> of{" "}
    //             <span className="fw-medium">{totalRows}</span> results
    //           </div>
    //           <div className="btn-group">
    //             <Button
    //               variant="outline-primary"
    //               onClick={() => handlePageChange(pagination.prevPage)}
    //               disabled={!pagination.hasPrevPage}
    //             >
    //               Previous
    //             </Button>
    //             <Button
    //               variant="outline-primary"
    //               onClick={() => handlePageChange(pagination.nextPage)}
    //               disabled={!pagination.hasNextPage}
    //             >
    //               Next
    //             </Button>
    //           </div>
    //         </div>
    //       )}
    //     </>
    //   );
    // }

    return (
      <>
        <table
          className="table"
          style={{ minWidth: "900px", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              {(activeStatus === "Returned"
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
                  ]
              ).map((heading, idx) => (
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
            {dataToRender.map((row, index) => (
              <React.Fragment key={row._id}>
                <tr style={{ borderTop: "1px solid #dee2e6" }}>
                  <td
                    style={{
                      minWidth: "100px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                    }}
                  >
                    {row.date || row.createdAt}
                  </td>
                  {activeStatus !== "Returned" && (
                    <>
                      <td
                        style={{
                          minWidth: "110px",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        className="common-text-color"
                        onClick={() => {
                          console.log("Opening bill for row:", row);

                          openBillModal(row);
                        }}
                      >
                        {row.billNumber}
                      </td>
                      <td
                        style={{
                          minWidth: "160px",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        className="common-text-color"
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
                          textDecoration: "underline",
                        }}
                        className="common-text-color"
                        onClick={() => openRAModal(row)}
                      >
                        {row.receivedAmount}
                      </td>
                      <td
                        style={{
                          minWidth: "100px",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          color:
                            Number(row.remainingAmount) === 0 ? "black" : "red",
                        }}
                      >
                        {row.remainingAmount}
                      </td>
                      <td
                        style={{
                          minWidth: "150px",
                          maxWidth: "150px",
                          cursor: "pointer",
                          textDecoration: "underline",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                        }}
                        className="common-text-color"
                        onClick={() => openNotesModal(row)}
                      >
                        {row.notes === "N/A" ? "--------" : row.notes}
                      </td>
                    </>
                  )}
                  {activeStatus === "Returned" && (
                    <>
                      <td style={{ minWidth: "160px" }}>
                        {row.customerName || "N/A"}
                      </td>
                      <td
                        style={{
                          minWidth: "102px",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        {row.customerPhone || "N/A"}
                      </td>
                      <td
                        style={{
                          minWidth: "105px",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        {(row.products || []).length}
                      </td>
                      <td style={{ minWidth: "150px" }}>
                        {(row.payAmount || []).reduce(
                          (total, item) => total + Number(item.amount || 0),
                          0
                        )}
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
                      {(activeStatus === "Pending" ||
                        activeStatus === "Ready" ||
                        activeStatus === "In Process" ||
                        activeStatus === "In Fitting" ||
                        activeStatus === "New Order") && (
                        <div className="d-flex flex-column align-items-center justify-content-center">
                          {activeStatus !== "Delivered" && (
                            <button
                              className="btn btn-sm btn-primary px-0 py-2 mb-2"
                              style={{ minWidth: "60px", width: "50px" }}
                              onClick={() =>
                                navigate(`/process/shop/${row._id}`)
                              }
                            >
                              Edit
                            </button>
                          )}
                          {activeStatus === "New Order" && (
                            <>
                              <button
                                className="btn btn-sm btn-danger border px-0 py-2 mb-2"
                                style={{ minWidth: "60px", width: "80px" }}
                                onClick={() => handleDeleteSale(row._id)}
                                disabled={loading}
                              >
                                {loading ? "Deleting..." : "Delete"}
                              </button>
                            </>
                          )}
                          {(activeStatus !== "Returned" ||
                            activeStatus !== "Delivered") && (
                            <button
                              className="btn btn-sm border py-2 mb-2"
                              style={{ minWidth: "80px" }}
                              onClick={() => openAPModal(row)}
                            >
                              Assign Power
                            </button>
                          )}
                        </div>
                      )}
                      <button
                        className="btn btn-sm border px-2 py-2"
                        style={{ minWidth: "60px", width: "80px" }}
                        onClick={() => openBillInNewTab(row)}
                      >
                        View Bill
                      </button>
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
                                  <th className="py-3 px-2">Product SKU</th>
                                  <th className="py-3 px-2">Right Lens SKU</th>

                                  <th className="py-3 px-2">Left Lens SKU</th>
                                  <th className="py-3 px-2">Status</th>
                                  <th className="py-3 px-2">Chat</th>
                                </>
                              ) : (
                                <>
                                  <th className="py-3 px-2">Sr No.</th>
                                  <th className="py-3 px-2">Product SKU</th>
                                  <th className="py-3 px-2">Barcode</th>
                                  <th className="py-3 px-2">SRP</th>
                                  <th className="py-3 px-2">Chat</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {(activeStatus !== "Returned"
                              ? productTableData
                              : salesReturnProductData
                            )
                              .filter((prod) => prod.saleId === row._id)
                              .map((prodRow, prodIndex) => {
                                return (
                                  <tr key={prodRow.id}>
                                    {activeStatus !== "Returned" ? (
                                      <>
                                        <td>
                                          <input
                                            type="checkbox"
                                            style={{
                                              width: "20px",
                                              height: "20px",
                                            }}
                                            checked={prodRow.selected}
                                            onChange={() =>
                                              handleSelect(prodRow.id)
                                            }
                                          />
                                        </td>
                                        <td style={{ minWidth: "110px" }}>
                                          {prodRow.productSku
                                            ? prodRow.productSku
                                            : "--"}
                                        </td>
                                        <td style={{ minWidth: "110px" }}>
                                          <p>
                                            {" "}
                                            {prodRow.rightLens
                                              ? prodRow.rightLens
                                              : "--"}
                                          </p>
                                          {prodRow.rightLens ? (
                                            <p
                                              className={`${
                                                ["pending", "damaged"].includes(
                                                  prodRow?.fullOrder
                                                    ?.currentRightJobWork
                                                    ?.status
                                                )
                                                  ? "text-danger"
                                                  : "text-success"
                                              }`}
                                            >
                                              {
                                                prodRow?.fullOrder
                                                  ?.currentRightJobWork?.vendor
                                                  ?.companyName
                                              }
                                            </p>
                                          ) : (
                                            ""
                                          )}
                                        </td>
                                        <td style={{ minWidth: "200px" }}>
                                          <p>
                                            {" "}
                                            {prodRow.leftLens
                                              ? prodRow.leftLens
                                              : "--"}
                                          </p>
                                          {prodRow.rightLens ? (
                                            <p
                                              className={`${
                                                ["pending", "damaged"].includes(
                                                  prodRow?.fullOrder
                                                    ?.currentLeftJobWork?.status
                                                )
                                                  ? "text-danger"
                                                  : "text-success"
                                              }`}
                                            >
                                              {
                                                prodRow?.fullOrder
                                                  ?.currentLeftJobWork?.vendor
                                                  ?.companyName
                                              }
                                            </p>
                                          ) : (
                                            ""
                                          )}
                                        </td>
                                        <td style={{ minWidth: "70px" }}>
                                          {prodRow.status}
                                        </td>
                                        <td style={{ minWidth: "70px" }}>
                                          <SiWhatsapp
                                            className="text-success"
                                            size={30}
                                            onClick={() =>
                                              openWhatsAppModal(row)
                                            }
                                          />
                                        </td>
                                      </>
                                    ) : (
                                      <>
                                        <td style={{ minWidth: "110px" }}>
                                          {prodIndex + 1}
                                        </td>
                                        <td style={{ minWidth: "110px" }}>
                                          {prodRow.product
                                            ? prodRow.product.sku
                                            : prodRow.rightLens?.sku}
                                        </td>
                                        <td style={{ minWidth: "200px" }}>
                                          {prodRow.product
                                            ? prodRow.product.barcode
                                            : prodRow.rightLens?.barcode}
                                        </td>
                                        <td style={{ minWidth: "70px" }}>
                                          {prodRow.product
                                            ? prodRow.product.srp
                                            : prodRow.rightLens?.srp}
                                        </td>
                                        <td style={{ minWidth: "70px" }}>
                                          <SiWhatsapp
                                            className="text-success "
                                            size={30}
                                            onClick={() =>
                                              openWhatsAppModal(row)
                                            }
                                          />
                                        </td>
                                      </>
                                    )}
                                  </tr>
                                );
                              })}
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
        {tableData.length !== 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span>
              Showing {startRow} to {endRow} of {pagination.totalDocs} entries
            </span>
            <nav>
              <ul className="pagination mb-0">
                <li
                  className={`page-item ${
                    !pagination.hasPrevPage ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.prevPage)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </button>
                </li>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <li
                    key={pageNum}
                    className={`page-item ${
                      pagination.page === pageNum ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    !pagination.hasNextPage ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.nextPage)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </>
    );
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
              onClick={() => {
                setActiveStatus(status.name);
                setSelectedRows([]);
                setLocalProductTableData(
                  localProductTableData.map((row) => ({
                    ...row,
                    selected: false,
                  }))
                );
              }}
              className={`bg-transparent border-0 pb-2 px-1 fw-medium ${
                activeStatus === status.name
                  ? "common-text-color border-bottom common-tab-border-color"
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
        style={{ margin: "-9px 0px 10px 0px" }}
      ></div>
      {hasSelectedProducts && activeStatus === "Pending" && (
        <div className="mb-2">
          <button
            className="btn me-2 custom-hover-border"
            onClick={handleSendToPending}
            disabled={loading}
          >
            {loading ? "Processing..." : "Process Order"}
          </button>
          <button
            className="btn me-2 custom-hover-border"
            onClick={handleSendToWorkshop}
            disabled={loading}
          >
            {loading ? "Processing..." : "Send To Workshop"}
          </button>
          <button
            className="btn custom-hover-border mx-2"
            onClick={handleDeliver}
            disabled={loading}
          >
            {loading ? "Processing..." : "Deliver"}
          </button>
        </div>
      )}
      {hasSelectedProducts && activeStatus === "New Order" && (
        <div className="mb-2">
          {" "}
          <button
            className="btn me-2 custom-hover-border"
            onClick={handleSendToPending}
            disabled={loading}
          >
            {loading ? "Processing..." : "Process Order"}
          </button>
          <button
            className="btn custom-hover-border me-2"
            type="button"
            onClick={handleSendForFitting}
            disabled={loading}
          >
            {loading ? "Processing..." : "Send for Fitting"}
          </button>
          <button
            className="btn custom-hover-border mx-2"
            onClick={handleDeliver}
            disabled={loading}
          >
            {loading ? "Processing..." : "Deliver"}
          </button>
          {/* <button
            className="btn custom-hover-border me-2"
            type="button"
            onClick={handleRevertOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : "Revert Order"}
          </button> */}
          {/* <button
            className="btn custom-hover-border"
            type="button"
            disabled={loading}
          >
            {loading ? "Processing..." : "Force Ahead"}
          </button> */}
        </div>
      )}
      {hasSelectedProducts && activeStatus === "In Process" && (
        <div className="mb-2">
          <button
            className="btn me-1 custom-hover-border"
            onClick={handleEditVendor}
            disabled={loading}
          >
            {loading ? "Processing..." : "Edit Vendor"}
          </button>
          <button
            className="btn custom-hover-border ms-2"
            type="button"
            onClick={handleSendForFitting}
            disabled={loading}
          >
            {loading ? "Processing..." : "Send for Fitting"}
          </button>
          <button
            className="btn custom-hover-border ms-2"
            onClick={handleSendToReady}
            disabled={loading}
          >
            {loading ? "Processing..." : "Ready"}
          </button>
        </div>
      )}
      {hasSelectedProducts && activeStatus === "In Fitting" && (
        <div className="mb-2">
          <button
            className="btn custom-hover-border ms-2"
            onClick={handleSendToReady}
            disabled={loading}
          >
            {loading ? "Processing..." : "Ready"}
          </button>
          <button
            className="btn custom-hover-border ms-2"
            type="button"
            onClick={handleAddDamagePiece}
            disabled={loading}
          >
            {loading ? "Processing..." : "Add Damaged"}
          </button>
          <button
            className="btn custom-hover-border ms-2"
            type="button"
            onClick={handleRevertOrder}
            disabled={loading}
          >
            {loading ? "Processing..." : "Revert Order"}
          </button>
        </div>
      )}
      {hasSelectedProducts && activeStatus === "Ready" && (
        <div className="mb-2">
          <button
            className="btn custom-hover-border mx-2"
            onClick={handleDeliver}
            disabled={loading}
          >
            {loading ? "Processing..." : "Deliver"}
          </button>
        </div>
      )}

      <div className="table-responsive overflow-x-auto">
        {renderTableContent()}
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
          refreshSalesData={refreshSalesData}
        />
      )}
      {showCustomerModal && selectedRow && (
        <CustomerNameModal
          show={showCustomerModal}
          onHide={() => setShowCustomerModal(false)}
          selectedRow={selectedRow}
        />
      )}
      {showVendorModal && pendingprocessOrder && (
        <SelectVendorModal
          show={showVendorModal}
          onHide={() => setShowVendorModal(false)}
          selectedRows={pendingprocessOrder}
          onSubmit={handleVendorSubmit}
        />
      )}
      {showEditVendorModal && (
        <EditVendorModal
          show={showEditVendorModal}
          onHide={() => setShowEditVendorModal(false)}
          selectedRows={selectedRow}
          onSubmit={handleEditVendorSubmit}
        />
      )}
      {showAddDamage && (
        <AddDamagedModal
          show={showAddDamage}
          onHide={() => setShowAddDamage(false)}
          selectedRows={selectedRow}
          onSubmit={handleAddDamageSubmit}
        />
      )}
      {showWhatsAppModal && selectedRow && (
        <WhatsAppModal
          closeModal={closeWhatsAppModal}
          selectedRow={selectedRow}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "800px",
        }}
      >
        {downloadOrder && (
          <div ref={downloadRef}>
            <OrderImageTemplate
              order={downloadOrder?.order}
              details={downloadOrder?.orderDetails}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ShopProcess;
