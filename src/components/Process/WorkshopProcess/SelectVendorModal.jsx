import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { workshopService } from "../../../services/Process/workshopService";

const SelectVendorModal = ({ show, onHide, selectedRows, onSubmit }) => {
  const [rightSelected, setRightSelected] = useState(false);
  const [leftSelected, setLeftSelected] = useState(false);
  const [rightVendor, setRightVendor] = useState(null);
  const [leftVendor, setLeftVendor] = useState(null);
  const [vendorNote, setVendorNote] = useState("");
  const [vendorOptions, setVendorOptions] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Log selectedRows for debugging
  console.log("selectedRows:", selectedRows);

  // Fetch vendors when the modal opens
  useEffect(() => {
    if (show) {
      const fetchVendors = async () => {
        setLoadingVendors(true);
        try {
          const response = await workshopService.getVendors();
          console.log("Vendors response:", response); // Debug log
          if (response.success) {
            const vendors = response?.data?.data?.docs?.map((vendor) => ({
              value: vendor._id,
              label: vendor.companyName,
            }));
            setVendorOptions(vendors);
          } else {
            toast.error(response.message);
            setVendorOptions([]);
          }
        } catch (error) {
          console.error("Error fetching vendors:", error); // Debug log
          toast.error("Failed to fetch vendors");
          setVendorOptions([]);
        } finally {
          setLoadingVendors(false);
        }
      };
      fetchVendors();
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rightSelected && !leftSelected) {
      toast.warning("Please select at least one side (Right or Left).");
      return;
    }

    let successCount = 0;

    for (const row of selectedRows) {
      try {
        const {
          orderId,
          saleId,
          fullOrder: { store, powerAtTime, leftLens, rightLens },
        } = row;

        // common data
        const basePayload = {
          sale: saleId,
          order: orderId,
          store,
          powerAtTime: {
            specs: powerAtTime?.specs,
            contacts: powerAtTime?.contacts,
          },
        };

        // ---- LEFT SIDE ----
        if (leftSelected && leftVendor && leftLens) {
          const leftPayload = {
            ...basePayload,
            lens: {
              item: leftLens.item,
              barcode: leftLens.barcode,
              sku: leftLens.sku,
              mrp: leftLens.mrp,
              srp: leftLens.srp,
            },
            side: "left",
            vendor: leftVendor.value,
          };

          console.log("Creating Left JobWork:", leftPayload);
          const jobWorkRes = await workshopService.createJobWork(leftPayload);

          if (jobWorkRes?.success && jobWorkRes.data?.data?.id) {
            const jobWorkId = jobWorkRes.data.data.id;

            const updatePayload = {
              _id: orderId,
              currentLeftJobWork: jobWorkId,
              status: "inLab",
              vendorNote: vendorNote || null,
            };

            console.log("Updating order (Left):", updatePayload);
            const updateRes = await workshopService.updateOrderJobWork(
              orderId,
              updatePayload
            );

            if (updateRes.success) successCount++;
          }
        }

        // ---- RIGHT SIDE ----
        if (rightSelected && rightVendor && rightLens) {
          const rightPayload = {
            ...basePayload,
            lens: {
              item: rightLens.item,
              barcode: rightLens.barcode,
              sku: rightLens.sku,
              mrp: rightLens.mrp,
              srp: rightLens.srp,
            },
            side: "right",
            vendor: rightVendor.value,
          };

          console.log("Creating Right JobWork:", rightPayload);
          const jobWorkRes = await workshopService.createJobWork(rightPayload);

          if (jobWorkRes?.success && jobWorkRes.data?.data?.id) {
            const jobWorkId = jobWorkRes.data.data.id;

            const updatePayload = {
              _id: orderId,
              currentRightJobWork: jobWorkId,
              status: "inLab",
              vendorNote: vendorNote || null,
            };

            console.log("Updating order (Right):", updatePayload);
            const updateRes = await workshopService.updateOrderJobWork(
              orderId,
              updatePayload
            );

            if (updateRes.success) successCount++;
          }
        }
      } catch (err) {
        console.error("Error processing order:", err);
        toast.error("Error while processing order.");
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} order(s) processed successfully`);
      onSubmit({
        rightVendor: rightSelected ? rightVendor : null,
        leftVendor: leftSelected ? leftVendor : null,
        vendorNote: vendorNote || null,
        selectedRows,
      });
      onHide();
    } else {
      toast.error("No orders were processed successfully.");
    }
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
                isDisabled={!rightSelected || loadingVendors}
                isLoading={loadingVendors}
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
                isDisabled={!leftSelected || loadingVendors}
                isLoading={loadingVendors}
                classNamePrefix="react-select"
                instanceId="left-vendor-select"
                className="w-100"
              />
            </div>
          </div>
          <div className="mb-3">
            voli{" "}
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
              disabled={loadingVendors}
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
