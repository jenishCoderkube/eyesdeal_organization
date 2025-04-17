import { City, Country, State } from "country-state-city";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";

// Validation schema using Yup
const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  phone: Yup.string()
    .min(4, "Phone number is required")
    .required("Phone number is required"),
  customerReference: Yup.object()
    .nullable()
    .required("Customer Reference is required"),
  gender: Yup.object().nullable().required("Gender is required"),
  country: Yup.object().nullable().required("Country is required"),
  state: Yup.object().nullable().required("State is required"),
  city: Yup.object().nullable().required("City is required"),
  role: Yup.string().trim().required("Role is required"),
  companyName: Yup.string().trim().required("Company Name is required"),
  gstNumber: Yup.string().trim().required("GST Number is required"),
  pincode: Yup.string().trim().optional(),
  address: Yup.string().trim().optional(),
});

const AddOrganization = ({ onAddSpecs, onAddContacts }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [anniversaryDate, setAnniversaryDate] = useState(null);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "+91",
      customerReference: null,
      gender: null,
      country: null,
      state: null,
      city: null,
      role: "",
      password: "",
      companyName: "",
      gstNumber: "",
      pincode: "395007",
      address: "",
    },
    validationSchema,
    onSubmit: (values) => {
      // Log form values to console
      console.log("Form Values:", values);
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
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
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

  return (
    <>
      <div className="container">
        <h3 className="mb-4 user_main_title mt-4">Add Organization</h3>
        <form onSubmit={formik.handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label custom-label_user">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  formik.touched.name && formik.errors.name ? "is-invalid" : ""
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
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label custom-label_user">
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
                <div className="text-danger mt-1">{formik.errors.phone}</div>
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label custom-label_user">
                Gender <span className="text-danger">*</span>
              </label>
              <Select
                options={genderOptions}
                value={formik.values.gender}
                onChange={(option) => formik.setFieldValue("gender", option)}
                onBlur={() => formik.setFieldTouched("gender", true)}
                placeholder="Select..."
              />
              {formik.touched.gender && formik.errors.gender && (
                <div className="text-danger mt-1">{formik.errors.gender}</div>
              )}
            </div>
          </div>
          <div className="row g-3 mt-1">
            <div className="col-12 col-md-6">
              <label className="form-label custom-label_user">
                Role <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  formik.touched.role && formik.errors.role ? "is-invalid" : ""
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
            <div className="col-12 col-md-6">
              <label className="form-label custom-label_user">Password</label>
              <input
                type="text"
                className="form-control"
                placeholder="Password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>
          <div className="row g-3 mt-1">
            <div className="col-12 col-md-6">
              <label className="form-label custom-label_user">
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
            <div className="col-12 col-md-6">
              <label className="form-label custom-label_user">
                GST Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${
                  formik.touched.gstNumber && formik.errors.gstNumber
                    ? "is-invalid"
                    : ""
                }`}
                placeholder="GST Number"
                name="gstNumber"
                value={formik.values.gstNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.gstNumber && formik.errors.gstNumber && (
                <div className="text-danger mt-1">
                  {formik.errors.gstNumber}
                </div>
              )}
            </div>
          </div>
          <div className="row g-3 mt-3">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label custom-label_user">
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
                <div className="text-danger mt-1">{formik.errors.country}</div>
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label custom-label_user">
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
                <div className="text-danger mt-1">{formik.errors.state}</div>
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label custom-label_user">
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
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label custom-label_user">Pincode</label>
              <input
                type="text"
                className="form-control"
                name="pincode"
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
          </div>
          <div className="row g-3 mt-3">
            <div className="col-12">
              <label className="form-label custom-label_user">Address</label>
              <textarea
                className="form-control"
                rows="5"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              ></textarea>
            </div>
          </div>
          <div className="row mt-3 pb-5">
            <div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </div>
          </div>
          <hr />
        </form>
      </div>
    </>
  );
};

export default AddOrganization;
