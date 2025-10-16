import React, { lazy, Suspense, useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import moment from "moment";
import ReactPaginate from "react-paginate";
import { inventoryService } from "../../../services/inventoryService";
import { purchaseService } from "../../../services/purchaseService";
import { Modal, Carousel, Button } from "react-bootstrap";
import Pagination from "../../Common/Pagination";
import ImageSliderModal from "../ImageSliderModal";
import { defalutImageBasePath } from "../../../utils/constants";
const OrderMediaCell = lazy(() => import("./Lazy/OrderMediaCell"));
const PaymentModal = ({
  show,
  onHide,
  productId,
  orderId,
  currentPaymentStatus,
  onUpdate,
}) => {
  const [paymentStatus, setPaymentStatus] = useState(
    currentPaymentStatus || "Pending"
  );

  const paymentOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Success", label: "Success" },
    { value: "Rejected", label: "Rejected" },
  ];

  const handleSubmit = () => {
    onUpdate(orderId, paymentStatus);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Payment Status</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label className="form-label fw-medium">Product ID</label>
          <input
            type="text"
            className="form-control"
            value={productId}
            disabled
          />
        </div>
        <div className="mb-3">
          <label className="form-label fw-medium">Payment Status</label>
          <Select
            options={paymentOptions}
            value={paymentOptions.find((opt) => opt.value === paymentStatus)}
            onChange={(option) => setPaymentStatus(option.value)}
            placeholder="Select..."
            classNamePrefix="react-select"
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
const UniversalStockRequestCom = () => {
  const [storeData, setStoreData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRowStores, setSelectedRowStores] = useState({});
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalDocs: 0,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [currentPaymentStatus, setCurrentPaymentStatus] = useState("Pending");

  const user = JSON.parse(localStorage.getItem("user")) || { stores: [] };

  const formik = useFormik({
    initialValues: {
      stores: [],
      dateFrom: moment().subtract(1, "month").format("YYYY-MM-DD"), // 1 month back
      dateTo: moment().format("YYYY-MM-DD"), // today
    },
    validationSchema: Yup.object({
      stores: Yup.array()
        .of(
          Yup.object().shape({
            value: Yup.string().required(),
            label: Yup.string().required(),
          })
        )
        .nullable(),

      dateFrom: Yup.date().required("Start date is required"),
      dateTo: Yup.date().required("End date is required"),
    }),
    onSubmit: (values) => {
      fetchAuditData(values);
    },
  });

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const storedStoreId = user?.stores?.[0];
    if (storedStoreId && storeData.length > 0) {
      const defaultStore = storeData.find(
        (store) => store._id === storedStoreId
      );
      if (defaultStore) {
        const defaultValues = {
          ...formik.values,
          stores: [
            {
              value: defaultStore._id,
              label: defaultStore.name,
            },
          ],
        };
        formik.setValues(defaultValues);
        fetchAuditData(defaultValues, true); // ✅ use updated values directly
      }
    }
  }, [storeData]);

  const fetchStores = async () => {
    try {
      const response = await inventoryService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to fetch stores");
    }
  };

  const fetchAuditData = async (values, isInitial = false, newPage) => {
    const storeId = values?.stores?.length
      ? values.stores.map((s) => s.value)
      : [];

    setLoading(true);

    try {
      const response = await purchaseService.getUniversalStock(
        values.dateFrom,
        values.dateTo,
        storeId,
        newPage || pagination.page,
        pagination.limit
      );

      if (response.success) {
        const container = response.data.data;
        const mappedData = container.docs.map((item) => ({
          ordNo: item._id,
          date: item.createdAt,
          store: item.store.name,
          category: item.product.__t,
          sku: item.product.sku,
          qty: item.qty || 1,
          paymentStatus: item.paymentStatus,
          orderStatus: item.orderStatus,
          image: item.product.photos[0],
          photos: item.product.photos, // Store all photos
          productId: item.product._id,
          orderMedia:
            item?.product?.orderMedia ||
            "https://www.w3schools.com/html/mov_bbb.mp4",
          resellerPrice: item?.product?.resellerPrice,
        }));

        setAuditData(mappedData);
        setSelectedRowStores("");
        setPagination({
          page: container.page,
          limit: container.limit,
          totalDocs: container.totalDocs,
          totalPages: container.totalPages,
          hasPrevPage: container.hasPrevPage,
          hasNextPage: container.hasNextPage,
        });
      } else {
        toast.error(response.message || "Failed to fetch purchase data");
      }
    } catch (error) {
      console.error("Error fetching purchase data:", error);
      toast.error("Failed to fetch purchase data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (orderId, newStatus) => {
    try {
      // Assuming purchaseService has an updatePaymentStatus method
      // e.g., await purchaseService.updatePaymentStatus(orderId, newStatus);
      toast.success("Payment status updated successfully");
      fetchAuditData(formik.values);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const handleReceived = async () => {
    try {
      // Assuming purchaseService has a markAsReceived method that takes array of order IDs
      // e.g., await purchaseService.markAsReceived(selectedOrders);
      toast.success("Selected orders marked as received");
      setSelectedOrders([]);
      fetchAuditData(formik.values);
    } catch (error) {
      console.error("Error marking as received:", error);
      toast.error("Failed to mark as received");
    }
  };
  const handleCancelled = async () => {
    try {
      // Assuming purchaseService has a markAsReceived method that takes array of order IDs
      // e.g., await purchaseService.markAsReceived(selectedOrders);
      toast.success("Selected orders marked as Cancelled");
      setSelectedOrders([]);
      fetchAuditData(formik.values);
    } catch (error) {
      console.error("Error marking as Cancelled:", error);
      toast.error("Failed to mark as Cancelled");
    }
  };
  const handleSelect = (ordNo) => {
    if (selectedOrders.includes(ordNo)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== ordNo));
    } else {
      setSelectedOrders([...selectedOrders, ordNo]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === auditData.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(auditData.map((item) => item.ordNo));
    }
  };

  const handleOpenPaymentModal = (orderId, productId, paymentStatus) => {
    setSelectedOrderId(orderId);
    setSelectedProductId(productId);
    setCurrentPaymentStatus(paymentStatus || "Pending");
    setShowPaymentModal(true);
  };

  const handleViewMoreImages = (photos) => {
    const fullImageUrls = photos.map(
      (photo) => `${defalutImageBasePath}${photo}`
    );
    setSelectedImages(fullImageUrls);
    setShowImageModal(true);
  };

  const storeOptions = storeData.map((store) => ({
    value: store._id,
    label: store.name,
  }));

  const handlePageClick = (event) => {
    const newPage = event.selected + 1;
    setCurrentPage(event.selected);
    fetchAuditData(formik.values, false, newPage);
  };

  const handleSubmitOrder = async () => {
    const selectedData = auditData
      .filter((item) => selectedRows[item.ordNo])
      .map((item) => ({
        stockRequest: item.ordNo, // this is the stockRequest id
        toStore: selectedRowStores[item.ordNo]?.value, // selected store id
      }));

    if (selectedData.some((row) => !row.toStore)) {
      toast.warn("Please select a store for all selected rows!");
      return;
    }

    try {
      const response = await purchaseService.createStockOrder(selectedData);

      if (response.success) {
        toast.success("Stock order created successfully!");
        // optionally reload data
        fetchAuditData(formik.values);
      } else {
        toast.error(response.message || "Failed to create stock order");
      }
    } catch (error) {
      console.error("Error creating stock order:", error);
      toast.error("An error occurred while creating stock order");
    }
  };

  return (
    <div className="card-body p-4">
      <h4 className="mb-4 font-weight-bold">Universal Stock Request View</h4>
      <form
        onSubmit={formik.handleSubmit}
        className="row row-cols-1 row-cols-md-4 g-3 align-items-end"
      >
        <div className="col">
          <label className="form-label fw-medium">Stores</label>
          <Select
            options={storeOptions}
            value={formik.values.stores}
            onChange={(option) => formik.setFieldValue("stores", option)}
            placeholder="Select..."
            classNamePrefix="react-select"
            className="w-100"
            isMulti
          />
          {formik.touched.stores && formik.errors.stores && (
            <div className="text-danger">{formik.errors.stores}</div>
          )}
        </div>
        <div className="col">
          <label className="form-label fw-medium">Date From</label>
          <input
            type="date"
            className="form-control"
            value={formik.values.dateFrom}
            onChange={(e) => formik.setFieldValue("dateFrom", e.target.value)}
          />
          {formik.touched.dateFrom && formik.errors.dateFrom && (
            <div className="text-danger">{formik.errors.dateFrom}</div>
          )}
        </div>
        <div className="col">
          <label className="form-label fw-medium">Date To</label>
          <input
            type="date"
            className="form-control"
            value={formik.values.dateTo}
            onChange={(e) => formik.setFieldValue("dateTo", e.target.value)}
          />
          {formik.touched.dateTo && formik.errors.dateTo && (
            <div className="text-danger">{formik.errors.dateTo}</div>
          )}
        </div>
        <div className="col">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
      <div className="col mt-3 gap-3 d-flex align-items-center">
        <button
          type="button"
          className="btn btn-primary"
          disabled={selectedOrders.length === 0}
          onClick={handleReceived}
        >
          Received
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={selectedOrders.length === 0}
          onClick={handleCancelled}
        >
          Cancelled
        </button>
      </div>

      <div className="table-responsive mt-3">
        {loading ? (
          <div className="text-center py-5">Loading...</div>
        ) : (
          <>
            <table className="table  table-striped table-hover">
              <thead className="border-top">
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        selectedOrders.length === auditData.length &&
                        auditData.length > 0
                      }
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="py-3">ORDNO</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Store</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">SKU & Barcode</th>
                  <th className="py-3">Qty</th>
                  <th className="py-3">Price</th>
                  <th className="py-3">Image</th>
                  <th className="py-3">Payment Status</th>
                  <th className="py-3">Order Status</th>
                  <th className="py-3">Order Image/Video</th>
                </tr>
              </thead>
              <tbody>
                {auditData.length > 0 ? (
                  auditData.map((item, index) => (
                    <tr key={index} className="align-middle">
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(item.ordNo)}
                          onChange={() => handleSelect(item.ordNo)}
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                          }}
                        />
                      </td>
                      <td className="py-3">
                        {index + 1 + (pagination.page - 1) * pagination.limit}
                      </td>
                      <td className="py-3">
                        {moment(item.date).format("D-M-YYYY")}
                      </td>
                      <td className="py-3">{item.store}</td>
                      <td className="py-3">{item.category}</td>
                      <td className="py-3">{item.sku}</td>
                      <td className="py-3">{item.qty}</td>
                      <td className="py-3">{item?.resellerPrice}</td>

                      <td className="py-3">
                        {item.image ? (
                          <>
                            <img
                              src={`${defalutImageBasePath}${item.image}`}
                              alt="Product"
                              className="img-fluid rounded"
                              style={{ width: "50px", height: "50px" }}
                            />
                            <div>
                              <a
                                href="#"
                                className="text-primary text-decoration-underline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleViewMoreImages(item.photos);
                                }}
                              >
                                View More
                              </a>
                            </div>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="py-3">
                        {item.paymentStatus === "Success" ? (
                          <span className="badge bg-success">
                            {item.paymentStatus}
                          </span>
                        ) : (
                          <button
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: "#0cacb8ff" }}
                            // onClick={() =>
                            //   handleOpenPaymentModal(
                            //     item.ordNo,
                            //     item.productId,
                            //     item.paymentStatus
                            //   )
                            // }
                          >
                            Pay Now
                          </button>
                        )}
                      </td>

                      <td className="py-3">
                        <span
                          className={`badge ${
                            item.paymentStatus === "Success"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {item.orderStatus}
                        </span>
                      </td>
                      <Suspense
                        fallback={<td className="text-center">Loading...</td>}
                      >
                        <OrderMediaCell orderMedia={item?.orderMedia} />
                      </Suspense>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center py-5">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="d-flex justify-content-center mt-4">
              <Pagination
                pageCount={pagination?.totalPages || 1}
                currentPage={pagination.page || 1} // 1-based
                onPageChange={handlePageClick}
              />
            </div>
          </>
        )}
      </div>
      <ImageSliderModal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        images={selectedImages}
      />
      <PaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        productId={selectedProductId}
        orderId={selectedOrderId}
        currentPaymentStatus={currentPaymentStatus}
        onUpdate={handleUpdatePayment}
      />
    </div>
  );
};

export default UniversalStockRequestCom;
