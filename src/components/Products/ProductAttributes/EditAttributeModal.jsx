import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

function EditAttributeModal({
  show,
  onHide,
  attribute,
  type = "brand",
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
  });

  // Update formData when attribute prop changes
  useEffect(() => {
    if (attribute) {
      setFormData({
        id: attribute.id || "",
        name: attribute.name || "",
      });
    }
  }, [attribute]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      dialogClassName="w-full max-w-2xl max-h-[90vh]"
      contentClassName="bg-white rounded shadow-lg overflow-auto"
    >
      <Modal.Header closeButton className=" border-bottom border-slate-200">
        <Modal.Title className="font-semibold text-slate-800">
          Edit {type}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
          <Form.Group>
            <Form.Label className="block text-sm font-medium mb-1">
              System ID <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="id"
              value={formData.id}
              disabled
              className="w-100"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="block text-sm font-medium mb-1">
              Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-100"
              placeholder="Enter name"
            />
          </Form.Group>
          <div>
            <Button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              Submit
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditAttributeModal;
