import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";

const VendorNoteModal = ({ show, onHide, selectedRow, onSubmit }) => {
  const [vendorNote, setVendorNote] = useState(selectedRow?.vendorNote || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...selectedRow, vendorNote });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="d-flex justify-content-between align-items-center">
        <Modal.Title>Vendor Note</Modal.Title>
        <Button
          variant="link"
          onClick={onHide}
          className="p-0"
          style={{ lineHeight: 0 }}
        >
          <FaTimes
            className="text-secondary"
            style={{ width: "20px", height: "20px" }}
          />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>System Id</Form.Label>
            <Form.Control
              type="text"
              value={selectedRow?._id || ""}
              disabled
              readOnly
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Vendor Note</Form.Label>
            <Form.Control
              type="text"
              value={vendorNote}
              onChange={(e) => setVendorNote(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default VendorNoteModal;
