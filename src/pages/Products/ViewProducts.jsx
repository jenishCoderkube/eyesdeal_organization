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
    search: queryParams.get("search") || "",
    model: queryParams.get("model") || "eyeGlasses",
    brand: queryParams.get("brand") || "",
    frameType: queryParams.get("frameType") || "",
    frameShape: queryParams.get("frameShape") || "",
    gender: queryParams.get("gender") || "",
    frameMaterial: queryParams.get("frameMaterial") || "",
    frameColor: queryParams.get("frameColor") || "",
    frameSize: queryParams.get("frameSize") || "",
    prescriptionType: queryParams.get("prescriptionType") || "",
    frameCollection: queryParams.get("frameCollection") || "",
    status: queryParams.get("status") || "active",
  };

  const [filters, setFilters] = useState(filterFromUrl);
  const [isDownloadButtonVisible, setIsDownloadButtonVisible] = useState(true);

  // Keep filters in sync with URL changes (back/forward navigation support)
  useEffect(() => {
    setFilters(filterFromUrl);
  }, [location.search]);

  const handleFilterSubmit = (filterValues) => {
    setFilters(filterValues);
    setIsDownloadButtonVisible(true);
    const query = new URLSearchParams({
      ...filterValues,
      model: filterValues.model || "eyeGlasses",
      status: filterValues.status || "active",
    }).toString();
    navigate(`/products/view?${query}`);
  };

  return (
    <div className="container-fluid max-width-90 mx-auto mt-5">
      <ProductFilterForm
        onSubmit={handleFilterSubmit}
        initialValues={filters}
      />
      <ProductViewTable
        isDownloadButtonVisible={isDownloadButtonVisible}
        setIsDownloadButtonVisible={setIsDownloadButtonVisible}
        filters={filters}
      />
    </div>
  );
}

export default ProductList;
