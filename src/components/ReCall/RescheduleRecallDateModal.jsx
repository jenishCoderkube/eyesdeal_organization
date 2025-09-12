import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { recallService } from "../../services/recallService";

function RescheduleRecallDateModal({
  closeModal,
  selectedRecall,
  refreshSalesData,
}) {
  const [recallDate, setRecallDate] = useState(
    selectedRecall?.recallDate || ""
  );
  const [rescheduleNotes, setRescheduleNotes] = useState(
    selectedRecall?.rescheduleNotes || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recallDate) {
      toast.error("Recall date cannot be empty");
      return;
    }
    if (!rescheduleNotes.trim()) {
      toast.error("Reschedule notes cannot be empty");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      id: selectedRecall._id,
      recallDate,
      rescheduleNotes,
      updateNotes: selectedRecall?.updateNotes || "",
    };

    try {
      const response = await recallService.updateRecallNote(payload);

      if (response.data.success) {
        toast.success("Recall rescheduled successfully");
        if (refreshSalesData) {
          await refreshSalesData();
        }
        closeModal();
      } else {
        toast.error(response.data.message || "Failed to reschedule recall");
      }
    } catch (error) {
      toast.error("Failed to reschedule recall");
      console.error("Reschedule Recall API Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={true} onHide={closeModal} centered size="md">
      <Modal.Header closeButton className="border-bottom py-3 ">
        <Modal.Title className="font-semibold text-slate-800 h6">
          Reschedule Recall Date
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
          <div className="w-full">
            <Form.Label className="block text-sm font-medium mb-1">
              Recall Date
            </Form.Label>
            <Form.Control
              type="date"
              name="reCallDate"
              value={recallDate}
              onChange={(e) => setRecallDate(e.target.value)}
              class
              swojego="w-full"
              autoComplete="off"
            />
          </div>
          <div>
            <Form.Label className="block text-sm font-medium mb-1">
              Reschedule Notes
            </Form.Label>
            <Form.Control
              as="textarea"
              name="rescheduleNotes"
              rows={5}
              value={rescheduleNotes}
              onChange={(e) => setRescheduleNotes(e.target.value)}
              placeholder="Enter reschedule notes"
              className="w-full"
            />
          </div>
          <div>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default RescheduleRecallDateModal;
