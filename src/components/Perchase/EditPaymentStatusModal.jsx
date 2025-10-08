import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";

const statusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "Rejected", label: "Rejected" },
  { value: "Success", label: "Success" },
];

const EditPaymentStatusModal = ({ show, onHide, purchaseItem, onUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    if (purchaseItem) {
      setSelectedStatus({
        value: purchaseItem.paymentStatus || "Pending",
        label: purchaseItem.paymentStatus || "Pending",
      });
    }
  }, [purchaseItem]);

  const handleUpdate = () => {
    if (!selectedStatus) return;
    onUpdate(selectedStatus.value); // Pass updated status to parent
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Payment Status</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {purchaseItem ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Purchase Order ID</Form.Label>
              <Form.Control type="text" value={purchaseItem._id} disabled />
            </Form.Group>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Select
                options={statusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="Select status..."
              />
            </Form.Group>
          </>
        ) : (
          <p>No purchase selected.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdate}
          disabled={!selectedStatus}
        >
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPaymentStatusModal;
