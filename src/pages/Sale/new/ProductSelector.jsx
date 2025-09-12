import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import { saleService } from "../../../services/saleService";
import { v4 as uuidv4 } from "uuid";

export default function ProductSelector({
  showProductSelector,
  defaultStore,
  setInventoryPairs,
}) {
  const [showSelect, setShowSelect] = useState(showProductSelector);

  const fetchProductData = async (inputValue) => {
    try {
      const resp = await saleService.listProducts(inputValue);
      if (resp?.success) {
        return resp.data.data.docs.map((p) => ({
          value: p._id,
          label: `${p.newBarcode ?? ""} / ${p.sku ?? ""}`,
          data: p,
        }));
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchInventoryDetails = async (prodID, storeID) => {
    try {
      const response = await saleService.checkInventory(prodID, storeID);
      if (response?.success) {
        const inv = response.data.data.docs?.[0];
        if (!inv) {
          alert("Product out of stock");
          return null;
        }
        if ((inv.quantity ?? 0) <= 0) {
          alert("Product out of stock");
          return null;
        }
        return { ...inv.product, quantity: inv.quantity };
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const calcInvoice = (mrp = 0, srp = 0, tax = 0) => {
    const base = srp / (1 + (Number(tax) || 0) / 100);
    const taxAmount = srp - base;
    const discount = mrp - srp;
    return {
      taxAmount: Number(taxAmount.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      totalAmount: Number(Number(srp).toFixed(2)),
    };
  };

  const normalizeForPair = (prod) => {
    const mrp = Number(prod?.MRP) || 0;
    const srp = Number(prod?.sellPrice) || 0;
    const tax = Number(prod?.tax) || 0;
    const { taxAmount, discount, totalAmount } = calcInvoice(mrp, srp, tax);

    return {
      id: prod._id,
      displayName: prod.productName || prod.displayName || "",
      barcode: prod.newBarcode ?? prod.oldBarcode ?? "",
      sku: prod.sku ?? "",
      photos: prod.photos ?? [],
      mrp,
      srp,
      taxRate: `${tax} (Inc)`,
      taxAmount,
      discount,
      totalAmount,
      quantity: prod.quantity ?? 1,
      raw: prod,
    };
  };

  const handleAddProduct = async (selected) => {
    if (!selected || !defaultStore?.value) {
      console.warn("select or defaultStore missing");
      return;
    }
    const inv = await fetchInventoryDetails(selected.value, defaultStore.value);
    if (!inv) return;

    const pairId = uuidv4();
    const type = inv.__t; // "eyeGlasses" or "contactLens"

    if (type === "eyeGlasses") {
      setInventoryPairs((prev) => [
        ...prev,
        {
          pairId,
          product: normalizeForPair(inv),
          leftLens: null,
          rightLens: null,
          autoFilledRight: false,
        },
      ]);
    } else if (type === "contactLens") {
      setInventoryPairs((prev) => [
        ...prev,
        {
          pairId,
          product: null,
          leftLens: normalizeForPair(inv),
          rightLens: normalizeForPair(inv),
          autoFilledRight: false,
        },
      ]);
    } else {
      console.warn("unknown product type", type);
    }

    // ✅ hide select after adding
    setShowSelect(false);
  };

  if (!showProductSelector) return null;

  return (
    <div className="mb-3">
      {showSelect ? (
        <>
          <label className="form-label fw-semibold">Product</label>
          <AsyncSelect
            cacheOptions
            loadOptions={fetchProductData}
            onChange={handleAddProduct}
            placeholder="Search frames or lenses..."
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </>
      ) : (
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => setShowSelect(true)}
        >
          + Add Another Pair
        </button>
      )}
    </div>
  );
}
