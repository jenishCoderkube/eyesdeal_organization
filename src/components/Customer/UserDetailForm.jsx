import React, { useState } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import "./UserDetailForm.css";

const UserDetailForm = ({ onAddSpecs, onAddContacts }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [anniversaryDate, setAnniversaryDate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "+91",
    customerReference: null,
    gender: null,
  });
  const [errors, setErrors] = useState({});
  const countryOptions = [
    { value: "India", label: "India", image: "https://flagcdn.com/in.svg" },
    { value: "USA", label: "USA", image: "https://flagcdn.com/us.svg" },
  ];

  const stateOptions = [
    { value: "Gujarat", label: "Gujarat" },
    { value: "Maharashtra", label: "Maharashtra" },
  ];

  const cityOptions = [
    { value: "Surat", label: "Surat" },
    { value: "Mumbai", label: "Mumbai" },
  ];

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  const referenceOptions = [
    { value: "Online", label: "Online" },
    { value: "Store", label: "Store" },
  ];

  const CustomOption = ({ innerProps, label, data }) => (
    <div {...innerProps} className="custom-option">
      {data.image && <img src={data.image} alt={label} className="flag-icon" />}
      {label}
    </div>
  );
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.phone.length <= 3)
      newErrors.phone = "Phone number is required";
    if (!formData.customerReference)
      newErrors.customerReference = "Customer Reference is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
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
    setFormData({ ...formData, [field]: value });
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
                components={{ Option: CustomOption }}
                defaultValue={countryOptions[0]}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label custom-label_user">
                State <span className="text-danger">*</span>
              </label>
              <Select options={stateOptions} defaultValue={stateOptions[0]} />
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label custom-label_user">
                City <span className="text-danger">*</span>
              </label>
              <Select options={cityOptions} defaultValue={cityOptions[0]} />
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
          <div className="row g-3 ">
            <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center p-4 ">
              <p className="mb-3 mb-md-0 add_power ">Add Power</p>
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
                <table className="table border-top border-bottom table-hover table-sm">
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
                  <tbody></tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="row mt-3 pb-5">
            <div>
              <button type="submit" className="btn btn-primary ">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserDetailForm;
