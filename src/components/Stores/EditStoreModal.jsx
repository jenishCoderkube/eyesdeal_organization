import React, { useEffect, useState } from "react";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Country, State, City } from "country-state-city";
import { storeService } from "../../services/storeService";
import { toast } from "react-toastify";
import { uploadImage } from "../../utils/constants";

const EditStoreModal = ({ show, onHide, storeData }) => {
  const [formData, setFormData] = useState({
    SystemId: "",
    storeNumber: "",
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

  // Populate form with store data when modal opens
  useEffect(() => {
    if (storeData) {
      const selectedCountry = countryOptions.find(
        (c) => c.label === storeData.country
      );
      const selectedState = stateOptions.find(
        (s) => s.label === storeData.state
      );
      const selectedCity = cityOptions.find((c) => c.label === storeData.city);
      setFormData({
        SystemId: storeData._id || "",
        storeNumber: storeData.storeNumber || "",
        name: storeData.name || "",
        locationUrl: storeData?.locationUrl,
        address: storeData?.address,
        companyName: storeData?.companyName,
        country: selectedCountry || "",
        state: selectedState || "",
        city: selectedCity || "",
        pincode: storeData?.pincode,
        GSTNumber: storeData?.GSTNumber,
        emails: storeData?.emails || [],
        phones: storeData?.phones || [],
        photos: storeData?.photos || [],
        activeInWebsite: storeData.activeInWebsite || false,
      });
    }
  }, [storeData]);

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
      if (field === "country") {
        newFormData.state = null;
        newFormData.city = null;
      }
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
      setShowEmailInput(false);
    } else if (!showEmailInput) {
      setShowEmailInput(true);
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
      setShowPhoneInput(false);
    } else if (!showPhoneInput) {
      setShowPhoneInput(true);
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
      setShowPhotoInput(false);
    } else if (!showPhotoInput) {
      setShowPhotoInput(true);
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
    console.log("Updated store data:", formData);
    // Add API call to update store here

    const payload = {
      ...formData,
      _id: formData?.SystemId,
      city: formData?.city?.label ? formData?.city?.label : formData?.city,
      state: formData?.state?.label ? formData?.state?.label : formData?.state,
      country: formData?.country?.label
        ? formData?.country?.label
        : formData?.country,
    };
    console.log("Form submitted:", payload);

    try {
      const response = await storeService.updateStore(payload);
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
    onHide(); // Close modal after submission
  };
  // Handle click on backdrop to close modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      photos: prevData.photos.filter((_, index) => index !== indexToRemove),
    }));
  };

  return (
    <>
      {show && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={handleBackdropClick}
          />
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Store</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={onHide}
                  />
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-12 mt-3">
                        <label htmlFor="name" className="form-label fw-medium">
                          System Id <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="SystemId"
                          disabled
                          className="form-control"
                          value={formData.SystemId}
                          onChange={(e) =>
                            handleInputChange("SystemId", e.target.value)
                          }
                        />
                        {errors.SystemId && (
                          <div className="text-danger mt-1">
                            {errors.SystemId}
                          </div>
                        )}
                      </div>
                      <div className="col-12 mt-3">
                        <label htmlFor="name" className="form-label fw-medium">
                          storeNumber <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="storeNumber"
                          disabled
                          className="form-control"
                          value={formData.storeNumber}
                          onChange={(e) =>
                            handleInputChange("storeNumber", e.target.value)
                          }
                        />
                        {errors.storeNumber && (
                          <div className="text-danger mt-1">
                            {errors.storeNumber}
                          </div>
                        )}
                      </div>
                      <div className="col-12 mt-3">
                        <label htmlFor="name" className="form-label fw-medium">
                          Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                        />
                        {errors.name && (
                          <div className="text-danger mt-1">{errors.name}</div>
                        )}
                      </div>
                      <div className="col-12 mt-3">
                        <label
                          htmlFor="locationUrl"
                          className="form-label fw-medium"
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
                      <div className="col-12 mt-3">
                        <label
                          htmlFor="address"
                          className="form-label fw-medium"
                        >
                          Address <span className="text-danger">*</span>
                        </label>
                        <textarea
                          id="address"
                          className="form-control"
                          rows="5"
                          value={formData.address}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
                          }
                        />
                        {errors.address && (
                          <div className="text-danger mt-1">
                            {errors.address}
                          </div>
                        )}
                      </div>

                      <div className="col-12 mt-3">
                        <label
                          htmlFor="companyName"
                          className="form-label fw-medium"
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
                      <div className="col-12 mt-3">
                        <label
                          htmlFor="GSTNumber"
                          className="form-label fw-medium"
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
                        <div className="col-12 mt-3">
                          <label className="form-label fw-medium">
                            Country <span className="text-danger">*</span>
                          </label>
                          <Select
                            options={countryOptions}
                            value={formData.country}
                            onChange={(option) =>
                              handleInputChange("country", option)
                            }
                            placeholder="Select Country..."
                          />
                          {errors.country && (
                            <div className="text-danger mt-1">
                              {errors.country}
                            </div>
                          )}
                        </div>
                        <div className="col-12 mt-3">
                          <label className="form-label fw-medium">
                            State <span className="text-danger">*</span>
                          </label>
                          <Select
                            options={stateOptions}
                            value={formData.state}
                            onChange={(option) =>
                              handleInputChange("state", option)
                            }
                            placeholder="Select State..."
                            isDisabled={!formData.country}
                          />
                          {errors.state && (
                            <div className="text-danger mt-1">
                              {errors.state}
                            </div>
                          )}
                        </div>
                        <div className="col-12 mt-3">
                          <label className="form-label fw-medium">
                            City <span className="text-danger">*</span>
                          </label>
                          <Select
                            options={cityOptions}
                            value={formData.city}
                            onChange={(option) =>
                              handleInputChange("city", option)
                            }
                            placeholder="Select City..."
                            isDisabled={!formData.state}
                          />
                          {errors.city && (
                            <div className="text-danger mt-1">
                              {errors.city}
                            </div>
                          )}
                        </div>
                        <div className="col-12 mt-3">
                          <label
                            htmlFor="pincode"
                            className="form-label fw-medium"
                          >
                            Pincode
                          </label>
                          <input
                            type="text"
                            id="pincode"
                            className="form-control"
                            value={formData.pincode}
                            onChange={(e) =>
                              handleInputChange("pincode", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="col-12 mt-3">
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <h5 className="h6 mb-0 fw-medium">Emails</h5>
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
                      <div className="col-12 mt-3">
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <h3 className="h6 mb-0 fw-medium">Phones</h3>
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
                      <div className="col-12 mt-3">
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <h3 className="h6 mb-0 fw-medium">Photos</h3>
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
                          <ul className="list-group">
                            {formData.photos.map((photo, index) => (
                              <li
                                key={index}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                {photo}
                                <i
                                  role="button"
                                  className="bi bi-x fs-4 text-danger cursor-pointer"
                                  onClick={() => handleRemovePhoto(index)}
                                ></i>
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
                              handleInputChange(
                                "activeInWebsite",
                                e.target.checked
                              )
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
                      <div className="col-12 mt-3">
                        <button
                          type="submit"
                          className="btn custom-button-bgcolor"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default EditStoreModal;
