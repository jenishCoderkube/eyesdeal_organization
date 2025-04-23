import React, { useState } from "react";
import { Modal, Button, Form, Nav, ListGroup } from "react-bootstrap";
import { FaTimes, FaTrash } from "react-icons/fa";

const AddAssetModal = ({ show, onHide, onSubmit }) => {
  const [activeTab, setActiveTab] = useState("image");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]); // Array of { name, file }

  const handleAddFile = () => {
    if (fileName && selectedFile) {
      setFileList((prev) => [...prev, { name: fileName, file: selectedFile }]);
      setFileName("");
      setSelectedFile(null);
      // Clear the file input
      document.getElementById("fileInput").value = null;
    }
  };

  const handleRemoveFile = (index) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fileList.length > 0) {
      fileList.forEach(({ name, file }) => {
        onSubmit({
          name,
          url: URL.createObjectURL(file), // In production, upload to a server
        });
      });
      setFileList([]);
      setFileName("");
      setSelectedFile(null);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header>
        <Modal.Title>Add Asset</Modal.Title>
        <Button variant="link" className="p-0" onClick={onHide}>
          <FaTimes />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <Nav
          variant="tabs"
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Nav.Item>
            <Nav.Link eventKey="image">Add Image</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="file">Add File</Nav.Link>
          </Nav.Item>
        </Nav>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control type="text" value="/" readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>File Name</Form.Label>
            <Form.Control
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required={fileList.length === 0} // Required only if no files added
            />
          </Form.Group>
          <div className="mb-3">
            <h5>
              {activeTab === "image" ? "Photos (max 15 at a time)" : "Files"}
            </h5>
            <Form.Control
              id="fileInput"
              type="file"
              accept={activeTab === "image" ? "image/*" : "*"}
              onChange={(e) => setSelectedFile(e.target.files[0])}
              required={fileList.length === 0} // Required only if no files added
            />
          </div>
          <Button
            variant="secondary"
            onClick={handleAddFile}
            disabled={!fileName || !selectedFile}
            className="mb-3"
          >
            Add
          </Button>
          <hr />
          {fileList.length > 0 && (
            <div className="mb-3">
              <h5>Added Files</h5>
              <ListGroup>
                {fileList.map(({ name }, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {name}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <FaTrash />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          <Button
            variant="primary"
            type="submit"
            disabled={fileList.length === 0}
          >
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddAssetModal;
