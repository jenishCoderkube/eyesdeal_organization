import React, { useEffect, useState } from "react";
import { saleService } from "../../services/saleService";
import AsyncSelect from "react-select/async";
import { v4 as uuidv4 } from "uuid";

export default function InventoryData({
  inventoryData,
  setInventoryData,
  inventoryPairs,
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

  useEffect(() => {
    const updatedData = inventoryData.map((item) => {
      const data = item.data || {};
      const mrp = parseFloat(data?.MRP) || 0;
      const srp = parseFloat(data?.sellPrice) || 0;
      const taxRate = parseFloat(data?.tax) || 0;

      const { taxAmount, discount, totalAmount } = calculateInvoiceValues(
        mrp,
        srp,
        taxRate
      );
      return {
        ...item,
        taxAmount,
        discount,
        totalAmount,
      };
    });
    setInventoryData(updatedData);
  }, [inventoryData.length, setInventoryData]);

  const handleLensSelection = (selectedLens, lensType, groupId, index) => {
    if (!selectedLens) {
      setLensSelections((prev) => ({
        ...prev,
        [groupId]: {
          ...prev[groupId],
          [lensType]: null,
        },
      }));
      setInventoryPairs((prev) => {
        const updated = prev.map((pair) => {
          if (pair.pairId === groupId) {
            return {
              ...pair,
              [lensType]: null,
            };
          }
          return pair;
        });
        return updated;
      });
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

    setLensSelections((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        [lensType]: {
          barcode: selectedLens.data.oldBarcode,
          sku: selectedLens.data.sku,
          item: selectedLens.data._id,
        },
      },
    }));

    setInventoryPairs((prev) => {
      const updated = prev.map((pair) => {
        if (pair.pairId === groupId) {
          const newPair = {
            ...pair,
            [lensType]: {
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
            },
          };

          if (newPair.rightLens && newPair.leftLens) {
            const newGroupId = uuidv4();
            setInventoryData((prevData) => {
              const updatedData = [...prevData];
              updatedData.splice(index, 1);
              updatedData.push({
                type: "rightLens",
                data: newPair.rightLens.item === selectedLens.data._id ? selectedLens.data : pair.rightLens,
                quantity: 1,
                taxAmount: newPair.rightLens.perPieceTax,
                discount: newPair.rightLens.perPieceDiscount,
                totalAmount: newPair.rightLens.perPieceAmount,
                pairId: groupId,
                groupId,
              });
              updatedData.push({
                type: "leftLens",
                data: newPair.leftLens.item === selectedLens.data._id ? selectedLens.data : pair.leftLens,
                quantity: 1,
                taxAmount: newPair.leftLens.perPieceTax,
                discount: newPair.leftLens.perPieceDiscount,
                totalAmount: newPair.leftLens.perPieceAmount,
                pairId: groupId,
                groupId,
              });
              updatedData.push({
                type: "lensDropdown",
                pairId: newGroupId,
                groupId: newGroupId,
              });
              return updatedData;
            });

            setInventoryPairs((prevPairs) => [
              ...prevPairs,
              {
                pairId: newGroupId,
                rightLens: null,
                leftLens: null,
              },
            ]);

            setLensSelections((prev) => ({
              ...prev,
              [newGroupId]: {
                rightLens: null,
                leftLens: null,
              },
            }));
          }
          return newPair;
        }
        return pair;
      });
      return updated;
    });
  };

  const handleRemoveRow = (groupId, index) => {
    setInventoryData((prev) => prev.filter((item, i) => !(item.groupId === groupId && i === index)));
    if (inventoryData.filter((item) => item.groupId === groupId).length === 1) {
      setInventoryPairs((prev) => prev.filter((pair) => pair.pairId !== groupId));
      setLensSelections((prev) => {
        const newSelections = { ...prev };
        delete newSelections[groupId];
        return newSelections;
      });
    }
  };

  const handleRemoveGroup = (groupId) => {
    setInventoryData((prev) => prev.filter((item) => item.groupId !== groupId));
    setInventoryPairs((prev) => prev.filter((pair) => pair.pairId !== groupId));
    setLensSelections((prev) => {
      const newSelections = { ...prev };
      delete newSelections[groupId];
      return newSelections;
    });
  };

  const groupedData = inventoryData.reduce((acc, item) => {
    const groupId = item.groupId || item.pairId || uuidv4();
    if (!acc[groupId]) acc[groupId] = [];
    acc[groupId].push({ ...item, groupId });
    return acc;
  }, {});

  return (
    <div className="px-2">
      <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
        <table className="table-auto w-full">
          <thead className="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-t border-b border-slate-200">
            <tr>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                  Barcode
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "160px" }}>
                  SKU
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                  Photos
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "20px" }}>
                  Stock
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                  MRP
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                  SRP
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                  Tax Rate
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "20px" }}>
                  Tax Amount
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "20px" }}>
                  Discount
                </div>
              </th>
              <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                <div className="font-semibold text-left break-words" style={{ minWidth: "50px" }}>
                  Total Amount
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {Object.keys(groupedData).length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center">
                  No products added
                </td>
              </tr>
            ) : (
              Object.entries(groupedData).map(([groupId, items], groupIndex) => (
                <React.Fragment key={`group-${groupId}`}>
                  <tr>
                    <td colSpan="10" className="py-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Product Group {groupIndex + 1}</span>
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
                      <table className="table-auto w-full mt-2">
                        <thead className="text-xs font-semibold uppercase text-slate-500 bg-slate-50 border-t border-b border-slate-200">
                          <tr>
                            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                                Barcode
                              </div>
                            </th>
                            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="font-semibold text-left break-words" style={{ minWidth: "160px" }}>
                                SKU
                              </div>
                            </th>
                            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                                Photos
                              </div>
                            </th>
                            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="font-semibold text-left break-words" style={{ minWidth: "20px" }}>
                                Stock
                              </div>
                            </th>
                            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                                MRP
                              </div>
                            </th>
                            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                                SRP
                              </div>
                            </th>
                            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="font-semibold text-left break-words" style={{ minWidth: "80px" }}>
                                Tax Rate
                              </div>
                            </th>
                            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="font-semibold text-left break-words" style={{ minWidth: "20px" }}>
                                Tax Amount
                              </div>
                            </th>
                            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="font-semibold text-left break-words" style={{ minWidth: "20px" }}>
                                Discount
                              </div>
                            </th>
                            <th className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                              <div className="font-semibold text-left break-words" style={{ minWidth: "50px" }}>
                                Total Amount
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {items
                            .filter((item) => item.type !== "lensDropdown")
                            .map((item, index) => {
                              const data = item.data || item.product;
                              const isProduct = item.type === "product";

                              const handleSellPriceChange = (e) => {
                                const updated = [...inventoryData];
                                const newSRP = parseFloat(e.target.value) || 0;
                                const mrp = parseFloat(data?.MRP) || 0;
                                const taxRate = parseFloat(data?.tax) || 0;

                                updated[index].data.sellPrice = e.target.value;

                                const { taxAmount, discount, totalAmount } = calculateInvoiceValues(
                                  mrp,
                                  newSRP,
                                  taxRate
                                );

                                updated[index].taxAmount = taxAmount;
                                updated[index].discount = discount;
                                updated[index].totalAmount = totalAmount;

                                setInventoryData(updated);

                                setInventoryPairs((prev) => {
                                  const updated = prev.map((pair) => {
                                    if (pair.pairId === item.pairId) {
                                      const lensKey =
                                        item.type === "rightLens"
                                          ? "rightLens"
                                          : item.type === "leftLens"
                                          ? "leftLens"
                                          : null;
                                      if (lensKey) {
                                        return {
                                          ...pair,
                                          [lensKey]: {
                                            ...pair[lensKey],
                                            srp: newSRP,
                                            perPieceDiscount: discount,
                                            perPieceTax: taxAmount,
                                            perPieceAmount: totalAmount,
                                          },
                                        };
                                      }
                                    }
                                    return pair;
                                  });
                                  return updated;
                                });
                              };

                              return (
                                <tr key={`item-${groupId}-${index}`}>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <button
                                        onClick={() => handleRemoveRow(groupId, inventoryData.findIndex((i) => i === item))}
                                        className="text-red-500 hover:text-red-700 mr-2"
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
                                      {data?.oldBarcode || ""}
                                    </div>
                                  </td>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <textarea
                                      className="w-full form-input"
                                      rows="1"
                                      cols="5"
                                      type="text"
                                      readOnly
                                      value={isProduct ? data?.sku : data?.productName}
                                      style={{ height: "50px" }}
                                    />
                                  </td>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <div className="border border-b-0 relative">
                                      {data?.photos?.length > 0 ? (
                                        <>
                                          <img
                                            src={data?.photos[0]}
                                            alt="Product"
                                            style={{ width: "50px", height: "50px" }}
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
                                        <p style={{ width: 50, height: 50 }}>No image</p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <input
                                      type="text"
                                      value={item?.quantity || 1}
                                      readOnly
                                      className="w-full form-input"
                                    />
                                  </td>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <input
                                      type="number"
                                      value={data?.MRP || ""}
                                      readOnly
                                      className="w-full form-input"
                                    />
                                  </td>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <input
                                      type="number"
                                      value={data?.sellPrice || ""}
                                      className="w-full form-input"
                                      onChange={handleSellPriceChange}
                                    />
                                  </td>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <input
                                      type="text"
                                      value={`${data?.tax || 0} (Inc)`}
                                      readOnly
                                      className="w-full form-input"
                                    />
                                  </td>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <input
                                      type="number"
                                      value={item?.taxAmount || 0}
                                      readOnly
                                      className="w-full form-input"
                                    />
                                  </td>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <input
                                      type="number"
                                      value={item?.discount || 0}
                                      readOnly
                                      className="w-full form-input"
                                    />
                                  </td>
                                  <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap">
                                    <input
                                      type="number"
                                      value={item?.totalAmount || 0}
                                      readOnly
                                      className="w-full form-input"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          {items.some((item) => item.type === "lensDropdown") && (
                            <>
                              <tr className="border-b-2 border-slate-300">
                                <td colSpan="10">
                                  <label className="block text-sm font-medium mb-1">Right Lens</label>
                                  {!lensSelections[groupId]?.rightLens ? (
                                    <AsyncSelect
                                      cacheOptions
                                      loadOptions={fetchLensData}
                                      placeholder="Select..."
                                      isClearable
                                      onChange={(selectedLens) =>
                                        handleLensSelection(selectedLens, "rightLens", groupId, inventoryData.findIndex((i) => i.groupId === groupId && i.type === "lensDropdown"))
                                      }
                                    />
                                  ) : (
                                    <p className="mb-0">
                                      Selected: {lensSelections[groupId].rightLens.barcode} /{" "}
                                      {lensSelections[groupId].rightLens.sku}
                                    </p>
                                  )}
                                </td>
                              </tr>
                              <tr className="border-b-2 border-slate-300">
                                <td colSpan="10">
                                  <label className="block text-sm font-medium mb-1">Left Lens</label>
                                  {!lensSelections[groupId]?.leftLens ? (
                                    <AsyncSelect
                                      cacheOptions
                                      loadOptions={fetchLensData}
                                      placeholder="Select..."
                                      isClearable
                                      onChange={(selectedLens) =>
                                        handleLensSelection(selectedLens, "leftLens", groupId, inventoryData.findIndex((i) => i.groupId === groupId && i.type === "lensDropdown"))
                                      }
                                    />
                                  ) : (
                                    <p className="mb-0">
                                      Selected: {lensSelections[groupId].leftLens.barcode} /{" "}
                                      {lensSelections[groupId].leftLens.sku}
                                    </p>
                                  )}
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}