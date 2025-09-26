import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { debounce } from "lodash"; // Ensure lodash is installed or use a custom debounce
import GlassesCard from "./GlassesCard";
import ProductDetails from "./ProductDetails";
import PurchaseTabBar from "./PurchaseTabbar"; // Updated to use ProductFilterForm
import productViewService from "../../../services/Products/productViewService"; // Adjust path

const ProductPurchase = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredData, setFilteredData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginationMeta, setPaginationMeta] = useState({
    totalDocs: 0,
    limit: 100,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
    page: 1,
  });

  // Debounced fetch function
  const fetchProducts = useMemo(
    () =>
      debounce(async (model, filters, page) => {
        setLoading(true);
        try {
          console.log("Fetching products with payload:", {
            model,
            filters,
            page,
          });
          // Assuming getRange is defined elsewhere; remove if not needed
          // getRange(filters);
          const response = await productViewService.getProductsPurchase(
            model,
            { ...filters, isB2B: true },
            page
          );
          console.log("API response:", response);
          if (response.success && response.other) {
            setFilteredData(response.other.docs || []);
            setPaginationMeta({
              totalDocs: response.other.totalDocs || 0,
              limit: response.other.limit || 100,
              totalPages: response.other.totalPages || 1,
              hasPrevPage: response.other.hasPrevPage || false,
              hasNextPage: response.other.hasNextPage || false,
              page: response.other.page || 1,
            });
            setError(null);
          } else {
            setError(response.message || "Failed to fetch products");
            setFilteredData([]);
            setPaginationMeta({
              totalDocs: 0,
              limit: 100,
              totalPages: 1,
              hasPrevPage: false,
              hasNextPage: false,
              page: 1,
            });
          }
        } catch (err) {
          console.error("Error fetching products:", err);
          setError("An error occurred while fetching products");
          setFilteredData([]);
          setPaginationMeta({
            totalDocs: 0,
            limit: 100,
            totalPages: 1,
            hasPrevPage: false,
            hasNextPage: false,
            page: 1,
          });
        }
        setLoading(false);
      }, 200),
    []
  );

  // Handle filter changes and fetch products
  useEffect(() => {
    const model = searchParams.get("model") || "eyeGlasses";
    const page = parseInt(searchParams.get("page")) || 1;
    const filters = {
      brand: searchParams.get("brand") || "",
      frameType: searchParams.get("frameType") || "",
      frameShape: searchParams.get("frameShape") || "",
      frameMaterial: searchParams.get("frameMaterial") || "",
    };

    fetchProducts(model, filters, page);

    // Cleanup debounce on unmount
    return () => {
      fetchProducts.cancel();
    };
  }, [searchParams, fetchProducts]);

  // Handle form submission to update URL params
  const handleSubmit = (values) => {
    const newParams = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });
    // Preserve page if it exists
    if (searchParams.get("page")) {
      newParams.set("page", searchParams.get("page"));
    }
    setSearchParams(newParams);
  };

  // Handle card click to show product details
  const handleCardClick = (id) => {
    const product = filteredData.find((item) => item._id === id);
    if (product) {
      setSelectedProduct(product);
      setShowDetails(true);
    }
  };

  // Handle back from product details
  const handleBack = () => {
    setShowDetails(false);
    setSelectedProduct(null);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="container py-5">
      <PurchaseTabBar onSubmit={handleSubmit} />
      {loading && <div className="text-center my-4">Loading products...</div>}
      {error && <div className="alert alert-danger my-4">{error}</div>}
      {!loading && !error && filteredData.length === 0 && (
        <div className="alert alert-info my-4">No products found.</div>
      )}
      {showDetails && selectedProduct ? (
        <ProductDetails product={selectedProduct} onBack={handleBack} />
      ) : (
        <>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4">
            {filteredData.map((frame) => (
              <div className="col" key={frame._id}>
                {console.log("frame", frame)}
                <GlassesCard
                  title={frame.sku}
                  price={`${frame.sellPrice} ₹`}
                  imageUrl={
                    frame.photos && frame.photos[0] ? frame.photos[0] : null
                  }
                  onClick={() => handleCardClick(frame._id)}
                  frame={frame}
                />
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {paginationMeta.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav aria-label="Page navigation">
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      !paginationMeta.hasPrevPage ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(paginationMeta.page - 1)}
                      disabled={!paginationMeta.hasPrevPage}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(paginationMeta.totalPages).keys()].map((page) => (
                    <li
                      className={`page-item ${
                        paginationMeta.page === page + 1 ? "active" : ""
                      }`}
                      key={page + 1}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page + 1)}
                      >
                        {page + 1}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      !paginationMeta.hasNextPage ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(paginationMeta.page + 1)}
                      disabled={!paginationMeta.hasNextPage}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductPurchase;
