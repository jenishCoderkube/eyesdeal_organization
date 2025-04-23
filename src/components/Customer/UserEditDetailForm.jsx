import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
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
import { saleService } from "../../services/saleService";

const UserEditDetailForm = ({
  onAddSpecs,
  onAddContacts,
  initialData,
  isEdit,
}) => {
  // const { prescriptions } = useSelector((state) => state.specsPower);
  const [prescriptions, setPrescriptions] = useState([]);

  const dispatch = useDispatch();

  const [editModal, setEditModal] = useState({
    show: false,
    type: null,
    data: null,
  });

  // Fetch countries
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const [referenceOptions, setReferenceOptions] = useState([]);

  const getMarketingReferences = async () => {
    try {
      const response = await saleService.getMarketingReferences();
      if (response.success) {
        const fetchedOptions = response.data.data.map((ref) => ({
          value: ref._id,
          label: ref.name,
        }));
        setReferenceOptions(fetchedOptions);
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    getMarketingReferences();
  }, []);


  // Formik validation schema (only for required fields)
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
  });

  // Initial form values (include all fields)
  const initialValues = {
    name: initialData?.Name,
    phone: String(initialData?.Phone),
    customerReference: initialData?.customerReference,
    gender: initialData?.gender,
    country: initialData?.country,
    state: initialData?.state,
    city: initialData?.city,
    email: initialData?.Email,
    pincode: initialData?.pincode,
    address: initialData?.address,
    notes: initialData?.notes,
    birthDate: initialData?.birthDate ? new Date(initialData.birthDate) : null,
    anniversaryDate: initialData?.anniversaryDate
      ? new Date(initialData.anniversaryDate)
      : null,
  };

  const handleEdit = (prescription) => {
    setEditModal({
      show: true,
      type: prescription.__t,
      data: prescription,
    });
  };

  const handleDelete = (id) => {
    dispatch(deletePrescription(id));
  };

  const handleModalClose = () => {
    setEditModal({ show: false, type: null, data: null });
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

  return (
    <div className="container">
      <h3 className="mb-4 user_main_title mt-4">Edit User</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={(values) => {
          console.log("Updating user:", values);
          // Dispatch update action or API call
        }}
      >
        {({ values, setFieldValue, setValues, errors, touched }) => {
          // Fetch states based on selected country
          const stateOptions = values.country
            ? State.getStatesOfCountry(values.country.value).map((state) => ({
              value: state.isoCode,
              label: state.name,
            }))
            : [];

          // Fetch cities based on selected country and state
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

          // Set values when initialData changes
          useEffect(() => {
            if (initialData) {
              const reference = referenceOptions.find(ref => ref.label === initialData?.marketingReference)
              const gender = genderOptions.find(gen => gen.value === initialData?.gender)
              const country = countryOptions.find(con => con.label.toLowerCase() === initialData?.country)
              const stateOptions = State.getStatesOfCountry(country.value).map((state) => ({
                value: state.isoCode,
                label: state.name,
              }))
              const state = stateOptions.find(state => state.label.toLowerCase() === initialData?.state)
              const cityOptions = City.getCitiesOfState(
                country.value,
                state.value
              ).map((city) => ({
                value: city.name,
                label: city.name,
              }))
              const city = cityOptions.find(city => city.label.toLowerCase() === initialData?.city)
              setValues({
                name: initialData?.name,
                phone: initialData?.phone,
                customerReference: reference,
                gender: gender,
                email: initialData?.email,
                country: country,
                state: state,
                city: city,
                pincode: initialData?.pincode,
                address: initialData?.address,
                note: initialData?.note,
              });

              if (initialData?.prescriptions) {
                setPrescriptions(initialData?.prescriptions);
              }
            }
          }, [initialData]);

          console.log(prescriptions);

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
                    className="form-control"
                    placeholder="Name"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-danger mt-1"
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
                    inputClass="form-control w-100"
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-danger mt-1"
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
                  />
                  <ErrorMessage
                    name="customerReference"
                    component="div"
                    className="text-danger mt-1"
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
                  />
                  <ErrorMessage
                    name="gender"
                    component="div"
                    className="text-danger mt-1"
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-4">
                  <label className="form-label custom-label_user">Email</label>
                  <Field
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-danger mt-1"
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
                  />
                  <ErrorMessage
                    name="country"
                    component="div"
                    className="text-danger mt-1"
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
                  />
                  <ErrorMessage
                    name="state"
                    component="div"
                    className="text-danger mt-1"
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
                  />
                  <ErrorMessage
                    name="city"
                    component="div"
                    className="text-danger mt-1"
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label custom-label_user">
                    Pincode
                  </label>
                  <Field type="text" name="pincode" className="form-control" />
                  <ErrorMessage
                    name="pincode"
                    component="div"
                    className="text-danger mt-1"
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
                  <ErrorMessage
                    name="birthDate"
                    component="div"
                    className="text-danger mt-1"
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
                  <ErrorMessage
                    name="anniversaryDate"
                    component="div"
                    className="text-danger mt-1"
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
                  <ErrorMessage
                    name="address"
                    component="div"
                    className="text-danger mt-1"
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
                  <ErrorMessage
                    name="notes"
                    component="div"
                    className="text-danger mt-1"
                  />
                </div>
              </div>
              <div className="row g-3">
                <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center p-4">
                  <p className="mb-3 mb-md-0 add_power">Add Power</p>
                  <div className="d-flex flex-column flex-sm-row">
                    <button
                      type="button"
                      className="btn btn-primary mb-2 mb-sm-0 me-sm-2"
                      onClick={onAddSpecs}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span className="ms-2">Add Specs Power</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={onAddContacts}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span className="ms-2">Add Contacts Power</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <div className="table-responsive">
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
                          <tr key={prescription._id} className="text-center">
                            <td className="px-3 py-2">
                              {formatDate(prescription.createdAt)}
                            </td>
                            <td className="px-3 py-2">
                              {prescription.__t}
                            </td>
                            <td className="px-3 py-2">({prescription.prescribedBy})</td>
                            <td className="px-3 py-2">
                              <button
                                className="btn p-0 me-2"
                                onClick={() => handleEdit(prescription)}
                              >
                                <FaEdit color="blue" />
                              </button>
                              <button
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
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                </div>
              </div>
              <hr />
            </Form>
          );
        }}
      </Formik>
      <SpecsPowerModal
        show={editModal.show && editModal.type === "specs"}
        onHide={handleModalClose}
        editData={editModal.data}
      />
      <ContactsPowerModal
        show={editModal.show && editModal.type === "contacts"}
        onHide={handleModalClose}
        editData={editModal.data}
      />
    </div>
  );
};

export default UserEditDetailForm;
