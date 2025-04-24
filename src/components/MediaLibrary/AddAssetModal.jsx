import React, { useState } from "react";
import { Modal, Button, Form, Nav, ListGroup } from "react-bootstrap";
import { FaTimes, FaTrash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { uploadToMediaLibrary } from "../../services/uploadToMediaLibrary";
import CommonButton from "../CommonButton/CommonButton";
import { toast } from "react-toastify";

const AddAssetModal = ({ show, onHide, onSubmit }) => {
  const [activeTab, setActiveTab] = useState("image");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileList, setFileList] = useState([]); // Array of { name, file }
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (fileList.length > 0) {
      fileList.forEach(async ({ name, file }) => {
        // onSubmit({
        //   name,
        //   url: URL.createObjectURL(file), // In production, upload to a server
        // });
        const response = await uploadToMediaLibrary(file, currentFolder, name);
        if (response.success) {
          setLoading(false);

          setFileList([]);
          setFileName("");
          setSelectedFile(null);
          onHide();
        } else {
          toast.error(response.message);
          setLoading(false);
        }
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header className="d-flex justify-content-between align-items-center">
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
            <Form.Control type="text" value={currentFolder} disabled />
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

          {/* <Button
            variant="primary"
            type="submit"
            disabled={fileList.length === 0}
          >
            Submit
          </Button> */}

          {/* <div className="text-end"> */}
          <Button
            type="submit"
            variant="primary"
            disabled={fileList.length === 0}
          >
            {loading ? (
              <span className="indicator-progress" style={{ display: "block" }}>
                Please wait...
                <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
              </span>
            ) : (
              <span className="indicator-label">Submit</span>
            )}
          </Button>
          {/* </div> */}
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddAssetModal;
