// src/components/ProductList.jsx
import React, { useState } from "react";
import ProductFilterForm from "../../components/Products/ViewProducts/ProductFilterForm";
import ProductViewTable from "../../components/Products/ViewProducts/ProductViewTable";

function ProductList() {
  const [filters, setFilters] = useState({});

  const handleFilterSubmit = (filterValues) => {
    setFilters(filterValues);
  };

  return (
    <div className="container-fluid max-width-90 mx-auto mt-5">
      <ProductFilterForm onSubmit={handleFilterSubmit} />
      <ProductViewTable filters={filters} />
    </div>
  );
}

export default ProductList;
