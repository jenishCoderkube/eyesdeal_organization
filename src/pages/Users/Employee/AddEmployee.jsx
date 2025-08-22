import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Country, State, City } from "country-state-city";
import { userService } from "../../../services/userService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For reverse geocoding

// Validation schema using Yup
const validationSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  phone: Yup.string()
    .min(4, "Phone number is required")
    .required("Phone number is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().optional(),
  role: Yup.object().nullable().required("Role is required"),
  country: Yup.object().nullable().required("Country is required"),
  state: Yup.object().nullable().required("State is required"),
  city: Yup.object().nullable().required("City is required"),
  pincode: Yup.string().trim().required("Pincode is required"),
  gender: Yup.object().nullable().required("Gender is required"),
  stores: Yup.array()
    .of(
      Yup.object().shape({
        value: Yup.string(),
        label: Yup.string(),
      })
    )
    .min(1, "At least 1 store is required")
    .required("Store is required"),
  joiningDate: Yup.date().nullable().required("Joining date is required"),
  isActive: Yup.boolean().required("Active status is required"),
});

// Options for dropdowns
const roleOptions = [
  { value: "sales", label: "Sales" },
  { value: "store manager", label: "Store Manager" },
  { value: "order manager", label: "Order Manager" },
  { value: "purchase manager", label: "Purchase Manager" },
  { value: "sub admin", label: "Sub Admin" },
  { value: "individual store", label: "Individual Store" },
  { value: "owner", label: "Owner" },
  { value: "local store", label: "Local Store" },
  { value: "outside store", label: "Outside Store" },
  { value: "ecommerce manager", label: "Ecommerce Manager" },
  { value: "org admin", label: "Org Admin" },
];

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

function AddEmployee() {
  const [stores, setStores] = useState([]);
  const navigate = useNavigate();

  const storeOptions = stores.map((store) => ({
    value: store?._id,
    label: store?.name,
  }));

  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "+91",
      email: "",
      password: "",
      role: null,
      country: null,
      state: null,
      city: null,
      pincode: "",
      gender: null,
      stores: [],
      joiningDate: null,
      isActive: false,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formattedData = {
          name: values.name,
          phone: values.phone.replace("+", ""),
          email: values.email,
          password: values.password,
          role: values.role.value,
          gender: values.gender.value.toLowerCase(),
          country: values.country.label,
          state: values.state.label,
          city: values.city.label,
          pincode: values.pincode,
          stores: values.stores.map((store) => store.value),
          joiningDate: values.joiningDate.getTime(),
          isActive: values.isActive,
        };

        const response = await userService.addEmployee(formattedData);

        if (response.success) {
          toast.success(response.message);
          resetForm(); // Clear all form data
          // navigate(`/employee/${response.data?.data?._id}`);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Failed to add employee!");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Fetch stores
  useEffect(() => {
    userService
      .getStores()
      .then((res) => {
        setStores(res?.data?.data);
      })
      .catch((e) => console.log("failed to fetch stores: ", e));
  }, []);

  // Fetch user's location and set country, state, city
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use a reverse geocoding API (e.g., OpenStreetMap's Nominatim)
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const { address } = response.data;

            // Find country
            const country = Country.getAllCountries().find(
              (c) => c.name === address.country
            );
            if (country) {
              formik.setFieldValue("country", {
                value: country.isoCode,
                label: country.name,
              });

              // Find state
              const states = State.getStatesOfCountry(country.isoCode);
              const state = states.find((s) => s.name === address.state);
              if (state) {
                formik.setFieldValue("state", {
                  value: state.isoCode,
                  label: state.name,
                });

                // Find city
                const cities = City.getCitiesOfState(
                  country.isoCode,
                  state.isoCode
                );
                const city = cities.find(
                  (c) =>
                    c.name === address.city ||
                    c.name === address.town ||
                    c.name === address.village
                );
                if (city) {
                  formik.setFieldValue("city", {
                    value: city.name,
                    label: city.name,
                  });
                }
              }
            }
          } catch (error) {
            console.error("Failed to fetch location data:", error);
            toast.error("Could not detect location automatically.");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Location access denied. Please select manually.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  }, []);

  // Fetch countries
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
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="h2 fw-bold text-dark">Add Employee</h1>
      </div>
      <div className="p-0 mb-4">
        <div className="card-body">
          <form
            className="d-flex flex-column gap-3"
            onSubmit={formik.handleSubmit}
          >
            {/* Name */}
            <div className="w-100">
              <label className="form-label font-weight-500" htmlFor="name">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="name"
                className={`form-control ${
                  formik.touched.name && formik.errors.name ? "is-invalid" : ""
                }`}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter name"
              />
              {formik.touched.name && formik.errors.name && (
                <div className="invalid-feedback-color">
                  {formik.errors.name}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="w-100">
              <label className="form-label font-weight-500" htmlFor="phone">
                Phone <span className="text-danger">*</span>
              </label>
              <PhoneInput
                country={"in"}
                value={formik.values.phone}
                onChange={(phone) => formik.setFieldValue("phone", phone)}
                onBlur={() => formik.setFieldTouched("phone", true)}
                inputClass={`form-control ${
                  formik.touched.phone && formik.errors.phone
                    ? "is-invalid"
                    : ""
                }`}
                containerClass="w-100"
                inputStyle={{ width: "100%" }}
                placeholder="1 (702) 123-4567"
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className="invalid-feedback-color">
                  {formik.errors.phone}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="w-100">
              <label className="form-label font-weight-500" htmlFor="email">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                name="email"
                className={`form-control ${
                  formik.touched.email && formik.errors.email
                    ? "is-invalid"
                    : ""
                }`}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter email"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="invalid-feedback-color">
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="w-100">
              <label className="form-label font-weight-500" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter password"
              />
            </div>

            {/* Role */}
            <div className="w-100">
              <label className="form-label font-weight-500" htmlFor="role">
                Role <span className="text-danger">*</span>
              </label>
              <Select
                options={roleOptions}
                value={formik.values.role}
                onChange={(option) => formik.setFieldValue("role", option)}
                onBlur={() => formik.setFieldTouched("role", true)}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
              {formik.touched.role && formik.errors.role && (
                <div className="invalid-feedback-color mt-1">
                  {formik.errors.role}
                </div>
              )}
            </div>

            {/* Country */}
            <div className="w-100">
              <label className="form-label font-weight-500" htmlFor="country">
                Country <span className="text-danger">*</span>
              </label>
              <Select
                options={countryOptions}
                value={formik.values.country}
                onChange={handleCountryChange}
                onBlur={() => formik.setFieldTouched("country", true)}
                placeholder="Select country..."
                classNamePrefix="react-select"
              />
              {formik.touched.country && formik.errors.country && (
                <div className="invalid-feedback-color mt-1">
                  {formik.errors.country}
                </div>
              )}
            </div>

            {/* State */}
            <div className="w-100">
              <label className="form-label font-weight-500" htmlFor="state">
                State <span className="text-danger">*</span>
              </label>
              <Select
                options={stateOptions}
                value={formik.values.state}
                onChange={handleStateChange}
                onBlur={() => formik.setFieldTouched("state", true)}
                placeholder="Select state..."
                isDisabled={!formik.values.country}
                classNamePrefix="react-select"
              />
              {formik.touched.state && formik.errors.state && (
                <div className="invalid-feedback-color mt-1">
                  {formik.errors.state}
                </div>
              )}
            </div>

            {/* City */}
            <div className="w-100">
              <label className="form-label font-weight-500" htmlFor="city">
                City <span className="text-danger">*</span>
              </label>
              <Select
                options={cityOptions}
                value={formik.values.city}
                onChange={(option) => formik.setFieldValue("city", option)}
                onBlur={() => formik.setFieldTouched("city", true)}
                placeholder="Select city..."
                isDisabled={!formik.values.state}
                classNamePrefix="react-select"
              />
              {formik.touched.city && formik.errors.city && (
                <div className="invalid-feedback-color mt-1">
                  {formik.errors.city}
                </div>
              )}
            </div>

            {/* Pincode */}
            <div className="w-100">
              <label className="form-label font-weight-500" htmlFor="pincode">
                Pincode <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                className={`form-control ${
                  formik.touched.pincode && formik.errors.pincode
                    ? "is-invalid"
                    : ""
                }`}
                value={formik.values.pincode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter pincode"
              />
              {formik.touched.pincode && formik.errors.pincode && (
                <div className="invalid-feedback-color">
                  {formik.errors.pincode}
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="w-100">
              <label className="form-label font-weight-500" htmlFor="gender">
                Gender <span className="text-danger">*</span>
              </label>
              <Select
                options={genderOptions}
                value={formik.values.gender}
                onChange={(option) => formik.setFieldValue("gender", option)}
                onBlur={() => formik.setFieldTouched("gender", true)}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
              {formik.touched.gender && formik.errors.gender && (
                <div className="invalid-feedback-color mt-1">
                  {formik.errors.gender}
                </div>
              )}
            </div>

            {/* Stores */}
            <div className="w-100">
              <label className="form-label font-weight-500" htmlFor="stores">
                Stores <span className="text-danger">*</span>
              </label>
              <Select
                options={storeOptions}
                value={formik.values.stores}
                isMulti
                onChange={(option) => formik.setFieldValue("stores", option)}
                onBlur={() => formik.setFieldTouched("stores", true)}
                placeholder="Select..."
                classNamePrefix="react-select"
              />
              {formik.touched.stores && formik.errors.stores && (
                <div className="invalid-feedback-color mt-1">
                  {formik.errors.stores}
                </div>
              )}
            </div>

            {/* Joining Date */}
            <div style={{ width: "fit-content" }}>
              <label
                className="form-label font-weight-500"
                htmlFor="joiningDate"
              >
                Joining Date <span className="text-danger">*</span>
              </label>
              <DatePicker
                selected={formik.values.joiningDate}
                onChange={(date) => formik.setFieldValue("joiningDate", date)}
                onBlur={() => formik.setFieldTouched("joiningDate", true)}
                className={`form-control w-auto ${
                  formik.touched.joiningDate && formik.errors.joiningDate
                    ? "is-invalid"
                    : ""
                }`}
                placeholderText="Select date"
                dateFormat="dd/MM/yyyy"
                autoComplete="off"
              />
              {formik.touched.joiningDate && formik.errors.joiningDate && (
                <div className="invalid-feedback-color">
                  {formik.errors.joiningDate}
                </div>
              )}
            </div>

            {/* Active Employee */}
            <div className="form-check">
              <input
                type="checkbox"
                name="isActive"
                checked={formik.values.isActive}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="form-check-input"
                id="isActive"
              />
              <label className="form-check-label" htmlFor="isActive">
                Active Employee <span className="text-danger">*</span>
              </label>
              {formik.touched.isActive && formik.errors.isActive && (
                <div className="text-danger mt-1">{formik.errors.isActive}</div>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                className="btn custom-button-bgcolor"
                type="submit"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
        <hr className="shadow-lg" />
      </div>
    </div>
  );
}

export default AddEmployee;
