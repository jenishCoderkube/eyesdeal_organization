import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

// Debounce utility to optimize search
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

  // Initialize filteredLens with lens data
  useEffect(() => {
    if (lensData?.lens) {
      // Create an array with the lens object, and optionally rightLens and leftLens
      const lensArray = [lensData.lens];
      if (lensData.order?.rightLens) lensArray.push(lensData.order.rightLens);
      if (lensData.order?.leftLens) lensArray.push(lensData.order.leftLens);
      setFilteredLens(lensArray);
    } else {
      setFilteredLens([]);
    }
  }, [lensData]);

  // Filter lenses by barcode, SKU, or displayName
  const filterGlobally = useCallback((data, query) => {
    if (!query || !data) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter((item) =>
      [item.barcode, item.sku, item.displayName || item.item?.displayName].some(
        (field) => field?.toString().toLowerCase().includes(lowerQuery)
      )
    );
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!lensData?.lens) return;
    const lensArray = [lensData.lens];
    if (lensData.order?.rightLens) lensArray.push(lensData.order.rightLens);
    if (lensData.order?.leftLens) lensArray.push(lensData.order.leftLens);
    const debouncedFilter = debounce((query) => {
      setFilteredLens(filterGlobally(lensArray, query));
    }, 200);
    debouncedFilter(searchQuery);
    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, lensData, filterGlobally]);

  // Export filtered data to Excel
  const exportToExcel = () => {
    if (!filteredLens.length) {
      toast.error("No data to export");
      return;
    }
    const data = filteredLens.map((item) => ({
      Barcode: item.barcode || "N/A",
      SKU: item.sku || "N/A",
      DisplayName: item.displayName || item.item?.displayName || "N/A",
      MRP: item.mrp || item.item?.MRP || "N/A",
      SRP: item.srp || item.item?.sellPrice || "N/A",
      Quantity: lensData.sale?.totalQuantity || "N/A",
      Tax: lensData.sale?.totalTax || item.taxRate || item.item?.tax || "N/A",
      TotalAmount: lensData.sale?.netAmount || item.perPieceAmount || "N/A",
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lens Data");
    XLSX.writeFile(workbook, `Lens_Data_${Date.now()}.xlsx`);
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
            <div className="font-semibold fs-5">ORDERS DETAILS</div>
            <button className="p-0" onClick={onHide}>
              <i className="bi bi-x fs-1"></i>
            </button>
          </div>

          {/* Search & Export */}
          <div className="px-4 py-4">
            <div className="d-flex flex-column flex-md-row gap-3 mb-4">
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
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Search by barcode, SKU, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Lens Table */}
            <div className="table-responsive px-2">
              <table className="table table-sm">
                <thead className="text-xs text-uppercase text-muted bg-light border">
                  <tr>
                    <th className="p-3 text-left">BARCODE</th>
                    <th className="p-3 text-left">SKU</th>
                    <th className="p-3 text-left">NAME</th>
                    <th className="p-3 text-left">MRP</th>
                    <th className="p-3 text-left">SRP</th>
                    <th className="p-3 text-left">QTY</th>
                    <th className="p-3 text-left">TAX</th>
                    <th className="p-3 text-left">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredLens.length > 0 ? (
                    filteredLens.map((item, index) => (
                      <tr key={index}>
                        <td className="p-3">{item.barcode || "N/A"}</td>
                        <td className="p-3">{item.sku || "N/A"}</td>
                        <td className="p-3">
                          {item.displayName || item.item?.displayName || "N/A"}
                        </td>
                        <td className="p-3">
                          {item.mrp || item.item?.MRP || "N/A"}
                        </td>
                        <td className="p-3">
                          {item.srp || item.item?.sellPrice || "N/A"}
                        </td>
                        <td className="p-3">
                          {lensData.sale?.totalQuantity || "N/A"}
                        </td>
                        <td className="p-3">
                          {lensData.sale?.totalTax ||
                            item.taxRate ||
                            item.item?.tax ||
                            "N/A"}
                        </td>
                        <td className="p-3">
                          {lensData.sale?.netAmount ||
                            item.perPieceAmount ||
                            "N/A"}
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
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LensModal;
