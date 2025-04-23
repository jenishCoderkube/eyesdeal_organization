import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";

const AddFolderModal = ({ show, onHide, onSubmit }) => {
  const [folderName, setFolderName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderName) {
      onSubmit({ name: folderName });
      setFolderName("");
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header>
        <Modal.Title>Add Folder</Modal.Title>
        <Button variant="link" className="p-0" onClick={onHide}>
          <FaTimes />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Current Folder <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control type="text" value="/" readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Folder Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              required
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

export default AddFolderModal;
