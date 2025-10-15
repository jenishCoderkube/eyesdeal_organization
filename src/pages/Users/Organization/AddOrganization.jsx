import { City, Country, State } from "country-state-city";
import React, { useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import { userService } from "../../../services/userService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CommonButton from "../../../components/CommonButton/CommonButton";

// Validation schema using Yup
const validationSchema = Yup.object({
  name: Yup.string().trim().required("Owner name is required"),
  phone: Yup.string()
    .min(4, "Phone number is required")
    .required("Phone number is required"),
  gender: Yup.object().nullable().required("Gender is required"),
  password: Yup.string().trim().required("Password is required"),
  partnerType: Yup.object().nullable().required("Partner type is required"),
  maxStore: Yup.number()
    .min(1, "Max store must be at least 1")
    .required("Max store is required"),
  status: Yup.object().nullable().required("Org status is required"),
  companyName: Yup.string().trim().required("Company name is required"),
  companyPhone: Yup.string()
    .min(4, "Phone number is required")
    .required("Phone number is required"),
  // gstNumber: Yup.string().trim().required("GST Number is required"),
  country: Yup.object().nullable().required("Country is required"),
  state: Yup.object().nullable().required("State is required"),
  city: Yup.object().nullable().required("City is required"),
  // role: Yup.string().trim().required("Role is required"),
  pincode: Yup.string().trim().required("Pincode is required"),
  address: Yup.string().trim().required("Address is required"),
  companyLogo: Yup.mixed().optional(),
  erpBanner: Yup.mixed().optional(),
  salesBanner: Yup.mixed().optional(),
});

const AddOrganization = ({ onAddSpecs, onAddContacts }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState({});

  const companyLogoRef = useRef(null);
  const erpBannerRef = useRef(null);
  const salesBannerRef = useRef(null);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "+91",
      gender: null,
      password: "",
      partnerType: null,
      maxStore: 2,
      status: null,
      companyName: "",
      companyPhone: "+91",
      gstNumber: "",
      country: null,
      state: null,
      city: null,
      // role: "",
      pincode: "395007",
      address: "",
      companyLogo: null,
      erpBanner: null,
      salesBanner: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      // Log form values to console
      setLoading(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phone", values.phone);
      formData.append("gender", values.gender?.value || "");
      formData.append("password", values.password || "");
      // formData.append("role", values.role || "");
      formData.append("partnerType", values.partnerType?.value || "");
      formData.append("maxStore", values.maxStore);
      formData.append("status", values.status?.value || "");
      formData.append("companyName", values.companyName);
      formData.append("companyPhone", values.companyPhone);
      formData.append("gstNumber", values.gstNumber);
      formData.append("country", values.country?.label || "");
      formData.append("state", values.state?.label || "");
      formData.append("city", values.city?.label || "");
      formData.append("pincode", values.pincode);
      formData.append("address", values.address || "");
      if (values.companyLogo)
        formData.append("companyLogo", values.companyLogo);
      if (values.erpBanner) formData.append("erpBanner", values.erpBanner);
      if (values.salesBanner)
        formData.append("salesBanner", values.salesBanner);
      try {
        const response = await userService.addOrganization(formData);
        if (response.success) {
          toast.success(response.message);
          resetForm();
          setPreviews({}); // Clear previews on successful submit
          navigate("/users/view-organization");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        // toast.error("Failed to add organization!");
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch countries from country-state-city
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  // Fetch states based on selected country
  const stateOptions = formik.values.country
    ? State.getStatesOfCountry(formik.values.country.value).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }))
    : [];

  // Fetch cities based on selected country and state
  const cityOptions =
    formik.values.country && formik.values.state
      ? City.getCitiesOfState(
          formik.values.country.value,
          formik.values.state.value
        ).map((city) => ({
          value: city.name,
          label: city.name,
        }))
      : [];

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const partnerTypeOptions = [
    { value: "brand", label: "Brand Partner" },
    { value: "vision", label: "Vision Partner" },
  ];

  const orgStatusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Handle country change to reset state and city
  const handleCountryChange = (option) => {
    formik.setFieldValue("country", option);
    formik.setFieldValue("state", null);
    formik.setFieldValue("city", null);
  };

  // Handle state change to reset city
  const handleStateChange = (option) => {
    formik.setFieldValue("state", option);
    formik.setFieldValue("city", null);
  };

  // Handle file change for previews
  const handleFileChange = (fieldName) => (e) => {
    const file = e.target.files[0];
    formik.setFieldValue(fieldName, file);
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  // Handle clear preview
  const handleClearPreview = (fieldName) => {
    formik.setFieldValue(fieldName, null);
    setPreviews((prev) => ({ ...prev, [fieldName]: null }));
    // Clear the file input
    if (fieldName === "companyLogo" && companyLogoRef.current) {
      companyLogoRef.current.value = "";
    } else if (fieldName === "erpBanner" && erpBannerRef.current) {
      erpBannerRef.current.value = "";
    } else if (fieldName === "salesBanner" && salesBannerRef.current) {
      salesBannerRef.current.value = "";
    }
  };

  // Preview component with hover close icon
  const PreviewImage = ({ src, alt, fieldName, onClear, fileName }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="position-relative mt-3 d-flex justify-content-center flex-column align-items-center"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: "pointer" }}
      >
        <div className="position-relative">
          <img
            src={src}
            alt={alt}
            className="rounded"
            style={{
              maxWidth: "100px",
              maxHeight: "100px",
              objectFit: "cover",
              transition: "transform 0.3s ease, opacity 0.3s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              opacity: isHovered ? 0.8 : 1,
            }}
          />
          <button
            type="button"
            className="position-absolute top-50 start-50 translate-middle btn-close btn-sm"
            style={{
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease",
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
            onClick={onClear}
            onMouseEnter={(e) => e.stopPropagation()}
            onMouseLeave={(e) => e.stopPropagation()}
            aria-label="Remove image"
          >
            <span
              style={{
                fontSize: "14px",
                color: "white",
                lineHeight: "1",
                fontWeight: "bold",
              }}
            >
              ×
            </span>
          </button>
        </div>
        {fileName && (
          <small className="text-center d-block text-muted mt-1">
            {fileName}
          </small>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="container">
        <h3 className="mb-4 user_main_title mt-4">Add Organization</h3>
        <form onSubmit={formik.handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label font-weight-500">
                    Owner Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      formik.touched.name && formik.errors.name
                        ? "is-invalid"
                        : ""
                    }`}
                    placeholder="Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-danger mt-1">{formik.errors.name}</div>
                  )}
                </div>
                <div className="col-12">
                  <label className="form-label font-weight-500">
                    Phone <span className="text-danger">*</span>
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={formik.values.phone}
                    onChange={(phone) => formik.setFieldValue("phone", phone)}
                    onBlur={() => formik.setFieldTouched("phone", true)}
                    inputClass={`form-control w-100 ${
                      formik.touched.phone && formik.errors.phone
                        ? "is-invalid"
                        : ""
                    }`}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <div className="text-danger mt-1">
                      {formik.errors.phone}
                    </div>
                  )}
                </div>
                <div className="col-12">
                  <label className="form-label font-weight-500">
                    Gender <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={genderOptions}
                    value={formik.values.gender}
                    onChange={(option) =>
                      formik.setFieldValue("gender", option)
                    }
                    onBlur={() => formik.setFieldTouched("gender", true)}
                    placeholder="Select..."
                  />
                  {formik.touched.gender && formik.errors.gender && (
                    <div className="text-danger mt-1">
                      {formik.errors.gender}
                    </div>
                  )}
                </div>
              </div>
              <div className="row g-3 mt-1">
                <div className="col-12 ">
                  <label className="form-label font-weight-500">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      formik.touched.password && formik.errors.password
                        ? "is-invalid"
                        : ""
                    }`}
                    placeholder="Password"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-danger mt-1">
                      {formik.errors.password}
                    </div>
                  )}
                </div>
              </div>
              {/* <div className="row g-3 mt-1">
                <div className="col-12 ">
                  <label className="form-label font-weight-500">
                    Role <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      formik.touched.role && formik.errors.role
                        ? "is-invalid"
                        : ""
                    }`}
                    placeholder="Role"
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.role && formik.errors.role && (
                    <div className="text-danger mt-1">{formik.errors.role}</div>
                  )}
                </div>
              </div> */}
              <div className="row g-3 mt-1">
                <div className="col-12 col-md-4">
                  <label className="form-label font-weight-500">
                    Partner Type <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={partnerTypeOptions}
                    value={formik.values.partnerType}
                    onChange={(option) =>
                      formik.setFieldValue("partnerType", option)
                    }
                    onBlur={() => formik.setFieldTouched("partnerType", true)}
                    placeholder="Select..."
                  />
                  {formik.touched.partnerType && formik.errors.partnerType && (
                    <div className="text-danger mt-1">
                      {formik.errors.partnerType}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label font-weight-500">
                    Max Store <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className={`form-control ${
                      formik.touched.maxStore && formik.errors.maxStore
                        ? "is-invalid"
                        : ""
                    }`}
                    placeholder="Max Store"
                    name="maxStore"
                    value={formik.values.maxStore}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.maxStore && formik.errors.maxStore && (
                    <div className="text-danger mt-1">
                      {formik.errors.maxStore}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label font-weight-500">
                    Org Status <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={orgStatusOptions}
                    value={formik.values.status}
                    onChange={(option) =>
                      formik.setFieldValue("status", option)
                    }
                    onBlur={() => formik.setFieldTouched("status", true)}
                    placeholder="Select..."
                  />
                  {formik.touched.status && formik.errors.status && (
                    <div className="text-danger mt-1">
                      {formik.errors.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="row g-3 ">
                <div className="col-12">
                  <label className="form-label font-weight-500">
                    Company Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      formik.touched.companyName && formik.errors.companyName
                        ? "is-invalid"
                        : ""
                    }`}
                    placeholder="Company Name"
                    name="companyName"
                    value={formik.values.companyName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.companyName && formik.errors.companyName && (
                    <div className="text-danger mt-1">
                      {formik.errors.companyName}
                    </div>
                  )}
                </div>
                <div className="col-12">
                  <label className="form-label font-weight-500">
                    Phone <span className="text-danger">*</span>
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={formik.values.companyPhone}
                    onChange={(phone) =>
                      formik.setFieldValue("companyPhone", phone)
                    }
                    onBlur={() => formik.setFieldTouched("companyPhone", true)}
                    inputClass={`form-control w-100 ${
                      formik.touched.companyPhone && formik.errors.companyPhone
                        ? "is-invalid"
                        : ""
                    }`}
                  />
                  {formik.touched.companyPhone &&
                    formik.errors.companyPhone && (
                      <div className="text-danger mt-1">
                        {formik.errors.companyPhone}
                      </div>
                    )}
                </div>
                <div className="col-12">
                  <label className="form-label font-weight-500">
                    GST Number
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="GST Number"
                    name="gstNumber"
                    value={formik.values.gstNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {/* {formik.touched.gstNumber && formik.errors.gstNumber && (
                    <div className="text-danger mt-1">
                      {formik.errors.gstNumber}
                    </div>
                  )} */}
                </div>
              </div>
              <div className="row g-3">
                {/* Row for Country and State */}
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label font-weight-500">
                      Country <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={countryOptions}
                      value={formik.values.country}
                      onChange={handleCountryChange}
                      onBlur={() => formik.setFieldTouched("country", true)}
                      placeholder="Select Country..."
                    />
                    {formik.touched.country && formik.errors.country && (
                      <div className="text-danger mt-1">
                        {formik.errors.country}
                      </div>
                    )}
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label font-weight-500">
                      State <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={stateOptions}
                      value={formik.values.state}
                      onChange={handleStateChange}
                      onBlur={() => formik.setFieldTouched("state", true)}
                      placeholder="Select State..."
                      isDisabled={!formik.values.country}
                    />
                    {formik.touched.state && formik.errors.state && (
                      <div className="text-danger mt-1">
                        {formik.errors.state}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row for City and Pincode */}

                <div className="col-12 col-md-6 mt-4">
                  <label className="form-label font-weight-500">
                    City <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={cityOptions}
                    value={formik.values.city}
                    onChange={(option) => formik.setFieldValue("city", option)}
                    onBlur={() => formik.setFieldTouched("city", true)}
                    placeholder="Select City..."
                    isDisabled={!formik.values.state}
                  />
                  {formik.touched.city && formik.errors.city && (
                    <div className="text-danger mt-1">{formik.errors.city}</div>
                  )}
                </div>
                <div className="col-12 col-md-6 mt-4">
                  <label className="form-label font-weight-500">
                    Pincode <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      formik.touched.pincode && formik.errors.pincode
                        ? "is-invalid"
                        : ""
                    }`}
                    name="pincode"
                    value={formik.values.pincode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.pincode && formik.errors.pincode && (
                    <div className="text-danger mt-1">
                      {formik.errors.pincode}
                    </div>
                  )}
                </div>
              </div>
              <div className="row g-3 mt-1">
                <div className="col-12">
                  <label className="form-label font-weight-500">
                    Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${
                      formik.touched.address && formik.errors.address
                        ? "is-invalid"
                        : ""
                    }`}
                    rows="5"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  ></textarea>
                  {formik.touched.address && formik.errors.address && (
                    <div className="text-danger mt-1">
                      {formik.errors.address}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="row g-3 mt-3">
            <div className="col-md-4">
              <label className="form-label font-weight-500">Company Logo</label>
              <input
                ref={companyLogoRef}
                type="file"
                className="form-control"
                name="companyLogo"
                onChange={handleFileChange("companyLogo")}
                accept="image/*"
              />
              {previews.companyLogo && (
                <PreviewImage
                  src={previews.companyLogo}
                  alt="Company Logo Preview"
                  fieldName="companyLogo"
                  onClear={() => handleClearPreview("companyLogo")}
                  fileName={formik.values.companyLogo?.name || ""}
                />
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label font-weight-500">ERP Banner</label>
              <input
                ref={erpBannerRef}
                type="file"
                className="form-control"
                name="erpBanner"
                onChange={handleFileChange("erpBanner")}
                accept="image/*"
              />
              {previews.erpBanner && (
                <PreviewImage
                  src={previews.erpBanner}
                  alt="ERP Banner Preview"
                  fieldName="erpBanner"
                  onClear={() => handleClearPreview("erpBanner")}
                  fileName={formik.values.erpBanner?.name || ""}
                />
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label font-weight-500">
                Sales App Banner
              </label>
              <input
                ref={salesBannerRef}
                type="file"
                className="form-control"
                name="salesBanner"
                onChange={handleFileChange("salesBanner")}
                accept="image/*"
              />
              {previews.salesBanner && (
                <PreviewImage
                  src={previews.salesBanner}
                  alt="Sales App Banner Preview"
                  fieldName="salesBanner"
                  onClear={() => handleClearPreview("salesBanner")}
                  fileName={formik.values.salesBanner?.name || ""}
                />
              )}
            </div>
          </div>
          <div className="row mt-3 pb-5">
            <div>
              <CommonButton
                loading={loading}
                buttonText="Submit"
                type="submit"
                className="btn w-auto px-4"
              />
            </div>
          </div>
          <hr />
        </form>
      </div>
    </>
  );
};

export default AddOrganization;
