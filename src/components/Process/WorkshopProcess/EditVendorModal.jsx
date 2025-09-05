import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Select from "react-select";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { workshopService } from "../../../services/Process/workshopService";

const EditVendorModal = ({ show, onHide, selectedRows, onSubmit }) => {
  const [rightVendor, setRightVendor] = useState(null);
  const [leftVendor, setLeftVendor] = useState(null);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [previousRightVendor, setPreviousRightVendor] = useState(null);
  const [previousLeftVendor, setPreviousLeftVendor] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  console.log("EditVendorModal", selectedRows);

  // Fetch vendors when the modal opens
  useEffect(() => {
    if (show) {
      const fetchVendors = async () => {
        setLoadingVendors(true);
        try {
          const response = await workshopService.getVendors();
          if (response.success) {
            const vendors =
              response?.data?.data?.docs?.map((vendor) => ({
                value: vendor._id,
                label: vendor.companyName,
              })) || [];
            setVendorOptions(vendors);

            // Set previous vendors based on the first selected row
            if (selectedRows.length > 0) {
              const firstRow = selectedRows[0];
              const rightJobWork = firstRow?.fullOrder?.currentRightJobWork;
              const leftJobWork = firstRow?.fullOrder?.currentLeftJobWork;

              // Find previous vendors from job work data
              if (rightJobWork?.vendor?._id) {
                const vendor = vendors.find(
                  (v) => v.value === rightJobWork.vendor._id
                );
                setPreviousRightVendor(vendor || null);
              }
              if (leftJobWork?.vendor?._id) {
                const vendor = vendors.find(
                  (v) => v.value === leftJobWork.vendor._id
                );
                setPreviousLeftVendor(vendor || null);
              }
            }
          } else {
            toast.error(response.message);
            setVendorOptions([]);
          }
        } catch (error) {
          toast.error("Failed to fetch vendors");
          setVendorOptions([]);
        } finally {
          setLoadingVendors(false);
        }
      };
      fetchVendors();
    }
  }, [show, selectedRows]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rightVendor && !leftVendor) {
      toast.warning("Please select at least one vendor (Right or Left).");
      return;
    }

    let successCount = 0;

    for (const row of selectedRows) {
      const order = row.fullOrder || row;
      console.log("Processing order:", order);

      const {
        _id: _id,
        product,
        rightLens,
        leftLens,
        sale,
        store,
        powerAtTime,
        currentRightJobWork,
        currentLeftJobWork,
      } = order;

      const orderId = order._id || order.id;

      // Base payload (common parts)
      const basePayload = {
        product: {
          item: product.item,
          barcode: product.barcode,
          sku: product.sku,
          mrp: product.mrp,
          srp: product.srp,
        },
        sale,
        order: orderId,
        store,
        powerAtTime,
      };

      let newRightJobWorkId = null;
      let newLeftJobWorkId = null;

      try {
        setLoadingSubmit(true);
        // 1. Cancel existing right job work
        if (rightVendor && currentRightJobWork?._id) {
          await workshopService.updateJobWorkStatus(
            currentRightJobWork._id,
            "canceled"
          );
        }

        // 2. Cancel existing left job work
        if (leftVendor && currentLeftJobWork?._id) {
          await workshopService.updateJobWorkStatus(
            currentLeftJobWork._id,
            "canceled"
          );
        }

        // 3. Create new Right job work
        if (rightVendor) {
          console.log("come in right part");

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

          const jobWorkResponse = await workshopService.createJobWork(
            rightPayload
          );

          if (jobWorkResponse?.data?.success) {
            newRightJobWorkId = jobWorkResponse?.data?.data?._id;
          } else {
            toast.error(
              `Failed to create job work for right side of order ${orderId}`
            );
            continue;
          }
        }

        // 4. Create new Left job work
        if (leftVendor) {
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

          const jobWorkResponse = await workshopService.createJobWork(
            leftPayload
          );
          if (jobWorkResponse?.data?.success) {
            newLeftJobWorkId = jobWorkResponse?.data?.data?._id;
          } else {
            toast.error(
              `Failed to create job work for left side of order ${orderId}`
            );
            continue;
          }
        }
        // 5. Update order with new job works
        if (newRightJobWorkId || newLeftJobWorkId) {
          const orderPayload = {
            _id: orderId,
            currentRightJobWork:
              newRightJobWorkId || currentRightJobWork?._id || null,
            currentLeftJobWork:
              newLeftJobWorkId || currentLeftJobWork?._id || null,
            status: "inLab",
          };

          const orderResponse = await workshopService.updateOrderJobWork(
            orderId,
            orderPayload
          );
          console.log("orderResponse", orderResponse);

          if (orderResponse.success) {
            successCount++;
          } else {
            toast.error(`Failed to update order ${orderId}`);
          }
        }
      } catch (error) {
        toast.error(`Error processing order ${orderId}: ${error.message}`);
      } finally {
        setLoadingSubmit(false);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} order(s) updated successfully`);
      onSubmit({ rightVendor, leftVendor, selectedRows });
      onHide();
    } else {
      toast.error("No orders were updated successfully.");
    }
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
                isLoading={loadingVendors}
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
                isLoading={loadingVendors}
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
                isDisabled={loadingVendors}
                isLoading={loadingVendors}
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
                isDisabled={loadingVendors}
                isLoading={loadingVendors}
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
              disabled={loadingSubmit}
            >
              Submit
            </Button>
            <Button
              variant="outline-primary"
              className="border-slate-200 hover-border-slate-300 text-indigo-500"
              onClick={onHide}
              disabled={loadingVendors}
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
