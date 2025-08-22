import React, { useEffect, useState } from "react";
import { saleService } from "../../services/saleService";
import AsyncSelect from "react-select/async";
import { v4 as uuidv4 } from "uuid";
import "bootstrap/dist/css/bootstrap.min.css";

export default function InventoryData({
  inventoryData,
  setInventoryData,
  setInventoryPairs,
}) {
  const [lensSelections, setLensSelections] = useState({});

  const fetchLensData = async (inputValue) => {
    try {
      const response = await saleService.getLensData(inputValue);
      if (response.success) {
        return response.data.data.docs.map((prod) => ({
          value: prod._id,
          label: `${prod.oldBarcode} / ${prod.sku}`,
          data: prod,
        }));
      } else {
        console.error(response.data.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching lenses:", error);
      return [];
    }
  };

  const calculateInvoiceValues = (mrp, srp, taxRate) => {
    const basePrice = srp / (1 + taxRate / 100);
    const taxAmount = srp - basePrice;
    const discount = mrp - srp;
    const totalAmount = srp;

    return {
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    };
  };

  // Initialize lensSelections from inventoryData
  useEffect(() => {
    const updatedLensSelections = {};
    const updatedData = inventoryData.map((item) => {
      const groupId = item.groupId || item.pairId;
      const data = item.data || {};
      const mrp = parseFloat(data?.MRP) || 0;
      const srp = parseFloat(data?.sellPrice) || 0;
      const taxRate = parseFloat(data?.tax) || 0;

      // Calculate financial values for both frames and lenses
      const { taxAmount, discount, totalAmount } = calculateInvoiceValues(
        mrp,
        srp,
        taxRate
      );

      // Update lensSelections for lenses
      if (["rightLens", "leftLens"].includes(item.type)) {
        updatedLensSelections[groupId] = updatedLensSelections[groupId] || {};
        updatedLensSelections[groupId][item.type] = {
          barcode: data.oldBarcode,
          sku: data.sku,
          item: data._id,
          productName: data.productName,
        };
      }

      return {
        ...item,
        quantity: data.quantity || 1, // Use quantity from data
        taxAmount,
        discount,
        totalAmount,
      };
    });

    setLensSelections((prev) => ({
      ...prev,
      ...updatedLensSelections,
    }));
    setInventoryData(updatedData);
  }, [inventoryData.length, setInventoryData]);

  const handleLensSelection = (selectedLens, lensType, groupId) => {
    const otherLensType = lensType === "rightLens" ? "leftLens" : "rightLens";

    if (!selectedLens) {
      setLensSelections((prev) => ({
        ...prev,
        [groupId]: {
          ...prev[groupId],
          [lensType]: null,
          [otherLensType]: null,
        },
      }));
      setInventoryPairs((prev) =>
        prev.map((pair) => {
          if (pair.pairId === groupId) {
            return { ...pair, [lensType]: null, [otherLensType]: null };
          }
          return pair;
        })
      );
      setInventoryData((prev) =>
        prev.filter(
          (item) =>
            !(
              item.groupId === groupId &&
              (item.type === lensType || item.type === otherLensType)
            )
        )
      );
      return;
    }

    const mrp = parseFloat(selectedLens?.data?.MRP) || 0;
    const srp = parseFloat(selectedLens?.data?.sellPrice) || 0;
    const taxRate = parseFloat(selectedLens?.data?.tax) || 0;

    const { taxAmount, discount, totalAmount } = calculateInvoiceValues(
      mrp,
      srp,
      taxRate
    );

    const lensData = {
      item: selectedLens.data._id,
      unit: selectedLens.data.unit?.name || "Pieces",
      displayName: selectedLens.data.productName || "Lens",
      barcode: selectedLens.data.oldBarcode,
      sku: selectedLens.data.sku,
      mrp,
      srp,
      perPieceDiscount: discount,
      taxRate: `${taxRate} (Inc)`,
      perPieceTax: taxAmount,
      perPieceAmount: totalAmount,
      inclusiveTax: selectedLens.data.inclusiveTax ?? true,
      manageStock: selectedLens.data.manageStock ?? false,
      incentiveAmount: selectedLens.data.incentiveAmount || 0,
      quantity: selectedLens.data.quantity || 1, // Use quantity from data
    };

    setLensSelections((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [lensType]: {
          barcode: selectedLens.data.oldBarcode,
          sku: selectedLens.data.sku,
          item: selectedLens.data._id,
          productName: selectedLens.data.productName,
        },
        [otherLensType]: {
          barcode: selectedLens.data.oldBarcode,
          sku: selectedLens.data.sku,
          item: selectedLens.data._id,
          productName: selectedLens.data.productName,
        },
      },
    }));

    setInventoryPairs((prev) =>
      prev.map((pair) => {
        if (pair.pairId === groupId) {
          return {
            ...pair,
            rightLens: lensData,
            leftLens: lensData,
          };
        }
        return pair;
      })
    );

    setInventoryData((prev) => {
      const newData = prev.filter(
        (item) =>
          !(
            item.groupId === groupId &&
            (item.type === lensType || item.type === otherLensType)
          )
      );
      return [
        ...newData,
        {
          groupId,
          type: lensType,
          data: {
            ...selectedLens.data,
            sellPrice: srp,
            quantity: selectedLens.data.quantity || 1, // Use quantity from data
          },
          quantity: selectedLens.data.quantity || 1,
          taxAmount,
          discount,
          totalAmount,
        },
        {
          groupId,
          type: otherLensType,
          data: {
            ...selectedLens.data,
            sellPrice: srp,
            quantity: selectedLens.data.quantity || 1, // Use quantity from data
          },
          quantity: selectedLens.data.quantity || 1,
          taxAmount,
          discount,
          totalAmount,
        },
      ];
    });
  };

  const handleRemoveGroup = (groupId) => {
    console.log("Removing group:", groupId);

    // Update inventoryData: Remove all items with matching groupId or pairId
    setInventoryData((prev) => {
      const newData = prev.filter(
        (item) => item.groupId !== groupId && item.pairId !== groupId
      );
      console.log("Updated inventoryData:", newData);
      return newData;
    });

    // Update inventoryPairs: Remove pairs with matching pairId
    setInventoryPairs((prev) => {
      const newPairs = prev.filter((pair) => pair.pairId !== groupId);
      console.log("Updated inventoryPairs:", newPairs);
      return newPairs;
    });

    // Update lensSelections: Remove the group from lensSelections
    setLensSelections((prev) => {
      const newSelections = { ...prev };
      delete newSelections[groupId];
      console.log("Updated lensSelections:", newSelections);
      return newSelections;
    });
  };

  const handleRemoveRow = (groupId, rowType) => {
    console.log("Removing row:", groupId, rowType);
    setInventoryData((prev) => {
      const newData = prev.filter(
        (item) => !(item.groupId === groupId && item.type === rowType)
      );
      const remaining = newData.filter(
        (item) => item.groupId === groupId && item.type === "product"
      );
      console.log("Remaining items in group:", remaining);
      if (remaining.length === 0) {
        handleRemoveGroup(groupId);
        return newData;
      }
      return newData;
    });

    setInventoryPairs((prev) =>
      prev.map((pair) => {
        if (pair.pairId === groupId && rowType === "product") {
          return { ...pair, product: null, rightLens: null, leftLens: null };
        }
        return pair;
      })
    );

    setLensSelections((prev) => {
      const newSelections = { ...prev };
      if (rowType === "product") {
        delete newSelections[groupId];
      }
      return newSelections;
    });
  };

  const groupedData = inventoryData.reduce((acc, item) => {
    const groupId = item.groupId || item.pairId || uuidv4();
    if (!acc[groupId]) acc[groupId] = { items: [], hasFrame: false };
    acc[groupId].items.push({ ...item, groupId });

    if (item.type === "product") {
      acc[groupId].hasFrame = true;
    }

    return acc;
  }, {});

  return (
    <div className="px-2">
      <style>
        {`
          .table th, .table td {
            padding: 0.75rem 0.5rem;
            white-space: nowrap;
            vertical-align: middle;
          }
          .table thead {
            background-color: #f8fafc;
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            text-transform: uppercase;
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 600;
          }
          .table tbody {
            font-size: 0.875rem;
          }
          .form-input {
            width: 100%;
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            background-color: #fff;
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075);
          }
          .form-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          }
          .border-slate-300 {
            border-color: #d1d5db;
          }
          .text-slate-500 {
            color: #64748b;
          }
          .bg-slate-50 {
            background-color: #f8fafc;
          }
          .border-slate-200 {
            border-color: #e5e7eb;
          }
          .text-red-500 {
            color: #ef4444;
          }
          .text-red-500:hover {
            color: #dc2626;
          }
          .table-responsive {
            max-height: 400px;
            overflow-y: auto;
          }
          .lens-dropdown-container {
            display: flex;
            gap: 1rem;
            align-items: flex-start;
            margin-top: 1rem;
            z-index: 9999 !important;

          }
          .lens-dropdown {
            flex: 1;
          }
        `}
      </style>
      <div className="table-responsive">
        {Object.keys(groupedData).length === 0 ? (
          <div className="text-center py-3">No products or lenses added</div>
        ) : (
          Object.entries(groupedData).map(
            ([groupId, { items, hasFrame }], groupIndex) => (
              <div key={`group-${groupId}`} className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold">Pair {groupIndex + 1}</span>
                  <button
                    onClick={() => handleRemoveGroup(groupId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                {hasFrame && (
                  <table className="table table-auto w-100">
                    <thead className="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-t border-b border-slate-200">
                      <tr>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div
                            className="font-semibold text-left break-words"
                            style={{ minWidth: "80px" }}
                          >
                            Barcode
                          </div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div
                            className="font-semibold text-left break-words"
                            style={{ minWidth: "160px" }}
                          >
                            SKU
                          </div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div
                            className="font-semibold text-left break-words"
                            style={{ minWidth: "80px" }}
                          >
                            Photos
                          </div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div
                            className="font-semibold text-left break-words"
                            style={{ minWidth: "20px" }}
                          >
                            Stock
                          </div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div
                            className="font-semibold text-left break-words"
                            style={{ minWidth: "80px" }}
                          >
                            MRP
                          </div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div
                            className="font-semibold text-left break-words"
                            style={{ minWidth: "80px" }}
                          >
                            SRP
                          </div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div
                            className="font-semibold text-left break-words"
                            style={{ minWidth: "80px" }}
                          >
                            Tax Rate
                          </div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div
                            className="font-semibold text-left break-words"
                            style={{ minWidth: "20px" }}
                          >
                            Tax Amount
                          </div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div
                            className="font-semibold text-left break-words"
                            style={{ minWidth: "20px" }}
                          >
                            Discount
                          </div>
                        </th>
                        <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                          <div
                            className="font-semibold text-left break-words"
                            style={{ minWidth: "50px" }}
                          >
                            Total Amount
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {items
                        .filter((item) => item.type === "product")
                        .map((item, index) => {
                          const data = item.data || {};

                          const handleSellPriceChange = (e) => {
                            const updated = [...inventoryData];
                            const itemIndex = inventoryData.findIndex(
                              (i) =>
                                i.groupId === groupId && i.type === item.type
                            );
                            const newSRP = parseFloat(e.target.value) || 0;
                            const mrp = parseFloat(data?.MRP) || 0;
                            const taxRate = parseFloat(data?.tax) || 0;

                            updated[itemIndex].data.sellPrice = newSRP;

                            const { taxAmount, discount, totalAmount } =
                              calculateInvoiceValues(mrp, newSRP, taxRate);

                            updated[itemIndex].taxAmount = taxAmount;
                            updated[itemIndex].discount = discount;
                            updated[itemIndex].totalAmount = totalAmount;

                            setInventoryData(updated);

                            setInventoryPairs((prev) =>
                              prev.map((pair) => {
                                if (pair.pairId === groupId) {
                                  return {
                                    ...pair,
                                    product: {
                                      ...pair.product,
                                      srp: newSRP,
                                      perPieceDiscount: discount,
                                      perPieceTax: taxAmount,
                                      perPieceAmount: totalAmount,
                                    },
                                  };
                                }
                                return pair;
                              })
                            );
                          };

                          return (
                            <tr key={`item-${groupId}-${index}`}>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <div className="d-flex align-items-center">
                                  {data?.oldBarcode || ""}
                                </div>
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <textarea
                                  className="form-input w-70"
                                  rows="1"
                                  cols="5"
                                  type="text"
                                  readOnly
                                  value={data?.sku || ""}
                                  style={{ height: "50px" }}
                                />
                              </td>
                              <td className="px-2 first:pl-1 last:pr-1 py-3 whitespace-nowrap">
                                <div className="border border-bottom-0 position-relative">
                                  {data?.photos?.length > 0 ? (
                                    <>
                                      <img
                                        src={data?.photos[0]}
                                        alt="Product"
                                        style={{
                                          width: "50px",
                                          height: "50px",
                                        }}
                                      />
                                      <div
                                        style={{
                                          textDecoration: "underline",
                                          color: "blue",
                                          cursor: "pointer",
                                        }}
                                      >
                                        View More
                                      </div>
                                    </>
                                  ) : (
                                    <p style={{ width: 50, height: 50 }}>
                                      No image
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={item?.quantity || 1}
                                  readOnly
                                  className="form-input w-100"
                                />
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={data?.MRP || ""}
                                  readOnly
                                  className="form-input w-100"
                                />
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={data?.sellPrice || ""}
                                  className="form-input w-100"
                                  onChange={handleSellPriceChange}
                                />
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <input
                                  type="text"
                                  value={`${data?.tax || 0} (Inc)`}
                                  readOnly
                                  className="form-input w-100"
                                />
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={item?.taxAmount || 0}
                                  readOnly
                                  className="form-input w-100"
                                />
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={item?.discount || 0}
                                  readOnly
                                  className="form-input w-100"
                                />
                              </td>
                              <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                <input
                                  type="number"
                                  value={item?.totalAmount || 0}
                                  readOnly
                                  className="form-input w-100"
                                />
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
                <div className="lens-dropdown-container">
                  {["rightLens", "leftLens"].map((lensType) => {
                    const lensData = lensSelections[groupId]?.[lensType];
                    return (
                      <div key={lensType} className="lens-dropdown">
                        <label className="d-block text-sm font-medium mb-1">
                          {lensType === "rightLens"
                            ? "Right Lens"
                            : "Left Lens"}
                        </label>
                        <AsyncSelect
                          cacheOptions
                          loadOptions={fetchLensData}
                          placeholder="Select lens..."
                          isClearable
                          value={
                            lensData
                              ? {
                                  value: lensData.item,
                                  label: `${lensData.barcode} / ${lensData.sku}`,
                                  data: {
                                    _id: lensData.item,
                                    oldBarcode: lensData.barcode,
                                    sku: lensData.sku,
                                    productName: lensData.productName,
                                  },
                                }
                              : null
                          }
                          onChange={(selected) =>
                            handleLensSelection(selected, lensType, groupId)
                          }
                          menuPortalTarget={document.body} // Add this to render the dropdown in a portal
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure dropdown appears on top
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
