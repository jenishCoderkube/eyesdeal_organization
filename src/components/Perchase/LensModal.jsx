import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "react-bootstrap";

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const LensModal = ({ show, onHide, purchase }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLens, setFilteredLens] = useState([]);
  const [editableLens, setEditableLens] = useState([]);
  console.log(editableLens, "thisbis");
  console.log(purchase, "testing");

  // Load jobWorks data
  useEffect(() => {
    if (purchase?.jobWorks) {
      setFilteredLens([purchase.jobWorks]);
    } else {
      setFilteredLens([]);
    }
  }, [purchase]);

  // Process editableLens from jobWorks
  useEffect(() => {
    if (purchase?.jobWorks) {
      const jobWorks = purchase.jobWorks;
      const lensArray = Object.values(jobWorks).filter((item) => item.lens); // Extract lens entries
      const formattedLens = lensArray.map((jobWork, index) => ({
        ...jobWork,
        costPrice: jobWork.price || jobWork.lens?.costPrice || 0,
        taxRate: jobWork.taxRate || jobWork.lens?.tax || 12, // Default to 12 if taxRate is missing
        barcode: jobWork.lens?.barcode || "N/A",
        sku: jobWork.lens?.sku || "N/A",
        mrp: jobWork.lens?.mrp || "N/A",
        displayName: jobWork.lens?.displayName || "N/A",
      }));
      setEditableLens(formattedLens);
    } else {
      setEditableLens([]);
    }
  }, [purchase]);

  // Filtering
  const filterGlobally = useCallback((data, query) => {
    if (!query || !data) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter((lens) =>
      [lens.barcode, lens.sku, lens.displayName].some((field) =>
        field?.toString().toLowerCase().includes(lowerQuery)
      )
    );
  }, []);

  useEffect(() => {
    if (!purchase?.jobWorks) return;
    const lensArray = Object.values(purchase.jobWorks).filter(
      (item) => item.lens
    );
    const formattedLens = lensArray.map((jobWork) => ({
      ...jobWork,
      barcode: jobWork.lens?.barcode || "N/A",
      sku: jobWork.lens?.sku || "N/A",
      displayName: jobWork.lens?.displayName || "N/A",
    }));
    const debouncedFilter = debounce((query) => {
      setFilteredLens(filterGlobally(formattedLens, query));
    }, 200);
    debouncedFilter(searchQuery);
    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, purchase, filterGlobally]);

  // Handle cost price change
  const handleCostPriceChange = (index, value) => {
    const updated = [...editableLens];
    updated[index].costPrice = parseFloat(value) || 0;
    setEditableLens(updated);
  };

  // Calculate total with tax
  const calculateTotal = (costPrice, taxRate) => {
    const price = parseFloat(costPrice) || 0;
    const tax = parseFloat(taxRate) || 0;
    return (price + price * (tax / 100)).toFixed(2);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Body className="p-0">
        <div className="bg-white rounded shadow-lg w-100 max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="px-4 py-3 border-bottom border-slate-200 d-flex justify-content-between align-items-center">
            <div className="font-semibold fs-5">LENS DETAILS</div>
            <button
              type="button"
              className="btn p-0 border-0 bg-transparent"
              onClick={onHide}
              aria-label="Close"
            >
              <i className="bi bi-x fs-3"></i>
            </button>
          </div>

          {/* Invoice / Purchase Summary */}
          <div className="px-4 py-3">
            <div className="row g-3">
              <div className="col-md-4">
                <strong>Vendor:</strong>{" "}
                {purchase?.vendor?.companyName || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Invoice Number:</strong>{" "}
                {purchase?.invoiceNumber || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Bill Date:</strong> {purchase?.invoiceDate || "N/A"}
              </div>
              {console.log(purchase, "ttttttttttttttt")}
              <div className="col-md-4">
                <strong>Total Qty:</strong> {purchase?.totalQuantity || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Total Amount:</strong> {purchase?.totalAmount || "N/A"}
              </div>
              <div className="col-md-4">
                <strong>Total Tax:</strong>{" "}
                {Math.floor(purchase?.taxAmount) || "0.00"}
              </div>

              <div className="col-md-4">
                <strong>Discount:</strong> {purchase?.flatDiscount}
              </div>
              <div className="col-md-4">
                <strong>Other Charges:</strong> {purchase?.otherCharges}
              </div>
              <div className="col-md-4 fw-bold">
                <strong>Net Amount:</strong> {purchase?.totalAmount || "N/A"}
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
                    <th className="p-3 text-left">COST PRICE</th>
                    <th className="p-3 text-left">MRP</th>
                    <th className="p-3 text-left">TAX</th>
                    <th className="p-3 text-left">TOTAL AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {editableLens.length > 0 ? (
                    editableLens.map((lens, index) => (
                      <tr key={lens._id || index}>
                        <td className="p-3">{lens.barcode || "N/A"}</td>
                        <td className="p-3">{lens.sku || "N/A"}</td>
                        <td className="p-3">
                          {purchase?.store?.name || "N/A"}
                        </td>
                        {console.log("jenish", lens?.lens)}
                        <td className="p-3">
                          {/* <input
                            type="number"
                            value={lens.costPrice || ""}
                            onChange={(e) =>
                              handleCostPriceChange(index, e.target.value)
                            }
                            className="form-control form-control-sm"
                          /> */}
                          {lens?.lens?.item?.costPrice}
                          {/* {lens?.barcode} */}
                        </td>
                        <td className="p-3">{lens.mrp || "N/A"}</td>
                        <td className="p-3">{lens.taxRate}%</td>

                        <td className="p-3 fw-bold">
                          {/* {calculateTotal(lens.costPrice, lens.taxRate)} */}
                          {lens?.lens?.item?.totalAmount}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-3 text-center">
                        No matching lenses found
                      </td>
                    </tr>
                  )}
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
