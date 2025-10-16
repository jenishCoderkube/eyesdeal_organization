import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import moment from "moment";
import { purchaseService } from "../../services/purchaseService";
import { inventoryService } from "../../services/inventoryService";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Carousel from "react-bootstrap/Carousel";
import Form from "react-bootstrap/Form";
import { defalutImageBasePath } from "../../utils/constants";
import EditPaymentStatusModal from "./EditPaymentStatusModal";
import PurchaseEdModal from "./PurchaseEdModal";
import Pagination from "../Common/Pagination";

const PurchaseOrderViewCom = () => {
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalDocs: 0,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const [storeData, setStoreData] = useState([]);
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
      organizations: Yup.array().nullable(),
      dateFrom: Yup.date().required("Start date is required"),
      dateTo: Yup.date()
        .required("End date is required")
        .min(
          Yup.ref("dateFrom"),
          "End date must be later than or equal to start date"
        ),
    }),
    onSubmit: (values) => {
      fetchPurchaseData(values);
    },
  });
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

  const onUpdateSuccess = () => {
    fetchPurchaseData(formik.values, false, pagination.page);
  };

  const fetchPurchaseData = async (values, isInitial = false, newPage = 1) => {
    const storeId = values?.stores?.map((s) => s.value) || user?.stores || [];
    setLoading(true);

    try {
      const response = await purchaseService.getPurchaseOrders(
        values.dateFrom,
        values.dateTo,
        storeId,
        isInitial ? 1 : newPage,
        pagination.limit
      );

      if (response.success) {
        const container = response.data?.data;
        setPurchaseData(container.docs || []);

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
  const storeOptions = storeData.map((store) => ({
    value: store._id,
    label: store.name,
  }));
  const handleDownload = (data) => {
    // Prepare CSV header
    const csvRows = [
      "SRNO,Date,Store,Category,Barcode,SKU,Quantity,Price,Amount",
      ...data.items.map((item, index) => {
        const quantity = item.quantity || 0;
        const price = item.purchaseRate || item.product?.costPrice || 0;
        const amount = item.totalAmount || (quantity * price).toFixed(2);

        return [
          index + 1, // SRNO
          data.createdAt, // Date
          data.store?.name || "N/A", // Store
          item?.product?.__t || "N/A", // Store

          item.product?.newBarcode || item.product?.oldBarcode || "N/A", // Barcode
          item.product?.sku || "N/A", // SKU
          quantity, // Quantity
          price, // Price
          amount, // Amount
        ].join(",");
      }),
    ];

    // Convert array to CSV string
    const csv = csvRows.join("\n");

    // Create a downloadable blob
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `purchase_order_${data._id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditSubmit = async () => {
    if (!selectedItem) return;

    const payload = {
      _id: selectedItem._id,
      quantity: Number(editedQuantity),
    };

    try {
      const response = await purchaseService.updatePurchaseOrder(payload);
      if (response.success) {
        toast.success("Quantity updated successfully");
        setShowEditModal(false);
        fetchPurchaseData(formik.values, false, pagination.page);
      } else {
        toast.error(response.message || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating purchase order:", error);
      toast.error("Error updating quantity");
    }
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
        return "badge bg-warning text-dark";
      case "success":
        return "badge bg-success";
      case "rejected":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  const handleEditPaymentPurchaseOrder = async (newStatus) => {
    if (!selectedPaymentItem) return;
    const payload = {
      paymentStatus: newStatus,
    };
    try {
      const response = await purchaseService.UpdatePaymentStatus(
        selectedPaymentItem._id,
        payload
      );
      if (response.success) {
        toast.success("Payment status updated successfully");
        setShowPaymentModal(false);
        fetchPurchaseData(formik.values, false, pagination.page);
      } else {
        toast.error(response.message || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Error updating payment status");
    }
  };

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setPagination((prev) => ({ ...prev, page: selectedPage }));
    fetchPurchaseData(formik.values, false, selectedPage);
  };
  return (
    <div className="card-body p-4">
      <h4 className="mb-4 font-weight-bold">View Purchase Orders</h4>
      <Form
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
          <Form.Label className="form-label fw-medium">Date From</Form.Label>
          <Form.Control
            type="date"
            value={formik.values.dateFrom}
            onChange={(e) => formik.setFieldValue("dateFrom", e.target.value)}
          />
          {formik.touched.dateFrom && formik.errors.dateFrom && (
            <div className="text-danger">{formik.errors.dateFrom}</div>
          )}
        </div>
        <div className="col">
          <Form.Label className="form-label fw-medium">Date To</Form.Label>
          <Form.Control
            type="date"
            value={formik.values.dateTo}
            onChange={(e) => formik.setFieldValue("dateTo", e.target.value)}
          />
          {formik.touched.dateTo && formik.errors.dateTo && (
            <div className="text-danger">{formik.errors.dateTo}</div>
          )}
        </div>
        <div className="col">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Form>

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
                  <th className="py-3">Organization</th>
                  <th className="py-3">Total Qty</th>
                  <th className="py-3">Total Amount</th>
                  <th className="py-3">Payment Status</th>
                  <th className="py-3">Actions</th>
                  <th className="py-3">Download</th>
                </tr>
              </thead>
              <tbody>
                {purchaseData.length > 0 ? (
                  purchaseData.map((item, index) => {
                    const totalQuantity = item.items.reduce(
                      (sum, i) => sum + i.quantity,
                      0
                    );
                    const totalAmount = item.items.reduce(
                      (sum, i) => sum + i?.totalAmount,
                      0
                    );
                    return (
                      <tr key={item._id} className="align-middle">
                        <td className="py-3">
                          {index + 1 + (pagination.page - 1) * pagination.limit}
                        </td>
                        <td className="py-3">
                          {moment(item.createdAt).format("YYYY-MM-DD")}
                        </td>
                        <td className="py-3">
                          {item?.user?.organizationId?.companyName ||
                            item?.user?.name ||
                            "N/A"}
                        </td>
                        <td className="py-3">{totalQuantity}</td>
                        <td className="py-3">{totalAmount}</td>

                        <td className="py-3">
                          <span className={getStatusBadge(item.paymentStatus)}>
                            {item.paymentStatus
                              ? item.paymentStatus.charAt(0).toUpperCase() +
                                item.paymentStatus.slice(1).toLowerCase()
                              : "Pending"}
                          </span>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowViewModal(true);
                            }}
                          >
                            View
                          </Button>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setDeleteItemId(item._id);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleDownload(item)}
                          >
                            Download
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
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
                <Pagination
                  pageCount={pagination?.totalPages || 1}
                  currentPage={pagination.page || 1} // 1-based
                  onPageChange={handlePageClick}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <EditPaymentStatusModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        purchaseItem={selectedPaymentItem}
        onUpdate={handleEditPaymentPurchaseOrder}
      />
      {showViewModal && (
        <PurchaseEdModal
          show={showViewModal}
          onHide={() => setShowViewModal(false)}
          purchaseId={selectedItem}
          onUpdateSuccess={onUpdateSuccess}
        />
      )}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Quantity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Control
              type="text"
              disabled
              value={selectedItem?.product?._id || ""}
            />
            <Form.Label className="mt-3">Quantity</Form.Label>
            <Form.Control
              type="number"
              value={editedQuantity}
              autoFocus
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                  setEditedQuantity("");
                } else {
                  let num = Number(val);
                  if (num > 5000) num = 5000;
                  setEditedQuantity(num);
                }
              }}
              onBlur={() => {
                if (!editedQuantity || editedQuantity < 1) {
                  setEditedQuantity(1);
                }
              }}
            />
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
