import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { Modal, Button, Form } from "react-bootstrap";

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
  GST: Yup.string().trim(),
});

// Type options
const typeOptions = [
  { value: "lens_vendor", label: "Lens Vendor" },
  { value: "frame_vendor", label: "Frame Vendor" },
  { value: "accessory_vendor", label: "Accessory Vendor" },
];

const EditVendorModal = ({ show, onHide, editVendor }) => {
  // Formik setup
  const formik = useFormik({
    initialValues: {
      _id: editVendor?._id || "",
      companyName: editVendor?.companyName || "",
      phone: editVendor?.phone || "+91",
      email: editVendor?.email || "",
      type:
        editVendor?.type &&
        typeOptions.find((option) => option.value === editVendor.type)
          ? typeOptions.find((option) => option.value === editVendor.type)
          : null,
      country:
        editVendor?.country &&
        Country.getAllCountries().find((c) => c.isoCode === editVendor.country)
          ? Country.getAllCountries().find(
              (c) => c.isoCode === editVendor.country
            )
          : null,
      state:
        editVendor?.state && editVendor?.country
          ? State.getStatesOfCountry(editVendor.country).find(
              (s) => s.isoCode === editVendor.state
            )
          : null,
      city:
        editVendor?.city && editVendor?.country && editVendor?.state
          ? City.getCitiesOfState(editVendor.country, editVendor.state).find(
              (c) => c.name === editVendor.city
            )
          : null,
      pincode: editVendor?.pincode || "",
      address: editVendor?.address || "",
      GST: editVendor?.GST || "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Edit Vendor:", values);
      onHide();
    },
    enableReinitialize: true,
  });

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
          <Form.Group className="mb-3" controlId="GST">
            <Form.Label>GST Number</Form.Label>
            <Form.Control
              type="text"
              name="GST"
              value={formik.values.GST}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter GST number"
              isInvalid={formik.touched.GST && !!formik.errors.GST}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.GST}
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
