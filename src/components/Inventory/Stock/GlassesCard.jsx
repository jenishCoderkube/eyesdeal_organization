import React from "react";
import "./GlassCard.css";
import img1 from "./eyesdealLogo.jpg";
import { imageBaseUrl } from "../../../utils/api";

const GlassesCard = ({
  title = "I-GOG Frames",
  price = "800 ₹",
  imageUrl = null,
  onClick,
  frame,
}) => {
  console.log("imageUrl", imageUrl);

  return (
    <div
      className="glass-card h-100 border glass-cursor-pointer rounded"
      onClick={onClick}
    >
      <div
        className="glass-card-img p-2 bg-white"
        style={{ height: "160px", overflow: "hidden" }}
      >
        {imageUrl ? (
          <img
            src={imageBaseUrl + imageUrl}
            className="glass-img-fluid rounded"
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
            alt={title}
            onError={(e) => {
              e.target.style.display = "none";
              const fallback = e.target.nextSibling;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : (
          <div className="glass-img-fallback d-flex justify-content-center align-items-center h-100 bg-light rounded">
            <p className="glass-text-muted small m-0">Image not found</p>
          </div>
        )}
      </div>
      <div className="glass-card-body p-3 text-center">
        <h6 className="glass-card-title mb-2 fw-bold text-dark">{title}</h6>
        <span className="fs-5 fw-semibold text-success">{price}</span>
      </div>
    </div>
  );
};

export default GlassesCard;
