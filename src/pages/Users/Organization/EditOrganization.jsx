import { City, Country, State } from "country-state-city";
import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import { userService } from "../../../services/userService";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import CommonButton from "../../../components/CommonButton/CommonButton";
import AssetSelector from "../../../components/Products/AddProducts/EyeGlasses/AssetSelector";
import { IoClose } from "react-icons/io5";
import { defalutImageBasePath } from "../../../utils/constants";

// Validation schema using Yup
const validationSchema = Yup.object({
  name: Yup.string().trim().required("Owner name is required"),
  phone: Yup.string()
    .min(4, "Phone number is required")
    .required("Phone number is required"),
  gender: Yup.object().nullable().required("Gender is required"),
  partnerType: Yup.object().nullable().required("Partner type is required"),
  maxStore: Yup.number()
    .min(1, "Max store must be at least 1")
    .required("Max store is required"),
  status: Yup.object().nullable().required("Org status is required"),
  companyName: Yup.string().trim().required("Company name is required"),
  companyNumber: Yup.string()
    .min(4, "Phone number is required")
    .required("Phone number is required"),
  // gstNumber: Yup.string().trim().required("GST Number is required"),
  country: Yup.object().nullable().required("Country is required"),
  state: Yup.object().nullable().required("State is required"),
  city: Yup.object().nullable().required("City is required"),
  pincode: Yup.string().trim().required("Pincode is required"),
  address: Yup.string().trim().required("Address is required"),
});

const EditOrganization = ({ onAddSpecs, onAddContacts }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const [previews, setPreviews] = useState({});
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showErpBannerModal, setShowErpBannerModal] = useState(false);
  const [showSalesBannerModal, setShowSalesBannerModal] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState("");
  const [selectedErpBanner, setSelectedErpBanner] = useState("");
  const [selectedSalesBanner, setSelectedSalesBanner] = useState("");
  const companyLogoRef = useRef(null);
  const erpBannerRef = useRef(null);
  const salesAppBannerRef = useRef(null);

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Formik setup
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      phone: "+91",
      companyNumber: "+91",
      gender: null,
      role: "",
      companyName: "",
      gstNumber: "",
      partnerType: null,
      maxStore: "",
      status: null,
      country: null,
      state: null,
      city: null,
      pincode: "",
      address: "",
      companyLogo: null,
      erpBanner: null,
      salesBanner: null,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("phone", values.phone.replace("+", ""));
      formData.append("gender", values.gender?.value);
      formData.append("role", values.role);
      formData.append(
        "partnerType",
        values.partnerType?.label || values.partnerType
      );
      formData.append("maxStore", values.maxStore);
      formData.append("status", values.status?.label || values.status);
      formData.append("companyName", values.companyName);
      formData.append("companyNumber", values.companyNumber.replace("+", ""));
      formData.append("gstNumber", values.gstNumber || "");
      formData.append("country", values.country?.label || values.country);
      formData.append("state", values.state?.label || values.state);
      formData.append("city", values.city?.label || values.city);
      formData.append("pincode", values.pincode);
      formData.append("address", values.address);
      formData.append("companyLogo", values.companyLogo ?? "");
      formData.append("erpBanner", values.erpBanner ?? "");
      formData.append("salesBanner", values.salesBanner ?? "");

      try {
        const response = await userService.updateOrganization(id, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.success) {
          toast.success(response.message);
          resetForm();
          navigate("/users/view-organization");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Failed to update organization!");
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch user data
  useEffect(() => {
    if (id) fetchUserData(id);
  }, [id]);

  const fetchUserData = async (userId) => {
    try {
      const response = await userService.getOrganizationById(userId);
      console.log("API response:", response);
      if (response.success) {
        const orgData =
          response.data?.data?.docs?.[0] ||
          response.data?.data ||
          response.data;
        console.log("Organization Data:", orgData);
        setUser(orgData);
        setSelectedLogo(orgData.companyLogo || "");
        setSelectedErpBanner(orgData.erpBanner || "");
        setSelectedSalesBanner(orgData.salesBanner || "");
        setPreviews({
          companyLogo: orgData.companyLogo || null,
          erpBanner: orgData.erpBanner || null,
          salesAppBanner: orgData.salesAppBanner || null,
        });

        // Initialize country, state, and city
        const countryOptions = Country.getAllCountries().map((country) => ({
          value: country.isoCode,
          label: country.name,
        }));
        const country =
          countryOptions.find(
            (con) => con.label.toLowerCase() === orgData?.country?.toLowerCase()
          ) || null;
        const stateOptions = country
          ? State.getStatesOfCountry(country.value).map((state) => ({
              value: state.isoCode,
              label: state.name,
            }))
          : [];
        const state =
          stateOptions.find(
            (state) =>
              state.label.toLowerCase() === orgData?.state?.toLowerCase()
          ) || null;
        const cityOptions =
          country && state
            ? City.getCitiesOfState(country.value, state.value).map((city) => ({
                value: city.name,
                label: city.name,
              }))
            : orgData?.city
            ? [{ value: orgData.city, label: orgData.city }]
            : [];
        const city =
          cityOptions.find(
            (city) => city.label.toLowerCase() === orgData?.city?.toLowerCase()
          ) ||
          (orgData?.city ? { value: orgData.city, label: orgData.city } : null);

        // Set form values
        formik.setValues({
          name: orgData?.user?.name || "",
          phone: orgData?.user?.phone ? `+${orgData.user.phone}` : "+91",
          companyNumber: orgData?.companyNumber
            ? `+${orgData.companyNumber}`
            : "+91",
          gender: orgData?.user?.gender
            ? {
                value: orgData.user.gender,
                label: capitalize(orgData.user.gender),
              }
            : null,
          role: orgData?.user?.role || "",
          companyName: orgData?.companyName || "",
          gstNumber: orgData?.gstNumber || "",
          partnerType: orgData?.partnerType
            ? {
                value: orgData.partnerType,
                label: capitalize(orgData.partnerType),
              }
            : null,
          maxStore: orgData?.maxStore || "",
          status: orgData?.status
            ? { value: orgData.status, label: capitalize(orgData.status) }
            : null,
          country: country,
          state: state,
          city: city,
          pincode: orgData?.pincode || "",
          address: orgData?.address || "",
          companyLogo: orgData?.companyLogo || null,
          erpBanner: orgData?.erpBanner || null,
          salesBanner: orgData?.salesBanner || null,
        });
      } else {
        console.error("Failed to fetch user:", response.message);
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
    }
  };

  // Country, State, and City options
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  const stateOptions = formik.values.country
    ? State.getStatesOfCountry(formik.values.country.value).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }))
    : [];

  const cityOptions =
    formik.values.country && formik.values.state
      ? City.getCitiesOfState(
          formik.values.country.value,
          formik.values.state.value
        ).map((city) => ({
          value: city.name,
          label: city.name,
        }))
      : formik.values.city
      ? [{ value: formik.values.city.value, label: formik.values.city.label }]
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

  // Handlers for country, state, and city changes
  const handleCountryChange = (option) => {
    formik.setFieldValue("country", option);
    formik.setFieldValue("state", null);
    formik.setFieldValue("city", null);
  };

  const handleStateChange = (option) => {
    formik.setFieldValue("state", option);
    formik.setFieldValue("city", null);
  };

  const handleCityChange = (option) => {
    formik.setFieldValue("city", option);
  };

  return (
    <>
      <div className="container">
        <h3 className="mb-4 user_main_title mt-4">Edit Organization</h3>
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
                <div className="col-12">
                  <label className="form-label font-weight-500">Role</label>
                  <input
                    type="text"
                    className={`form-control ${
                      formik.touched.role && formik.errors.role
                        ? "is-invalid"
                        : ""
                    }`}
                    placeholder="Role"
                    name="role"
                    disabled
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.role && formik.errors.role && (
                    <div className="text-danger mt-1">{formik.errors.role}</div>
                  )}
                </div>
              </div>
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
              <div className="row g-3">
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
                    value={formik.values.companyNumber}
                    onChange={(phone) =>
                      formik.setFieldValue("companyNumber", phone)
                    }
                    onBlur={() => formik.setFieldTouched("companyNumber", true)}
                    inputClass={`form-control w-100 ${
                      formik.touched.companyNumber &&
                      formik.errors.companyNumber
                        ? "is-invalid"
                        : ""
                    }`}
                  />
                  {formik.touched.companyNumber &&
                    formik.errors.companyNumber && (
                      <div className="text-danger mt-1">
                        {formik.errors.companyNumber}
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
                </div>
              </div>
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
                    key={`state-${formik.values.country?.value}`}
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
              <div className="row g-3">
                <div className="col-12 col-md-6 mt-4">
                  <label className="form-label font-weight-500">
                    City <span className="text-danger">*</span>
                  </label>
                  <Select
                    key={`city-${
                      formik.values.state?.value || formik.values.city?.value
                    }`}
                    options={cityOptions}
                    value={formik.values.city}
                    onChange={handleCityChange}
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
            {/* Company Logo */}
            <div className="col-md-4">
              <label className="form-label font-weight-500">Company Logo</label>
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-primary py-2 px-3"
                  onClick={() => setShowLogoModal(true)}
                >
                  Select Logo
                </button>
              </div>
              {selectedLogo && (
                <div className="row mt-4 g-3">
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="position-relative border text-center border-black rounded p-2">
                      <img
                        src={`${defalutImageBasePath}${selectedLogo}`}
                        alt="Logo"
                        className="img-fluid rounded w-50 h-auto object-fit-cover"
                        style={{ maxHeight: "100px", objectFit: "cover" }}
                      />
                      <button
                        className="position-absolute top-0 start-0 translate-middle bg-white rounded-circle border border-light p-1"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedLogo("");
                          formik.setFieldValue("companyLogo", null);
                        }}
                        aria-label="Remove logo"
                      >
                        <IoClose size={16} className="text-dark" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* ERP Banner */}
            <div className="col-md-4">
              <label className="form-label font-weight-500">ERP Banner</label>
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-primary py-2 px-3"
                  onClick={() => setShowErpBannerModal(true)}
                >
                  Select Banner
                </button>
              </div>
              {selectedErpBanner && (
                <div className="row mt-4 g-3">
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="position-relative border text-center border-black rounded p-2">
                      <img
                        src={`${defalutImageBasePath}${selectedErpBanner}`}
                        alt="ERP Banner"
                        className="img-fluid rounded w-50 h-auto object-fit-cover"
                        style={{ maxHeight: "100px", objectFit: "cover" }}
                      />
                      <button
                        className="position-absolute top-0 start-0 translate-middle bg-white rounded-circle border border-light p-1"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedErpBanner("");
                          formik.setFieldValue("erpBanner", null);
                        }}
                        aria-label="Remove banner"
                      >
                        <IoClose size={16} className="text-dark" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Sales App Banner */}
            <div className="col-md-4">
              <label className="form-label font-weight-500">
                Sales App Banner
              </label>
              <div className="d-flex align-items-center gap-3">
                <button
                  type="button"
                  className="btn btn-primary py-2 px-3"
                  onClick={() => setShowSalesBannerModal(true)}
                >
                  Select Banner
                </button>
              </div>
              {selectedSalesBanner && (
                <div className="row mt-4 g-3">
                  <div className="col-12 col-md-6 col-lg-3">
                    <div className="position-relative border text-center border-black rounded p-2">
                      <img
                        src={`${defalutImageBasePath}${selectedSalesBanner}`}
                        alt="Sales App Banner"
                        className="img-fluid rounded w-50 h-auto object-fit-cover"
                        style={{ maxHeight: "100px", objectFit: "cover" }}
                      />
                      <button
                        className="position-absolute top-0 start-0 translate-middle bg-white rounded-circle border border-light p-1"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedSalesBanner("");
                          formik.setFieldValue("salesBanner", null);
                        }}
                        aria-label="Remove banner"
                      >
                        <IoClose size={16} className="text-dark" />
                      </button>
                    </div>
                  </div>
                </div>
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
        {/* Logo Selector Modal */}
        <AssetSelector
          show={showLogoModal}
          onHide={() => setShowLogoModal(false)}
          onSelectImage={(imageSrc) => {
            setSelectedLogo(imageSrc[0]);
            formik.setFieldValue("companyLogo", imageSrc[0]);
            setShowLogoModal(false);
          }}
        />
        {/* ERP Banner Selector Modal */}
        <AssetSelector
          show={showErpBannerModal}
          onHide={() => setShowErpBannerModal(false)}
          onSelectImage={(imageSrc) => {
            setSelectedErpBanner(imageSrc[0]);
            formik.setFieldValue("erpBanner", imageSrc[0]);
            setShowErpBannerModal(false);
          }}
        />
        {/* Sales Banner Selector Modal */}
        <AssetSelector
          show={showSalesBannerModal}
          onHide={() => setShowSalesBannerModal(false)}
          onSelectImage={(imageSrc) => {
            setSelectedSalesBanner(imageSrc[0]);
            formik.setFieldValue("salesBanner", imageSrc[0]);
            setShowSalesBannerModal(false);
          }}
        />
      </div>
    </>
  );
};

export default EditOrganization;
