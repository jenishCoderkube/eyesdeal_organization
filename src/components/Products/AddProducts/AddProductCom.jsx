import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EyeGlasses from "./EyeGlasses/EyeGlasses";
import Accessories from "./Accessories/Accessories";
import SunGlasses from "./SunGlasses/SunGlasses";
import SpectacleLens from "./SpectacleLens/SpectacleLens";
import ContactLens from "./ContactLens/ContactLens";
import ReadingGlasses from "./ReadingGlasses/ReadingGlasses";
import ContactSolutions from "./ContactSolutions/ContactSolutions";

// Mock API to fetch product by ID
const fetchProductById = async (productId) => {
  const products = [
    {
      id: 1,
      model: "eyeGlasses",
      barcode: "10027",
      sku: "7STAR-9005-46",
      costPrice: 400,
      mrp: 1350,
      photos: [
        "https://placehold.co/100x100?text=Eyeglasses1",
        "https://placehold.co/100x100?text=Eyeglasses2",
      ],
      brand: "brand1",
      frameType: "fullRim",
      frameShape: "rectangle",
      gender: "unisex",
      frameMaterial: "metal",
      frameColor: "black",
      frameSize: "medium",
      prescriptionType: "singleVision",
      frameCollection: "classic",
      displayName: "Classic Eyeglasses",
      HSNCode: "1234",
      tax: 18,
      unit: "pair",
      resellerPrice: 500,
      discount: "10%",
      sellPrice: 1215,
      incentiveAmount: 0,
      manageStock: true,
      inclusiveTax: true,
      activeInERP: true,
      activeInWebsite: false,
    },
    {
      id: 2,
      model: "contactSolutions",
      barcode: "20001",
      sku: "CS-SALINE-001",
      costPrice: 50,
      mrp: 70,
      photos: [],
      brand: "brand2",
      material: "Saline",
      manufactureDate: new Date("2023-01-01"),
      expiryDate: new Date("2025-01-01"),
      unit: "bottle",
      description: "Multi-purpose solution",
      warranty: "1 year",
      HSNCode: "5678",
      tax: 12,
      resellerPrice: 60,
      discount: "5%",
      sellPrice: 66.5,
      incentiveAmount: 0,
      manageStock: true,
      inclusiveTax: true,
      activeInERP: true,
      activeInWebsite: false,
    },
    {
      id: 3,
      model: "sunGlasses",
      barcode: "30015",
      sku: "SUN-RAY-123",
      costPrice: 600,
      mrp: 1500,
      photos: ["https://placehold.co/100x100?text=Sunglasses1"],
      brand: "brand3",
      frameType: "fullRim",
      frameShape: "round",
      gender: "male",
      frameMaterial: "plastic",
      frameColor: "blue",
      frameSize: "large",
      prescriptionType: "none",
      frameCollection: "trendy",
      displayName: "Trendy Sunglasses",
      HSNCode: "9012",
      tax: 18,
      unit: "pair",
      resellerPrice: 700,
      discount: "15%",
      sellPrice: 1275,
      incentiveAmount: 0,
      manageStock: true,
      inclusiveTax: false,
      activeInERP: true,
      activeInWebsite: true,
    },
    {
      id: 4,
      model: "accessories",
      barcode: "40022",
      sku: "ACC-CASE-001",
      costPrice: 100,
      mrp: 200,
      photos: [],
      brand: "brand1",
      displayName: "Glasses Case",
      HSNCode: "3456",
      tax: 12,
      unit: "piece",
      resellerPrice: 120,
      discount: "10%",
      sellPrice: 180,
      incentiveAmount: 0,
      manageStock: true,
      inclusiveTax: true,
      activeInERP: true,
      activeInWebsite: false,
    },
    {
      id: 5,
      model: "spectacleLens",
      barcode: "50033",
      sku: "LENS-BLUECUT-01",
      costPrice: 300,
      mrp: 800,
      photos: ["https://placehold.co/100x100?text=Lens1"],
      brand: "brand2",
      prescriptionType: "progressive",
      displayName: "Blue Cut Lens",
      HSNCode: "7890",
      tax: 18,
      unit: "pair",
      resellerPrice: 350,
      discount: "10%",
      sellPrice: 720,
      incentiveAmount: 0,
      manageStock: true,
      inclusiveTax: false,
      activeInERP: true,
      activeInWebsite: true,
    },
    {
      id: 6,
      model: "contactLens",
      barcode: "60044",
      sku: "CL-DAILY-001",
      costPrice: 200,
      mrp: 500,
      photos: [],
      brand: "brand3",
      disposability: "daily",
      prescriptionType: "singleVision",
      displayName: "Daily Contact Lens",
      HSNCode: "2345",
      tax: 12,
      unit: "box",
      resellerPrice: 250,
      discount: "10%",
      sellPrice: 450,
      incentiveAmount: 0,
      manageStock: true,
      inclusiveTax: true,
      activeInERP: true,
      activeInWebsite: false,
    },
    {
      id: 7,
      model: "readingGlasses",
      barcode: "70055",
      sku: "RG-READ-001",
      costPrice: 350,
      mrp: 900,
      photos: ["https://placehold.co/100x100?text=Reading1"],
      brand: "brand1",
      frameType: "halfRim",
      frameShape: "rectangle",
      gender: "female",
      frameMaterial: "acetate",
      frameColor: "red",
      frameSize: "small",
      prescriptionType: "bifocal",
      frameCollection: "premium",
      displayName: "Premium Reading Glasses",
      HSNCode: "6789",
      tax: 18,
      unit: "pair",
      resellerPrice: 400,
      discount: "10%",
      sellPrice: 810,
      incentiveAmount: 0,
      manageStock: true,
      inclusiveTax: true,
      activeInERP: true,
      activeInWebsite: true,
    },
    {
      id: 8,
      model: "eyeGlasses",
      barcode: "80066",
      sku: "EG-MODERN-002",
      costPrice: 450,
      mrp: 1400,
      photos: ["https://placehold.co/100x100?text=Eyeglasses3"],
      brand: "brand2",
      frameType: "rimless",
      frameShape: "catEye",
      gender: "unisex",
      frameMaterial: "metal",
      frameColor: "black",
      frameSize: "medium",
      prescriptionType: "progressive",
      frameCollection: "trendy",
      displayName: "Modern Eyeglasses",
      HSNCode: "4567",
      tax: 18,
      unit: "pair",
      resellerPrice: 500,
      discount: "10%",
      sellPrice: 1260,
      incentiveAmount: 0,
      manageStock: true,
      inclusiveTax: false,
      activeInERP: true,
      activeInWebsite: true,
    },
    {
      id: 9,
      model: "contactSolutions",
      barcode: "90077",
      sku: "CS-MULTI-002",
      costPrice: 60,
      mrp: 80,
      photos: [],
      brand: "brand3",
      material: "Hydrogen Peroxide",
      manufactureDate: new Date("2023-06-01"),
      expiryDate: new Date("2025-06-01"),
      unit: "bottle",
      description: "Advanced cleaning solution",
      warranty: "1 year",
      HSNCode: "8901",
      tax: 12,
      resellerPrice: 70,
      discount: "5%",
      sellPrice: 76,
      incentiveAmount: 0,
      manageStock: true,
      inclusiveTax: true,
      activeInERP: true,
      activeInWebsite: false,
    },
    {
      id: 10,
      model: "sunGlasses",
      barcode: "10088",
      sku: "SUN-CLASSIC-456",
      costPrice: 700,
      mrp: 1600,
      photos: ["https://placehold.co/100x100?text=Sunglasses2"],
      brand: "brand1",
      frameType: "fullRim",
      frameShape: "round",
      gender: "female",
      frameMaterial: "plastic",
      frameColor: "red",
      frameSize: "large",
      prescriptionType: "none",
      frameCollection: "classic",
      displayName: "Classic Sunglasses",
      HSNCode: "0123",
      tax: 18,
      unit: "pair",
      resellerPrice: 800,
      discount: "10%",
      sellPrice: 1440,
      incentiveAmount: 0,
      manageStock: true,
      inclusiveTax: true,
      activeInERP: true,
      activeInWebsite: true,
    },
  ];
  return products.find((p) => p.id === parseInt(productId)) || null;
};

function AddProductCom({ mode = "add" }) {
  const [activeTab, setActiveTab] = useState("eyeGlasses");
  const [productData, setProductData] = useState(null);
  const { productId } = useParams();

  useEffect(() => {
    if (mode === "edit" && productId) {
      const loadProduct = async () => {
        const data = await fetchProductById(productId);
        if (data) {
          setProductData(data);
          setActiveTab(data.model);
        }
      };
      loadProduct();
    }
  }, [mode, productId]);

  const menuItems = [
    "eyeGlasses",
    "accessories",
    "sunGlasses",
    "spectacleLens",
    "contactLens",
    "readingGlasses",
    "contactSolutions",
  ];

  const componentMap = {
    eyeGlasses: <EyeGlasses initialData={productData} mode={mode} />,
    accessories: <Accessories initialData={productData} mode={mode} />,
    sunGlasses: <SunGlasses initialData={productData} mode={mode} />,
    spectacleLens: <SpectacleLens initialData={productData} mode={mode} />,
    contactLens: <ContactLens initialData={productData} mode={mode} />,
    readingGlasses: <ReadingGlasses initialData={productData} mode={mode} />,
    contactSolutions: (
      <ContactSolutions initialData={productData} mode={mode} />
    ),
  };

  return (
    <div className="container-fluid">
      <style>
        {`
          .nav-link.disabled {
            color: #6c757d !important;
            pointer-events: none;
            cursor: not-allowed;
            opacity: 0.65;
          }
        `}
      </style>
      <div className="d-md-none bg-light border-bottom">
        <div className="max-width-90 mx-auto py-md-3 py-2">
          <ul
            className="nav flex-row flex-nowrap overflow-x-auto"
            style={{ whiteSpace: "nowrap" }}
          >
            {menuItems.map((item) => {
              const isDisabled =
                mode === "edit" && productData && item !== productData.model;
              return (
                <li className="nav-item" key={item}>
                  <a
                    className={`nav-link fw-normal ${
                      activeTab === item
                        ? "active text-color-purple"
                        : "text-black"
                    } ${isDisabled ? "disabled" : ""}`}
                    style={{
                      backgroundColor:
                        activeTab === item
                          ? "rgb(238, 242, 255)"
                          : "transparent",
                      borderRadius: "0.25rem",
                      display: "inline-block",
                      marginRight: "0.5rem",
                    }}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isDisabled) {
                        setActiveTab(item);
                      }
                    }}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="row max-width-90 mx-auto mt-5">
        <div
          className="col-md-2 d-none d-md-block bg-light mt-5 border-end"
          style={{ minHeight: "100vh" }}
        >
          <div className="mx-auto mt-4">
            <ul className="nav flex-column">
              {menuItems.map((item) => {
                const isDisabled =
                  mode === "edit" && productData && item !== productData.model;
                return (
                  <li className="nav-item" key={item}>
                    <a
                      className={`nav-link fw-normal ${
                        activeTab === item
                          ? "active text-color-purple"
                          : "text-black"
                      } ${isDisabled ? "disabled" : ""}`}
                      style={{
                        backgroundColor:
                          activeTab === item
                            ? "rgb(238, 242, 255)"
                            : "transparent",
                        borderRadius: "0.25rem",
                      }}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isDisabled) {
                          setActiveTab(item);
                        }
                      }}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="col-12 col-md-10 p-md-4 mt-5 mt-md-0">
          <h2>{mode === "edit" ? "Edit Product" : "Add Product"}</h2>
          {componentMap[activeTab]}
        </div>
      </div>
    </div>
  );
}

export default AddProductCom;
