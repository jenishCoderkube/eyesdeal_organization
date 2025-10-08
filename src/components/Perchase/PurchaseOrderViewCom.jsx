import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import moment from "moment";
import { purchaseService } from "../../services/purchaseService"; // Adjust the path to your service file
import { inventoryService } from "../../services/inventoryService";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Carousel from "react-bootstrap/Carousel";
import Form from "react-bootstrap/Form";
import { defalutImageBasePath } from "../../utils/constants";
import EditPaymentStatusModal from "./EditPaymentStatusModal";

const PurchaseOrderViewCom = () => {
  const [storeData, setStoreData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalDocs: 0,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedQuantity, setEditedQuantity] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (selectedItem) {
      setEditedQuantity(selectedItem.quantity);
    }
  }, [selectedItem]);

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
      fetchPurchaseData(values);
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
        formik.setFieldValue("stores", [
          {
            value: defaultStore._id,
            label: defaultStore.name,
          },
        ]);
        fetchPurchaseData(formik.values, true);
      }
    }
  }, [storeData]);

  const fetchStores = async () => {
    try {
      const response = await inventoryService.getStores();
      if (response.success) {
        setStoreData(response.data.data);
      } else {
        toast.error(response.message || "Failed to fetch stores");
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to fetch stores");
    }
  };

  const fetchPurchaseData = async (values, isInitial = false, newPage) => {
    const storeId = values?.stores?.map((s) => s.value) || user?.stores || [];

    setLoading(true);

    try {
      const response = await purchaseService.getPurchaseOrders(
        values.dateFrom, // invoiceDateGte
        values.dateTo, // invoiceDateLte
        storeId ? storeId : [], // storeIds as array

        isInitial ? 1 : newPage, // page
        pagination.limit // rowsPerPage
      );

      if (response.success) {
        const container = response.data.data;
        setPurchaseData(container.docs);

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

  const handleDownload = (data) => {
    const csv = [
      "SRNO,Model Number,Date,Store,Quantity,Payment Status",
      `${data.srno},${data?.modelNumber},${data.date},${data.store},${data.quantity},${data.paymentStatus}`,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `purchase_order_${data.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditSubmit = async () => {
    if (!selectedItem) return;

    const payload = {
      _id: selectedItem._id, // purchase order ID
      quantity: editedQuantity, // new quantity
    };

    try {
      // Call the PATCH API
      const response = await purchaseService.updatePurchaseOrder(payload); // you need this service function

      if (response.success) {
        toast.success("Quantity updated successfully");
        setShowEditModal(false);
        // Refresh purchase orders
        fetchPurchaseData(formik.values, false, pagination.page);
      } else {
        toast.error(response.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating purchase order:", error);
      toast.error("Error updating quantity");
    }
  };

  const storeOptions = storeData.map((store) => ({
    value: store._id,
    label: store.name,
  }));

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchPurchaseData(formik.values, false, newPage);
  };
  const handleDeletePurchaseOrder = async () => {
    if (!deleteItemId) return;

    try {
      const response = await purchaseService.deletePurchaseOrder(deleteItemId);

      if (response.success) {
        toast.success("Purchase order deleted successfully");
        fetchPurchaseData(formik.values, false, pagination.page);
      } else {
        toast.error(response.message || "Failed to delete purchase order");
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      toast.error("Error deleting purchase order");
    } finally {
      setShowDeleteModal(false);
      setDeleteItemId(null);
    }
  };
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "badge bg-warning text-dark"; // yellow
      case "success":
        return "badge bg-success"; // green
      case "rejected":
        return "badge bg-danger"; // red
      default:
        return "badge bg-secondary"; // grey for unknown
    }
  };

  return (
    <div className="card-body p-4">
      <h4 className="mb-4 font-weight-bold">View Purchase Orders</h4>
      <form
        onSubmit={formik.handleSubmit}
        className="row row-cols-1 row-cols-md-4 g-3 align-items-end"
      >
        <div className="col">
          <label className="form-label fw-medium">Stores</label>
          <Select
            isMulti={true} // <-- multi-select enabled
            options={storeOptions}
            value={formik.values.stores} // array of selected options
            onChange={(selected) => formik.setFieldValue("stores", selected)}
            placeholder="Select..."
            classNamePrefix="react-select"
            className="w-100"
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

      <div className="table-responsive mt-3">
        {loading ? (
          <div className="text-center py-5">Loading...</div>
        ) : (
          <>
            <table className="table table-striped table-hover">
              <thead className="border-top">
                <tr>
                  <th className="py-3">SRNO</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Store</th>
                  <th className="py-3">Qty</th>
                  <th className="py-3">Payment Status</th>
                  <th className="py-3">Actions</th>
                  <th className="py-3">Download</th>
                </tr>
              </thead>
              <tbody>
                {purchaseData.length > 0 ? (
                  purchaseData.map((item, index) => (
                    <tr key={item._id} className="align-middle">
                      <td className="py-3">
                        {index + 1 + (pagination.page - 1) * pagination.limit}
                      </td>
                      <td className="py-3">
                        {moment(item.createdAt).format("YYYY-MM-DD")}
                      </td>
                      <td className="py-3">{item.store?.name || "N/A"}</td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3">
                        <span
                          className={getStatusBadge(item.paymentStatus)}
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setSelectedPaymentItem(item); // store selected item
                            setShowPaymentModal(true); // open modal
                          }}
                        >
                          {item.paymentStatus
                            ? item.paymentStatus.charAt(0).toUpperCase() +
                              item.paymentStatus.slice(1).toLowerCase()
                            : "Pending"}
                        </span>
                      </td>

                      <td className="py-3">
                        <button
                          className="btn btn-outline-primary btn-sm me-1"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowViewModal(true);
                          }}
                        >
                          View
                        </button>
                        {/* <button
                          className="btn btn-outline-warning btn-sm me-1"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowEditModal(true);
                          }}
                        >
                          Edit
                        </button> */}
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            setDeleteItemId(item._id); // store ID to delete
                            setShowDeleteModal(true); // open modal
                          }}
                        >
                          Delete
                        </button>
                      </td>
                      <td className="py-3">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            handleDownload({
                              srno:
                                index +
                                1 +
                                (pagination.page - 1) * pagination.limit,
                              modelNumber: item?.product?.modelNumber,
                              date: item.createdAt,
                              store: item.store?.name || "N/A",
                              quantity: item.quantity,
                              paymentStatus: item.paymentStatus,
                            })
                          }
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Showing{" "}
                {purchaseData.length > 0
                  ? (pagination.page - 1) * pagination.limit + 1
                  : 0}{" "}
                to{" "}
                {(pagination.page - 1) * pagination.limit + purchaseData.length}{" "}
                of {pagination.totalDocs} results
              </div>
              <div className="btn-group">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <EditPaymentStatusModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        purchaseItem={selectedPaymentItem}
        // onUpdate={async (newStatus) => {
        //   try {
        //     const payload = {
        //       _id: selectedPaymentItem._id,
        //       paymentStatus: newStatus,
        //     };
        //     const response = await purchaseService.updatePurchaseOrder(payload);
        //     if (response.success) {
        //       toast.success("Payment status updated successfully");
        //       fetchPurchaseData(formik.values, false, pagination.page);
        //     } else {
        //       toast.error(response.message || "Failed to update status");
        //     }
        //   } catch (error) {
        //     console.error("Error updating status:", error);
        //     toast.error("Error updating status");
        //   } finally {
        //     setShowPaymentModal(false);
        //     setSelectedPaymentItem(null);
        //   }
        // }}
      />

      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Purchase Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div className="container">
              {/* Top Row - Image (left) + Product Details (right) */}
              <div className="row mb-4">
                <div className="col-md-5">
                  {selectedItem.product?.photos &&
                  selectedItem.product?.photos?.length > 0 ? (
                    <Carousel interval={null}>
                      {selectedItem.product?.photos?.map((photo, idx) => (
                        <Carousel.Item key={idx}>
                          <img
                            className="d-block w-100 rounded shadow-sm"
                            src={defalutImageBasePath + photo}
                            alt={`Product ${idx + 1}`}
                            style={{ maxHeight: "300px", objectFit: "contain" }}
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  ) : (
                    <div className="d-flex  justify-content-center align-items-center h-100 ">
                      No Image Found
                    </div>
                  )}
                </div>

                <div className="col-md-7">
                  <h5 className="text-primary">Product Details</h5>
                  <p>
                    <strong>Display Name:</strong>{" "}
                    {selectedItem.product?.displayName}
                  </p>
                  <p>
                    <strong>Model Number:</strong>{" "}
                    {selectedItem.product?.modelNumber}
                  </p>
                  <p>
                    <strong>Color Number:</strong>{" "}
                    {selectedItem.product?.colorNumber}
                  </p>

                  <p>
                    <strong>Frame Size:</strong>{" "}
                    {selectedItem.product?.frameSize}
                  </p>
                  <p>
                    <strong>MRP:</strong> ₹{selectedItem.product?.MRP}
                  </p>
                </div>
              </div>

              {/* Bottom Row - Store + Order Details */}
              <div className="row">
                <div className="col-md-6">
                  <h5 className="text-success">Store Details</h5>
                  <p>
                    <strong>Name:</strong> {selectedItem.store?.name}
                  </p>
                  <p>
                    <strong>Company:</strong> {selectedItem.store?.companyName}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedItem.store?.address},{" "}
                    {selectedItem.store.city}, {selectedItem.store?.state},{" "}
                    {selectedItem.store.country} - {selectedItem.store?.pincode}
                  </p>
                </div>

                <div className="col-md-6">
                  <h5 className="text-warning">Order Details</h5>
                  <p>
                    <strong>Quantity:</strong> {selectedItem?.quantity}
                  </p>
                  <p>
                    <strong>Payment Status:</strong>{" "}
                    {selectedItem?.paymentStatus}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {moment(selectedItem?.createdAt).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )}
                  </p>
                  <p>
                    <strong>Updated:</strong>{" "}
                    {moment(selectedItem?.updatedAt).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        {console.log("selectedItem", selectedItem)}
        <Modal.Header closeButton>
          <Modal.Title>Edit Quantity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              type="text"
              disabled
              value={selectedItem?.product?._id}
            />
            <Form.Label className="mt-3">Quantity</Form.Label>
            <Form.Control
              type="number"
              value={editedQuantity}
              autoFocus
              onChange={(e) => {
                const val = e.target.value;
                // Allow empty while typing, otherwise clamp between 1 and 5000
                if (val === "") {
                  setEditedQuantity("");
                } else {
                  let num = Number(val);
                  if (num > 5000) num = 5000; // enforce max
                  setEditedQuantity(num);
                }
              }}
              onBlur={() => {
                // If empty or <1, reset to 1
                if (!editedQuantity || editedQuantity < 1) {
                  setEditedQuantity(1);
                }
              }}
            />
            {/* Optional inline error */}
            {editedQuantity !== "" &&
              (editedQuantity < 1 || editedQuantity > 5000) && (
                <small className="text-danger">
                  Quantity must be between 1 and 5000
                </small>
              )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleEditSubmit}
            disabled={
              !editedQuantity || editedQuantity < 1 || editedQuantity > 5000
            }
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this purchase order?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeletePurchaseOrder}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PurchaseOrderViewCom;
