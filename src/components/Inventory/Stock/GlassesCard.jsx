import React from "react";

const GlassesCard = ({
  title = "I-GOG Frames",
  price = "800 ₹",
  imageUrl = null,
  onClick,
}) => {
  return (
    <div
      className="card h-100 border-0 shadow-sm rounded-3 cursor-pointer"
      style={{ transition: "all 0.3s ease-in-out" }}
      onClick={onClick}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = "#E77817")}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = "transparent")}
    >
      <div
        className="card-img-top p-2"
        style={{ height: "105px", overflow: "hidden" }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            className="img-fluid rounded"
            style={{ objectFit: "cover", height: "100%", width: "100%" }}
            onError={(e) => {
              e.target.style.display = "none";
              const fallback = e.target.nextSibling;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : (
          <div className="d-flex justify-content-center align-items-center h-100 bg-light rounded">
            <p className="text-muted small">Image not found</p>
          </div>
        )}
      </div>
      <div className="card-body p-2 d-flex justify-content-between align-items-center">
        <h6 className="card-title mb-0">{title}</h6>
        <span className="badge bg-light text-dark">{price}</span>
      </div>
    </div>
  );
};

export default GlassesCard;
