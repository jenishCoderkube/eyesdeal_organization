import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import Select from "react-select";
import { FaSearch } from "react-icons/fa";
import productViewService from "../../../services/Products/productViewService"; // Adjust path
import { useLocation } from "react-router-dom";
const modelOptions = [
  { value: "eyeGlasses", label: "Eye Glasses" },
  { value: "accessories", label: "Accessories" },
  { value: "sunGlasses", label: "Sun Glasses" },
  { value: "spectacleLens", label: "Spectacle Lens" },
  { value: "contactLens", label: "Contact Lens" },
  { value: "readingGlasses", label: "Reading Glasses" },
  { value: "contactSolutions", label: "Contact Solutions" },
];

function ProductFilterForm({ onSubmit }) {
  const [options, setOptions] = useState({
    brandOptions: [],
    frameTypeOptions: [],
    frameShapeOptions: [],
    frameMaterialOptions: [],
    frameColorOptions: [],
    frameSizeOptions: [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
      { value: "extra_large", label: "Extra Large" },
    ], // Hardcoded as no API provided
    prescriptionTypeOptions: [],
    frameCollectionOptions: [],
    statusOptions: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Parse query string
  const queryParams = new URLSearchParams(location.search);
  const filters = {
    model: queryParams.get("model") || "eyeGlasses",
    brand: queryParams.get("brand") || "",
    status: queryParams.get("status") || "active",
  };
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [
          brandsRes,
          frameTypesRes,
          frameShapesRes,
          frameMaterialsRes,
          frameColorsRes,
          prescriptionTypesRes,
          frameCollectionsRes,
        ] = await Promise.all([
          productViewService.getBrands(),
          productViewService.getFrameTypes(),
          productViewService.getFrameShapes(),
          productViewService.getFrameMaterials(),
          productViewService.getFrameColors(),
          productViewService.getPrescriptionTypes(),
          productViewService.getFrameCollections(),
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
          frameColorOptions: frameColorsRes.success
            ? frameColorsRes.data.map((item) => ({
                value: item._id,
                label: item.name,
              }))
            : [],
          prescriptionTypeOptions: prescriptionTypesRes.success
            ? prescriptionTypesRes.data.map((item) => ({
                value: item._id,
                label: item.name,
              }))
            : [],
          frameCollectionOptions: frameCollectionsRes.success
            ? frameCollectionsRes.data.map((item) => ({
                value: item._id,
                label: item.name,
              }))
            : [],
        }));

        if (
          !brandsRes.success ||
          !frameTypesRes.success ||
          !frameShapesRes.success ||
          !frameMaterialsRes.success ||
          !frameColorsRes.success ||
          !prescriptionTypesRes.success ||
          !frameCollectionsRes.success
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
        search: queryParams.get("search") || "",
        model: filters.model, // from query
        brand: filters.brand, // from query
        frameType: queryParams.get("frameType") || "",
        frameShape: queryParams.get("frameShape") || "",
        gender: queryParams.get("gender") || "",
        frameMaterial: queryParams.get("frameMaterial") || "",
        frameColor: queryParams.get("frameColor") || "",
        frameSize: queryParams.get("frameSize") || "",
        prescriptionType: queryParams.get("prescriptionType") || "",
        frameCollection: queryParams.get("frameCollection") || "",
        status: filters.status, // from query
      }}
      onSubmit={(values) => onSubmit(values)}
    >
      {({ setFieldValue, values }) => (
        <Form className="d-flex flex-column gap-4 mb-4">
          <div>
            <h5 className="fw-bold">Search Product</h5>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <FaSearch className="text-muted" />
              </span>
              <Field
                type="search"
                name="search"
                className="form-control border-start-0"
                placeholder="Search…"
              />
            </div>
          </div>
          <div className="row row-cols-1 row-cols-md-4 g-4">
            <div>
              <label className="form-label text-sm font-weight-600">
                Product
              </label>
              <Select
                name="model"
                options={modelOptions}
                onChange={(option) =>
                  setFieldValue("model", option ? option.value : "")
                }
                value={modelOptions.find(
                  (option) => option.value === values.model
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Brand <span className="text-danger">*</span>
              </label>
              <Select
                name="brand"
                options={options.brandOptions}
                onChange={(option) =>
                  setFieldValue("brand", option ? option.value : "")
                }
                value={options.brandOptions.find(
                  (option) => option.value === values.brand
                )}
                placeholder="Select..."
                isClearable={true}
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Type
              </label>
              <Select
                name="frameType"
                options={options.frameTypeOptions}
                onChange={(option) =>
                  setFieldValue("frameType", option ? option.value : "")
                }
                value={options.frameTypeOptions.find(
                  (option) => option.value === values.frameType
                )}
                placeholder="Select..."
                isClearable={true}
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Shape
              </label>
              <Select
                name="frameShape"
                options={options.frameShapeOptions}
                onChange={(option) =>
                  setFieldValue("frameShape", option ? option.value : "")
                }
                value={options.frameShapeOptions.find(
                  (option) => option.value === values.frameShape
                )}
                placeholder="Select..."
                isClearable={true}
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Gender
              </label>
              <Select
                name="gender"
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "unisex", label: "Unisex" },
                  { value: "kids", label: "kids" },
                ]}
                onChange={(option) =>
                  setFieldValue("gender", option ? option.value : "")
                }
                value={options.genderOptions?.find(
                  (option) => option.value === values.gender
                )}
                placeholder="Select..."
                isClearable={true}
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Material
              </label>
              <Select
                name="frameMaterial"
                options={options.frameMaterialOptions}
                onChange={(option) =>
                  setFieldValue("frameMaterial", option ? option.value : "")
                }
                value={options.frameMaterialOptions.find(
                  (option) => option.value === values.frameMaterial
                )}
                placeholder="Select..."
                isClearable={true}
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Color
              </label>
              <Select
                name="frameColor"
                options={options.frameColorOptions}
                onChange={(option) =>
                  setFieldValue("frameColor", option ? option.value : "")
                }
                value={options.frameColorOptions.find(
                  (option) => option.value === values.frameColor
                )}
                placeholder="Select..."
                isClearable={true}
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Size
              </label>
              <Select
                name="frameSize"
                options={options.frameSizeOptions}
                onChange={(option) =>
                  setFieldValue("frameSize", option ? option.value : "")
                }
                value={options.frameSizeOptions.find(
                  (option) => option.value === values.frameSize
                )}
                placeholder="Select..."
                isClearable={true}
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Prescription Type
              </label>
              <Select
                name="prescriptionType"
                options={options.prescriptionTypeOptions}
                onChange={(option) =>
                  setFieldValue("prescriptionType", option ? option.value : "")
                }
                value={options.prescriptionTypeOptions.find(
                  (option) => option.value === values.prescriptionType
                )}
                placeholder="Select..."
                isClearable={true}
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Collection
              </label>
              <Select
                name="frameCollection"
                options={options.frameCollectionOptions}
                onChange={(option) =>
                  setFieldValue("frameCollection", option ? option.value : "")
                }
                value={options.frameCollectionOptions.find(
                  (option) => option.value === values.frameCollection
                )}
                placeholder="Select..."
                isClearable={true}
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Status
              </label>
              <Select
                name="status"
                options={options.statusOptions}
                onChange={(option) =>
                  setFieldValue("status", option ? option.value : "")
                }
                value={options.statusOptions.find(
                  (option) => option.value === values.status
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
            </div>
          </div>
          <div>
            <button type="submit" className="btn custom-button-bgcolor">
              Submit
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default ProductFilterForm;
