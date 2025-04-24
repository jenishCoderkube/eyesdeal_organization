import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { FaTimes } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const EditVendorModal = ({ show, onHide, selectedRows, onSubmit }) => {
  const [rightVendor, setRightVendor] = useState(null);
  const [leftVendor, setLeftVendor] = useState(null);

  // Mock vendor options (replace with actual data)
  const vendorOptions = [
    { value: "none", label: "None" },
    { value: "66b467f43058c5bb910af75b", label: "NAWAZ KAACH RX" },
    { value: "vendor2", label: "Vendor 2" },
    { value: "vendor3", label: "Vendor 3" },
  ];

  // Get previous vendors from the first selected row (or customize as needed)
  const previousRightVendor = selectedRows[0]?.vendor?.right
    ? {
        value: selectedRows[0].vendor.right,
        label: selectedRows[0].vendor.right,
      }
    : null;
  const previousLeftVendor = selectedRows[0]?.vendor?.left
    ? { value: selectedRows[0].vendor.left, label: selectedRows[0].vendor.left }
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rightVendor,
      leftVendor,
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
      style={{ maxHeight: "90vh" }}
    >
      <Modal.Header className="px-4 py-3 border-bottom border-slate-200 d-flex justify-content-between align-items-center">
        <Modal.Title className="font-semibold text-dark">
          Edit Vendor
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
          <p className="mb-4">Previous Vendors</p>
          <div className="row mb-3 align-items-center">
            <div className="col">
              <Form.Label
                className="mb-1 text-sm font-medium"
                htmlFor="previousRightVendor"
              >
                Previous Right Vendor
              </Form.Label>
              <Select
                options={vendorOptions}
                value={previousRightVendor}
                isDisabled={true}
                classNamePrefix="react-select"
                instanceId="previous-right-vendor-select"
                className="w-100"
              />
            </div>
          </div>
          <div className="row mb-3 align-items-center">
            <div className="col">
              <Form.Label
                className="mb-1 text-sm font-medium"
                htmlFor="previousLeftVendor"
              >
                Previous Left Vendor
              </Form.Label>
              <Select
                options={vendorOptions}
                value={previousLeftVendor}
                isDisabled={true}
                classNamePrefix="react-select"
                instanceId="previous-left-vendor-select"
                className="w-100"
              />
            </div>
          </div>
          <p className="mb-4">New Vendors</p>
          <div className="row mb-3 align-items-center">
            <div className="col">
              <Form.Label
                className="mb-1 text-sm font-medium"
                htmlFor="rightVendor"
              >
                New Right Vendor
              </Form.Label>
              <Select
                options={vendorOptions}
                value={rightVendor}
                onChange={setRightVendor}
                classNamePrefix="react-select"
                instanceId="right-vendor-select"
                className="w-100"
              />
            </div>
          </div>
          <div className="row mb-3 align-items-center">
            <div className="col">
              <Form.Label
                className="mb-1 text-sm font-medium"
                htmlFor="leftVendor"
              >
                New Left Vendor
              </Form.Label>
              <Select
                options={vendorOptions}
                value={leftVendor}
                onChange={setLeftVendor}
                classNamePrefix="react-select"
                instanceId="left-vendor-select"
                className="w-100"
              />
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

export default EditVendorModal;
