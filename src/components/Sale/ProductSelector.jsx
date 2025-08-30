import React from "react";
import AsyncSelect from "react-select/async";
import { saleService } from "../../services/saleService";
import { v4 as uuidv4 } from "uuid";

export default function ProductSelector({
  showProductSelector,
  defaultStore,
  setInventoryData,
  setInventoryPairs,
}) {
  const fetchProductData = async (inputValue) => {
    try {
      const response = await saleService.listProducts(inputValue);
      if (response?.success) {
        return response.data.data.docs.map((prod) => ({
          value: prod._id,
          label: `${prod.newBarcode ?? ""} / ${prod.sku ?? ""}`,
          data: prod,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  const fetchInventoryDetails = async (prodID, storeID) => {
    try {
      const response = await saleService.checkInventory(prodID, storeID);
      if (response?.success) {
        const invItem = response?.data?.data?.docs?.[0];
        if (!invItem) {
          alert("Product not found in inventory");
          return null;
        }
        if ((invItem.quantity ?? 0) <= 0) {
          alert("Product out of stock");
          return null;
        }
        return { ...invItem.product, quantity: invItem.quantity };
      }
      return null;
    } catch (error) {
      console.error("Error fetching inventory:", error);
      return null;
    }
  };

  // helpers
  const calcInvoice = (mrp = 0, srp = 0, taxRate = 0) => {
    const base = srp / (1 + (Number(taxRate) || 0) / 100);
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
    const taxRate = Number(prod?.tax) || 0;
    const { taxAmount, discount, totalAmount } = calcInvoice(mrp, srp, taxRate);

    return {
      product: prod._id,
      quantity: prod?.quantity ?? 1,
      barcode: prod?.oldBarcode ?? prod?.newBarcode ?? "",
      stock: prod?.quantity ?? 0,
      sku: prod?.sku ?? "",
      photos: Array.isArray(prod?.photos) ? prod.photos : [],
      mrp,
      srp,
      taxRate: `${taxRate} (Inc)`,
      perPieceTax: taxAmount,
      perPieceDiscount: discount,
      perPieceAmount: totalAmount,
      inclusiveTax: prod?.inclusiveTax ?? true,
      manageStock: prod?.manageStock ?? false,
      displayName: prod?.productName || prod?.displayName || "",
      unit: typeof prod?.unit === "object" ? prod?.unit?.name : "Pieces",
      incentiveAmount: prod?.incentiveAmount ?? 0,
      raw: prod,
    };
  };

  const rowFromProduct = (pairId, type, prod) => {
    const mrp = Number(prod?.MRP) || 0;
    const srp = Number(prod?.sellPrice) || 0;
    const taxRate = Number(prod?.tax) || 0;
    const { taxAmount, discount, totalAmount } = calcInvoice(mrp, srp, taxRate);

    return {
      groupId: pairId,
      type, // "product" | "leftLens" | "rightLens"
      data: {
        ...prod,
        sellPrice: srp,
        quantity: prod?.quantity ?? 1,
      },
      quantity: prod?.quantity ?? 1,
      taxAmount,
      discount,
      totalAmount,
    };
  };

  const handleAddProduct = async (selectedProduct) => {
    if (!selectedProduct || !defaultStore?.value) return;

    const productDetails = await fetchInventoryDetails(
      selectedProduct.value,
      defaultStore.value
    );
    if (!productDetails) return;

    const pairId = uuidv4();
    const type = productDetails?.__t;

    if (type === "eyeGlasses") {
      // frame → new pair with frame
      const normalized = normalizeForPair(productDetails);

      setInventoryPairs((prev) => [
        ...prev,
        { pairId, product: normalized, leftLens: null, rightLens: null },
      ]);

      setInventoryData((prev) => [
        ...prev,
        rowFromProduct(pairId, "product", productDetails),
      ]);
    } else if (type === "contactLens") {
      // lens → new pair with right lens only
      const normalized = normalizeForPair(productDetails);

      setInventoryPairs((prev) => [
        ...prev,
        { pairId, product: null, leftLens: null, rightLens: normalized },
      ]);

      setInventoryData((prev) => [
        ...prev,
        rowFromProduct(pairId, "rightLens", productDetails),
      ]);
    }
  };

  return (
    <>
      {showProductSelector && (
        <div className="mb-3">
          <label htmlFor="product" className="form-label fw-semibold">
            Product
          </label>
          <AsyncSelect
            cacheOptions
            loadOptions={fetchProductData}
            onChange={handleAddProduct}
            placeholder="Select product..."
          />
        </div>
      )}
    </>
  );
}
