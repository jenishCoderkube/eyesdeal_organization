import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "react-bootstrap";
import moment from "moment";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import vendorshopService from "../../services/Process/vendorshopService";
import { toast } from "react-toastify";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const PurchaseModal = ({
  show,
  onHide,
  purchase,
  filterType,
  onUpdate,
  currentPage,
}) => {
  console.log("get data from modelpurchase<<<", purchase);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(null);
  const [editableData, setEditableData] = useState([]);

  useEffect(() => {
    if (purchase) {
      const data = purchase.products || purchase.jobWorks || [];
      setEditableData(data);
    }
  }, [purchase]);

  // Custom global filter function
  const filterGlobally = useCallback((data, query) => {
    if (!query || !data) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter((item) => {
      if (item.product) {
        // For purchase logs (products)
        return [
          item.product.newBarcode?.toString(),
          item.product.sku,
          item.quantity?.toString(),
          item.purchaseRate?.toString(),
          item.tax?.toString(),
          item.totalDiscount?.toString(),
          item.totalAmount?.toString(),
        ].some((field) => field?.toLowerCase().includes(lowerQuery));
      } else if (item.lens) {
        // For invoices (jobWorks)
        return [
          item.lens.barcode?.toString(),
          item.lens.sku,
          item.sale?.totalQuantity?.toString(),
          item.lens.mrp?.toString(),
          item.sale?.totalTax?.toString(),
          item.sale?.totalDiscount?.toString(),
          item.sale?.netAmount?.toString(),
        ].some((field) => field?.toLowerCase().includes(lowerQuery));
      }
      return false;
    });
  }, []);

  // Debounced filter logic
  useEffect(() => {
    if (!purchase) return;
    const data = purchase.products || purchase.jobWorks || [];
    const debouncedFilter = debounce((query) => {
      setFilteredProducts(filterGlobally(data, query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, purchase, filterGlobally]);

  // Use filtered data if available, otherwise use full dataset
  const tableData =
    filteredProducts ||
    editableData ||
    (purchase ? purchase.products || purchase.jobWorks || [] : []);

  // Calculate totals for display
  const totalQuantity =
    tableData.length > 0
      ? tableData.reduce((sum, item) => {
          return sum + (item.quantity || item.sale?.totalQuantity || 0);
        }, 0)
      : 0;
  const totalAmount =
    tableData.length > 0
      ? tableData
          .reduce((sum, item) => {
            return sum + (item.totalAmount || item.sale?.netAmount || 0);
          }, 0)
          .toFixed(2)
      : "0.00";

  // Handle input changes
  const handleRateChange = useCallback((rowIndex, newRate) => {
    setEditableData((prev) =>
      prev.map((item, i) =>
        i === rowIndex
          ? {
              ...item,
              lens: item.lens
                ? {
                    ...item.lens,
                    item: {
                      ...item.lens.item,
                      costPrice: parseFloat(newRate),
                    },
                  }
                : item.lens,
              purchaseRate: parseFloat(newRate) || 0, // Support products
            }
          : item
      )
    );
  }, []);

  const handleTaxChange = useCallback((rowIndex, newTax) => {
    setEditableData((prev) =>
      prev.map((item, i) =>
        i === rowIndex
          ? {
              ...item,
              lens: item.lens
                ? {
                    ...item.lens,
                    item: {
                      ...item.lens.item,
                      tax: parseFloat(newTax),
                    },
                  }
                : item.lens,
              tax: parseFloat(newTax) || 0, // Support products
            }
          : item
      )
    );
  }, []);

  // Export to Excel
  const exportToExcel = () => {
    if (!purchase) return;
    const data = tableData.map((item) => {
      if (item.product) {
        return {
          Barcode: item.product.newBarcode,
          SKU: item.product.sku,
          Quantity: item.quantity,
          "Purchase Rate": item.purchaseRate,
          Tax: item.tax,
          "Tax Amount": (item.purchaseRate * item.tax) / 100,
          Discount: item.totalDiscount,
          Total: item.totalAmount,
        };
      } else if (item.lens) {
        return {
          Barcode: item.lens.barcode,
          SKU: item.lens.sku,
          Quantity: item.sale?.totalQuantity,
          "Purchase Rate": item.lens.mrp,
          Tax: item.sale?.totalTax,
          "Tax Amount": item.sale?.totalTax,
          Discount: item.sale?.totalDiscount,
          Total: item.sale?.netAmount,
        };
      }
      return {};
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Products");
    XLSX.writeFile(workbook, `Purchase_${purchase.invoiceNumber}.xlsx`);
  };

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 20;
  const startRow = pageIndex * pageSize;
  const endRow = Math.min((pageIndex + 1) * pageSize, tableData.length);
  const totalRows = tableData.length;
  const totalPages = Math.ceil(totalRows / pageSize);

  // Early return after hooks
  if (!purchase) return null;
  // Handle Save Row
  const handleSaveRow = async (item, rowIndex) => {
    const isLens = !!item.lens;
    const rate = isLens
      ? item.lens?.item?.costPrice ?? 0
      : item.purchaseRate ?? 0;
    const taxRate = isLens ? item.lens?.item?.tax ?? 0 : item.tax ?? 0;
    const taxAmount = (rate * taxRate) / 100;
    const amount = rate + taxAmount;

    // Build payload
    const payload = {
      _id: item._id || purchase._id, // fallback if row doesn't have id
      price: rate,
      taxAmount: taxAmount,
      taxRate: taxRate,
      taxType: "exc", // hardcoded for now
      amount: amount,
      fillStatus: "filled",
      notes: null,
      invoiceNumber: purchase.invoiceNumber,
      invoiceDate: new Date(purchase.invoiceDate).getTime(),
      gstType: "", // can map later if needed
    };

    console.log("Row Payload >>>", payload);
    try {
      const response = await vendorshopService.updateJobWorkData(payload);
      console.log("Update Response >>>", response);

      if (response.success) {
        onUpdate(currentPage); // Refresh data in parent component
        toast.success("Row updated successfully!");
      } else {
        toast.error(response.message || "Failed to update row");
      }
    } catch (error) {
      toast.error("Something went wrong while updating row");
    }
    // TODO: call API here
    // await api.updateRow(payload)
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="overflow-auto"
    >
      <Modal.Body className="p-0">
        <div className="bg-white rounded shadow-lg w-100  max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="px-4 py-3 border-bottom border-slate-200">
            <div className="d-flex justify-content-between align-items-center">
              <div className="font-semibold fs-5">
                Store: {purchase.store.name}
              </div>
              <button
                type="button"
                variant="link"
                className="p-0"
                onClick={onHide}
              >
                <i className="bi bi-x fs-1"></i>
              </button>
            </div>
          </div>

          {/* Purchase Info */}
          <div className="px-4 py-4">
            {/* Vendor, Bill No, Bill Date */}
            <div className="d-flex flex-wrap justify-content-around gap-5 mx-auto mb-4">
              <div className="mb-3 mb-md-0">
                <p className="mb-0 font-size-normal">
                  VENDOR:{" "}
                  <span className="font-size-normal">
                    {purchase.vendor.companyName}
                  </span>
                </p>
              </div>
              <div className="mb-3 mb-md-0">
                <p className="mb-0 font-size-normal">
                  Bill No:{" "}
                  <span className="font-size-normal">
                    {purchase.invoiceNumber}
                  </span>
                </p>
              </div>
              <div className="mb-3 mb-md-0">
                <p className="mb-0 font-size-normal">
                  BILL DATE:{" "}
                  <span className="font-size-normal">
                    {moment(purchase.invoiceDate).format("DD/MM/YYYY")}
                  </span>
                </p>
              </div>
            </div>

            {/* Totals */}
            <div className="w-full ms-md-5 mx-auto">
              <div className="row row-cols-1 ms-md-4 row-cols-sm-2 row-cols-md-5 justify-content-start gap-2 text-start mb-4">
                <div className="col mb-2">
                  <p className="mb-0 font-size-normal">
                    TOTAL QTY:{" "}
                    <span className="font-size-normal">{totalQuantity}</span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className="mb-0 font-size-normal">
                    TOTAL AMT:{" "}
                    <span className="font-size-normal">{totalAmount}</span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className="mb-0 font-size-normal">
                    TOTAL TAX:{" "}
                    <span className="font-size-normal">
                      {purchase.totalTax ||
                        purchase.jobWorks?.[0]?.sale?.totalTax ||
                        "0"}
                    </span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className="mb-0 font-size-normal">
                    TOTAL DISC:{" "}
                    <span className="font-size-normal">
                      {purchase.totalDiscount ||
                        purchase.jobWorks?.[0]?.sale?.totalDiscount ||
                        "0"}
                    </span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className="mb-0 font-size-normal">
                    OTHER CHARGE:{" "}
                    <span className="font-size-normal">
                      {purchase.otherCharges ||
                        purchase.jobWorks?.[0]?.sale?.otherCharges ||
                        "0"}
                    </span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className="mb-0 font-size-normal">
                    FLAT DISC:{" "}
                    <span className="font-size-normal">
                      {purchase.flatDiscount ||
                        purchase.jobWorks?.[0]?.sale?.flatDiscount ||
                        "0"}
                    </span>
                  </p>
                </div>
                <div className="col mb-2">
                  <p className="mb-0 font-size-normal">
                    NET AMT:{" "}
                    <span className="font-size-normal">
                      {purchase.netAmount ||
                        purchase.jobWorks?.[0]?.sale?.netAmount ||
                        "0"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-sm border border-slate-200">
              <div className="px-4 py-4">
                <div className="d-flex flex-column flex-md-row gap-3 mb-4">
                  <p className="mb-0 font-size-normal fw-normal text-black">
                    Total Quantity: {totalQuantity}
                  </p>
                  <p className="mb-0 font-size-normal fw-normal text-black">
                    Total Amount: {totalAmount}
                  </p>
                  <button
                    className="btn btn-primary ms-md-auto"
                    onClick={exportToExcel}
                  >
                    Export to Excel
                  </button>
                </div>
                <div className="mb-4 col-md-6">
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <FaSearch
                        className="text-muted"
                        style={{ color: "#94a3b8" }}
                      />
                    </span>
                    <input
                      type="search"
                      className="form-control border-start-0"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="table-responsive px-2">
                  <table className="table table-sm">
                    <thead className="text-xs text-uppercase text-muted bg-light border">
                      <tr>
                        <th className="p-3 text-left custom-perchase-th">
                          BARCODE
                        </th>
                        <th className="p-3 text-left custom-perchase-th">
                          SKU
                        </th>
                        <th className="p-3 text-left custom-perchase-th">
                          QTY
                        </th>
                        <th className="p-3 text-left custom-perchase-th">
                          pure RATE
                        </th>
                        <th className="p-3 text-left custom-perchase-th">
                          TAX (%)
                        </th>
                        <th className="p-3 text-left custom-perchase-th">
                          TAX AMOUNT
                        </th>
                        <th className="p-3 text-left custom-perchase-th">
                          Discount
                        </th>
                        <th className="p-3 text-left custom-perchase-th">
                          TOTAL (Rate + Tax)
                        </th>
                        {filterType === "invoice" && (
                          <th className="p-3 text-left custom-perchase-th">
                            ACTION
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {editableData
                        .slice(startRow, endRow)
                        .map((item, index) => {
                          const rowIndex = startRow + index;
                          const isLens = !!item.lens;
                          const rate = isLens
                            ? item.lens?.item?.costPrice ?? 0
                            : item.purchaseRate ?? 0;
                          const tax = isLens
                            ? item.lens?.item?.tax ?? 0
                            : item.tax ?? 0;
                          const discount = item?.totalDiscount;
                          const taxAmount = (rate * tax) / 100;
                          const total = rate + taxAmount;

                          return (
                            <tr key={rowIndex}>
                              <td className="p-3 fw-normal">
                                {item.product?.newBarcode ||
                                  item.lens?.barcode ||
                                  "N/A"}
                              </td>
                              <td className="p-3 fw-normal">
                                {item.product?.sku || item.lens?.sku || "N/A"}
                              </td>
                              <td className="p-3 fw-normal">
                                {item.quantity ||
                                  item.sale?.totalQuantity ||
                                  "N/A"}
                              </td>
                              {filterType === "invoice" ? (
                                <td className="p-3 fw-normal">
                                  <input
                                    type="number"
                                    value={rate}
                                    onChange={(e) =>
                                      handleRateChange(rowIndex, e.target.value)
                                    }
                                    className="form-control form-control-sm text-left"
                                    style={{ width: "100px" }}
                                  />
                                </td>
                              ) : (
                                <td className="p-3 fw-normal">{rate}</td>
                              )}
                              {filterType === "invoice" ? (
                                <td className="p-3 fw-normal">
                                  <input
                                    type="number"
                                    value={tax}
                                    onChange={(e) =>
                                      handleTaxChange(rowIndex, e.target.value)
                                    }
                                    className="form-control form-control-sm text-left"
                                    style={{ width: "80px" }}
                                  />
                                </td>
                              ) : (
                                <td className="p-3 fw-normal">{tax}</td>
                              )}
                              <td className="p-3 fw-normal">
                                {taxAmount.toFixed(2)}
                              </td>
                              <td className="p-3 fw-normal">
                                {discount.toFixed(2)}
                              </td>
                              <td className="p-3 fw-normal">
                                {total.toFixed(2)}
                              </td>
                              {filterType === "invoice" && (
                                <td className="p-3 fw-normal">
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() =>
                                      handleSaveRow(item, rowIndex)
                                    }
                                  >
                                    Save
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3 px-3">
                  <div className="text-sm text-muted mb-3 mb-sm-0">
                    Showing <span className="fw-medium">{startRow + 1}</span> to{" "}
                    <span className="fw-medium">{endRow}</span> of{" "}
                    <span className="fw-medium">{totalRows}</span> results
                  </div>
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-primary"
                      onClick={() =>
                        setPageIndex((prev) => Math.max(prev - 1, 0))
                      }
                      disabled={pageIndex === 0}
                    >
                      Previous
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() =>
                        setPageIndex((prev) =>
                          Math.min(prev + 1, totalPages - 1)
                        )
                      }
                      disabled={pageIndex >= totalPages - 1}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PurchaseModal;
