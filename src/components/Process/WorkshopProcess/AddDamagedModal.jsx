import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const AddDamagedModal = ({ show, onHide, selectedRows, onSubmit }) => {
  const [rightDamaged, setRightDamaged] = useState(false);
  const [leftDamaged, setLeftDamaged] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rightDamaged,
      leftDamaged,
      selectedRows,
    });
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="md"
      contentClassName="bg-white rounded shadow-lg overflow-auto"
      style={{ maxHeight: "90vh" }}
    >
      <Modal.Header className="px-4 py-3 border-bottom border-slate-200 d-flex justify-content-between align-items-center">
        <Modal.Title className="font-semibold text-dark">
          Add Damaged
        </Modal.Title>
        <Button
          variant="link"
          onClick={onHide}
          className="p-0 text-secondary"
          style={{ lineHeight: 0 }}
        >
          <FaTimes style={{ width: "24px", height: "24px" }} />
        </Button>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <p className="mb-4">Previous Damage 0</p>
          <div className="row mb-2 align-items-center">
            <div className="col-auto">
              <Form.Check
                type="checkbox"
                name="rightDamaged"
                checked={rightDamaged}
                onChange={(e) => setRightDamaged(e.target.checked)}
                id="rightDamaged"
                className="fs-5"
              />
            </div>
            <div className="col">
              <Form.Label
                className="mb-0 text-sm font-medium"
                htmlFor="rightDamaged"
              >
                Right
              </Form.Label>
            </div>
          </div>
          <div className="row mb-2 align-items-center">
            <div className="col-auto">
              <Form.Check
                type="checkbox"
                name="leftDamaged"
                checked={leftDamaged}
                onChange={(e) => setLeftDamaged(e.target.checked)}
                id="leftDamaged"
                className="fs-5"
              />
            </div>
            <div className="col">
              <Form.Label
                className="mb-0 text-sm font-medium"
                htmlFor="leftDamaged"
              >
                Left
              </Form.Label>
            </div>
          </div>
          <div className="d-flex gap-3">
            <Button
              type="submit"
              variant="primary"
              className="bg-primary hover-bg-primary-dark text-white"
            >
              Submit
            </Button>
            <Button
              variant="outline-primary"
              className="border-slate-200 hover-border-slate-300 text-indigo-500"
              onClick={onHide}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddDamagedModal;
