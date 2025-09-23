import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addPrescription,
  deletePrescription,
  removeAllPrescriptions,
} from "../../store/Power/specsPowerSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Country, State, City } from "country-state-city";
import { saleService } from "../../services/saleService";
import { userService } from "../../services/userService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { MdAdd } from "react-icons/md";

const UserEditDetailForm = ({
  onAddSpecs,
  onAddContacts,
  onEditPrescription,
  initialData,
  isEdit,
}) => {
  console.log("initialData", initialData);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { prescriptions } = useSelector((state) => state.specsPower); // Use Redux state
  const [referenceOptions, setReferenceOptions] = useState([]);

  // Fetch marketing references
  const getMarketingReferences = async () => {
    try {
      const response = await saleService.getMarketingReferences();
      if (response.success) {
        setReferenceOptions(
          response.data.data?.docs?.map((ref) => ({
            value: ref.name,
            label: ref.name,
          }))
        );
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching marketing references:", error);
    }
  };
  useEffect(() => {
    getMarketingReferences();
  }, []); // Empty dependency array to run only once

  const validationSchema = Yup.object({
    name: Yup.string().trim().required("Name is required"),

    gender: Yup.object().nullable().required("Gender is required"),
    country: Yup.object().nullable().required("Country is required"),
    state: Yup.object().nullable().required("State is required"),
    city: Yup.object().nullable().required("City is required"),
  });

  // Initial form values
  const initialValues = {
    name: initialData?.name || "",
    phone: initialData?.phone ? `+${initialData.phone}` : "",
    customerReference: initialData?.customerReference || null,
    gender: null,
    country: null,
    state: null,
    city: null,
    email: initialData?.email || "",
    pincode: initialData?.pincode || "",
    address: initialData?.address || "",
    notes: initialData?.note || "",
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate) : null,
    anniversaryDate: initialData?.anniversaryDate
      ? new Date(initialData.anniversaryDate)
      : null,
  };

  // Country, gender, and reference options
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "unisex", label: "Unisex" },
    { value: "kids", label: "Kids" },
  ];

  const handleEdit = (prescription) => {
    onEditPrescription(prescription); // Call the parent’s edit handler
  };

  const handleDelete = (id) => {
    dispatch(deletePrescription(id));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Transform payload for backend
  const transformPayload = (values) => {
    const transformDate = (date) =>
      date instanceof Date ? date.getTime() : date;

    const transformedPrescriptions = prescriptions.map((prescription) => {
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
        k,
        dia,
        bc,
      } = prescription;
      return {
        name: values.name || "",
        relation: "",
        gender: "",
        doctorName,
        prescribedBy,
        __t: type || prescription.__t,
        ipd: ipd || "",
        aSize: asize || "",
        bSize: bsize || "",
        dbl: dbl || "",
        fth: fth || "",
        pDesign: pdesign || "",
        ft: ftype || "",
        de: de || "",
        pres_id: id,
        right: {
          distance: {
            sph: right?.distance?.sph || "",
            cyl: right?.distance?.cyl || "",
            axis: right?.distance?.axis || "",
            vs: right?.distance?.vs || "",
            add: right?.distance?.add || "",
            _id: right?.distance?._id || undefined,
          },
          near: {
            sph: right?.near?.sph || "",
            cyl: right?.near?.cyl || "",
            axis: right?.near?.axis || "",
            vs: right?.near?.vs || "",
            _id: right?.near?._id || undefined,
          },
          psm: right?.psm || "",
          pd: right?.pd || "",
          fh: right?.fh || "",
          k: k || "",
          dia: dia || "",
          bc: bc || "",
        },
        left: {
          distance: {
            sph: left?.distance?.sph || "",
            cyl: left?.distance?.cyl || "",
            axis: left?.distance?.axis || "",
            vs: left?.distance?.vs || "",
            add: left?.distance?.add || "",
            _id: left?.distance?._id || undefined,
          },
          near: {
            sph: left?.near?.sph || "",
            cyl: left?.near?.cyl || "",
            axis: left?.near?.axis || "",
            vs: left?.near?.vs || "",
            _id: left?.near?._id || undefined,
          },
          psm: left?.psm || "",
          pd: left?.pd || "",
          fh: left?.fh || "",
          k: k || "",
          dia: dia || "",
          bc: bc || "",
        },
        phone: values.phone.replace(/^\+/, ""),
      };
    });

    return {
      _id: initialData._id,
      name: values.name,
      phone: values.phone.replace(/^\+/, ""),
      role: "customer",
      email: values.email,
      gender: values.gender?.value,
      customerReference: values.customerReference || { value: "", label: "" },
      birthDate: transformDate(values.birthDate),
      anniversaryDate: transformDate(values.anniversaryDate),
      address: values.address,
      note: values.notes,
      country: values.country?.label,
      state: values.state?.label,
      city: values.city?.label,
      pincode: values.pincode,
      prescriptions: transformedPrescriptions,
      verified: initialData?.verified || false,
      isMigrated: initialData?.isMigrated || false,
      isActive: initialData?.isActive || true,
      stores: initialData?.stores || [],
      storesData: initialData?.storesData || [],
    };
  };
  return (
    <div className="container">
      <h3 className="mb-4 user_main_title mt-4">Edit User</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const formattedData = transformPayload(values);
            const response = await userService.updateCustomer(formattedData);
            if (response.success) {
              dispatch(removeAllPrescriptions());
              toast.success(response.message);
              navigate("/sale/new", {
                state: {
                  customerAdded: true,
                  dataCustomer: response?.data?.data,
                },
              });
            } else {
              toast.error(response.message || "User not found!");
            }
          } catch (error) {
            toast.error(error.message || "Failed to update customer!");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          values,
          setFieldValue,
          setValues,
          errors,
          touched,
          isSubmitting,
        }) => {
          // Fetch states and cities
          const stateOptions = values.country
            ? State.getStatesOfCountry(values.country.value).map((state) => ({
                value: state.isoCode,
                label: state.name,
              }))
            : [];
          const cityOptions =
            values.country && values.state
              ? City.getCitiesOfState(
                  values.country.value,
                  values.state.value
                ).map((city) => ({
                  value: city.name,
                  label: city.name,
                }))
              : [];

          // Initialize form with initialData
          // Inside UserEditDetailForm component
          useEffect(() => {
            if (initialData && referenceOptions.length > 0) {
              const reference =
                initialData.customerReference ||
                referenceOptions.find(
                  (ref) => ref.label === initialData?.marketingReference
                ) ||
                null;
              const gender =
                genderOptions.find(
                  (gen) => gen.value === initialData?.gender
                ) || null;
              const country =
                countryOptions.find(
                  (con) =>
                    con.label.toLowerCase() ===
                    initialData?.country?.toLowerCase()
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
                    state.label.toLowerCase() ===
                    initialData?.state?.toLowerCase()
                ) || null;
              const cityOptions =
                country && state
                  ? City.getCitiesOfState(country.value, state.value).map(
                      (city) => ({
                        value: city.name,
                        label: city.name,
                      })
                    )
                  : [];
              const city =
                cityOptions.find(
                  (city) =>
                    city.label.toLowerCase() ===
                    initialData?.city?.toLowerCase()
                ) || null;

              // Set form values
              setValues({
                ...initialValues,
                name: initialData.name || "",
                phone: initialData.phone ? `+${initialData.phone}` : "",
                customerReference: reference,
                gender: gender,
                country: country,
                state: state,
                city: city,
                email: initialData.email || "",
                pincode: initialData.pincode || "",
                address: initialData.address || "",
                notes: initialData.note || "",
                birthDate: initialData.birthDate
                  ? new Date(initialData.birthDate)
                  : null,
                anniversaryDate: initialData.anniversaryDate
                  ? new Date(initialData.anniversaryDate)
                  : null,
              });

              // Initialize prescriptions in Redux store
              if (
                initialData.prescriptions &&
                initialData.prescriptions.length > 0
              ) {
                initialData.prescriptions.forEach((prescription) => {
                  dispatch(
                    addPrescription({
                      ...prescription,
                      id: prescription._id, // Use _id as the unique identifier
                      type: prescription.__t, // Map __t to type for consistency
                    })
                  );
                });
              }
            }
          }, [initialData, referenceOptions, dispatch, setValues]);

          return (
            <Form>
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label custom-label_user">
                    Name <span className="text-danger">*</span>
                  </label>
                  <Field
                    type="text"
                    name="name"
                    className={`form-control ${
                      touched.name && errors.name ? "is-invalid" : ""
                    }`}
                    placeholder="Name"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label custom-label_user">
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
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label custom-label_user">
                    Customer Reference <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={referenceOptions}
                    value={values.customerReference}
                    onChange={(option) =>
                      setFieldValue("customerReference", option)
                    }
                    placeholder="Select..."
                    className={
                      touched.customerReference && errors.customerReference
                        ? "is-invalid"
                        : ""
                    }
                  />
                  <ErrorMessage
                    name="customerReference"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>
              </div>
              <div className="row g-3 mt-1">
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label custom-label_user">
                    Gender <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={genderOptions}
                    value={values.gender}
                    onChange={(option) => setFieldValue("gender", option)}
                    placeholder="Select..."
                    className={
                      touched.gender && errors.gender ? "is-invalid" : ""
                    }
                  />
                  <ErrorMessage
                    name="gender"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label custom-label_user">Email</label>
                  <Field
                    type="email"
                    name="email"
                    className={`form-control ${
                      touched.email && errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label custom-label_user">Role</label>
                  <input
                    type="text"
                    className="form-control custom-disabled"
                    value="customer"
                    readOnly
                  />
                </div>
              </div>
              <div className="row g-3 mt-3">
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label custom-label_user">
                    Country <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={countryOptions}
                    value={values.country}
                    onChange={(option) => {
                      setFieldValue("country", option);
                      setFieldValue("state", null);
                      setFieldValue("city", null);
                    }}
                    placeholder="Select Country..."
                    className={
                      touched.country && errors.country ? "is-invalid" : ""
                    }
                  />
                  <ErrorMessage
                    name="country"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label custom-label_user">
                    State <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={stateOptions}
                    value={values.state}
                    onChange={(option) => {
                      setFieldValue("state", option);
                      setFieldValue("city", null);
                    }}
                    placeholder="Select State..."
                    isDisabled={!values.country}
                    className={
                      touched.state && errors.state ? "is-invalid" : ""
                    }
                  />
                  <ErrorMessage
                    name="state"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label custom-label_user">
                    City <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={cityOptions}
                    value={values.city}
                    onChange={(option) => setFieldValue("city", option)}
                    placeholder="Select City..."
                    isDisabled={!values.state}
                    className={touched.city && errors.city ? "is-invalid" : ""}
                  />
                  <ErrorMessage
                    name="city"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label custom-label_user">
                    Pincode
                  </label>
                  <Field
                    type="text"
                    name="pincode"
                    className={`form-control ${
                      touched.pincode && errors.pincode ? "is-invalid" : ""
                    }`}
                  />
                  <ErrorMessage
                    name="pincode"
                    component="div"
                    className="invalid-feedback"
                  />
                </div>
              </div>
              <div className="row g-3 mt-3">
                <div className="col-12 col-md-3">
                  <label className="form-label custom-label_user">
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
                  <label className="form-label custom-label_user">
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
                  <label className="form-label custom-label_user">
                    Address
                  </label>
                  <Field
                    as="textarea"
                    name="address"
                    className="form-control"
                    rows="5"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label custom-label_user">Notes</label>
                  <Field
                    as="textarea"
                    name="notes"
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
                      onClick={() => onAddSpecs()}
                    >
                      <MdAdd />
                      <span className="ms-2">Add Specs Power</span>
                    </button>
                    <button
                      type="button"
                      className="btn custom-button-bgcolor"
                      onClick={() => onAddContacts()}
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
                            Date
                          </th>
                          <th scope="col" className="px-3 py-2 add_power_title">
                            Power Type
                          </th>
                          <th scope="col" className="px-3 py-2 add_power_title">
                            Prescribed by
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
                              {formatDate(prescription.createdAt)}
                            </td>
                            <td className="px-3 py-2">
                              {prescription.type || prescription.__t}
                            </td>
                            <td className="px-3 py-2">
                              {prescription.prescribedBy}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                className="btn p-0 me-2"
                                onClick={() => handleEdit(prescription)}
                              >
                                <FaEdit color="blue" />
                              </button>
                              <button
                                type="button"
                                className="btn p-0"
                                onClick={() => handleDelete(prescription.id)}
                              >
                                <FaTrash color="red" />
                              </button>
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
                    {isSubmitting ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default UserEditDetailForm;
