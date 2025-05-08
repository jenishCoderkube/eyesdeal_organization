import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";

function UpdateRecallNoteModel({
  closeModal,
  selectedRecall,
  refreshSalesData,
}) {
  const [recallStatus, setRecallStatus] = useState(
    selectedRecall?.recallStatus || false
  );
  const [notes, setNotes] = useState(selectedRecall?.updateNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error("Notes cannot be empty");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      id: selectedRecall._id,
      recallStatus,
      rescheduleNotes: selectedRecall?.rescheduleNotes || "",
      updateNotes: notes,
    };

    try {
      const response = await axios.patch(
        "https://devnode.coderkubes.com/eyesdeal-api/report/recall",
        payload
      );

      if (response.data.success) {
        toast.success("Recall updated successfully");
        if (refreshSalesData) {
          await refreshSalesData();
        }
        closeModal();
      } else {
        toast.error(response.data.message || "Failed to update recall");
      }
    } catch (error) {
      toast.error("Failed to update recall");
      console.error("Update Recall API Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={true} onHide={closeModal} centered size="md">
      <Modal.Header closeButton className="border-bottom py-3">
        <Modal.Title className="font-weight-bold  h6 text-dark">
          Update Recall
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <div className="mb-3 d-flex align-items-center gap-2">
            <Form.Check
              type="checkbox"
              id="recallStatus"
              checked={recallStatus}
              onChange={(e) => setRecallStatus(e.target.checked)}
              label="Recall Status"
            />
          </div>
          <div className="mb-3">
            <Form.Label className="d-block font-weight-medium mb-1">
              Notes
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter update notes"
              className="w-100"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="bg-indigo-500 text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default UpdateRecallNoteModel;
