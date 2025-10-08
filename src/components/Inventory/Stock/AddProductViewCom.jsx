import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { debounce } from "lodash";
import GlassesCard from "./GlassesCard";
import ProductDetails from "./ProductDetails";
import PurchaseTabBar from "./PurchaseTabbar";
import productViewService from "../../../services/Products/productViewService";
import ProductTable from "./Product/ProductTable"; // new
import ProductModal from "./Product/ProductModal"; // new
import { toast } from "react-toastify";

const ProductPurchase = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredData, setFilteredData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
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

  const [isMultiSelect, setIsMultiSelect] = useState(true); // toggle table/card
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const productId = searchParams.get("productId");
  const modelType = searchParams.get("model");
  const navigate = useNavigate();
  const fetchProducts = useMemo(
    () =>
      debounce(async (model, filters, page) => {
        setLoading(true);
        try {
          const response = await productViewService.getProductsPurchase(
            model,
            { ...filters, isB2B: true },
            page
          );
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
          }
        } catch (err) {
          setError("An error occurred while fetching products");
          setFilteredData([]);
        }
        setLoading(false);
      }, 200),
    []
  );

  const fetchSingleProduct = async (id, isB2B = true) => {
    setLoading(true);
    try {
      const response = await productViewService.getProductById(
        modelType,
        id,
        isB2B
      );
      if (response.success && response.data) {
        setSelectedProduct(response?.data[0] || []);
        setError(null);
      } else {
        setError(response.message || "Failed to fetch product details");
        setSelectedProduct(null);
      }
    } catch (err) {
      setError("An error occurred while fetching product details");
      setSelectedProduct(null);
    }
    setLoading(false);
  };
  useEffect(() => {
    const multi = searchParams.get("isMultiSelect");
    setIsMultiSelect(multi === "true");
  }, [searchParams]);

  useEffect(() => {
    const model = searchParams.get("model") || "eyeGlasses";
    const page = parseInt(searchParams.get("page")) || 1;
    const filters = {
      brand: searchParams.get("brand") || "",
      frameType: searchParams.get("frameType") || "",
      frameShape: searchParams.get("frameShape") || "",
      frameMaterial: searchParams.get("frameMaterial") || "",
      search: searchParams.get("search") || "",
    };

    if (productId) {
      fetchSingleProduct(productId);
    } else {
      setSelectedProduct(null);
      fetchProducts(model, filters, page);
    }

    return () => fetchProducts.cancel();
  }, [searchParams, fetchProducts, productId]);
  console.log("selectedIds", selectedIds);

  const handleSubmit = (values) => {
    const newParams = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });
    if (searchParams.get("page"))
      newParams.set("page", searchParams.get("page"));
    setSearchParams(newParams);
  };

  const handleCardClick = (id) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("productId", id);
    setSearchParams(newParams);
  };

  const handleBack = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("productId");
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  const handleSelectChange = (ids, checked) => {
    setSelectedIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...ids]));
      }
      if (ids.length === 0) {
        return []; // Clear all IDs when deselecting all
      }
      return prev.filter((id) => !ids.includes(id));
    });
  };
  const selectedProducts = filteredData.filter((p) =>
    selectedIds.includes(p._id)
  );
  // New: Handle delete product
  const handleDeleteProduct = (id) => {
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  };
  // Updated handleAddToCart to handle multiple products
  const handleAddToCart = async (productsWithQuantities) => {
    setIsAddingToCart(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData._id || !userData.stores?.[0]) {
        throw new Error("User data or store not found in localStorage");
      }

      const payload = {
        store: userData.stores[0],
        user: userData._id,
        products: productsWithQuantities, // Array of { product: id, quantity }
      };

      const response = await productViewService.addToCartProductPurchase(
        payload
      );
      console.log("response", response);

      if (response?.success) {
        toast.success(
          `Added ${productsWithQuantities.length} item(s) to cart successfully!`
        );
        navigate("/purchase/viewPurchaseOrder");
      } else {
        throw new Error(response.message || "Failed to add items to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error.message);
      toast.error(error.message || "Failed to add items to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };
  const handleCartSubmit = () => {
    const validItems = selectedIds.filter((item) => item.quantity > 0);
    if (validItems.length === 0) {
      toast.warning("Please select quantity greater than 0 before proceeding.");
      return;
    }

    const productsWithQuantities = validItems.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    handleAddToCart(productsWithQuantities);
  };

  return (
    <div className="container py-3">
      <PurchaseTabBar
        onSubmit={handleSubmit}
        isMultiSelect={isMultiSelect}
        setIsMultiSelect={setIsMultiSelect}
        onSelectChange={handleSelectChange}
        onSubmitCart={handleCartSubmit}
        totalCount={
          selectedIds?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0
        }
      />

      {loading && <div className="text-center my-4">Loading...</div>}
      {error && <div className="alert alert-danger my-4">{error}</div>}
      {!loading && !error && !productId && filteredData.length === 0 && (
        <div className="alert alert-info my-4">No products found</div>
      )}

      {productId && selectedProduct ? (
        <ProductDetails product={selectedProduct} onBack={handleBack} />
      ) : (
        !productId &&
        !loading &&
        (isMultiSelect ? (
          <>
            {selectedIds.length > 0 && (
              <div className="mb-3">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Add {selectedIds.length} Product(s)
                </button>
              </div>
            )}

            <ProductTable
              products={filteredData}
              selectedIds={selectedIds}
              onSelectChange={handleSelectChange}
            />

            <ProductModal
              show={showModal}
              onClose={() => setShowModal(false)}
              products={selectedProducts}
              onConfirm={handleAddToCart}
              onDelete={handleDeleteProduct}
            />
          </>
        ) : (
          <>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-4">
              {filteredData.map((frame) => (
                <div className="col" key={frame._id}>
                  <GlassesCard
                    title={frame.sku}
                    price={`${frame.sellPrice} ₹`}
                    imageUrl={
                      frame.photos && frame.photos[0] ? frame.photos[0] : null
                    }
                    onClick={() => handleCardClick(frame._id)}
                    frame={frame}
                    onQuantityChange={(id, qty) => {
                      setSelectedIds((prev) => {
                        const updated = prev.filter((p) => p._id !== id);
                        if (qty > 0)
                          return [...updated, { _id: id, quantity: qty }];
                        return updated;
                      });
                    }}
                  />
                </div>
              ))}
            </div>

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
                        onClick={() =>
                          handlePageChange(paginationMeta.page - 1)
                        }
                        disabled={!paginationMeta.hasPrevPage}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(paginationMeta.totalPages).keys()].map(
                      (page) => (
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
                      )
                    )}
                    <li
                      className={`page-item ${
                        !paginationMeta.hasNextPage ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() =>
                          handlePageChange(paginationMeta.page + 1)
                        }
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
        ))
      )}
    </div>
  );
};

export default ProductPurchase;
