import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { imageBaseUrl } from "../../../utils/api";

const GlassesCard = ({
  title = "",
  price = "",
  imageUrl = null,
  onClick,
  frame,
  quantity: propQuantity = 0, // ✅ receive quantity as prop
  onQuantityChange,
}) => {
  const [quantity, setQuantity] = useState(propQuantity);

  // Sync local quantity state with prop when prop changes
  useEffect(() => {
    setQuantity(propQuantity || 0);
  }, [propQuantity]);

  const handleQuantityChange = (newQty) => {
    if (newQty === "") {
      setQuantity("");
      onQuantityChange?.(frame._id, 0, frame?.sellPrice);
      return;
    }

    const validQty = Math.max(0, Math.min(5000, Number(newQty)));
    setQuantity(validQty);
    onQuantityChange?.(frame._id, validQty, frame?.sellPrice);
  };

  return (
    <div className="card h-auto border-0 shadow-sm">
      {/* Image Section */}
      <div
        className="bg-white d-flex align-items-center justify-content-center p-2"
        style={{ height: "160px" }}
      >
        {imageUrl ? (
          <img
            src={imageBaseUrl + imageUrl}
            alt={title}
            className="img-fluid rounded"
            style={{ maxHeight: "100%", objectFit: "contain" }}
          />
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100 w-100 bg-light rounded">
            <p className="text-muted small m-0">No Image</p>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body text-center ">
        <h6 className="fw-semibold text-dark text-truncate mb-1">{title}</h6>
        <p className="fw-bold text-success mb-3 fs-6">{price}</p>

        {/* Quantity & View Row */}
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-secondary btn-sm px-2 py-1"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 0}
            >
              −
            </button>
            <input
              type="number"
              value={quantity === "" ? "" : quantity}
              min="0"
              max="5000"
              onChange={(e) => handleQuantityChange(e.target.value)}
              onBlur={() => {
                if (quantity === "") handleQuantityChange(0);
              }}
              className="form-control form-control-sm text-center mx-1"
              style={{ width: "60px" }}
            />
            <button
              className="btn btn-outline-secondary btn-sm px-2 py-1"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 5000}
            >
              +
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="fw-semibold px-2 py-1"
            onClick={onClick}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GlassesCard;
