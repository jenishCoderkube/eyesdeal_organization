// src/components/ProductList.jsx
import React, { useState } from "react";
import ProductFilterForm from "../../components/Products/ViewProducts/ProductFilterForm";
import ProductViewTable from "../../components/Products/ViewProducts/ProductViewTable";

function ProductList() {
  const [filters, setFilters] = useState({});
  const [isDownloadButtonVisible, setIsDownloadButtonVisible] = useState(false);
  const handleFilterSubmit = (filterValues) => {
    setFilters(filterValues);
    setIsDownloadButtonVisible(true); // Show download button when filters are applied
  };

  return (
    <div className="container-fluid max-width-90 mx-auto mt-5">
      <ProductFilterForm onSubmit={handleFilterSubmit} />
      <ProductViewTable
        isDownloadButtonVisible={isDownloadButtonVisible}
        filters={filters}
      />
    </div>
  );
}

export default ProductList;
