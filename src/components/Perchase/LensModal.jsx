import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "react-bootstrap";

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const LensModal = ({ show, onHide, lensData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLens, setFilteredLens] = useState([]);
  const [editableLens, setEditableLens] = useState([]);

  // Load lens data
  useEffect(() => {
    if (lensData?.lens) {
      setFilteredLens([lensData.lens]); // ✅ only lens object
    } else {
      setFilteredLens([]);
    }
  }, [lensData]);

  useEffect(() => {
    if (lensData?.lens) {
      setEditableLens([
        {
          ...lensData.lens,
          costPrice: lensData.lens.price || lensData.lens.item?.costPrice || 0,
          taxRate: lensData.lens.taxRate || lensData.lens.item?.tax || 0,
        },
      ]);
    } else {
      setEditableLens([]);
    }
  }, [lensData]);

  // Filtering
  const filterGlobally = useCallback((data, query) => {
    if (!query || !data) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter((item) =>
      [item.barcode, item.sku, item.displayName || item.item?.displayName].some(
        (field) => field?.toString().toLowerCase().includes(lowerQuery)
      )
    );
  }, []);

  useEffect(() => {
    if (!lensData?.lens) return;
    const lensArray = [lensData.lens];
    const debouncedFilter = debounce((query) => {
      setFilteredLens(filterGlobally(lensArray, query));
    }, 200);
    debouncedFilter(searchQuery);
    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, lensData, filterGlobally]);

  // Handle cost price change
  const handleCostPriceChange = (index, value) => {
    const updated = [...editableLens];
    updated[index].costPrice = parseFloat(value) || "";
    setEditableLens(updated);
  };

  // Calculate total with tax
  const calculateTotal = (costPrice, taxRate) => {
    const price = parseFloat(costPrice) || 0;
    const tax = parseFloat(taxRate) || 0;
    return (price + price * (tax / 100)).toFixed(2);
  };

  if (!lensData?.lens) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Body className="p-0">
          <div className="bg-white rounded shadow-lg w-100 max-h-[90vh] overflow-auto">
            <div className="px-4 py-3 border-bottom border-slate-200 d-flex justify-content-between align-items-center">
              <div className="font-semibold fs-5">LENS DETAILS</div>
              <button className="p-0" onClick={onHide}>
                <i className="bi bi-x fs-1"></i>
              </button>
            </div>
            <div className="px-4 py-4 text-center">No lens data available</div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Body className="p-0">
        <div className="bg-white rounded shadow-lg w-100 max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="px-4 py-3 border-bottom border-slate-200 d-flex justify-content-between align-items-center">
            <div className="font-semibold fs-5">LENS DETAILS</div>
            <button className="p-0" onClick={onHide}>
              <i className="bi bi-x fs-1"></i>
            </button>
          </div>

          {/* Invoice / Purchase Summary */}
          <div className="px-4 py-3">
            <div className="row g-3">
              <div className="col-md-4">
                <strong>Vendor:</strong>{" "}
                {lensData?.vendor?.companyName || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>invoiceNumber:</strong>{" "}
                {lensData?.invoiceNumber || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Bill Date:</strong> {lensData?.invoiceDate || "N/A"}
              </div>
              <div className="col-md-3">
                <strong>Total Qty:</strong>{" "}
                {lensData?.sale?.totalQuantity || "0"}
              </div>
              <div className="col-md-3">
                <strong>Total Amount:</strong>{" "}
                {lensData?.sale?.totalAmount || "0.00"}
              </div>
              <div className="col-md-3">
                <strong>Total Tax:</strong> {lensData?.sale?.totalTax || "0.00"}
              </div>
              <div className="col-md-3">
                <strong>Discount:</strong>{" "}
                {lensData?.sale?.netDiscount || "N/A"}
              </div>
              <div className="col-md-3">
                <strong>Other Charges:</strong>{" "}
                {lensData?.sale?.otherCharges || "N/A"}
              </div>

              <div className="col-md-3 fw-bold ">
                <strong>Net Amount:</strong>{" "}
                {lensData?.sale?.netAmount || "0.00"}
              </div>
            </div>
          </div>

          {/* Lens Table */}
          <div className="px-4 py-4">
            <div className="table-responsive px-2">
              <table className="table table-sm">
                <thead className="text-xs text-uppercase text-muted bg-light border">
                  <tr>
                    <th className="p-3 text-left">BARCODE</th>
                    <th className="p-3 text-left">SKU</th>
                    <th className="p-3 text-left">STORE</th>
                    <th className="p-2 text-left">COST PRICE</th>
                    <th className="p-3 text-left">MRP</th>
                    <th className="p-3 text-left">SRP</th>
                    <th className="p-3 text-left">TAX</th>
                    <th className="p-3 text-left">TOTAL AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {editableLens.length > 0 ? (
                    editableLens.map((item, index) => (
                      <tr key={index}>
                        <td className="p-3">{item.barcode || "N/A"}</td>
                        <td className="p-3">{item.sku || "N/A"}</td>
                        <td className="p-3">
                          {lensData?.store?.name || "N/A"}
                        </td>
                        <td className="p-3">{item?.costPrice}</td>
                        <td className="p-3">
                          {item.mrp || item.item?.MRP || "N/A"}
                        </td>
                        <td className="p-3">
                          {item.srp || item.item?.sellPrice || "N/A"}
                        </td>
                        <td className="p-3">{item.taxRate}%</td>
                        <td className="p-3 fw-bold">
                          {calculateTotal(item.costPrice, item.taxRate)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-3 text-center">
                        No matching lenses found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lens Specifications */}
          <div className="px-4 py-4">
            <h6 className="fw-bold mb-3">Lens Specifications</h6>
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <tbody>
                  <tr>
                    <th className="w-25">Lens Material</th>
                    <td>{lensData?.lens?.item?.lensMaterial || "N/A"}</td>
                  </tr>

                  <tr>
                    <th>Gender</th>
                    <td>{lensData?.lens?.item?.gender || "Unisex / N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LensModal;
