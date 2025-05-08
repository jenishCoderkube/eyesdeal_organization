import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { shopProcessService } from "../../services/Process/shopProcessService";

function PreviousNotesModel({
  closeNotesModal,
  selectedNotes,
  refreshSalesData,
}) {
  console.log("selectedNotesselectedNotes<<<", selectedNotes);

  const [updateNotes, setUpdateNotes] = useState(
    selectedNotes?.updateNotes || ""
  );
  const [rescheduleNotes, setRescheduleNotes] = useState(
    selectedNotes?.rescheduleNotes || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!updateNotes.trim() && !rescheduleNotes.trim()) {
      toast.error("At least one note field must be filled");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      updateNotes: updateNotes || "",
      rescheduleNotes: rescheduleNotes || "",
    };

    try {
      const response = await shopProcessService.updateSale(
        selectedNotes._id,
        payload
      );

      if (response.success) {
        toast.success("Notes updated successfully");
        if (refreshSalesData) {
          await refreshSalesData();
        }
        closeNotesModal();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to update notes");
      console.error("updateSale API Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={true} onHide={closeNotesModal} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title className="font-weight-bold text-dark">Notes</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3">
        <Form onSubmit={handleSubmit}>
          <div className="mb-3">
            <h6 className="font-weight-bold">Recall Update Notes</h6>
            <Form.Control
              type="text"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              placeholder="No recall update notes available"
              className="mt-2"
              disabled
            />
          </div>
          <div className="mb-3">
            <h6 className="font-weight-bold mt-2">Reschedule Notes</h6>
            <Form.Control
              type="text"
              value={rescheduleNotes}
              onChange={(e) => setRescheduleNotes(e.target.value)}
              placeholder="No reschedule notes available"
              className="mt-2"
              disabled
            />
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default PreviousNotesModel;
