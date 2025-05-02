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
    console.log("handleSubmit called with:", {
      rightSelected,
      leftSelected,
      rightVendor,
      leftVendor,
      selectedRows,
    }); // Debug log

    if (!rightSelected && !leftSelected) {
      toast.warning("Please select at least one side (Right or Left).");
      return;
    }

    let successCount = 0;

    for (const row of selectedRows) {
      const { _id: orderId, product, lens, sale, store, powerAtTime } = row;
      console.log("Processing row:", row); // Debug log

      // Validate required fields, allowing empty product.item
      if (
        !orderId ||
        (product?.item &&
          Object.keys(product.item).length > 0 &&
          (!product.item._id ||
            !product.barcode ||
            !product.sku ||
            !product.mrp ||
            !product.srp)) ||
        !lens?.item?._id ||
        !lens?.barcode ||
        !lens?.sku ||
        !lens?.mrp ||
        !lens?.srp ||
        !sale?._id ||
        !store?._id ||
        !powerAtTime?.specs?._id
      ) {
        toast.error(
          `Missing required fields for order ${orderId || "unknown"}`
        );
        continue;
      }

      // Prepare common payload data
      const basePayload = {
        product:
          product?.item && Object.keys(product.item).length > 0
            ? {
                item: product.item._id,
                barcode: product.barcode,
                sku: product.sku,
                mrp: product.mrp,
                srp: product.srp,
              }
            : null, // Allow null product if not present
        lens: {
          item: lens.item._id,
          barcode: lens.barcode,
          sku: lens.sku,
          mrp: lens.mrp,
          srp: lens.srp,
        },
        sale: sale._id,
        order: orderId,
        store: store._id,
        powerAtTime: {
          specs: powerAtTime.specs._id,
        },
      };

      try {
        // Handle Left Side
        if (leftSelected && leftVendor) {
          const leftPayload = {
            ...basePayload,
            side: "left",
            vendor: leftVendor.value,
          };
          console.log("Creating left job work with payload:", leftPayload); // Debug log

          // Create job work for left side
          const jobWorkResponse = await workshopService.createJobWork(
            leftPayload
          );
          console.log("Left job work response:", jobWorkResponse); // Debug log

          if (jobWorkResponse.data?.success && jobWorkResponse.data.data.id) {
            const jobWorkId = jobWorkResponse.data.data.id;

            // Update order with left job work
            const orderPayload = {
              _id: orderId,
              currentLeftJobWork: jobWorkId,
              status: "inLab",
              vendorNote: vendorNote || null,
            };
            console.log("Updating order with payload:", orderPayload); // Debug log
            const orderResponse = await workshopService.updateOrderJobWork(
              orderId,
              orderPayload
            );
            console.log("Order update response:", orderResponse); // Debug log

            if (orderResponse.success) {
              successCount++;
            } else {
              toast.error(
                `Failed to update order ${orderId} for left side: ${orderResponse.message}`
              );
            }
          } else {
            toast.error(
              `Failed to create job work for left side of order ${orderId}: ${jobWorkResponse.message}`
            );
          }
        }

        // Handle Right Side
        if (rightSelected && rightVendor) {
          const rightPayload = {
            ...basePayload,
            side: "right",
            vendor: rightVendor.value,
          };
          console.log("Creating right job work with payload:", rightPayload); // Debug log

          // Create job work for right side
          const jobWorkResponse = await workshopService.createJobWork(
            rightPayload
          );
          console.log("Right job work response:", jobWorkResponse); // Debug log

          if (jobWorkResponse.data?.success && jobWorkResponse.data.data.id) {
            const jobWorkId = jobWorkResponse.data.data.id;

            // Update order with right job work
            const orderPayload = {
              _id: orderId,
              currentRightJobWork: jobWorkId,
              status: "inLab",
              vendorNote: vendorNote || null,
            };
            console.log("Updating order with payload:", orderPayload); // Debug log
            const orderResponse = await workshopService.updateOrderJobWork(
              orderId,
              orderPayload
            );
            console.log("Order update response:", orderResponse); // Debug log

            if (orderResponse.success) {
              successCount++;
            } else {
              toast.error(
                `Failed to update order ${orderId} for right side: ${orderResponse.message}`
              );
            }
          } else {
            toast.error(
              `Failed to create job work for right side of order ${orderId}: ${jobWorkResponse.message}`
            );
          }
        }
      } catch (error) {
        console.error(`Error processing order ${orderId}:`, error); // Debug log
        toast.error(`Error processing order ${orderId}: ${error.message}`);
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
