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
import ViewAddressModel from "./ViewAddressModel";
const OrderMediaCell = lazy(() => import("./Lazy/OrderMediaCell"));

const UniversalStockOrderCom = () => {
  const [storeData, setStoreData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRowStores, setSelectedRowStores] = useState({});
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [viewSelectedAddress, setViewSelectedOrders] = useState(null);
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
  const [showviewAddressModal, setShowviewAddressModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});

  const user = JSON.parse(localStorage.getItem("user")) || { stores: [] };

  const formik = useFormik({
    initialValues: {
      stores: [],
      dateFrom: moment().subtract(1, "month").format("YYYY-MM-DD"),
      dateTo: moment().format("YYYY-MM-DD"),
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
        fetchAuditData(defaultValues, true);
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
      const response = await purchaseService.getUniversalStockOrders(
        values.dateFrom,
        values.dateTo,
        storeId,
        newPage || pagination.page,
        pagination.limit
      );

      if (response.success) {
        const container = response.data.data;
        const mappedData = container.docs.map((item) => ({
          ...item,
          ordNo: item._id, // Order ID from root _id
          date: item.stockRequest.createdAt, // Date from stockRequest.createdAt
          category: item.stockRequest.product.__t || "Unknown", // Product type
          sku: item.stockRequest.product.sku || "N/A", // SKU from product
          qty: item.stockRequest.qty || 1, // Default qty to 1 if not provided
          paymentStatus: item.stockRequest.paymentStatus || "Unknown", // Payment status
          orderStatus: item.stockRequest.orderStatus || "Unknown", // Order status
          image: item.stockRequest.product.photos[0] || null, // First photo
          photos: item.stockRequest.product.photos || [], // All photos
          productId: item.stockRequest.product._id || "N/A", // Product ID
          orderMedia:
            item.stockRequest.product.orderMedia ||
            "https://www.w3schools.com/html/mov_bbb.mp4", // Fallback video
          resellerPrice: item.stockRequest.product.resellerPrice || 0, // Reseller price
          store: item.toStore || item.stockRequest.store, // Store info for address
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
      toast.success("Payment status updated successfully");
      fetchAuditData(formik.values);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const handleAccept = async (status) => {
    try {
      const res = await purchaseService.updateStockOrderStatus(
        selectedOrders,
        "Accept"
      );

      if (res.success) {
        toast.success("Selected orders marked as Accepted");
        setSelectedOrders([]);
        fetchAuditData(formik.values);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error marking as accepted:", error);
      toast.error("Failed to mark as accepted");
    }
  };

  const handleCancelled = async () => {
    try {
      const res = await purchaseService.updateStockOrderStatus(
        selectedOrders,
        "Cancelled"
      );

      if (res.success) {
        toast.success("Selected orders marked as Cancelled");
        setSelectedOrders([]);
        fetchAuditData(formik.values);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error marking as cancelled:", error);
      toast.error("Failed to mark as cancelled");
    }
  };

  const handleTransit = async () => {
    if (selectedOrders.length === 0) return;
    try {
      const res = await purchaseService.updateStockOrderStatusForTransit(
        selectedOrders,
        "Transit"
      );

      if (res.success) {
        toast.success("Selected orders marked as Cancelled");
        setSelectedOrders([]);
        fetchAuditData(formik.values);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error marking as cancelled:", error);
      toast.error("Failed to mark as cancelled");
    }
    // ✅ Check that all selected orders have uploaded files
    // const invalidOrders = selectedOrders.filter(
    //   (ordNo) => !uploadedFiles[ordNo]
    // );

    // if (invalidOrders.length > 0) {
    //   toast.error(
    //     `Please upload at least one image/video for all selected orders before marking as Transit.`
    //   );
    //   return;
    // }

    // try {
    //   // ✅ Step 1: Upload files for each order
    //   const formDataArray = selectedOrders.map((ordNo) => {
    //     const file = uploadedFiles[ordNo];
    //     const orderInfo = auditData.find((item) => item.ordNo === ordNo);

    //     const formData = new FormData();
    //     formData.append("orderId", ordNo);
    //     formData.append("productId", orderInfo?.productId || "");
    //     formData.append("sku", orderInfo?.sku || "");
    //     formData.append("category", orderInfo?.category || "");
    //     formData.append("qty", orderInfo?.qty || 0);
    //     formData.append("date", orderInfo?.date || "");
    //     formData.append("file", file);

    //     return formData;
    //   });

    //   // If you’re actually uploading the files individually, you’d do:
    //   // await Promise.all(formDataArray.map((formData) => api.post(UPLOAD_URL, formData)));

    //   // ✅ Step 2: Update order status to "Transit"
    //   const response = await stockService.updateStockOrderStatusForTransit(
    //     selectedOrders,
    //     "Transit"
    //   );

    //   if (response.success) {
    //     toast.success("Selected orders marked as Transit");
    //     setSelectedOrders([]);
    //     setUploadedFiles({});
    //     fetchAuditData(formik.values);
    //   } else {
    //     toast.error(response.message || "Failed to update Transit status");
    //   }
    // } catch (error) {
    //   console.error("Error marking as Transit:", error);
    //   toast.error("Failed to mark as Transit");
    // }
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

  return (
    <div className="card-body p-4">
      <h4 className="mb-4 font-weight-bold">Universal Stock Order View</h4>
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
          onClick={handleAccept}
        >
          Accept
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={selectedOrders.length === 0}
          onClick={handleCancelled}
        >
          Cancelled
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={selectedOrders.length === 0}
          onClick={handleTransit}
        >
          Transit
        </button>
      </div>

      <div className="table-responsive mt-3">
        {loading ? (
          <div className="text-center py-5">Loading...</div>
        ) : (
          <>
            <table className="table table-striped table-hover">
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
                  <th className="py-3" style={{ minWidth: "80px" }}>
                    ORDNO
                  </th>
                  <th className="py-3" style={{ minWidth: "120px" }}>
                    Date
                  </th>
                  <th className="py-3" style={{ minWidth: "120px" }}>
                    Category
                  </th>
                  <th className="py-3" style={{ minWidth: "150px" }}>
                    SKU & Barcode
                  </th>
                  <th className="py-3" style={{ minWidth: "50px" }}>
                    Qty
                  </th>
                  <th className="py-3" style={{ minWidth: "50px" }}>
                    Price
                  </th>
                  <th className="py-3" style={{ minWidth: "100px" }}>
                    Image
                  </th>
                  <th className="py-3" style={{ minWidth: "100px" }}>
                    Order
                  </th>
                  <th className="py-3" style={{ minWidth: "100px" }}>
                    Order Status
                  </th>
                  <th
                    className="py-3"
                    style={{ minWidth: "100px", maxWidth: "200px" }}
                  >
                    Upload Image/Video
                  </th>
                  <th
                    className="py-3"
                    style={{ minWidth: "150px", maxWidth: "150px" }}
                  >
                    Order Image/Video
                  </th>
                  <th className="py-3">Address</th>
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
                        <span
                          className={`badge ${
                            item?.status === "pending"
                              ? "bg-warning text-dark"
                              : item?.status === "Accept"
                              ? "bg-success"
                              : item?.status === "Cancelled"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}
                        >
                          {item?.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`badge ${
                            item.orderStatus === "pending"
                              ? "bg-warning text-dark"
                              : item.orderStatus === "Completed"
                              ? "bg-success"
                              : item.orderStatus === "cancelled"
                              ? "bg-danger"
                              : item.orderStatus === "inProcess"
                              ? "bg-info text-dark"
                              : "bg-secondary"
                          }`}
                        >
                          {item.orderStatus}
                        </span>
                      </td>
                      <td
                        className="py-3 text-center"
                        style={{ minWidth: "150px", maxWidth: "200px" }}
                      >
                        {uploadedFiles[item.ordNo] ? (
                          <div className="d-flex flex-column align-items-center justify-content-center gap-2">
                            {uploadedFiles[item.ordNo].type.startsWith(
                              "image/"
                            ) ? (
                              <img
                                src={URL.createObjectURL(
                                  uploadedFiles[item.ordNo]
                                )}
                                alt="Preview"
                                className="img-thumbnail"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <video
                                src={URL.createObjectURL(
                                  uploadedFiles[item.ordNo]
                                )}
                                controls
                                style={{
                                  width: "120px",
                                  height: "80px",
                                  borderRadius: "8px",
                                  background: "#000",
                                }}
                              />
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                setUploadedFiles((prev) => {
                                  const updated = { ...prev };
                                  delete updated[item.ordNo];
                                  return updated;
                                });
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="form-control"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;

                              const fileType = file.type;
                              const isImage = fileType.startsWith("image/");
                              const isVideo = fileType.startsWith("video/");

                              if (!isImage && !isVideo) {
                                toast.error(
                                  "Only image or video files are allowed"
                                );
                                e.target.value = "";
                                return;
                              }

                              const maxSize = isImage
                                ? 20 * 1024 * 1024
                                : 50 * 1024 * 1024;
                              if (file.size > maxSize) {
                                toast.error(
                                  `File too large. Max size is ${
                                    isImage ? "20MB" : "50MB"
                                  }`
                                );
                                e.target.value = "";
                                return;
                              }

                              setUploadedFiles((prev) => ({
                                ...prev,
                                [item.ordNo]: file,
                              }));
                            }}
                          />
                        )}
                      </td>
                      <Suspense
                        fallback={<td className="text-center">Loading...</td>}
                      >
                        <OrderMediaCell orderMedia={item?.orderMedia} />
                      </Suspense>
                      <td>
                        <button
                          className="btn btn-primary"
                          disabled={item?.status !== "Accept"}
                          onClick={() => {
                            if (item?.status === "Accept") {
                              setViewSelectedOrders(item?.store);
                              setShowviewAddressModal(true);
                            }
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="text-center py-5">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="d-flex justify-content-center mt-4">
              <Pagination
                pageCount={pagination?.totalPages || 1}
                currentPage={pagination.page || 1}
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
      <ViewAddressModel
        show={showviewAddressModal}
        onHide={() => setShowviewAddressModal(false)}
        storeData={viewSelectedAddress}
      />
    </div>
  );
};

export default UniversalStockOrderCom;
