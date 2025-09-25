// src/ProductDetails.js
import React, { useState } from "react";
import { FaHeart, FaShippingFast } from "react-icons/fa";
import { AiOutlineSafetyCertificate, AiOutlineUser } from "react-icons/ai";
import "./ProductDetails.css";

const ProductDetails = ({ product, onBack }) => {
  const [activeImage, setActiveImage] = useState(product.photos?.[0] || null);
  const [selectedVariant, setSelectedVariant] = useState(
    product.colorVariants?.[0] || null
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    setTimeout(() => {
      setIsAddingToCart(false);
      alert("Added to cart successfully!"); // Replace with toast if needed
    }, 1000);
  };

  return (
    <div className="container">
      <button className="btn btn-link mt-3" onClick={onBack}>
        Back
      </button>
      <div className="row">
        {/* Left Panel: Images */}
        <div className="col-md-6">
          <div className="d-flex">
            {/* Thumbnails (Desktop: Vertical) */}
            <div
              className="d-none d-md-flex flex-column me-3"
              style={{ maxHeight: "500px", overflowY: "auto" }}
            >
              {product.photos.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className={`img-fluid rounded mb-2 cursor-pointer ${
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
            {/* Main Image */}
            <div className="flex-grow-1">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.sku}
                  className="img-fluid rounded"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div
                  className="d-flex justify-content-center align-items-center bg-light rounded"
                  style={{ height: "400px" }}
                >
                  <p className="text-muted">Image not found</p>
                </div>
              )}
              {/* Thumbnails (Mobile: Horizontal) */}
              <div className="d-md-none d-flex flex-row mt-3 gap-2">
                {product.photos.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className={`img-fluid rounded cursor-pointer ${
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
              {/* Buttons */}
              <div className="mt-3">
                <button className="btn btn-outline-secondary w-100 mb-2">
                  Add Power Sunglasses
                </button>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary flex-grow-1"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                  >
                    {isAddingToCart ? "Adding to Cart..." : "Buy Sunglasses"}
                  </button>
                  <button className="btn btn-outline-secondary flex-grow-1">
                    Add To Combo
                  </button>
                </div>
                {/* Back Button */}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Details */}
        <div className="col-md-6">
          <h1 className="fw-bold mb-3">{product.displayName}</h1>
          <span className="badge bg-secondary mb-3">{product.sku}</span>
          <div className="mb-3">
            <span className="fs-2 fw-bold">{product.sellPrice} ₹</span>
            <span className="text-muted ms-3 d-md-none">
              [ MRP-{product.MRP} ]
            </span>
          </div>
          <div className="d-flex align-items-center mb-3">
            <span className="text-warning">★★★★★</span>
            <span className="ms-2 text-muted">157 Reviews</span>
          </div>

          <h3 className="fw-bold">Features:</h3>
          <ul className="list-group mb-3">
            {product.features.length > 0 ? (
              product.features.map((feature, index) => (
                <li key={index} className="list-group-item border-0">
                  {feature}
                </li>
              ))
            ) : (
              <li className="list-group-item border-0 text-muted">
                No features available
              </li>
            )}
          </ul>

          <h3 className="fw-bold">Store Colors Available</h3>
          {product.colorVariants.length > 0 ? (
            <div className="d-flex flex-wrap gap-2 mb-3">
              {product.colorVariants.map((variant) => (
                <div
                  key={variant._id}
                  className={`border rounded p-1 cursor-pointer ${
                    selectedVariant?._id === variant._id
                      ? "border-primary"
                      : "border-secondary"
                  }`}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setActiveImage(variant.photos?.[0]);
                  }}
                >
                  <img
                    src={variant.photos?.[0] || ""}
                    alt={variant.frameColor}
                    className="rounded"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No colors available</p>
          )}

          <h3 className="fw-bold">Universal Colors Available</h3>
          {product.colorVariants.length > 0 ? (
            <div className="d-flex flex-wrap gap-2 mb-3">
              {product.colorVariants.map((variant) => (
                <div
                  key={variant._id}
                  className={`border rounded p-1 cursor-pointer ${
                    selectedVariant?._id === variant._id
                      ? "border-primary"
                      : "border-secondary"
                  }`}
                  onClick={() => {
                    setSelectedVariant(variant);
                    setActiveImage(variant.photos?.[0]);
                  }}
                >
                  <img
                    src={variant.photos?.[0] || ""}
                    alt={variant.frameColor}
                    className="rounded"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No colors available</p>
          )}

          <div className="d-flex align-items-center gap-2 mb-3">
            <button
              className="btn btn-success flex-grow-1"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? "Adding to Cart..." : "Add To Cart"}
            </button>
            <div className="border rounded p-2">
              <FaHeart size={20} />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 mb-2">
            <FaShippingFast size={20} />
            <span>Free shipping worldwide</span>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <AiOutlineSafetyCertificate size={20} />
            <span>100% Secured Payment</span>
          </div>
          <div className="d-flex align-items-center gap-2 mb-2">
            <AiOutlineUser size={20} />
            <span>Made by the Professionals</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
