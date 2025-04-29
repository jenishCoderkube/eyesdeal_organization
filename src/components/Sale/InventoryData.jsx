import React, { useEffect } from "react";
import { saleService } from "../../services/saleService";
import AsyncSelect from "react-select/async";
export default function InventoryData({
  inventoryData,
  setInventoryData,
  setInventoryPairs,
}) {
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
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
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
  }, [inventoryData.length]);

  return (
    <div
      className="table-responsive px-2"
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
                color: "",
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
              if (item.type === "lensDropdown") {
                return (
                  <tr key={`lens-dropdown-${index}`}>
                    <td colSpan="10">
                      <AsyncSelect
                        cacheOptions
                        loadOptions={fetchLensData}
                        placeholder="Select lens"
                        onChange={(selectedLens) => {
                          const selectedPairId = inventoryData[index]?.pairId;

                          const mrp = parseFloat(selectedLens?.data?.MRP) || 0;
                          const srp =
                            parseFloat(selectedLens?.data?.sellPrice) || 0;
                          const taxRate =
                            parseFloat(selectedLens?.data?.tax) || 0;

                          const { taxAmount, discount, totalAmount } =
                            calculateInvoiceValues(mrp, srp, taxRate);

                          const lensItem = {
                            type: "lens",
                            data: selectedLens?.data,
                            quantity: 1,
                            taxAmount,
                            discount,
                            totalAmount,
                            pairId: selectedPairId, // <==== IMPORTANT!! preserve pairId
                          };

                          setInventoryData((prev) => {
                            const updated = [...prev];
                            updated[index] = lensItem;
                            return updated;
                          });
                          // setInventoryPairs((prev) => {
                          //     const updated = [...prev];
                          //     console.log("updated", updated);
                          //     console.log("index", index);

                          //     // updated[index] = {
                          //     //   ...updated[index],
                          //     //   lens: lensItem.data,
                          //     // };

                          //     const targetIndex = updated.findIndex(pair => pair.lens === null);

                          //     if (targetIndex !== -1) {
                          //         updated[targetIndex] = {
                          //             ...updated[targetIndex],
                          //             lens: lensItem.data,
                          //         };
                          //     } else {
                          //         console.error("No matching product found to pair lens with!");
                          //     }
                          //     return updated;
                          // });

                          setInventoryPairs((prev) => {
                            const updated = prev.map((pair) => {
                              if (pair.pairId === selectedPairId) {
                                return { ...pair, lens: selectedLens.data };
                              }
                              return pair;
                            });
                            return updated;
                          });
                        }}
                      />
                    </td>
                  </tr>
                );
              }

              if (item.type === "product" || item.type === "lens") {
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
                          src={data?.photos}
                          alt="Product"
                          style={{ width: 40, height: 40 }}
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
  );
}
