import React, { useState } from "react";
import GlassesCard from "./GlassesCard";
import Header from "./HedarCompnent";

const mockData = {
  Frame: [
    {
      _id: "1",
      sku: "I-GOG Frames 870/-",
      sellPrice: "870",
      photos: ["frame1.jpg"],
    },
    {
      _id: "2",
      sku: "I-GOG Frames 870/-",
      sellPrice: "870",
      photos: ["frame2.jpg"],
    },
    {
      _id: "3",
      sku: "I-GOG Frames 870/-",
      sellPrice: "870",
      photos: ["frame3.jpg"],
    },
    {
      _id: "4",
      sku: "I-GOG Frames 870/-",
      sellPrice: "870",
      photos: ["frame4.jpg"],
    },
    {
      _id: "5",
      sku: "I-GOG Frames 870/-",
      sellPrice: "870",
      photos: ["frame5.jpg"],
    },
  ],
  Sunglasses: [
    {
      _id: "6",
      sku: "Sun Frame 900/-",
      sellPrice: "900",
      photos: ["sun1.jpg"],
    },
    {
      _id: "7",
      sku: "Sun Frame 900/-",
      sellPrice: "900",
      photos: ["sun2.jpg"],
    },
    {
      _id: "8",
      sku: "Sun Frame 900/-",
      sellPrice: "900",
      photos: ["sun3.jpg"],
    },
  ],
  "Reading Glasses": [
    {
      _id: "9",
      sku: "Read Frame 750/-",
      sellPrice: "750",
      photos: ["read1.jpg"],
    },
    {
      _id: "10",
      sku: "Read Frame 750/-",
      sellPrice: "750",
      photos: ["read2.jpg"],
    },
  ],
  "Contact Lenses": [
    { _id: "11", sku: "Lens 500/-", sellPrice: "500", photos: ["lens1.jpg"] },
    { _id: "12", sku: "Lens 500/-", sellPrice: "500", photos: ["lens2.jpg"] },
  ],
  Solution: [
    {
      _id: "13",
      sku: "Solution 300/-",
      sellPrice: "300",
      photos: ["sol1.jpg"],
    },
  ],
  Accessories: [
    { _id: "14", sku: "Case 200/-", sellPrice: "200", photos: ["acc1.jpg"] },
    { _id: "15", sku: "Case 200/-", sellPrice: "200", photos: ["acc2.jpg"] },
  ],
};

const AddProductViewCom = () => {
  const [activeTab, setActiveTab] = useState("Frame");
  const [filteredData, setFilteredData] = useState(mockData[activeTab]);
  const [frameType, setFrameType] = useState("");
  const [material, setMaterial] = useState("");
  const [brand, setBrand] = useState("");
  const [shape, setShape] = useState("");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    filterData(tab, frameType, material, brand, shape);
  };

  const handleFilterChange = (type, value) => {
    switch (type) {
      case "Frame Type":
        setFrameType(value);
        break;
      case "Material":
        setMaterial(value);
        break;
      case "Brand":
        setBrand(value);
        break;
      case "Shape":
        setShape(value);
        break;
      default:
        break;
    }
    filterData(activeTab, value, material, brand, shape);
  };

  const filterData = (tab, frameType, material, brand, shape) => {
    let data = [...mockData[tab]];
    if (frameType) data = data.filter((item) => item.sku.includes(frameType));
    if (material) data = data.filter((item) => item.sku.includes(material));
    if (brand) data = data.filter((item) => item.sku.includes(brand));
    if (shape) data = data.filter((item) => item.sku.includes(shape));
    setFilteredData(data);
  };

  const handleCardClick = (id, frame) => {
    console.log("Selected:", id, frame);
  };

  return (
    <div className="container py-5">
      <Header
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        frameType={frameType}
        material={material}
        brand={brand}
        shape={shape}
        handleFilterChange={handleFilterChange}
      />

      {/* Product Grid */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4">
        {filteredData.map((frame) => (
          <div className="col" key={frame._id}>
            <GlassesCard
              title={frame.sku}
              price={`${frame.sellPrice} ₹`}
              imageUrl={
                frame.photos && frame.photos.length > 0 ? frame.photos[0] : null
              }
              onClick={() => handleCardClick(frame._id, frame)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddProductViewCom;
