import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";
import "./ProductDetails.css";
import { imageBaseUrl } from "../../../utils/api";
import productViewService from "../../../services/Products/productViewService";

const ProductDetails = ({
  product,
  onBack,
  onQuantityChange,
  existingQuantity,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeImage, setActiveImage] = useState(product?.photos?.[0] || null);
  const [quantity, setQuantity] = useState(existingQuantity || 0);
  const [colorVariants, setColorVariants] = useState([]);

  // Sync product image
  useEffect(() => {
    if (product?.photos?.length) {
      setActiveImage(product.photos[0]);
    } else {
      setActiveImage(null);
    }
  }, [product]);

  // Fetch color variants
  useEffect(() => {
    const fetchColorVariants = async () => {
      if (product?.brand && product?.modelNumber && product?.__t) {
        try {
          const response = await productViewService.getProductsColors(
            product.brand,
            product.modelNumber,
            product.__t,
            true
          );
          if (response.success) {
            setColorVariants(response.data.docs);
          } else {
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

  // 🔹 Notify parent when quantity changes
  useEffect(() => {
    if (onQuantityChange && product?._id) {
      onQuantityChange(product._id, Number(quantity) || 0, product.sellPrice);
    }
  }, [quantity, product?._id]);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && value >= 0 && value <= 5000)) {
      setQuantity(value === "" ? "" : Number(value));
    }
  };

  const handleIncrement = () => {
    if (quantity < 5000) {
      setQuantity(Number(quantity) + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(Number(quantity) - 1);
    }
  };

  const handleColorSelect = (productId) => {
    setSearchParams(
      {
        ...Object.fromEntries(searchParams),
        model: searchParams.get("model") || "eyeGlasses",
        productId: productId,
      },
      { replace: true }
    );
  };

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
            <div
              className="d-none d-md-flex flex-column me-3 gap-2"
              style={{ maxHeight: "500px", overflowY: "auto" }}
            >
              {product?.photos?.map((img, index) => (
                <img
                  key={index}
                  src={imageBaseUrl + img}
                  alt={`Thumbnail ${index + 1}`}
                  className={`img-thumbnail rounded ${
                    activeImage === img ? "border border-primary" : ""
                  }`}
                  style={{
                    width: "100px",
                    height: "80px",
                    objectFit: "contain",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveImage(img)}
                />
              ))}
            </div>

            <div className="flex-grow-1">
              {/* Main Image */}
              <div className="mb-3">
                {activeImage ? (
                  <img
                    src={imageBaseUrl + activeImage}
                    alt="Main"
                    className="img-fluid rounded shadow-sm"
                    style={{
                      maxHeight: "400px",
                      width: "100%",
                      objectFit: "contain",
                    }}
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

              {/* Quantity Input */}
              <div className="d-flex justify-content-center align-items-center mb-3">
                <div className="input-group" style={{ maxWidth: "200px" }}>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 0}
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
            {product?.features?.length ? (
              product.features.map((feature, index) => (
                <li
                  key={index}
                  className="list-group-item"
                  style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}
                >
                  {feature?.name}
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
                  />
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
