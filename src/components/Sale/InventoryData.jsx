import React, { useEffect, useState } from "react";
import { saleService } from "../../services/saleService";
import AsyncSelect from "react-select/async";
import { Row, Col } from "react-bootstrap";

export default function InventoryData({
  inventoryData,
  setInventoryData,
  inventoryPairs,
  setInventoryPairs,
}) {
  const [rightLensSelected, setRightLensSelected] = useState(null);
  const [leftLensSelected, setLeftLensSelected] = useState(null);

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

  const handleLensSelection = (selectedLens, lensType, index) => {
    const selectedPairId = inventoryData[index]?.pairId;

    if (!selectedLens) {
      // Handle clearing the selection
      if (lensType === "rightLens") {
        setRightLensSelected(null);
      } else {
        setLeftLensSelected(null);
      }
      setInventoryPairs((prev) => {
        const updated = prev.map((pair) => {
          if (pair.pairId === selectedPairId) {
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

    // Update the selected lens state
    if (lensType === "rightLens") {
      setRightLensSelected({
        barcode: selectedLens.data.oldBarcode,
        sku: selectedLens.data.sku,
        item: selectedLens.data._id,
      });
    } else {
      setLeftLensSelected({
        barcode: selectedLens.data.oldBarcode,
        sku: selectedLens.data.sku,
        item: selectedLens.data._id,
      });
    }

    // Update InventoryPairs to store the selected lens
    setInventoryPairs((prev) => {
      const updated = prev.map((pair) => {
        if (pair.pairId === selectedPairId) {
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

          // Check if both lenses are selected
          const bothLensesSelected = newPair.rightLens && newPair.leftLens;

          if (bothLensesSelected) {
            // Add both lens items to inventoryData and remove lensDropdown
            setInventoryData((prevData) => {
              const updatedData = [...prevData];
              updatedData.splice(index, 1); // Remove lensDropdown
              updatedData.push({
                type: "rightLens",
                data:
                  newPair.rightLens.item === selectedLens.data._id
                    ? selectedLens.data
                    : pair.rightLens,
                quantity: 1,
                taxAmount: newPair.rightLens.perPieceTax,
                discount: newPair.rightLens.perPieceDiscount,
                totalAmount: newPair.rightLens.perPieceAmount,
                pairId: selectedPairId,
              });
              updatedData.push({
                type: "leftLens",
                data:
                  newPair.leftLens.item === selectedLens.data._id
                    ? selectedLens.data
                    : pair.leftLens,
                quantity: 1,
                taxAmount: newPair.leftLens.perPieceTax,
                discount: newPair.leftLens.perPieceDiscount,
                totalAmount: newPair.leftLens.perPieceAmount,
                pairId: selectedPairId,
              });
              return updatedData;
            });
          }

          return newPair;
        }
        return pair;
      });
      return updated;
    });
  };

  return (
    <div className="px-2">
      <div
        className="table-responsive"
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        <table className="table table-sm align-middle custom-table">
          <thead
            className="text-uppercase"
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#64748b",
              backgroundColor: "#f8fafc",
              borderTop: "1px solid #e5e7eb",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <tr>
              <th
                style={{
                  minWidth: "80px",
                  padding: "0.75rem 1.25rem 0.75rem 1.25rem",
                }}
                className="custom-th"
              >
                Barcode
              </th>
              <th
                style={{
                  minWidth: "160px",
                  padding: "0.75rem 0.5rem",
                }}
                className="custom-th"
              >
                SKU
              </th>
              <th
                style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                className="custom-th"
              >
                Photos
              </th>
              <th
                style={{ minWidth: "20px", padding: "0.75rem 0.5rem" }}
                className="custom-th"
              >
                Stock
              </th>
              <th
                style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                className="custom-th"
              >
                MRP
              </th>
              <th
                style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                className="custom-th"
              >
                SRP
              </th>
              <th
                style={{ minWidth: "80px", padding: "0.75rem 0.5rem" }}
                className="custom-th"
              >
                Tax Rate
              </th>
              <th
                style={{ minWidth: "20px", padding: "0.75rem 0.5rem" }}
                className="custom-th"
              >
                Tax Amount
              </th>
              <th
                style={{ minWidth: "20px", padding: "0.75rem 0.5rem" }}
                className="custom-th"
              >
                Discount
              </th>
              <th
                style={{
                  minWidth: "50px",
                  padding: "0.75rem 0.5rem 0.75rem 1.25rem",
                }}
                className="custom-th"
              >
                Total Amount
              </th>
            </tr>
          </thead>
          <tbody
            style={{
              fontSize: "0.875rem",
            }}
          >
            {inventoryData.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center">
                  No products added
                </td>
              </tr>
            ) : (
              inventoryData.map((item, index) => {
                if (
                  item.type === "product" ||
                  item.type === "rightLens" ||
                  item.type === "leftLens"
                ) {
                  const data = item.data || item.product;
                  const isProduct = item.type === "product";

                  const handleSellPriceChange = (e) => {
                    const updated = [...inventoryData];
                    const newSRP = parseFloat(e.target.value) || 0;
                    const mrp = parseFloat(data?.MRP) || 0;
                    const taxRate = parseFloat(data?.tax) || 0;

                    updated[index].data.sellPrice = e.target.value;

                    const { taxAmount, discount, totalAmount } =
                      calculateInvoiceValues(mrp, newSRP, taxRate);

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
                    <tr key={`item-${index}`}>
                      <td className="custom-td">{data?.oldBarcode || ""}</td>
                      <td className="custom-td">
                        {isProduct ? data?.sku : data?.productName}
                      </td>
                      <td className="custom-td">
                        {data?.photos?.length > 0 ? (
                          <img
                            src={data?.photos[0]}
                            alt="Product"
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <p style={{ width: 40, height: 40 }}>No image</p>
                        )}
                      </td>
                      <td className="custom-td">
                        <input
                          type="text"
                          value={item?.quantity || 1}
                          disabled
                          className="form-control form-control-sm"
                        />
                      </td>
                      <td className="custom-td">
                        <input
                          type="text"
                          value={data?.MRP || ""}
                          disabled
                          className="form-control form-control-sm"
                        />
                      </td>
                      <td className="custom-td">
                        <input
                          type="text"
                          value={data?.sellPrice || ""}
                          className="form-control form-control-sm"
                          onChange={handleSellPriceChange}
                        />
                      </td>
                      <td className="custom-td">
                        <input
                          type="text"
                          value={`${data?.tax || 0} (Inc)`}
                          disabled
                          className="form-control form-control-sm"
                        />
                      </td>
                      <td className="custom-td">
                        <input
                          type="text"
                          value={item?.taxAmount || 0}
                          disabled
                          className="form-control form-control-sm"
                        />
                      </td>
                      <td className="custom-td">
                        <input
                          type="text"
                          value={item?.discount || 0}
                          disabled
                          className="form-control form-control-sm"
                        />
                      </td>
                      <td className="custom-td">
                        <input
                          type="text"
                          value={item?.totalAmount || 0}
                          disabled
                          className="form-control form-control-sm"
                        />
                      </td>
                    </tr>
                  );
                }
                return null;
              })
            )}
          </tbody>
        </table>
      </div>

      {inventoryData.some((item) => item.type === "lensDropdown") && (
        <div className="mt-3">
          <Row>
            {inventoryData.map((item, index) => {
              if (item.type === "lensDropdown") {
                return (
                  <React.Fragment key={`lens-dropdown-${index}`}>
                    <Col md={6}>
                      <label className="d-block mb-1 fw-medium">
                        Right Lens
                      </label>
                      {!rightLensSelected ? (
                        <AsyncSelect
                          cacheOptions
                          loadOptions={fetchLensData}
                          placeholder="Select right lens"
                          isClearable
                          onChange={(selectedLens) =>
                            handleLensSelection(
                              selectedLens,
                              "rightLens",
                              index
                            )
                          }
                        />
                      ) : (
                        <p className="mb-0">
                          Selected: {rightLensSelected.barcode} /{" "}
                          {rightLensSelected.sku}
                        </p>
                      )}
                    </Col>
                    <Col md={6}>
                      <label className="d-block mb-1 fw-medium">
                        Left Lens
                      </label>
                      {!leftLensSelected ? (
                        <AsyncSelect
                          cacheOptions
                          loadOptions={fetchLensData}
                          placeholder="Select left lens"
                          isClearable
                          onChange={(selectedLens) =>
                            handleLensSelection(selectedLens, "leftLens", index)
                          }
                        />
                      ) : (
                        <p className="mb-0">
                          Selected: {leftLensSelected.barcode} /{" "}
                          {leftLensSelected.sku}
                        </p>
                      )}
                    </Col>
                  </React.Fragment>
                );
              }
              return null;
            })}
          </Row>
        </div>
      )}
    </div>
  );
}
