import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useFormik } from "formik";
import * as Yup from "yup";

function VendorInvoiceModal({ show, onHide, onSubmit, loading }) {
  const formik = useFormik({
    initialValues: {
      invoiceNumber: "",
      invoiceDate: new Date(),
    },
    validationSchema: Yup.object({
      invoiceNumber: Yup.string().required("Invoice number is required"),
      invoiceDate: Yup.date().required("Invoice date is required"),
    }),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Vendor Invoice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={formik.handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Invoice Number</Form.Label>
            <Form.Control
              type="text"
              name="invoiceNumber"
              value={formik.values.invoiceNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              isInvalid={
                formik.touched.invoiceNumber && formik.errors.invoiceNumber
              }
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.invoiceNumber}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Invoice Date</Form.Label>
            <DatePicker
              selected={formik.values.invoiceDate}
              onChange={(date) => formik.setFieldValue("invoiceDate", date)}
              className="form-control"
              dateFormat="yyyy-MM-dd"
              autoComplete="off"
            />
            {formik.touched.invoiceDate && formik.errors.invoiceDate ? (
              <div className="text-danger small">
                {formik.errors.invoiceDate}
              </div>
            ) : null}
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button
              variant="secondary"
              onClick={onHide}
              className="me-2"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default VendorInvoiceModal;
