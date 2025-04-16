import React, { useState } from "react";
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

// Assuming other parts of your code remain unchanged
const UserDetailForm = ({ onAddSpecs, onAddContacts }) => {
  const { prescriptions } = useSelector((state) => state.specsPower);

  const [selectedDate, setSelectedDate] = useState(null);
  const [anniversaryDate, setAnniversaryDate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "+91",
    customerReference: null,
    gender: null,
    country: null,
    state: null,
    city: null,
  });

  const [errors, setErrors] = useState({});
  const [editModal, setEditModal] = useState({
    show: false,
    type: null,
    data: null,
  });
  const dispatch = useDispatch();

  const handleEdit = (prescription) => {
    setEditModal({
      show: true,
      type: prescription.type,
      data: prescription,
    });
  };

  const handleDelete = (id) => {
    dispatch(deletePrescription(id));
  };

  const handleModalClose = () => {
    setEditModal({ show: false, type: null, data: null });
  };

  // Fetch countries from country-state-city
  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  // Fetch states based on selected country
  const stateOptions = formData.country
    ? State.getStatesOfCountry(formData.country.value).map((state) => ({
        value: state.isoCode,
        label: state.name,
      }))
    : [];

  // Fetch cities based on selected country and state
  const cityOptions =
    formData.country && formData.state
      ? City.getCitiesOfState(formData.country.value, formData.state.value).map(
          (city) => ({
            value: city.name,
            label: city.name,
          })
        )
      : [];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  const referenceOptions = [
    { value: "Online", label: "Online" },
    { value: "Store", label: "Store" },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.phone.length <= 3)
      newErrors.phone = "Phone number is required";
    if (!formData.customerReference)
      newErrors.customerReference = "Customer Reference is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city) newErrors.city = "City is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    // Proceed with form submission
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newFormData = { ...prev, [field]: value };

      // Reset state and city when country changes
      if (field === "country") {
        newFormData.state = null;
        newFormData.city = null;
      }
      // Reset city when state changes
      if (field === "state") {
        newFormData.city = null;
      }

      return newFormData;
    });

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <>
      <div className="container">
        <h3 className="mb-4 user_main_title mt-4">Add Users</h3>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label custom-label_user">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              {errors.name && (
                <div className="text-danger mt-1">{errors.name}</div>
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label custom-label_user">
                Phone <span className="text-danger">*</span>
              </label>
              <PhoneInput
                country={"in"}
                value={formData.phone}
                onChange={(phone) => handleInputChange("phone", phone)}
                inputClass="form-control w-100"
              />
              {errors.phone && (
                <div className="text-danger mt-1">{errors.phone}</div>
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label custom-label_user">
                Customer Reference <span className="text-danger">*</span>
              </label>
              <Select
                options={referenceOptions}
                value={formData.customerReference}
                onChange={(option) =>
                  handleInputChange("customerReference", option)
                }
                placeholder="Select..."
              />
              {errors.customerReference && (
                <div className="text-danger mt-1">
                  {errors.customerReference}
                </div>
              )}
            </div>
          </div>
          <div className="row g-3 mt-1">
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label custom-label_user">
                Gender <span className="text-danger">*</span>
              </label>
              <Select
                options={genderOptions}
                value={formData.gender}
                onChange={(option) => handleInputChange("gender", option)}
                placeholder="Select..."
              />
              {errors.gender && (
                <div className="text-danger mt-1">{errors.gender}</div>
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label custom-label_user">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
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
                value={formData.country}
                onChange={(option) => handleInputChange("country", option)}
                placeholder="Select Country..."
              />
              {errors.country && (
                <div className="text-danger mt-1">{errors.country}</div>
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label custom-label_user">
                State <span className="text-danger">*</span>
              </label>
              <Select
                options={stateOptions}
                value={formData.state}
                onChange={(option) => handleInputChange("state", option)}
                placeholder="Select State..."
                isDisabled={!formData.country}
              />
              {errors.state && (
                <div className="text-danger mt-1">{errors.state}</div>
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label custom-label_user">
                City <span className="text-danger">*</span>
              </label>
              <Select
                options={cityOptions}
                value={formData.city}
                onChange={(option) => handleInputChange("city", option)}
                placeholder="Select City..."
                isDisabled={!formData.state}
              />
              {errors.city && (
                <div className="text-danger mt-1">{errors.city}</div>
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label custom-label_user">Pincode</label>
              <input
                type="text"
                className="form-control"
                defaultValue="395007"
              />
            </div>
          </div>
          {/* The rest of your form remains unchanged */}
          <div className="row g-3 mt-3">
            <div className="col-12 col-md-3">
              <label className="form-label custom-label_user">Birth Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="form-control"
                placeholderText="Select date"
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label custom-label_user">
                Anniversary Date
              </label>
              <DatePicker
                selected={anniversaryDate}
                onChange={(date) => setAnniversaryDate(date)}
                className="form-control"
                placeholderText="Select date"
              />
            </div>
          </div>
          <div className="row g-3 mt-3">
            <div className="col-12 col-md-6">
              <label className="form-label custom-label_user">Address</label>
              <textarea className="form-control" rows="5"></textarea>
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label custom-label_user">Notes</label>
              <textarea className="form-control" rows="5"></textarea>
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
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal"
                  data-bs-whatever="@mdo"
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
                        <td className="px-3 py-2">{prescription.doctorName}</td>
                        <td className="px-3 py-2">
                          {prescription.prescribedBy?.label}
                        </td>
                        <td className="px-3 py-2">{prescription.type}</td>
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
                Submit
              </button>
            </div>
          </div>
          <hr />
        </form>
      </div>
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
    </>
  );
};

export default UserDetailForm;
