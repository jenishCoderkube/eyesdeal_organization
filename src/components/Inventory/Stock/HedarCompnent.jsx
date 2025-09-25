import React from "react";

const HeaderComponent = ({
  activeTab,
  handleTabChange,
  frameType,
  material,
  brand,
  shape,
  handleFilterChange,
}) => {
  const tabs = [
    "Frame",
    "Sunglasses",
    "Reading Glasses",
    "Contact Lenses",
    "Solution",
    "Accessories",
  ];

  return (
    <div className="mb-5">
      {/* Title */}
      <div className="text-center mb-5">
        <h2 className="fw-bold  text-dark">ADD PRODUCT PURCHASE</h2>
      </div>

      {/* Tabs */}
      {/* Tabs */}
      {/* Tabs */}
      <ul className="nav nav-pills justify-content-center flex-nowrap overflow-auto mb-5">
        {tabs.map((tab) => (
          <li className="nav-item mx-2" key={tab}>
            <button
              className={`nav-link px-5 py-3 fontSize-16 text-nowrap ${
                activeTab === tab ? "active fw-bold" : "fw-semibold"
              }`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      {/* Filters */}
      <div className="d-flex flex-wrap justify-content-start gap-5 align-items-center">
        <select
          className="form-select form-select-sm w-auto fs-5 py-1 px-2"
          onChange={(e) => handleFilterChange("Frame Type", e.target.value)}
          value={frameType}
        >
          <option value="">Frame Type</option>
          <option value="870">870</option>
          <option value="900">900</option>
        </select>

        <select
          className="form-select form-select-sm w-auto fs-5 py-1 px-2"
          onChange={(e) => handleFilterChange("Material", e.target.value)}
          value={material}
        >
          <option value="">Material</option>
          <option value="Metal">Metal</option>
          <option value="Plastic">Plastic</option>
        </select>

        <select
          className="form-select form-select-sm w-auto fs-5 py-1 px-2"
          onChange={(e) => handleFilterChange("Brand", e.target.value)}
          value={brand}
        >
          <option value="">Brand</option>
          <option value="I-GOG">I-GOG</option>
          <option value="Sun">Sun</option>
        </select>

        <select
          className="form-select form-select-sm w-auto fs-5 py-1 px-2"
          onChange={(e) => handleFilterChange("Shape", e.target.value)}
          value={shape}
        >
          <option value="">Shape</option>
          <option value="Square">Square</option>
          <option value="Round">Round</option>
        </select>

        <button className="btn btn-success btn-sm px-3 py-1 fs-5 fw-bold">
          Apply
        </button>
      </div>
    </div>
  );
};

export default HeaderComponent;
