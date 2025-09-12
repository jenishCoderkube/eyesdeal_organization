import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import workshopService from "../../../services/Process/workshopService";

const AddDamagedModal = ({ show, onHide, selectedRows, onSubmit, error }) => {
  const [rightDamaged, setRightDamaged] = useState(false);
  const [leftDamaged, setLeftDamaged] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log("selectedRows<<", selectedRows);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rightDamaged && !leftDamaged) {
      toast.warning("Please select at least one side (Left or Right)");
      return;
    }

    setLoading(true);

    try {
      for (const row of selectedRows) {
        const order = row.fullOrder;

        // 1. Mark old jobWorks as damaged
        const jobWorkIds = [];
        if (leftDamaged && order.currentLeftJobWork?._id) {
          jobWorkIds.push(order.currentLeftJobWork._id);
        }
        if (rightDamaged && order.currentRightJobWork?._id) {
          jobWorkIds.push(order.currentRightJobWork._id);
        }
        for (const jwId of jobWorkIds) {
          await workshopService.updateJobWorkStatus(jwId, "damaged");
        }

        // 2. Create new jobWorks
        const basePayload = {
          product: order.product,
          sale: order.sale,
          order: order._id,
          store: order.store,
          powerAtTime: order.powerAtTime,
        };

        let patchPayload = { _id: order._id }; // collect changes for order

        if (rightDamaged && order.rightLens) {
          const vendor = order.currentRightJobWork?.vendor;
          if (!vendor) {
            toast.error("No vendor found for Right JobWork");
          } else {
            const rightPayload = {
              ...basePayload,
              lens: order.rightLens,
              side: "right",
              vendor,
            };
            const res = await workshopService.createJobWork(rightPayload);
            if (!res.success) {
              toast.error("Failed to create Right JobWork");
            } else {
              console.log("res<<<", res?.data);

              patchPayload.currentRightJobWork = res.data?.data?._id; // update order
            }
          }
        }

        if (leftDamaged && order.leftLens) {
          const vendor = order.currentLeftJobWork?.vendor;
          if (!vendor) {
            toast.error("No vendor found for Left JobWork");
          } else {
            const leftPayload = {
              ...basePayload,
              lens: order.leftLens,
              side: "left",
              vendor,
            };
            const res = await workshopService.createJobWork(leftPayload);
            if (!res.success) {
              toast.error("Failed to create Left JobWork");
            } else {
              patchPayload.currentLeftJobWork = res.data?.data?._id; // update order
            }
          }
        }

        // Always update order status to "inLab" after new jobWork(s)
        patchPayload.status = "inLab";
        console.log("patchPayload", patchPayload);

        // 3. PATCH order
        await workshopService.updateOrder(patchPayload);
      }

      toast.success("Damaged job work(s) created successfully");
      onSubmit({ rightDamaged, leftDamaged, selectedRows });
      onHide();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while creating damaged job work");
    } finally {
      setLoading(false);
    }
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
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
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
