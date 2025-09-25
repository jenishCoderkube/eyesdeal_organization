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
        <h1 className="fw-bold display-4 text-dark">ED PRODUCT PURCHASE</h1>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills justify-content-center mb-4 fs-5">
        {tabs.map((tab) => (
          <li className="nav-item mx-1" key={tab}>
            <button
              className={`nav-link px-4 py-2 ${
                activeTab === tab ? "active" : ""
              }`}
              style={{ fontWeight: activeTab === tab ? "600" : "400" }}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      {/* Filters */}
      <div className="d-flex flex-wrap justify-content-center gap-3">
        <select
          className="form-select w-auto fs-5"
          onChange={(e) => handleFilterChange("Frame Type", e.target.value)}
          value={frameType}
        >
          <option value="">Frame Type</option>
          <option value="870">870</option>
          <option value="900">900</option>
        </select>
        <select
          className="form-select w-auto fs-5"
          onChange={(e) => handleFilterChange("Material", e.target.value)}
          value={material}
        >
          <option value="">Material</option>
          <option value="Metal">Metal</option>
          <option value="Plastic">Plastic</option>
        </select>
        <select
          className="form-select w-auto fs-5"
          onChange={(e) => handleFilterChange("Brand", e.target.value)}
          value={brand}
        >
          <option value="">Brand</option>
          <option value="I-GOG">I-GOG</option>
          <option value="Sun">Sun</option>
        </select>
        <select
          className="form-select w-auto fs-5"
          onChange={(e) => handleFilterChange("Shape", e.target.value)}
          value={shape}
        >
          <option value="">Shape</option>
          <option value="Square">Square</option>
          <option value="Round">Round</option>
        </select>
        <button className="btn btn-lg btn-success px-4">Apply</button>
      </div>
    </div>
  );
};

export default HeaderComponent;
