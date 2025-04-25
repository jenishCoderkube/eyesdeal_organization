import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { Modal, Button, Form } from "react-bootstrap";
import { userService } from "../../../services/userService";
import { IoIosClose } from "react-icons/io";

// Validation schema
const validationSchema = Yup.object({
  companyName: Yup.string().trim().required("Company Name is required"),
  phone: Yup.string()
    .min(4, "Phone number is required")
    .required("Phone number is required"),
  email: Yup.string().email("Invalid email address"),
  type: Yup.object().nullable(),
  country: Yup.object().nullable().required("Country is required"),
  state: Yup.object().nullable().required("State is required"),
  city: Yup.object().nullable().required("City is required"),
  pincode: Yup.string().trim().required("Pincode is required"),
  address: Yup.string().trim(),
  GSTNumber: Yup.string().trim(),
  contactNumber: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string(),
        phone: Yup.string(),
      })
    )
    .notRequired(),
});

// Type options
const typeOptions = [
  { value: "lens_vendor", label: "Lens Vendor" },
  { value: "frame_vendor", label: "Frame Vendor" },
  { value: "accessory_vendor", label: "Accessory Vendor" },
];

const EditVendorModal = ({ show, onHide, onSubmit, editVendor }) => {
  // Formik setup
  const formik = useFormik({
    initialValues: {
      _id: "",
      companyName: "",
      phone: "+91",
      email: "",
      type: null,
      country: null,
      state: null,
      city: null,
      pincode: "",
      address: "",
      GSTNumber: "",
      contactNumber: [],
    },
    validationSchema,
    onSubmit: (values) => {
      const data = {
        ...values,
        country: values.country.label,
        state: values.state.label,
        city: values.city.label,
        type: values.type?.value,
        contactPerson: values.contactNumber,
      };
      onSubmit && onSubmit(data);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (show) {
      fetchVendorDetails();
    } else {
      formik.resetForm();
    }
  }, [show]);

  // Country, state, city options
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
      : [];

  const fetchVendorDetails = async () => {
    userService
      .getVendorById(editVendor?._id)
      .then((res) => {
        const vendorDetails = res.data?.data?.docs?.[0];
        const country = countryOptions.find(
          (item) =>
            item.label.toLowerCase() === vendorDetails?.country?.toLowerCase()
        );
        const stateOptions = State.getStatesOfCountry(country.value).map(
          (state) => ({ value: state.isoCode, label: state.name })
        );
        const state = stateOptions.find(
          (state) =>
            state.label.toLowerCase() === vendorDetails?.state?.toLowerCase()
        );
        const cityOptions = City.getCitiesOfState(
          country?.value,
          state?.value
        ).map((city) => ({ value: city.name, label: city.name }));
        const city = cityOptions.find(
          (city) =>
            city.label.toLowerCase() === vendorDetails?.city?.toLowerCase()
        );
        console.log(vendorDetails);
        formik.setValues({
          ...vendorDetails,
          country: country,
          state: state,
          city: city,
          type: typeOptions.find((item) => item.value === vendorDetails?.type),
          contactNumber: vendorDetails?.contactPerson,
        });
      })
      .catch((e) => console.log("Failed to fetch vendor details: ", e));
  };

  const handleAddPhone = () => {
    const contactNumber =
      formik.values.contactNumber?.length > 0
        ? [...formik.values.contactNumber, { name: "", phone: "+91" }]
        : [{ name: "", phone: "+91" }];
    formik.setFieldValue("contactNumber", contactNumber);
  };

  const handleNameChange = (e, index) => {
    const { value } = e.target;
    let contactNumber = formik.values.contactNumber;
    contactNumber[index].name = value;
    formik.setFieldValue("contactNumber", contactNumber);
  };

  const handlePhoneChange = (phone, index) => {
    let contactNumber = formik.values.contactNumber;
    contactNumber[index].phone = phone;
    formik.setFieldValue("contactNumber", contactNumber);
  };

  const handleRemoveContact = (contactIndex) => {
    const contactNumber = formik.values.contactNumber.filter(
      (item, index) => index !== contactIndex
    );
    formik.setFieldValue("contactNumber", contactNumber);
  };

  // Handle country/state changes
  const handleCountryChange = (option) => {
    formik.setFieldValue("country", option);
    formik.setFieldValue("state", null);
    formik.setFieldValue("city", null);
  };

  const handleStateChange = (option) => {
    formik.setFieldValue("state", option);
    formik.setFieldValue("city", null);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Edit Vendor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={formik.handleSubmit}>
          <Form.Group className="mb-3" controlId="_id">
            <Form.Label>
              System Id <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="_id"
              value={formik.values._id}
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="companyName">
            <Form.Label>
              Company Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="companyName"
              value={formik.values.companyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter company name"
              isInvalid={
                formik.touched.companyName && !!formik.errors.companyName
              }
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.companyName}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter email"
              isInvalid={formik.touched.email && !!formik.errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="phone">
            <Form.Label>
              Phone <span className="text-danger">*</span>
            </Form.Label>
            <PhoneInput
              country={"in"}
              value={formik.values.phone}
              onChange={(phone) => formik.setFieldValue("phone", phone)}
              onBlur={() => formik.setFieldTouched("phone", true)}
              inputClass={`form-control ${
                formik.touched.phone && formik.errors.phone ? "is-invalid" : ""
              }`}
              containerClass="w-100"
              inputStyle={{ width: "100%" }}
              placeholder="1 (702) 123-4567"
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="invalid-feedback d-block">
                {formik.errors.phone}
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="type">
            <Form.Label>Type</Form.Label>
            <Select
              options={typeOptions}
              value={formik.values.type}
              onChange={(option) => formik.setFieldValue("type", option)}
              onBlur={() => formik.setFieldTouched("type", true)}
              placeholder="Select..."
              classNamePrefix="react-select"
            />
            {formik.touched.type && formik.errors.type && (
              <div className="text-danger mt-1">{formik.errors.type}</div>
            )}
          </Form.Group>
          <Form.Group>
            <label className="form-label fw-medium" htmlFor="type">
              Contact Person
            </label>
            <br />
            <button
              className="btn btn-outline-primary"
              onClick={(e) => {
                e.preventDefault();
                handleAddPhone();
              }}
            >
              Add Phone
            </button>
            {formik.values.contactNumber?.map((contact, index) => (
              <div className="ms-3 mt-3">
                <div className="w-100 position-relative">
                  <IoIosClose
                    size={25}
                    color="red"
                    className="remove-icon"
                    onClick={() => handleRemoveContact(index)}
                  />
                  <label className="form-label fw-medium" htmlFor="companyName">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full form-control"
                    name="name"
                    placeholder="Enter name"
                    value={contact?.name}
                    onChange={(e) => handleNameChange(e, index)}
                  />
                </div>
                <div className="w-100 mt-3">
                  <label className="form-label fw-medium" htmlFor="phone">
                    Phone <span className="text-danger">*</span>
                  </label>
                  <PhoneInput
                    country={"in"}
                    inputClass={`form-control "is-invalid`}
                    containerClass="w-100"
                    value={contact?.phone}
                    onChange={(phone) => handlePhoneChange(phone, index)}
                    inputStyle={{ width: "100%" }}
                    placeholder="1 (702) 123-4567"
                  />
                </div>
              </div>
            ))}
          </Form.Group>
          <Form.Group className="mb-3" controlId="country">
            <Form.Label>
              Country <span className="text-danger">*</span>
            </Form.Label>
            <Select
              options={countryOptions}
              value={formik.values.country}
              onChange={(option) => handleCountryChange(option)}
              onBlur={() => formik.setFieldTouched("country", true)}
              placeholder="Select country..."
              classNamePrefix="react-select"
            />
            {formik.touched.country && formik.errors.country && (
              <div className="text-danger mt-1">{formik.errors.country}</div>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="state">
            <Form.Label>
              State <span className="text-danger">*</span>
            </Form.Label>
            <Select
              options={stateOptions}
              value={formik.values.state}
              onChange={(option) => handleStateChange(option)}
              onBlur={() => formik.setFieldTouched("state", true)}
              placeholder="Select state..."
              isDisabled={!formik.values.country}
              classNamePrefix="react-select"
            />
            {formik.touched.state && formik.errors.state && (
              <div className="text-danger mt-1">{formik.errors.state}</div>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="city">
            <Form.Label>
              City <span className="text-danger">*</span>
            </Form.Label>
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
              <div className="text-danger mt-1">{formik.errors.city}</div>
            )}
          </Form.Group>
          <Form.Group className="mb-3" controlId="pincode">
            <Form.Label>
              Pincode <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="pincode"
              value={formik.values.pincode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter pincode"
              isInvalid={formik.touched.pincode && !!formik.errors.pincode}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.pincode}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              name="address"
              rows={5}
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter address"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="GSTNumber">
            <Form.Label>GST Number</Form.Label>
            <Form.Control
              type="text"
              name="GSTNumber"
              value={formik.values.GSTNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter GST number"
              isInvalid={formik.touched.GSTNumber && !!formik.errors.GSTNumber}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.GSTNumber}
            </Form.Control.Feedback>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button
              variant="secondary"
              onClick={onHide}
              className="me-2"
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={formik.isSubmitting}
            >
              Save
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditVendorModal;
