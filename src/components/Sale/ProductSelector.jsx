import React from "react";
import AsyncSelect from "react-select/async";
import { saleService } from "../../services/saleService";
import { v4 as uuidv4 } from "uuid";

export default function ProductSelector({
  showProductSelector,
  defaultStore,
  setInventoryData,
  setShowProductSelector,
  setInventoryPairs,
  inventoryData,
}) {
  console.log("jenish<<", inventoryData);

  const fetchProductData = async (inputValue) => {
    try {
      const response = await saleService.listProducts(inputValue);
      if (response.success) {
        return response.data.data.docs.map((prod) => ({
          value: prod._id,
          label: `${prod.newBarcode} / ${prod.sku}`,
          data: prod,
        }));
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchInventoryDetails = async (prodID, storeID) => {
    try {
      const response = await saleService.checkInventory(prodID, storeID);
      if (response.success) {
        const newItem = response?.data?.data?.docs?.[0];
        console.log("Fetched inventory item:", newItem);
        if (newItem?.quantity <= 0) {
          alert("Product out of stock");
          return null;
        }
        if (newItem) {
          return { ...newItem.product, quantity: newItem.quantity };
        }
        if (response.data.data.docs.length === 0) {
          alert("Product out of stock");
          return null;
        }
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleAddProduct = async (selectedProduct) => {
    if (!selectedProduct || !defaultStore || !defaultStore.value) {
      console.warn("Selected product or default store is missing.");
      return;
    }

    const productDetails = await fetchInventoryDetails(
      selectedProduct.value,
      defaultStore.value
    );

    if (productDetails) {
      const pairId = uuidv4();
      if (productDetails.__t === "eyeGlasses") {
        // Frame: Add product and lens dropdown
        setInventoryData((prev) => [
          ...prev,
          {
            type: "product",
            data: productDetails,
            pairId,
            quantity: productDetails.quantity || 0,
          },
          { type: "lensDropdown", pairId },
        ]);

        const newPair = {
          pairId,
          product: productDetails,
          lens: null, // Note: Original had lens: null, but for frames, it's right/left
        };
        setInventoryPairs((prev) => [...prev, newPair]);
        setShowProductSelector(false);
      } else if (productDetails.__t === "contactLens") {
        // Lens: Auto-add right and left lenses with same data, no frame, no dropdown

        console.log(
          "Adding contact lens with details:",
          productDetails?.quantity
        );

        setInventoryData((prev) => [
          ...prev,
          {
            type: "rightLens",
            data: productDetails,
            pairId,
            quantity: productDetails.quantity || 0,
          },
          {
            type: "leftLens",
            data: productDetails,
            pairId,
            quantity: productDetails.quantity || 0,
          },
        ]);

        const newPair = {
          pairId,
          rightLens: productDetails,
          leftLens: productDetails,
        };
        setInventoryPairs((prev) => [...prev, newPair]);
        setShowProductSelector(false);
      }
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
