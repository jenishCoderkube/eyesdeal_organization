import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { mediaService } from "../../services/mediaService";
import { toast } from "react-toastify";
import CommonButton from "../CommonButton/CommonButton";

const AddFolderModal = ({ show, onHide, onSubmit }) => {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function extractMediaPath(input) {
    const prefix = "/media-library";

    if (input === prefix) {
      return "/";
    }

    if (input.startsWith(prefix)) {
      let result = input.slice(prefix.length);

      // Remove leading slash if it exists
      if (result.startsWith("/")) {
        result = result.slice(1);
      }

      // Ensure trailing slash
      if (!result.endsWith("/")) {
        result += "/";
      }

      return result;
    }

    return input;
  }

  const path = useLocation();
  let currentFolder = extractMediaPath(path?.pathname);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!folderName.trim()) {
      setError("Folder name is required");
      return;
    }

    setError("");

    const data = {
      currentFolder: currentFolder,
      folderName: folderName,
    };

    setLoading(true);

    try {
      const response = await mediaService.addFolder(data);
      if (response.success) {
        setFolderName("");
        onHide();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal centered show={show} onHide={onHide} size="lg">
      <Modal.Header className="d-flex justify-content-between align-items-center">
        <Modal.Title>Add Folder</Modal.Title>
        <Button
          variant="link"
          className="text-dark p-0 border-0"
          onClick={onHide}
        >
          <FaTimes size={20} />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Current Folder <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control type="text" value={currentFolder} disabled />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Folder Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                if (error) setError("");
              }}
              required
            />
            {error && <div className="text-danger mt-1">{error}</div>}
          </Form.Group>

          <CommonButton
            loading={loading}
            buttonText="Submit"
            onClick={(e) => handleSubmit(e)}
            className="btn btn-primary w-auto bg-indigo-500 hover-bg-indigo-600 text-white"
          />
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddFolderModal;
