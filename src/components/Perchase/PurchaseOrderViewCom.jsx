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

const PurchaseOrderViewCom = () => {
  const [organizationData, setOrganizationData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    totalDocs: 0,
    totalPages: 1,
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
      organizations: [],
      dateFrom: moment().subtract(1, "month").format("YYYY-MM-DD"),
      dateTo: moment().format("YYYY-MM-DD"),
    },
    validationSchema: Yup.object({
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

  const fetchOrganizations = async () => {
    try {
      const response = await inventoryService.getOrganization(1, 20);
      if (response.success) {
        setOrganizationData(response.data.docs || []);
      } else {
        toast.error(response.message || "Failed to fetch organizations");
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      toast.error("Failed to fetch organizations");
    }
  };

  const organizationOptions = organizationData.map((org) => ({
    value: org._id,
    label: org.companyName,
  }));

  useEffect(() => {
    const init = async () => {
      await fetchOrganizations();
      fetchPurchaseData(formik.values, true);
    };
    init();
  }, []);

  const fetchPurchaseData = async (values, isInitial = false, newPage = 1) => {
    const orgIds = values?.organizations?.map((o) => o.value) || [];
    setLoading(true);

    try {
      const response = await purchaseService.getPurchaseOrders(
        values.dateFrom,
        values.dateTo,
        orgIds,
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

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
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
        return "badge bg-warning text-dark";
      case "success":
        return "badge bg-success";
      case "rejected":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  return (
    <div className="card-body p-4">
      <h4 className="mb-4 font-weight-bold">View Purchase Orders</h4>
      <Form
        onSubmit={formik.handleSubmit}
        className="row row-cols-1 row-cols-md-4 g-3 align-items-end"
      >
        <div className="col">
          <Form.Label className="form-label fw-medium">Organization</Form.Label>
          <Select
            isMulti
            options={organizationOptions}
            value={formik.values.organizations}
            onChange={(selected) =>
              formik.setFieldValue("organizations", selected)
            }
            placeholder="Select..."
            classNamePrefix="react-select"
            className="w-100"
          />
          {formik.touched.organizations && formik.errors.organizations && (
            <div className="text-danger">{formik.errors.organizations}</div>
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
                        <td className="py-3">
                          <span
                            className={getStatusBadge(item.paymentStatus)}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedPaymentItem(item);
                              setShowPaymentModal(true);
                            }}
                          >
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
                <Button
                  variant="outline-primary"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <EditPaymentStatusModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        purchaseItem={selectedPaymentItem}
      />
      {showViewModal && (
        <PurchaseEdModal
          show={showViewModal}
          onHide={() => setShowViewModal(false)}
          purchaseId={selectedItem}
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
