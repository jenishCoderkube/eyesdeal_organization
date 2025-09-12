import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Modal, Button, Form } from "react-bootstrap";
import { userService } from "../../../services/userService";
import { FaTimes } from "react-icons/fa";

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string().trim().required("Reference Name is required"),
});

const EditReferenceModal = ({ show, onHide, onSubmit, editReference }) => {
  // Formik setup
  const formik = useFormik({
    initialValues: {
      id: "",
      name: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const data = {
        id: values._id || values.id,
        name: values.name,
      };
      onSubmit && onSubmit(data);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (show) {
      fetchReferenceDetails();
    } else {
      formik.resetForm();
    }
  }, [show]);

  const fetchReferenceDetails = () => {
    userService
      .getMarketingReferenceById(editReference?._id)
      .then((res) => {
        formik.setValues(res.data?.data);
      })
      .catch((e) => console.log("Failed to fetch reference details: ", e));
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      // backdrop="static"
      keyboard={false}
    >
      <Modal.Header className="d-flex justify-content-between align-items-center">
        <Modal.Title>Edit Reference</Modal.Title>
        <Button
          variant="link"
          onClick={onHide}
          style={{
            fontSize: "1.5rem", // Larger icon size
            color: "#000", // Black color, adjust as needed
            textDecoration: "none",
            padding: "0",
            lineHeight: "1",
          }}
          aria-label="Close"
        >
          <FaTimes className=" opacity-75" />
        </Button>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={formik.handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label className="fw-medium">
              Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter reference name"
              isInvalid={formik.touched.name && !!formik.errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {formik.errors.name}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="id">
            <Form.Label className="fw-medium">
              Id <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="id"
              value={formik.values._id}
              disabled
              readOnly
            />
          </Form.Group>
          <div className="d-flex justify-content-start mt-4">
            <Button
              variant="primary"
              type="submit"
              className="me-2 custom-button-bgcolor"
              disabled={formik.isSubmitting}
            >
              Submit
            </Button>
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditReferenceModal;
