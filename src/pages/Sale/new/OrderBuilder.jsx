// OrderBuilder.jsx
import React, { useState } from "react";
import ProductSelector from "../new/ProductSelector";
import InventoryPairs from "../new/InventoryPairs";

export default function OrderBuilder({ defaultStore }) {
  const [inventoryPairs, setInventoryPairs] = useState([]);
  const [showProductSelector, setShowProductSelector] = useState(true);

  return (
    <div>
      <ProductSelector
        showProductSelector={showProductSelector}
        defaultStore={defaultStore}
        setInventoryPairs={setInventoryPairs}
      />

      <hr />

      <InventoryPairs
        inventoryPairs={inventoryPairs}
        setInventoryPairs={setInventoryPairs}
        defaultStore={defaultStore}
      />
    </div>
  );
}
