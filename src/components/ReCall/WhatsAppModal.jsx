import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

function WhatsAppModal({ closeModal, selectedRow }) {
  const [phone, setPhone] = useState(selectedRow?.customerNumber || "");
  const [message, setMessage] = useState(
    `Hi ${
      selectedRow?.customerName || ""
    }, It’s been a while since your last visit! We recommend stopping by for a new eye check-up and to explore our latest eyewear collection. We'd love to see you again and help you with any optical needs!`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !message.trim()) {
      toast.error("Phone number and message cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      // Placeholder for WhatsApp API call
      // Replace with actual API integration when available
      console.log("Sending WhatsApp message:", { phone, message });
      toast.success("Message sent successfully");
      closeModal();
    } catch (error) {
      toast.error("Failed to send message");
      console.error("WhatsApp API Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={true}
      onHide={closeModal}
      centered
      size="md"
      className="max-w-2xl"
      style={{ maxHeight: "90vh", overflowY: "auto" }}
    >
      <Modal.Header closeButton></Modal.Header>

      <Modal.Body className="p-4">
        <Form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label className="block text-sm font-medium mb-1 text-slate-800">
              Phone Number
            </Form.Label>
            <Form.Control
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-100"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label className="block text-sm font-medium mb-1 text-slate-800">
              Message
            </Form.Label>
            <Form.Control
              as="textarea"
              id="message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="w-100"
            />
          </Form.Group>
          <div>
            <Button
              type="submit"
              variant="success"
              className="text-white hover:bg-success-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default WhatsAppModal;
