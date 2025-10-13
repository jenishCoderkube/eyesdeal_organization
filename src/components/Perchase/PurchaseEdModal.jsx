import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { purchaseService } from "../../services/purchaseService"; // Adjust the import path

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const PurchaseEdModal = ({ show, onHide, purchaseId, onUpdateSuccess }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(null);
  const [editableData, setEditableData] = useState([]);
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getPurchaseDetails = async () => {
    setLoading(true);
    const response = await purchaseService.getPurchaseOrderById(
      purchaseId?._id
    );
    if (response.success) {
      setPurchase(response.data?.data);
    } else {
      toast.error(response.message || "Failed to fetch purchase data");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (purchaseId) getPurchaseDetails();
  }, [purchaseId]);

  // initialize editable data (ensure totalAmount is a number)
  useEffect(() => {
    if (purchase && purchase.items) {
      const data = purchase.items.map((item) => {
        const rate =
          item.purchaseRate !== undefined
            ? Number(item.purchaseRate)
            : Number(item.product?.costPrice || 0);
        const qty = item.quantity !== undefined ? Number(item.quantity) : 0;
        const total = qty * rate;
        return {
          ...item,
          // keep values as numbers except allow empty string later while editing
          purchaseRate: rate,
          quantity: qty,
          totalAmount: Number.isFinite(total) ? total : 0,
        };
      });
      setEditableData(data);
    }
  }, [purchase]);

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

  // Debounced search
  useEffect(() => {
    if (!purchase) return;
    const data = purchase.items || [];
    const debouncedFilter = debounce((query) => {
      setFilteredProducts(filterGlobally(data, query));
    }, 200);
    debouncedFilter(searchQuery);
    // Note: debounce implementation doesn't expose timeout property; cleanup omitted
  }, [searchQuery, purchase, filterGlobally]);

  const tableData = filteredProducts || editableData || [];

  // totalQuantity: treat empty qty as 1 for display/calculation per your requirement
  const totalQuantity = tableData.reduce((sum, item) => {
    const qty = item.quantity === "" ? 1 : Number(item.quantity) || 0;
    return sum + qty;
  }, 0);

  // totalAmount: sum numeric totalAmount (we store it as number)
  const totalAmount = tableData
    .reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0)
    .toFixed(2);

  // Allow blank input but compute totals using default fallbacks; store totalAmount as number
  const handleInlineChange = (index, field, value) => {
    setEditableData((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === "quantity") {
        // Allow empty string while typing
        if (value === "") {
          item.quantity = "";
        } else {
          let qty = Number(value);
          if (isNaN(qty)) qty = 1;
          if (qty < 1) qty = 1;
          if (qty > 5000) qty = 5000;
          item.quantity = qty;
        }
      } else if (field === "purchaseRate") {
        if (value === "") {
          item.purchaseRate = "";
        } else {
          let rate = Number(value);
          if (isNaN(rate)) rate = 0;
          if (rate < 0) rate = 0;
          item.purchaseRate = rate;
        }
      }

      // compute numeric values for calculation (use defaults)
      const qtyForCalc = item.quantity === "" ? 1 : Number(item.quantity) || 0;
      const rateForCalc =
        item.purchaseRate === "" ? 0 : Number(item.purchaseRate) || 0;
      item.totalAmount = qtyForCalc * rateForCalc; // numeric

      updated[index] = item;
      return updated;
    });
  };

  // Submit: convert empty inputs to defaults (1 or 0)
  const handleSubmitAll = async () => {
    if (!purchaseId) return;

    setSaving(true);
    const items = editableData.map((item) => {
      const qty = item.quantity === "" ? 1 : Number(item.quantity) || 0;
      const rate =
        item.purchaseRate === "" ? 0 : Number(item.purchaseRate) || 0;
      return {
        _id: item._id,
        product: item.product._id,
        quantity: qty,
        purchaseRate: rate,
        totalAmount: qty * rate,
      };
    });

    const payload = {
      _id: purchaseId,
      store: purchase?.store?._id,
      user: purchase?.user?._id,
      items,
    };

    try {
      const response = await purchaseService.updatePurchaseOrder(payload);
      if (response.success) {
        toast.success("Purchase items updated successfully");
        await getPurchaseDetails();
        onUpdateSuccess();
      } else {
        toast.error(response.message || "Failed to update data");
      }
    } catch (error) {
      console.error("Error updating purchase order:", error);
      toast.error(error.message || "Error updating data");
    } finally {
      setSaving(false);
    }
  };

  const exportToExcel = () => {
    if (!purchase) return;

    const data = tableData.map((item, index) => {
      const qty = item.quantity === "" ? 1 : Number(item.quantity) || 0;
      const price =
        item.purchaseRate === ""
          ? 0
          : Number(item.purchaseRate) || item.product?.costPrice || 0;
      const amount = qty * price;
      return {
        SRNO: index + 1,
        Date: moment(item.createdAt || purchase.createdAt).format("YYYY-MM-DD"),
        Barcode: item.product?.newBarcode || "N/A",
        Store: purchase?.store?.name || "N/A",
        Category: item.product?.__t || "N/A",
        SKU: item.product?.sku || "N/A",
        Quantity: qty,
        Price: price,
        Amount: amount.toFixed(2),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Products");
    XLSX.writeFile(
      workbook,
      `Purchase_${purchase.invoiceNumber || "data"}.xlsx`
    );
  };
  // Remove a product row by index
  const handleDeleteItem = (index) => {
    setEditableData((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Body>
        <div>
          <div className="border-bottom p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                ORGANIZATION:{" "}
                {purchase?.user?.organizationId?.companyName ||
                  purchase?.user?.name ||
                  "N/A"}
              </div>
              <button onClick={onHide}>&times;</button>
            </div>
          </div>

          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex gap-5 mb-3">
                <div>TOTAL QTY: {totalQuantity}</div>
                <div>TOTAL AMT: {totalAmount}</div>
              </div>
              <div className="d-flex gap-5 mb-3">
                <div>
                  Date: {moment(purchase?.createdAt).format("YYYY-MM-DD")}
                </div>
              </div>
            </div>

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

            {/* Editable Table */}
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>BARCODE</th>
                    <th>SKU</th>
                    <th>QTY</th>
                    <th>PURCHASE RATE</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                {loading ? (
                  <tbody>
                    <tr>
                      <td colSpan="5" className="text-center">
                        Loading...
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody>
                    {editableData.map((item, index) => {
                      // compute display total using defaults (empty qty -> 1, empty rate -> 0)
                      const displayQty =
                        item.quantity === "" ? 1 : Number(item.quantity) || 0;
                      const displayRate =
                        item.purchaseRate === ""
                          ? 0
                          : Number(item.purchaseRate) || 0;
                      const displayTotal = (displayQty * displayRate).toFixed(
                        2
                      );

                      return (
                        <tr key={item._id || index}>
                          <td>{item.product?.newBarcode || "N/A"}</td>
                          <td>{item.product?.sku || "N/A"}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={item.quantity}
                              disabled
                              onChange={(e) =>
                                handleInlineChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              placeholder="Qty"
                              min="1"
                              max="5000"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={item.purchaseRate}
                              disabled
                              onChange={(e) =>
                                handleInlineChange(
                                  index,
                                  "purchaseRate",
                                  e.target.value
                                )
                              }
                              placeholder="Rate"
                              min="0"
                            />
                          </td>
                          <td>{displayTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                )}
              </table>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PurchaseEdModal;
