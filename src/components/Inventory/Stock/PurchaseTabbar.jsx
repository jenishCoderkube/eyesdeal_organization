import React, { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import Select from "react-select";
import productViewService from "../../../services/Products/productViewService"; // Adjust path
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { FiCheckSquare, FiSquare } from "react-icons/fi";
import { storeService } from "../../../services/storeService";
import { inventoryService } from "../../../services/inventoryService";
const modelOptions = [
  { value: "eyeGlasses", label: "Frame" },
  { value: "sunGlasses", label: "Sun Glasses" },
  { value: "readingGlasses", label: "Reading Glasses" },
  { value: "contactLens", label: "Contact Lens" },
  { value: "contactSolutions", label: "Contact Solutions" },
  { value: "accessories", label: "Accessories" },
  { value: "spectacleLens", label: "Spectacle Lens" },
];

function PurchaseTabBar({
  onSubmit,
  onSelectChange,
  onSubmitCart,
  totalCount,
}) {
  const [options, setOptions] = useState({
    brandOptions: [],
    frameTypeOptions: [],
    frameShapeOptions: [],
    frameMaterialOptions: [],
    storeData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Parse query string
  const filters = {
    model: searchParams.get("model") || "eyeGlasses",
    brand: searchParams.get("brand") || "",
    frameType: searchParams.get("frameType") || "",
    frameShape: searchParams.get("frameShape") || "",
    frameMaterial: searchParams.get("frameMaterial") || "",
  };

  // Set default model to eyeGlasses if not present in URL
  useEffect(() => {
    if (!searchParams.get("model")) {
      setSearchParams(
        {
          ...Object.fromEntries(searchParams),
          model: "eyeGlasses",
          isMultiSelect: searchParams.get("isMultiSelect") || "false",
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);
  let storeId = JSON.parse(localStorage.getItem("user"))?.stores[0];
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [
          brandsRes,
          frameTypesRes,
          frameShapesRes,
          frameMaterialsRes,
          storeData,
        ] = await Promise.all([
          productViewService.getBrands(),
          productViewService.getFrameTypes(),
          productViewService.getFrameShapes(),
          productViewService.getFrameMaterials(),
          inventoryService.getStores(),
        ]);

        setOptions((prev) => ({
          ...prev,
          brandOptions: brandsRes.success
            ? brandsRes.data.map((item) => ({
                value: item._id,
                label: item.name,
              }))
            : [],
          frameTypeOptions: frameTypesRes.success
            ? frameTypesRes.data.map((item) => ({
                value: item._id,
                label: item.name,
              }))
            : [],
          frameShapeOptions: frameShapesRes.success
            ? frameShapesRes.data.map((item) => ({
                value: item._id,
                label: item.name,
              }))
            : [],
          frameMaterialOptions: frameMaterialsRes.success
            ? frameMaterialsRes.data.map((item) => ({
                value: item._id,
                label: item.name,
              }))
            : [],
          storeData: storeData.success
            ? storeData.data?.data?.filter((data) => data?._id === storeId)
            : [],
        }));

        if (
          !brandsRes.success ||
          !frameTypesRes.success ||
          !frameShapesRes.success ||
          !frameMaterialsRes.success
        ) {
          setError("Failed to load some filter options.");
        }
      } catch (err) {
        setError("Error fetching filter options.");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  if (loading) {
    return <div>Loading filters...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <Formik
      initialValues={{
        model: filters.model,
        brand: filters.brand,
        frameType: filters.frameType,
        frameShape: filters.frameShape,
        frameMaterial: filters.frameMaterial,
        search: "",
        isMultiSelect: searchParams.get("isMultiSelect") === "true" || false,
      }}
      onSubmit={(values) => onSubmit(values)}
      enableReinitialize={true}
    >
      {({ setFieldValue, values, submitForm }) => (
        <Form className="d-flex flex-column gap-2 mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className=" fw-bold">ED PRODUCT PURCHASE</h6>
            <h6 className=" fw-bold">Store: {options.storeData[0]?.name}</h6>
          </div>

          <div className="d-flex align-items-center justify-content-between">
            <h5>Total Qty: {totalCount}</h5>
            <ul className="nav nav-tabs border-bottom-0">
              {modelOptions.map((tab) => (
                <li className="nav-item" key={tab.value}>
                  <button
                    type="button"
                    className={`nav-link px-4 py-2 fs-5 text-nowrap rounded-top-3 shadow-sm transition-all duration-300 ${
                      values.model === tab.value
                        ? "active bg-primary text-white fw-bold border-primary"
                        : "text-dark bg-light fw-semibold border-light hover:bg-gray-100"
                    }`}
                    style={{
                      minWidth: "120px",
                      borderBottom:
                        values.model === tab.value
                          ? "3px solid #007bff"
                          : "none",
                    }}
                    onClick={() => {
                      setFieldValue("model", tab.value);
                      setFieldValue("isMultiSelect", values.isMultiSelect);
                      setFieldValue("brand", "");
                      setFieldValue("frameType", "");
                      setFieldValue("frameShape", "");
                      setFieldValue("frameMaterial", "");
                      submitForm();
                    }}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="row flex justify-content-end  align-items-end row-cols-1 row-cols-md-6 g-3">
            {/* MultiSelect Toggle */}
            <div>
              <button
                type="button"
                className="btn btn-success ms-4"
                onClick={() => {
                  onSubmitCart?.(); // trigger add-to-cart from parent
                }}
              >
                Submit
              </button>
            </div>

            <div className="">
              <label
                className="form-label"
                style={{ fontSize: "13px", margin: 0, padding: 0 }}
              >
                Search
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search products..."
                value={values.search || ""}
                onChange={(e) => {
                  setFieldValue("search", e.target.value);
                  submitForm();
                }}
                style={{ fontSize: "0.85rem" }}
              />
            </div>

            <div>
              <label
                className="form-label"
                style={{ fontSize: "13px", margin: 0, padding: 0 }}
              >
                Brand
              </label>
              <Select
                name="brand"
                options={options.brandOptions}
                onChange={(option) => {
                  setFieldValue("brand", option ? option.value : "");
                  submitForm();
                }}
                value={options.brandOptions.find(
                  (option) => option.value === values.brand
                )}
                placeholder="Select Brand"
                isClearable={true}
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                    minHeight: "30px",
                    height: "30px",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: "0 8px",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                  }),
                  menu: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                  }),
                  dropdownIndicator: (base) => ({
                    ...base,
                    padding: "4px",
                  }),
                  clearIndicator: (base) => ({
                    ...base,
                    padding: "4px",
                  }),
                }}
              />
            </div>
            <div>
              <label
                className="form-label"
                style={{ fontSize: "13px", margin: 0, padding: 0 }}
              >
                Frame Type
              </label>
              <Select
                name="frameType"
                options={options.frameTypeOptions}
                onChange={(option) => {
                  setFieldValue("frameType", option ? option.value : "");
                  submitForm();
                }}
                value={options.frameTypeOptions.find(
                  (option) => option.value === values.frameType
                )}
                placeholder="Select Type"
                isClearable={true}
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                    minHeight: "30px",
                    height: "30px",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: "0 8px",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                  }),
                  menu: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                  }),
                  dropdownIndicator: (base) => ({
                    ...base,
                    padding: "4px",
                  }),
                  clearIndicator: (base) => ({
                    ...base,
                    padding: "4px",
                  }),
                }}
              />
            </div>
            <div>
              <label
                className="form-label"
                style={{ fontSize: "13px", margin: 0, padding: 0 }}
              >
                Frame Shape
              </label>
              <Select
                name="frameShape"
                options={options.frameShapeOptions}
                onChange={(option) => {
                  setFieldValue("frameShape", option ? option.value : "");
                  submitForm();
                }}
                value={options.frameShapeOptions.find(
                  (option) => option.value === values.frameShape
                )}
                placeholder="Select Shape"
                isClearable={true}
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                    minHeight: "30px",
                    height: "30px",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: "0 8px",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                  }),
                  menu: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                  }),
                  dropdownIndicator: (base) => ({
                    ...base,
                    padding: "4px",
                  }),
                  clearIndicator: (base) => ({
                    ...base,
                    padding: "4px",
                  }),
                }}
              />
            </div>
            <div>
              <label
                className="form-label"
                style={{ fontSize: "13px", margin: 0, padding: 0 }}
              >
                Frame Material
              </label>
              <Select
                name="frameMaterial"
                options={options.frameMaterialOptions}
                onChange={(option) => {
                  setFieldValue("frameMaterial", option ? option.value : "");
                  submitForm();
                }}
                value={options.frameMaterialOptions.find(
                  (option) => option.value === values.frameMaterial
                )}
                placeholder="Select Material"
                isClearable={true}
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                    minHeight: "30px",
                    height: "30px",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    padding: "0 8px",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                  }),
                  menu: (base) => ({
                    ...base,
                    fontSize: "0.85rem",
                  }),
                  dropdownIndicator: (base) => ({
                    ...base,
                    padding: "4px",
                  }),
                  clearIndicator: (base) => ({
                    ...base,
                    padding: "4px",
                  }),
                }}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default PurchaseTabBar;
