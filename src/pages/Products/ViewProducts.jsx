// src/components/ProductList.jsx
import React, { useState, useEffect } from "react";
import ProductFilterForm from "../../components/Products/ViewProducts/ProductFilterForm";
import ProductViewTable from "../../components/Products/ViewProducts/ProductViewTable";
import { useLocation, useNavigate } from "react-router-dom";

function ProductList() {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query string whenever URL changes
  const queryParams = new URLSearchParams(location.search);
  const filterFromUrl = {
    model: queryParams.get("model") || "eyeGlasses",
    status: queryParams.get("status") || "active",
  };

  const [filters, setFilters] = useState(filterFromUrl);
  const [isDownloadButtonVisible, setIsDownloadButtonVisible] = useState(false);

  // Keep filters in sync with URL changes (back/forward navigation support)
  useEffect(() => {
    setFilters(filterFromUrl);
  }, [location.search]);

  const handleFilterSubmit = (filterValues) => {
    setFilters(filterValues);
    setIsDownloadButtonVisible(true);
  };

  return (
    <div className="container-fluid max-width-90 mx-auto mt-5">
      <ProductFilterForm
        onSubmit={handleFilterSubmit}
        initialValues={filters}
      />
      <ProductViewTable
        isDownloadButtonVisible={isDownloadButtonVisible}
        filters={filters}
      />
    </div>
  );
}

export default ProductList;
