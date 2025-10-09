import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import moment from "moment";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { purchaseService } from "../../services/purchaseService"; // Adjust the import path as needed

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const PurchaseEdModal = ({ show, onHide, purchase }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(null);
  const [editableData, setEditableData] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedQuantity, setEditedQuantity] = useState("");
  const [editedRate, setEditedRate] = useState("");

  console.log("purchase in edit modal", purchase);

  useEffect(() => {
    if (purchase && purchase.items) {
      // Initialize editableData with purchaseRate and totalAmount
      const data = purchase.items.map((item) => ({
        ...item,
        purchaseRate: item.purchaseRate || item.product?.costPrice || 0,
        totalAmount:
          item.totalAmount ||
          item.quantity * (item.purchaseRate || item.product?.costPrice) ||
          0,
      }));
      setEditableData(data);
    }
  }, [purchase]);

  // Custom global filter function
  const filterGlobally = useCallback((data, query) => {
    if (!query || !data) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter((item) =>
      [
        item.product?.newBarcode?.toString(),
        item.product?.sku,
        item.quantity?.toString(),
        item.purchaseRate?.toString(),
        item.totalAmount?.toString(),
      ].some((field) => field?.toLowerCase().includes(lowerQuery))
    );
  }, []);

  // Debounced filter logic
  useEffect(() => {
    if (!purchase) return;
    const data = purchase.items || [];
    const debouncedFilter = debounce((query) => {
      setFilteredProducts(filterGlobally(data, query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, purchase, filterGlobally]);

  // Use filtered data if available, otherwise use full dataset
  const tableData = filteredProducts || editableData || [];

  // Calculate totals for display
  const totalQuantity = tableData.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  const totalAmount = tableData
    .reduce((sum, item) => sum + (item.totalAmount || 0), 0)
    .toFixed(2);

  // Handle edit button click
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setEditedQuantity(item.quantity || 1);
    setEditedRate(item.purchaseRate || item.product?.costPrice || 0);
    setShowEditModal(true);
  };

  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!selectedItem) return;

    const quantity = Number(editedQuantity);
    const rate = Number(editedRate);
    if (isNaN(quantity) || isNaN(rate)) {
      toast.error("Invalid quantity or rate");
      return;
    }

    const payload = {
      _id: selectedItem._id,
      quantity,
      purchaseRate: rate,
      totalAmount: quantity * rate,
    };

    try {
      const response = await purchaseService.updatePurchaseOrder(payload);
      if (response.success) {
        toast.success("Quantity and rate updated successfully");
        setShowEditModal(false);
        setEditableData((prev) =>
          prev.map((item) =>
            item._id === selectedItem._id
              ? {
                  ...item,
                  quantity,
                  purchaseRate: rate,
                  totalAmount: quantity * rate,
                }
              : item
          )
        );
      } else {
        toast.error(response.message || "Failed to update data");
      }
    } catch (error) {
      console.error("Error updating purchase order:", error);
      toast.error(error.message || "Error updating data");
    }
  };

  // Handle delete button click
  const handleDeleteClick = async (item) => {
    if (!item._id) {
      toast.error("Invalid item ID");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await purchaseService.deletePurchaseOrder(item._id);
      if (response.success) {
        toast.success("Item deleted successfully");
        setEditableData((prev) => prev.filter((i) => i._id !== item._id));
      } else {
        toast.error(response.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      toast.error(error.message || "Error deleting item");
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (!purchase) return;

    const data = tableData.map((item, index) => ({
      SRNO: index + 1,
      Date: moment(item.createdAt || purchase.createdAt).format("YYYY-MM-DD"),
      Store: purchase.user?.name || "N/A",
      Barcode: item.product?.newBarcode || "N/A",
      SKU: item.product?.sku || "N/A",
      Quantity: item.quantity || 0,
      Price: item.purchaseRate || item.product?.costPrice || 0,
      Amount:
        item.totalAmount ||
        (
          item.quantity * (item.purchaseRate || item.product?.costPrice) || 0
        ).toFixed(2),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Products");
    XLSX.writeFile(
      workbook,
      `Purchase_${purchase.invoiceNumber || "data"}.xlsx`
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Body>
        <div>
          {/* Header */}
          <div className="border-bottom p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>ORGANIZATION: {purchase?.user?.name || "N/A"}</div>
              <button onClick={onHide}>&times;</button>
            </div>
          </div>

          {/* Purchase Info */}
          <div className="p-3">
            {/* Totals */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex justify-content-start gap-5 mb-3">
                <div>TOTAL QTY: {totalQuantity}</div>
                <div>TOTAL AMT: {totalAmount}</div>
              </div>
              <div className="d-flex justify-content-start gap-5 mb-3">
                <div>Date: {purchase?.createdAt}</div>
              </div>
            </div>
            {/* Search Bar and Export Button */}
            <div className="d-flex justify-content-between mb-3">
              <div className="input-group w-50">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={exportToExcel}>
                Export to Excel
              </button>
            </div>

            {/* Products Table */}
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>BARCODE</th>
                    <th>SKU</th>
                    <th>QTY</th>
                    <th>PURCHASE RATE</th>
                    <th>TOTAL</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((item, index) => (
                    <tr key={item._id || index}>
                      <td>{item.product?.newBarcode || "N/A"}</td>
                      <td>{item.product?.sku || "N/A"}</td>
                      <td>{item.quantity || 0}</td>
                      <td>
                        {item.purchaseRate || item.product?.costPrice || 0}
                      </td>
                      <td>
                        {item.totalAmount ||
                          (
                            item.quantity *
                              (item.purchaseRate || item.product?.costPrice) ||
                            0
                          ).toFixed(2)}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEditClick(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteClick(item)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Product ID</Form.Label>
              <Form.Control
                type="text"
                disabled
                value={selectedItem?.product?._id || ""}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Quantity</Form.Label>
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
                    if (isNaN(num)) return;
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
            <Form.Group className="mt-3">
              <Form.Label>Purchase Rate</Form.Label>
              <Form.Control
                type="number"
                value={editedRate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setEditedRate("");
                  } else {
                    let num = Number(val);
                    if (isNaN(num)) return;
                    setEditedRate(num);
                  }
                }}
                onBlur={() => {
                  if (!editedRate || editedRate < 0) {
                    setEditedRate(0);
                  }
                }}
              />
              {editedRate !== "" && editedRate < 0 && (
                <small className="text-danger">
                  Purchase rate cannot be negative
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
                !editedQuantity ||
                editedQuantity < 1 ||
                editedQuantity > 5000 ||
                editedRate < 0 ||
                isNaN(editedRate)
              }
            >
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </Modal.Body>
    </Modal>
  );
};

export default PurchaseEdModal;
