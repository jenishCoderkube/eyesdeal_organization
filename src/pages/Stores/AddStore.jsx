import React, { useState } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Country, State, City } from "country-state-city";
import styles from "../../assets/css/Stores/AddStores.module.css";
import { storeService } from "../../services/storeService";
import { toast } from "react-toastify";
import { uploadImage } from "../../utils/constants";
const AddStore = () => {
  const [formData, setFormData] = useState({
    name: "",
    locationUrl: "",
    address: "",
    companyName: "",
    country: null,
    state: null,
    city: null,
    pincode: "",
    GSTNumber: "",
    emails: [],
    phones: [],
    photos: [],
    activeInWebsite: false,
  });

  const [errors, setErrors] = useState({});
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("+91");
  const [newPhoto, setNewPhoto] = useState(null);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showPhotoInput, setShowPhotoInput] = useState(false);

  // Fetch countries
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Store Name is required";
    if (!formData.address.trim())
      newErrors.address = "Store Address is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city) newErrors.city = "City is required";
    return newErrors;
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

  const handleAddEmail = () => {
    if (
      showEmailInput &&
      newEmail.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)
    ) {
      setFormData((prev) => ({
        ...prev,
        emails: [...prev.emails, newEmail],
      }));
      setNewEmail("");
      setShowEmailInput(false); // Hide input after adding
    } else if (!showEmailInput) {
      setShowEmailInput(true); // Show input on first click
    } else {
      alert("Please enter a valid email");
    }
  };

  const handleAddPhone = () => {
    if (showPhoneInput && newPhone.length > 3) {
      setFormData((prev) => ({
        ...prev,
        phones: [...prev.phones, newPhone],
      }));
      setNewPhone("+91");
      setShowPhoneInput(false); // Hide input after adding
    } else if (!showPhoneInput) {
      setShowPhoneInput(true); // Show input on first click
    } else {
      alert("Please enter a valid phone number");
    }
  };

  const handleAddPhoto = () => {
    if (showPhotoInput && newPhoto) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, newPhoto],
      }));
      setNewPhoto(null);
      setShowPhotoInput(false); // Hide input after adding
    } else if (!showPhotoInput) {
      setShowPhotoInput(true); // Show input on first click
    } else {
      alert("Please select a photo");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const payload = {
      ...formData,
      city: formData?.city?.label,
      state: formData?.state?.label,
      country: formData?.country?.label,
    };
    console.log("Form submitted:", payload);

    try {
      const response = await storeService.createStore(payload);
      if (response?.success) {
        toast.success(response.message);
        setFormData({
          name: "",
          locationUrl: "",
          address: "",
          companyName: "",
          country: null,
          state: null,
          city: null,
          pincode: "",
          GSTNumber: "",
          emails: [],
          phones: [],
          photos: [],
          activeInWebsite: false,
        });
      }
    } catch (error) {
      console.log("Error creating store:", error);
    }
    // Add API call or further submission logic here
  };

  return (
    <div className="container-fluid px-md-5 px-2">
      <h1 className={`h2 mt-4 text-dark fw-bold ${styles.store_add_title}`}>
        Add Stores
      </h1>
      <div className=" shadow-sm px-md-5">
        <div className="card-body p-md-5 p-2">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="name" className="form-label font-weight-500">
                  Store Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                {errors.name && (
                  <div className="text-danger mt-1">{errors.name}</div>
                )}
              </div>
              <div className="col-12">
                <label
                  htmlFor="locationUrl"
                  className="form-label font-weight-500"
                >
                  Location URL
                </label>
                <input
                  type="text"
                  id="locationUrl"
                  className="form-control"
                  value={formData.locationUrl}
                  onChange={(e) =>
                    handleInputChange("locationUrl", e.target.value)
                  }
                />
              </div>
              <div className="col-12">
                <label htmlFor="address" className="form-label font-weight-500">
                  Store Address <span className="text-danger">*</span>
                </label>
                <textarea
                  id="address"
                  className="form-control"
                  rows="5"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
                {errors.address && (
                  <div className="text-danger mt-1">{errors.address}</div>
                )}
              </div>
              <div className="col-12">
                <label
                  htmlFor="companyName"
                  className="form-label font-weight-500"
                >
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  className="form-control"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label font-weight-500">
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
              <div className="col-12">
                <label className="form-label font-weight-500">
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
              <div className="col-12">
                <label className="form-label font-weight-500">
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
              <div className="col-12">
                <label htmlFor="pincode" className="form-label font-weight-500">
                  Pincode
                </label>
                <input
                  type="text"
                  id="pincode"
                  className="form-control"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                />
              </div>
              <div className="col-12">
                <label
                  htmlFor="GSTNumber"
                  className="form-label font-weight-500"
                >
                  GST Number
                </label>
                <input
                  type="text"
                  id="GSTNumber"
                  className="form-control"
                  value={formData.GSTNumber}
                  onChange={(e) =>
                    handleInputChange("GSTNumber", e.target.value)
                  }
                />
              </div>
              <div className="col-12">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h5 className="h6 mb-0 font-weight-500">Emails</h5>
                  <button
                    type="button"
                    className="btn custom-button-bgcolor"
                    onClick={handleAddEmail}
                  >
                    Add
                  </button>
                </div>
                {showEmailInput && (
                  <div className="input-group mb-3">
                    <input
                      type="email"
                      className="form-control"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter email"
                    />
                  </div>
                )}
                {formData.emails.length > 0 && (
                  <ul className="list-group mb-3">
                    {formData.emails.map((email, index) => (
                      <li key={index} className="list-group-item">
                        {email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-12">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h3 className="h6 mb-0 font-weight-500">Phones</h3>
                  <button
                    type="button"
                    className="btn custom-button-bgcolor"
                    onClick={handleAddPhone}
                  >
                    Add
                  </button>
                </div>
                {showPhoneInput && (
                  <PhoneInput
                    country={"in"}
                    value={newPhone}
                    onChange={(phone) => setNewPhone(phone)}
                    inputClass="form-control w-100"
                  />
                )}
                {formData.phones.length > 0 && (
                  <ul className="list-group mt-3 mb-3">
                    {formData.phones.map((phone, index) => (
                      <li key={index} className="list-group-item">
                        {phone}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-12">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <h3 className="h6 mb-0 font-weight-500">Photos</h3>
                  <button
                    type="button"
                    className="btn custom-button-bgcolor"
                    onClick={handleAddPhoto}
                  >
                    Add
                  </button>
                </div>
                {showPhotoInput && (
                  <input
                    type="file"
                    className="form-control mb-3"
                    onChange={async (e) => {
                      let res = await uploadImage(
                        e.target.files[0],
                        e.target.files[0]?.name
                      );
                      setNewPhoto(res);
                    }}
                    accept="image/*"
                  />
                )}
                {formData.photos.length > 0 && (
                  <ul className="list-group mb-3">
                    {formData.photos.map((photo, index) => (
                      <li key={index} className="list-group-item">
                        {photo}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-12 mt-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="activeInWebsite"
                    className="form-check-input p-2 border-3"
                    checked={formData.activeInWebsite}
                    onChange={(e) =>
                      handleInputChange("activeInWebsite", e.target.checked)
                    }
                  />
                  <label
                    htmlFor="activeInWebsite"
                    className="form-check-label ms-2"
                  >
                    Active In Website
                  </label>
                </div>
              </div>
              <div className="col-12">
                <button type="submit" className="btn custom-button-bgcolor">
                  Create
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStore;
