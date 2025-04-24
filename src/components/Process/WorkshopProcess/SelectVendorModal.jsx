import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { FaTimes } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const SelectVendorModal = ({ show, onHide, selectedRows, onSubmit }) => {
  const [rightSelected, setRightSelected] = useState(false);
  const [leftSelected, setLeftSelected] = useState(false);
  const [rightVendor, setRightVendor] = useState(null);
  const [leftVendor, setLeftVendor] = useState(null);
  const [vendorNote, setVendorNote] = useState("");

  // Mock vendor options (replace with actual data)
  const vendorOptions = [
    { value: "66b467f43058c5bb910af75b", label: "NAWAZ KAACH RX" },
    { value: "vendor2", label: "Vendor 2" },
    { value: "vendor3", label: "Vendor 3" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rightVendor: rightSelected ? rightVendor : null,
      leftVendor: leftSelected ? leftVendor : null,
      vendorNote,
      selectedRows,
    });
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      contentClassName="bg-white rounded shadow-lg overflow-auto"
    >
      <Modal.Header className="px-4 py-3 border-bottom border-slate-200 d-flex justify-content-between align-items-center">
        <Modal.Title className="font-semibold text-slate-800">
          Select Vendor
        </Modal.Title>
        <Button
          variant="link"
          onClick={onHide}
          className="p-0"
          style={{ lineHeight: 0 }}
        >
          <FaTimes
            className="text-secondary"
            style={{ width: "24px", height: "24px" }}
          />
        </Button>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleSubmit}>
          <p className="mb-4">{selectedRows.length} orders selected</p>
          <div className="row mb-3 align-items-center">
            <div className="col-auto">
              <Form.Check
                type="checkbox"
                name="rightSelected"
                checked={rightSelected}
                onChange={(e) => setRightSelected(e.target.checked)}
                id="rightSelected"
                className="fs-5"
              />
            </div>
            <div className="col">
              <Form.Label
                className="mb-1 text-sm font-normal font-weight-600"
                style={{ fontSize: "14px" }}
                htmlFor="rightVendor"
              >
                Right Vendor
              </Form.Label>
              <Select
                options={vendorOptions}
                value={rightVendor}
                onChange={setRightVendor}
                isDisabled={!rightSelected}
                classNamePrefix="react-select"
                instanceId="right-vendor-select"
                className="w-100"
              />
            </div>
          </div>
          <div className="row mb-3 align-items-center">
            <div className="col-auto">
              <Form.Check
                type="checkbox"
                name="leftSelected"
                checked={leftSelected}
                onChange={(e) => setLeftSelected(e.target.checked)}
                id="leftSelected"
                className="fs-5"
              />
            </div>
            <div className="col">
              <Form.Label
                className="mb-1 text-sm font-normal font-weight-600"
                style={{ fontSize: "14px" }}
                htmlFor="leftVendor"
              >
                Left Vendor
              </Form.Label>
              <Select
                options={vendorOptions}
                value={leftVendor}
                onChange={setLeftVendor}
                isDisabled={!leftSelected}
                classNamePrefix="react-select"
                instanceId="left-vendor-select"
                className="w-100"
              />
            </div>
          </div>
          <div className="mb-3">
            <Form.Label
              className="mb-1 text-sm font-medium"
              htmlFor="vendorNote"
            >
              Vendor Note
            </Form.Label>
            <Form.Control
              as="textarea"
              name="vendorNote"
              value={vendorNote}
              onChange={(e) => setVendorNote(e.target.value)}
              rows={5}
              className="w-100"
            />
          </div>
          <div>
            <Button
              type="submit"
              variant="primary"
              className="bg-primary hover-bg-primary-dark text-white"
            >
              Submit
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default SelectVendorModal;
