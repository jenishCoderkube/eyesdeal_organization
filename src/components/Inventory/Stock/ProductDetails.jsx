import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaHeart, FaShippingFast, FaPlus, FaMinus } from "react-icons/fa";
import { AiOutlineSafetyCertificate, AiOutlineUser } from "react-icons/ai";
import "./ProductDetails.css";
import { imageBaseUrl } from "../../../utils/api";
import productViewService from "../../../services/Products/productViewService";

const ProductDetails = ({ product, onBack }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(product?.photos?.[0] || null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [colorVariants, setColorVariants] = useState([]);

  // Set the active image when the product changes
  useEffect(() => {
    if (product && product.photos && product.photos.length > 0) {
      setActiveImage(product.photos[0]);
    } else {
      setActiveImage(null);
    }
  }, [product]);

  // Fetch color variants when the product changes
  useEffect(() => {
    const fetchColorVariants = async () => {
      if (product && product.brand && product.modelNumber && product.__t) {
        try {
          const response = await productViewService.getProductsColors(
            product.brand,
            product.modelNumber,
            product.__t
          );

          if (response.success) {
            setColorVariants(response.data.docs);
          } else {
            console.error(
              "Failed to fetch color variants:",
              response.data.message
            );
            setColorVariants([]);
          }
        } catch (error) {
          console.error("Error fetching color variants:", error);
          setColorVariants([]);
        }
      }
    };

    fetchColorVariants();
  }, [product]);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    setTimeout(() => {
      setIsAddingToCart(false);
      alert(`Added ${quantity} item(s) to cart successfully!`); // Replace with toast if needed
    }, 1000);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && value >= 1 && value <= 5000)) {
      setQuantity(value === "" ? "" : Number(value));
    }
  };

  const handleIncrement = () => {
    if (quantity < 5000) {
      setQuantity(Number(quantity) + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(Number(quantity) - 1);
    }
  };

  const handleColorSelect = (productId) => {
    // Update URL with the selected product's _id, preserving other query parameters
    setSearchParams(
      {
        ...Object.fromEntries(searchParams),
        model: searchParams.get("model") || "eyeGlasses", // Ensure model=eyeGlasses if not present
        productId: productId,
      },
      { replace: true }
    );
  };

  // If no product data is provided, show a fallback
  if (!product) {
    return (
      <div className="container py-5">
        <button className="btn btn-link mt-3" onClick={onBack}>
          Back
        </button>
        <div className="alert alert-info">Product not found.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button className="btn btn-link mb-3" onClick={onBack}>
        Back
      </button>
      <div className="row gy-4">
        {/* Left Panel: Images */}
        <div className="col-lg-6">
          <div className="d-flex flex-column flex-md-row">
            {/* Thumbnails (Desktop: Vertical) */}
            <div
              className="d-none d-md-flex flex-column me-3 gap-2"
              style={{ maxHeight: "500px", overflowY: "auto" }}
            >
              {product?.photos?.map((img, index) => (
                <img
                  key={index}
                  src={imageBaseUrl + img}
                  alt={`Thumbnail ${index + 1} for ${product.sku}`}
                  className={`img-thumbnail rounded cursor-pointer ${
                    activeImage === img ? "border border-primary" : ""
                  }`}
                  style={{
                    width: "100px",
                    height: "80px",
                    objectFit: "contain",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveImage(img)}
                  onError={(e) => (e.target.style.display = "none")}
                />
              ))}
            </div>
            {/* Main Image and Mobile Thumbnails */}
            <div className="flex-grow-1">
              {/* Main Image */}
              <div className="mb-3">
                {activeImage ? (
                  <img
                    src={imageBaseUrl + activeImage}
                    alt={`${product.displayName} - Main Image`}
                    className="img-fluid rounded shadow-sm"
                    style={{
                      maxHeight: "400px",
                      minWidth: "100%",
                      objectFit: "contain",
                    }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div
                    className="d-flex justify-content-center align-items-center bg-light rounded shadow-sm"
                    style={{ height: "400px" }}
                  >
                    <p className="text-muted">Image not found</p>
                  </div>
                )}
              </div>
              {/* Thumbnails (Mobile: Horizontal Scrollable) */}
              <div
                className="d-flex d-md-none overflow-auto gap-2 mb-3"
                style={{ maxWidth: "100%" }}
              >
                {product?.photos?.map((img, index) => (
                  <img
                    key={index}
                    src={imageBaseUrl + img}
                    alt={`Thumbnail ${index + 1} for ${product.sku}`}
                    className={`img-thumbnail rounded cursor-pointer flex-shrink-0 ${
                      activeImage === img ? "border border-primary" : ""
                    }`}
                    style={{
                      width: "100px",
                      height: "80px",
                      objectFit: "contain",
                    }}
                    onClick={() => setActiveImage(img)}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ))}
              </div>
              {/* Quantity Input */}
              <div className="d-flex justify-content-center align-items-center mb-3">
                <div className="input-group" style={{ maxWidth: "200px" }}>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                  >
                    <FaMinus />
                  </button>
                  <input
                    type="text"
                    className="form-control text-center"
                    value={quantity}
                    onChange={handleQuantityChange}
                    style={{ maxWidth: "80px" }}
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= 5000}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              {/* Add to Cart Button */}
              <div className="d-grid">
                <button
                  className="btn btn-success"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || quantity === ""}
                >
                  {isAddingToCart ? "Adding to Cart..." : "Add To Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Details */}
        <div className="col-lg-6">
          <h1 className="fw-bold fs-5 mb-3">{product.displayName}</h1>
          <span className="badge bg-secondary mb-3">{product.sku}</span>
          <div className="mb-3">
            <span className="fs-4 fw-bold">{product?.sellPrice} ₹</span>
            <span className="text-muted ms-2">[ MRP: {product?.MRP} ]</span>
          </div>

          <h3 className="fw-bold fs-6 mb-2">Features:</h3>
          <ul className="list-group list-group-flush mb-4">
            {product.features && product.features.length > 0 ? (
              product.features.map((feature, index) => (
                <li key={index} className="list-group-item px-0">
                  {feature}
                </li>
              ))
            ) : (
              <li className="list-group-item px-0 text-muted">
                No features available
              </li>
            )}
          </ul>

          <h3 className="fw-bold fs-6 mb-2">Details:</h3>
          <ul className="list-group list-group-flush mb-4">
            <li className="list-group-item px-0">
              <strong>Model Number:</strong> {product.modelNumber}
            </li>
            <li className="list-group-item px-0">
              <strong>Color Number:</strong> {product.colorNumber}
            </li>
            <li className="list-group-item px-0">
              <strong>Frame Size:</strong> {product.frameSize}
            </li>
          </ul>

          {/* Store Colors Available */}
          <h3 className="fw-bold fs-6 mb-2">Store Colors Available</h3>
          {colorVariants.length > 0 ? (
            <div className="d-flex flex-wrap gap-3 mb-4">
              {colorVariants.map((variant) => (
                <div
                  key={variant._id}
                  className={`cursor-pointer text-center ${
                    variant._id === product._id
                      ? "border border-primary rounded"
                      : ""
                  }`}
                  onClick={() => handleColorSelect(variant._id)}
                  style={{ width: "60px", cursor: "pointer" }}
                >
                  <img
                    src={imageBaseUrl + (variant.photos[0] || "")}
                    alt={`${variant.colorNumber} variant`}
                    className="img-fluid rounded"
                    style={{
                      height: "60px",
                      objectFit: "contain",
                    }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  {/* <p className="mt-1 mb-0 small">
                    {variant.frameColor?.[0]?.name || variant.colorNumber}
                  </p> */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-4">No color variants available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
