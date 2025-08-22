import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { deletePrescription } from "../../store/Power/specsPowerSlice";
import SpecsPowerModal from "./SpecsPowerModal";
import ContactsPowerModal from "./ContactsPowerModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Country, State, City } from "country-state-city";
import { userService } from "../../services/userService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { saleService } from "../../services/saleService";
import { MdAdd } from "react-icons/md";
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .test("min-digits", "Phone number must be at least 10 digits", (value) => {
      if (!value) return false;
      // Extract digits after the country code (e.g., remove "+91" and non-digits)
      const phoneDigits = value.replace(/^\+\d{1,3}/, "").replace(/\D/g, "");
      return phoneDigits.length >= 10;
    }),
  customerReference: Yup.string().required("Customer Reference is required"),
  gender: Yup.string().required("Gender is required"),
  country: Yup.string().required("Country is required"),
  state: Yup.string().required("State is required"),
  city: Yup.string().required("City is required"),
  email: Yup.string().email("Invalid email format"),
  pincode: Yup.string().matches(/^\d{6}$/, "Pincode must be 6 digits"),
});
function transformPayload(frontendPayload) {
  const camelToPascal = {
    asize: "aSize",
    bsize: "bSize",
    pdesign: "pDesign",
    ftype: "ft",
    type: "__t",
    id: "pres_id",
  };

  // Convert date strings to timestamps
  const transformDate = (date) =>
    typeof date === "string" ? new Date(date).getTime() : date;

  // Transform each prescription
  const transformedPrescriptions = (frontendPayload.prescriptions || []).map(
    (prescription) => {
      const {
        doctorName,
        prescribedBy,
        type,
        id,
        right,
        left,
        ipd,
        asize,
        bsize,
        dbl,
        fth,
        pdesign,
        ftype,
        de,
      } = prescription;

      return {
        name: frontendPayload.name || "",
        relation: "",
        gender: "",
        doctorName,
        prescribedBy,
        __t: type,
        ipd,
        aSize: asize,
        bSize: bsize,
        dbl,
        fth,
        pDesign: pdesign,
        ft: ftype,
        de,
        pres_id: id,
        right,
        left,
      };
    }
  );

  return {
    name: frontendPayload.name,
    phone: frontendPayload.phone,
    role: frontendPayload.role,
    email: frontendPayload.email,
    gender: frontendPayload.gender,
    marketingReference: frontendPayload.marketingReference,
    birthDate: transformDate(frontendPayload.birthDate),
    anniversaryDate: transformDate(frontendPayload.anniversaryDate),
    address: frontendPayload.address,
    note: frontendPayload.note,
    country: frontendPayload.country,
    state: frontendPayload.state,
    city: frontendPayload.city,
    pincode: frontendPayload.pincode,
    prescriptions: transformedPrescriptions,
  };
}

const UserDetailForm = ({
  onAddSpecs,
  onAddContacts,
  onEditSpecs,
  onEditContacts,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { prescriptions } = useSelector((state) => state.specsPower);
  const [referenceOptions, setReferenceOptions] = useState([]);
  const [geoLocation, setGeoLocation] = useState({
    country: "",
    state: "",
    city: "",
  });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const handleEdit = (prescription) => {
    console.log("Editing prescription:", prescription);
    if (prescription.type === "contacts") {
      onEditContacts(prescription);
    } else {
      onEditSpecs(prescription);
    }
  };
  const handleDelete = (id) => {
    dispatch(deletePrescription(id));
  };

  const initialValues = {
    name: "",
    phone: "+91",
    customerReference: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    email: "",
    pincode: "",
    birthDate: null,
    anniversaryDate: null,
    address: "",
    note: "",
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formattedData = {
        ...values,
        role: "customer",
        marketingReference: values.customerReference,
        gender: values.gender.toLowerCase(),
        prescriptions: prescriptions,
      };

      const response = await userService.addCustomer(
        transformPayload(formattedData)
      );
      if (response.success) {
        resetForm();
        toast.success(response.message);
        navigate("/sale/new", {
          state: { customerAdded: true, dataCustomer: response?.data?.data },
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to add customer!");
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch countries from country-state-city
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.name,
    label: country.name,
  }));

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "unisex", label: "Unisex" },
    { value: "kids", label: "Kids" },
  ];

  const getMarketingReferences = async () => {
    try {
      const response = await saleService.getMarketingReferences();
      if (response.success) {
        const fetchedOptions = response.data.data.map((ref) => ({
          value: ref.name,
          label: ref.name,
        }));
        setReferenceOptions(fetchedOptions);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching marketing references:", error);
    }
  };
  useEffect(() => {
    getMarketingReferences();
  }, []);
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => {
        // Move fetchLocationFromCoords inside Formik render prop
        const fetchLocationFromCoords = async (latitude, longitude) => {
          try {
            setGeoLoading(true);
            setGeoError(null);

            // Use OpenStreetMap Nominatim API for reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.address) {
              const { country, state, city, town, village } = data.address;
              const resolvedCity = city || town || village || "";

              // Update state with geolocation data
              setGeoLocation({
                country: country || "",
                state: state || "",
                city: resolvedCity || "",
              });

              // Update Formik fields
              setFieldValue("country", country || "");
              setFieldValue("state", state || "");
              setFieldValue("city", resolvedCity || "");
            } else {
              setGeoError("Unable to fetch location details.");
            }
          } catch (error) {
            setGeoError("Error fetching location: " + error.message);
            console.error("Geocoding error:", error);
          } finally {
            setGeoLoading(false);
          }
        };

        // Fetch states based on selected country
        const stateOptions = values.country
          ? State.getStatesOfCountry(
              Country.getCountryByCode(
                Country.getAllCountries().find((c) => c.name === values.country)
                  ?.isoCode
              )?.isoCode
            ).map((state) => ({
              value: state.name,
              label: state.name,
            }))
          : [];

        // Fetch cities based on selected country and state
        const cityOptions =
          values.country && values.state
            ? City.getCitiesOfState(
                Country.getCountryByCode(
                  Country.getAllCountries().find(
                    (c) => c.name === values.country
                  )?.isoCode
                )?.isoCode,
                State.getStatesOfCountry(
                  Country.getCountryByCode(
                    Country.getAllCountries().find(
                      (c) => c.name === values.country
                    )?.isoCode
                  )?.isoCode
                ).find((s) => s.name === values.state)?.isoCode
              ).map((city) => ({
                value: city.name,
                label: city.name,
              }))
            : [];

        // Move geolocation logic inside Formik to access setFieldValue
        useEffect(() => {
          if (navigator.geolocation) {
            setGeoLoading(true);
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                fetchLocationFromCoords(latitude, longitude);
              },
              (error) => {
                setGeoError("Geolocation error: " + error.message);
                setGeoLoading(false);
                console.error("Geolocation error:", error);
              },
              { timeout: 10000, enableHighAccuracy: true }
            );
          } else {
            setGeoError("Geolocation is not supported by this browser.");
          }
        }, [setFieldValue]); // Add setFieldValue to dependencies

        return (
          <Form>
            <div className="container">
              <h3 className="mb-4 user_main_title mt-4">Add Users</h3>
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label font-weight-500">
                    Name <span className="text-danger">*</span>
                  </label>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Name"
                    className={`form-control ${
                      touched.name && errors.name ? "is-invalid" : ""
                    }`}
                  />
                  {touched.name && errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label font-weight-500">
                    Phone <span className="text-danger">*</span>
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={values.phone}
                    onChange={(phone) => setFieldValue("phone", phone)}
                    inputClass={`form-control w-100 ${
                      touched.phone && errors.phone ? "is-invalid" : ""
                    }`}
                  />
                  {touched.phone && errors.phone && (
                    <div className="invalid-feedback-color">{errors.phone}</div>
                  )}
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label font-weight-500">
                    Customer Reference <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={referenceOptions}
                    value={referenceOptions.find(
                      (opt) => opt.value === values.customerReference
                    )}
                    onChange={(option) =>
                      setFieldValue("customerReference", option.value)
                    }
                    placeholder="Select..."
                    className={
                      touched.customerReference && errors.customerReference
                        ? "is-invalid"
                        : ""
                    }
                  />
                  {touched.customerReference && errors.customerReference && (
                    <div className="invalid-feedback">
                      {errors.customerReference}
                    </div>
                  )}
                </div>
              </div>
              <div className="row g-3 mt-1">
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label font-weight-500">
                    Gender <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={genderOptions}
                    value={genderOptions.find(
                      (opt) => opt.value === values.gender
                    )}
                    onChange={(option) => setFieldValue("gender", option.value)}
                    placeholder="Select..."
                  />
                  {touched.gender && errors.gender && (
                    <div className="invalid-feedback-color mt-1">
                      {errors.gender}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label font-weight-500">Email</label>
                  <Field
                    name="email"
                    type="email"
                    className={`form-control ${
                      touched.email && errors.email ? "is-invalid" : ""
                    }`}
                  />
                  {touched.email && errors.email && (
                    <div className="invalid-feedback-color">{errors.email}</div>
                  )}
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label font-weight-500">Role</label>
                  <Field
                    name="role"
                    type="text"
                    className="form-control custom-disabled"
                    value="customer"
                    readOnly
                  />
                </div>
              </div>
              <div className="row g-3 mt-3">
                {geoLoading && (
                  <div className="text-muted">Fetching location...</div>
                )}
                {geoError && <div className="text-danger">{geoError}</div>}
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label font-weight-500">
                    Country <span className="text-danger">*</span>
                  </label>

                  <Select
                    options={countryOptions}
                    value={countryOptions.find(
                      (opt) => opt.value === values.country
                    )}
                    onChange={(option) => {
                      setFieldValue("country", option.value);
                      setFieldValue("state", "");
                      setFieldValue("city", "");
                    }}
                    placeholder="Select Country..."
                    isDisabled={geoLoading} // Disable while fetching
                  />
                  {touched.country && errors.country && (
                    <div className="invalid-feedback-color mt-1">
                      {errors.country}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label font-weight-500">
                    State <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={stateOptions}
                    value={stateOptions.find(
                      (opt) => opt.value === values.state
                    )}
                    onChange={(option) => {
                      setFieldValue("state", option.value);
                      setFieldValue("city", "");
                    }}
                    placeholder="Select State..."
                    isDisabled={!values.country || geoLoading} // Disable while fetching
                  />
                  {touched.state && errors.state && (
                    <div className="invalid-feedback-color mt-1">
                      {errors.state}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label font-weight-500">
                    City <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={cityOptions}
                    value={cityOptions.find((opt) => opt.value === values.city)}
                    onChange={(option) => setFieldValue("city", option.value)}
                    placeholder="Select City..."
                    isDisabled={!values.state || geoLoading} // Disable while fetching
                  />
                  {touched.city && errors.city && (
                    <div className="invalid-feedback-color mt-1">
                      {errors.city}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label font-weight-500">Pincode</label>
                  <Field
                    name="pincode"
                    type="text"
                    className={`form-control ${
                      touched.pincode && errors.pincode ? "is-invalid" : ""
                    }`}
                  />
                  {touched.pincode && errors.pincode && (
                    <div className="invalid-feedback-color">
                      {errors.pincode}
                    </div>
                  )}
                </div>
              </div>
              <div className="row g-3 mt-3">
                <div className="col-12 col-md-3">
                  <label className="form-label font-weight-500">
                    Birth Date
                  </label>
                  <DatePicker
                    selected={values.birthDate}
                    onChange={(date) => setFieldValue("birthDate", date)}
                    className="form-control"
                    placeholderText="Select date"
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label font-weight-500">
                    Anniversary Date
                  </label>
                  <DatePicker
                    selected={values.anniversaryDate}
                    onChange={(date) => setFieldValue("anniversaryDate", date)}
                    className="form-control"
                    placeholderText="Select date"
                  />
                </div>
              </div>
              <div className="row g-3 mt-3">
                <div className="col-12 col-md-6">
                  <label className="form-label font-weight-500">Address</label>
                  <Field
                    name="address"
                    as="textarea"
                    className="form-control"
                    rows="5"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label font-weight-500">Notes</label>
                  <Field
                    name="note"
                    as="textarea"
                    className="form-control"
                    rows="5"
                  />
                </div>
              </div>
              <div className="row g-3">
                <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center p-4">
                  <p className="mb-3 mb-md-0 add_power">Add Power</p>
                  <div className="d-flex flex-column flex-sm-row">
                    <button
                      type="button"
                      className="btn custom-button-bgcolor mb-2 mb-sm-0 me-sm-2"
                      onClick={onAddSpecs}
                    >
                      <MdAdd />
                      <span className="ms-2">Add Specs Power</span>
                    </button>
                    <button
                      type="button"
                      className="btn custom-button-bgcolor"
                      onClick={onAddContacts}
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                      data-bs-whatever="@mdo"
                    >
                      <MdAdd />
                      <span className="ms-2">Add Contacts Power</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <div className="table-responsive px-2">
                    <table className="table table-bordered table-hover table-sm custom-table-grid">
                      <thead>
                        <tr className="text-center">
                          <th scope="col" className="px-3 py-2 add_power_title">
                            Prescriber Name
                          </th>
                          <th scope="col" className="px-3 py-2 add_power_title">
                            Prescribed by
                          </th>
                          <th scope="col" className="px-3 py-2 add_power_title">
                            Type
                          </th>
                          <th scope="col" className="px-3 py-2 add_power_title">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptions?.map((prescription) => (
                          <tr key={prescription.id} className="text-center">
                            <td className="px-3 py-2">
                              {prescription.doctorName}
                            </td>
                            <td className="px-3 py-2">
                              {prescription.prescribedBy}
                            </td>
                            <td className="px-3 py-2">{prescription.type}</td>
                            <td className="px-3 py-2">
                              <FaEdit
                                color="blue"
                                className="btn p-0 me-2"
                                onClick={() => handleEdit(prescription)}
                              />

                              <FaTrash
                                color="red"
                                className="btn p-0"
                                onClick={() => handleDelete(prescription.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="row mt-3 pb-5">
                <div>
                  <button
                    type="submit"
                    className="btn custom-button-bgcolor"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default UserDetailForm;
