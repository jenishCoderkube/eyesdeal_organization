// src/ProductPurchase.js
import React, { useState } from "react";
import GlassesCard from "./GlassesCard";
import HeaderComponent from "./HedarCompnent";
import ProductDetails from "./ProductDetails";
import img1 from "./eyesdealLogo.jpg";
const mockData = {
  Frame: [
    {
      _id: "1",
      sku: "I-GOG Frames 870/-",
      sellPrice: "870",
      photos: [img1],
      displayName: "I-GOG Classic Frames",
      MRP: "1000",
      features: ["Lightweight", "Durable", "UV Protection"],
      colorVariants: [
        { _id: "1a", frameColor: "Black", photos: ["eyesdealLogo.jpg"] },
        { _id: "1b", frameColor: "Blue", photos: ["eyesdealLogo.jpg"] },
      ],
    },
    {
      _id: "2",
      sku: "I-GOG Frames 870/-",
      sellPrice: "870",
      photos: ["eyesdealLogo.jpg"],
      displayName: "I-GOG Modern Frames",
      MRP: "1000",
      features: ["Stylish", "Comfort Fit"],
      colorVariants: [],
    },
    {
      _id: "3",
      sku: "I-GOG Frames 870/-",
      sellPrice: "870",
      photos: ["eyesdealLogo.jpg"],
      displayName: "I-GOG Sleek Frames",
      MRP: "1000",
      features: ["Anti-Slip", "Lightweight"],
      colorVariants: [],
    },
    {
      _id: "4",
      sku: "I-GOG Frames 870/-",
      sellPrice: "870",
      photos: ["eyesdealLogo.jpg"],
      displayName: "I-GOG Trendy Frames",
      MRP: "1000",
      features: ["Durable", "Fashionable"],
      colorVariants: [],
    },
    {
      _id: "5",
      sku: "I-GOG Frames 870/-",
      sellPrice: "870",
      photos: ["eyesdealLogo.jpg"],
      displayName: "I-GOG Premium Frames",
      MRP: "1000",
      features: ["UV Protection", "Comfortable"],
      colorVariants: [],
    },
  ],
  Sunglasses: [
    {
      _id: "6",
      sku: "Sun Frame 900/-",
      sellPrice: "900",
      photos: ["eyesdealLogo.jpg"],
      displayName: "Sun Frame Polarized",
      MRP: "1200",
      features: ["Polarized Lenses", "Anti-Glare", "Stylish Design"],
      colorVariants: [
        { _id: "6a", frameColor: "Brown", photos: ["eyesdealLogo.jpg"] },
        { _id: "6b", frameColor: "Green", photos: ["eyesdealLogo.jpg"] },
      ],
    },
    {
      _id: "7",
      sku: "Sun Frame 900/-",
      sellPrice: "900",
      photos: ["eyesdealLogo.jpg"],
      displayName: "Sun Frame Classic",
      MRP: "1200",
      features: ["UV400 Protection", "Lightweight"],
      colorVariants: [],
    },
    {
      _id: "8",
      sku: "Sun Frame 900/-",
      sellPrice: "900",
      photos: ["eyesdealLogo.jpg"],
      displayName: "Sun Frame Sport",
      MRP: "1200",
      features: ["Durable", "Anti-Slip"],
      colorVariants: [],
    },
  ],
  "Reading Glasses": [
    {
      _id: "9",
      sku: "Read Frame 750/-",
      sellPrice: "750",
      photos: ["eyesdealLogo.jpg"],
      displayName: "Reading Glasses Comfort",
      MRP: "900",
      features: ["Anti-Slip", "Clear Vision"],
      colorVariants: [],
    },
    {
      _id: "10",
      sku: "Read Frame 750/-",
      sellPrice: "750",
      photos: ["eyesdealLogo.jpg"],
      displayName: "Reading Glasses Pro",
      MRP: "900",
      features: ["Lightweight", "Comfort Fit"],
      colorVariants: [],
    },
  ],
  "Contact Lenses": [
    {
      _id: "11",
      sku: "Lens 500/-",
      sellPrice: "500",
      photos: ["eyesdealLogo.jpg"],
      displayName: "Daily Contact Lenses",
      MRP: "600",
      features: ["Comfort Wear", "High Moisture"],
      colorVariants: [],
    },
    {
      _id: "12",
      sku: "Lens 500/-",
      sellPrice: "500",
      photos: ["eyesdealLogo.jpg"],
      displayName: "Monthly Contact Lenses",
      MRP: "600",
      features: ["Breathable", "Easy to Wear"],
      colorVariants: [],
    },
  ],
  Solution: [
    {
      _id: "13",
      sku: "Solution 300/-",
      sellPrice: "300",
      photos: ["eyesdealLogo.jpg"],
      displayName: "Lens Cleaning Solution",
      MRP: "350",
      features: ["Anti-Bacterial", "Safe for All Lenses"],
      colorVariants: [],
    },
  ],
  Accessories: [
    {
      _id: "14",
      sku: "Case 200/-",
      sellPrice: "200",
      photos: ["eyesdealLogo.jpg"],
      displayName: "Protective Glasses Case",
      MRP: "250",
      features: ["Hard Shell", "Portable"],
      colorVariants: [],
    },
    {
      _id: "15",
      sku: "Case 200/-",
      sellPrice: "200",
      photos: ["eyesdealLogo.jpg"],
      displayName: "Stylish Glasses Case",
      MRP: "250",
      features: ["Compact", "Durable"],
      colorVariants: [],
    },
  ],
};

const ProductPurchase = () => {
  const [activeTab, setActiveTab] = useState("Frame");
  const [filteredData, setFilteredData] = useState(mockData[activeTab]);
  const [frameType, setFrameType] = useState("");
  const [material, setMaterial] = useState("");
  const [brand, setBrand] = useState("");
  const [shape, setShape] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedProduct(null);
    setShowDetails(false);
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

  const handleCardClick = (id) => {
    let product = null;
    for (const category in mockData) {
      const found = mockData[category].find((item) => item._id === id);
      if (found) {
        product = found;
        break;
      }
    }
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const handleBack = () => {
    setShowDetails(false);
    setSelectedProduct(null);
  };

  return (
    <div className="container py-5">
      <HeaderComponent
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        frameType={frameType}
        material={material}
        brand={brand}
        shape={shape}
        handleFilterChange={handleFilterChange}
      />
      {showDetails && selectedProduct ? (
        <ProductDetails product={selectedProduct} onBack={handleBack} />
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4">
          {filteredData.map((frame) => (
            <div className="col" key={frame._id}>
              <GlassesCard
                title={frame.sku}
                price={`${frame.sellPrice} ₹`}
                imageUrl={img1}
                onClick={() => handleCardClick(frame._id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPurchase;
