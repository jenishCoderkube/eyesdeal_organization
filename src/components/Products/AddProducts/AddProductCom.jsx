import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import productViewService from "../../../services/Products/productViewService";
import EyeGlasses from "./EyeGlasses/EyeGlasses";
import Accessories from "./Accessories/Accessories";
import SunGlasses from "./SunGlasses/SunGlasses";
import SpectacleLens from "./SpectacleLens/SpectacleLens";
import ContactLens from "./ContactLens/ContactLens";
import ReadingGlasses from "./ReadingGlasses/ReadingGlasses";
import ContactSolutions from "./ContactSolutions/ContactSolutions";

function AddProductCom({ mode = "add" }) {
  const { productId, model } = useParams();
  const [activeTab, setActiveTab] = useState(
    mode === "edit" && model ? model : "eyeGlasses"
  );
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === "edit" && productId && model) {
      const loadProduct = async () => {
        setLoading(true);
        setError(null);

        const response = await productViewService.getProductById(
          model,
          productId
        );

        if (response.success && response.data.length > 0) {
          const product = response.data[0];
          setProductData(product);
          setActiveTab(product.__t || model);
        } else {
          const errorMessage = response.message || "Failed to load product";
          setError(errorMessage);
          toast.error(errorMessage);
        }

        setLoading(false);
      };
      loadProduct();
    } else {
      setProductData(null);
    }
  }, [mode, productId, model]);

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
                mode === "edit" && productData && item !== productData.__t;
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
                  mode === "edit" && productData && item !== productData.__t;
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
          {loading && (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && !error && componentMap[activeTab]}
        </div>
      </div>
    </div>
  );
}

export default AddProductCom;
