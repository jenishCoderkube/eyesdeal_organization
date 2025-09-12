import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { vendorshopService } from "../../../services/Process/vendorshopService";

const VendorNoteModal = ({ show, onHide, selectedRow, onSubmit }) => {
  const [vendorNote, setVendorNote] = useState("");
  const [error, setError] = useState(null);

  // Update vendorNote state when selectedRow changes
  useEffect(() => {
    setVendorNote(selectedRow?.order?.vendorNote || "");
  }, [selectedRow]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const saleId = selectedRow?.sale?._id;
    if (!saleId) {
      setError("Sale ID not found.");
      return;
    }

    const response = await vendorshopService.updateOrderNote(
      saleId,
      vendorNote
    );

    if (response.success) {
      toast.success("Vendor note updated successfully!");
      onSubmit({ ...selectedRow, order: { ...selectedRow.order, vendorNote } });
      onHide();
    } else {
      setError(response.message);
    }
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
        {error && <Alert variant="danger">{error}</Alert>}
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
