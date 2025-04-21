// src/components/ProductFilterForm.jsx
import React from "react";
import { Formik, Form, Field } from "formik";
import Select from "react-select";
import { FaSearch } from "react-icons/fa";

const modelOptions = [
  { value: "eyeGlasses", label: "Eye Glasses" },
  { value: "accessories", label: "Accessories" },
  { value: "sunGlasses", label: "Sun Glasses" },
  { value: "spectacleLens", label: "Spectacle Lens" },
  { value: "contactLens", label: "Contact Lens" },
  { value: "readingGlasses", label: "Reading Glasses" },
  { value: "contactSolutions", label: "Contact Solutions" },
];

const brandOptions = [
  { value: "brand1", label: "Brand 1" },
  { value: "brand2", label: "Brand 2" },
  { value: "brand3", label: "Brand 3" },
];

const frameTypeOptions = [
  { value: "fullRim", label: "Full Rim" },
  { value: "halfRim", label: "Half Rim" },
  { value: "rimless", label: "Rimless" },
];

const frameShapeOptions = [
  { value: "rectangle", label: "Rectangle" },
  { value: "round", label: "Round" },
  { value: "catEye", label: "Cat Eye" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unisex", label: "Unisex" },
];

const frameMaterialOptions = [
  { value: "metal", label: "Metal" },
  { value: "plastic", label: "Plastic" },
  { value: "acetate", label: "Acetate" },
];

const frameColorOptions = [
  { value: "black", label: "Black" },
  { value: "blue", label: "Blue" },
  { value: "red", label: "Red" },
];

const frameSizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const prescriptionTypeOptions = [
  { value: "singleVision", label: "Single Vision" },
  { value: "bifocal", label: "Bifocal" },
  { value: "progressive", label: "Progressive" },
];

const frameCollectionOptions = [
  { value: "classic", label: "Classic" },
  { value: "trendy", label: "Trendy" },
  { value: "premium", label: "Premium" },
];

function ProductFilterForm({ onSubmit }) {
  return (
    <Formik
      initialValues={{
        search: "",
        model: "eyeGlasses",
        brand: "",
        frameType: "",
        frameShape: "",
        gender: "",
        frameMaterial: "",
        frameColor: "",
        frameSize: "",
        prescriptionType: "",
        frameCollection: "",
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
                options={brandOptions}
                onChange={(option) =>
                  setFieldValue("brand", option ? option.value : "")
                }
                value={brandOptions.find(
                  (option) => option.value === values.brand
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Type
              </label>
              <Select
                name="frameType"
                options={frameTypeOptions}
                onChange={(option) =>
                  setFieldValue("frameType", option ? option.value : "")
                }
                value={frameTypeOptions.find(
                  (option) => option.value === values.frameType
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Shape
              </label>
              <Select
                name="frameShape"
                options={frameShapeOptions}
                onChange={(option) =>
                  setFieldValue("frameShape", option ? option.value : "")
                }
                value={frameShapeOptions.find(
                  (option) => option.value === values.frameShape
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Gender
              </label>
              <Select
                name="gender"
                options={genderOptions}
                onChange={(option) =>
                  setFieldValue("gender", option ? option.value : "")
                }
                value={genderOptions.find(
                  (option) => option.value === values.gender
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Material
              </label>
              <Select
                name="frameMaterial"
                options={frameMaterialOptions}
                onChange={(option) =>
                  setFieldValue("frameMaterial", option ? option.value : "")
                }
                value={frameMaterialOptions.find(
                  (option) => option.value === values.frameMaterial
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Color
              </label>
              <Select
                name="frameColor"
                options={frameColorOptions}
                onChange={(option) =>
                  setFieldValue("frameColor", option ? option.value : "")
                }
                value={frameColorOptions.find(
                  (option) => option.value === values.frameColor
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Size
              </label>
              <Select
                name="frameSize"
                options={frameSizeOptions}
                onChange={(option) =>
                  setFieldValue("frameSize", option ? option.value : "")
                }
                value={frameSizeOptions.find(
                  (option) => option.value === values.frameSize
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Prescription Type
              </label>
              <Select
                name="prescriptionType"
                options={prescriptionTypeOptions}
                onChange={(option) =>
                  setFieldValue("prescriptionType", option ? option.value : "")
                }
                value={prescriptionTypeOptions.find(
                  (option) => option.value === values.prescriptionType
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="form-label text-sm font-weight-600">
                Frame Collection
              </label>
              <Select
                name="frameCollection"
                options={frameCollectionOptions}
                onChange={(option) =>
                  setFieldValue("frameCollection", option ? option.value : "")
                }
                value={frameCollectionOptions.find(
                  (option) => option.value === values.frameCollection
                )}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
            </div>
          </div>
          <div>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default ProductFilterForm;
