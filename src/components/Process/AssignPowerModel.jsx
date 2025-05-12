import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { shopProcessService } from "../../services/Process/shopProcessService";

function AssignPowerModel({ closeAPModal, selectedAP, refreshSalesData }) {
  const [activeCustStatus, setActiveCustStatus] = useState("Specs");
  const [prescriptions, setPrescriptions] = useState({
    specs: [],
    contacts: [],
  });
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const custstatus = ["Specs", "Contact"];

  // Fetch user prescriptions on mount
  useEffect(() => {
    const fetchPrescriptions = async () => {
      setIsLoading(true);
      try {
        // Assume selectedAP.fullSale.customer contains the customer ID
        const customerId = selectedAP?._id;
        if (!customerId) {
          toast.error("Customer ID not found");
          return;
        }

        const response = await shopProcessService.getUser(customerId);

        if (response.success) {
          const user = response?.data?.data?.docs?.[0];
          const specsPrescriptions = user?.prescriptions.filter(
            (p) => p.__t === "specs"
          );
          const contactsPrescriptions = user?.prescriptions.filter(
            (p) => p.__t === "contacts"
          );
          setPrescriptions({
            specs: specsPrescriptions,
            contacts: contactsPrescriptions,
          });
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        // toast.error("Failed to fetch prescriptions");
        console.error("getUser API Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [selectedAP]);

  const handleAssign = async () => {
    if (!selectedPrescription) {
      toast.error("Please select a prescription to assign");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      powerAtTime: {
        [activeCustStatus.toLowerCase()]: selectedPrescription._id,
      },
    };

    try {
      const response = await shopProcessService.updateSale(
        selectedAP._id,
        payload
      );

      if (response.success) {
        toast.success("Power assigned successfully");
        if (refreshSalesData) {
          await refreshSalesData(); // Await to ensure refresh completes
        }
        closeAPModal();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to assign power");
      console.error("updateSale API Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render prescription table based on active tab
  const renderPrescriptionTable = () => {
    const data = prescriptions[activeCustStatus.toLowerCase()];
    if (isLoading) {
      return (
        <div className="text-center py-3">
          <div className="spinner-border" role="status">
            <span className="sr-only"></span>
          </div>
        </div>
      );
    }
    if (!data || data.length === 0) {
      return (
        <p className="text-muted">No {activeCustStatus} prescriptions found</p>
      );
    }

    return (
      <div className="table-responsive px-2">
        <table className="table table-bordered text-center table-sm align-middle">
          <thead>
            <tr style={{ backgroundColor: "#f2f7fc", color: "#64748b" }}>
              <th>Select</th>
              {activeCustStatus === "Specs"
                ? [
                    "R SPH (D)",
                    "R CYL (D)",
                    "R AXIS",
                    "R VISION",
                    "R ADD",
                    "L SPH (D)",
                    "L CYL (D)",
                    "L AXIS",
                    "L VISION",
                    "L ADD",
                    "IPD",
                  ]
                : [
                    "R SPH (D)",
                    "R CYL (D)",
                    "R AXIS",
                    "R ADD",
                    "L SPH (D)",
                    "L CYL (D)",
                    "L AXIS",
                    "L ADD",
                    "K",
                    "DIA",
                    "BC",
                  ].map((heading, idx) => (
                    <th key={idx} className="small fw-semibold">
                      {heading}
                    </th>
                  ))}
            </tr>
          </thead>
          <tbody>
            {data.map((prescription) => (
              <tr key={prescription._id}>
                <td>
                  <input
                    type="radio"
                    name="prescription"
                    checked={selectedPrescription?._id === prescription._id}
                    onChange={() => setSelectedPrescription(prescription)}
                  />
                </td>
                {activeCustStatus === "Specs" ? (
                  <>
                    <td>{prescription.right.distance.sph || "-"}</td>
                    <td>{prescription.right.distance.cyl || "-"}</td>
                    <td>{prescription.right.distance.axis || "-"}</td>
                    <td>{prescription.right.distance.vs || "-"}</td>
                    <td>{prescription.right.distance.add || "-"}</td>
                    <td>{prescription.left.distance.sph || "-"}</td>
                    <td>{prescription.left.distance.cyl || "-"}</td>
                    <td>{prescription.left.distance.axis || "-"}</td>
                    <td>{prescription.left.distance.vs || "-"}</td>
                    <td>{prescription.left.distance.add || "-"}</td>
                    <td>{prescription.ipd || "-"}</td>
                  </>
                ) : (
                  <>
                    <td>{prescription.right.distance.sph || "-"}</td>
                    <td>{prescription.right.distance.cyl || "-"}</td>
                    <td>{prescription.right.distance.axis || "-"}</td>
                    <td>{prescription.right.distance.add || "-"}</td>
                    <td>{prescription.left.distance.sph || "-"}</td>
                    <td>{prescription.left.distance.cyl || "-"}</td>
                    <td>{prescription.left.distance.axis || "-"}</td>
                    <td>{prescription.left.distance.add || "-"}</td>
                    <td>{prescription.right.k || "-"}</td>
                    <td>{prescription.right.dia || "-"}</td>
                    <td>{prescription.right.bc || "-"}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section
      className="modal small"
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
        overflowY: "auto",
        padding: "20px",
      }}
    >
      <div
        className="modal-dialog"
        role="document"
        style={{
          width: "100%",
          maxWidth: "900px",
          backgroundColor: "#fff",
          borderRadius: "5px",
          overflow: "hidden",
          boxShadow: "0 5px 30px rgba(0,0,0,0.3)",
          padding: "0px",
        }}
      >
        <div className="modal-content border-0">
          <div className="modal-header border-bottom p-0">
            <button
              type="button"
              className="btn-close "
              style={{ width: "50px", height: "50px" }}
              onClick={closeAPModal}
              aria-label="Close"
            ></button>
          </div>

          <div className="px-3 pb-3">
            <div className="mt-3">
              <div className="d-flex gap-3 pb-2" style={{ minWidth: "600px" }}>
                {custstatus.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setActiveCustStatus(status);
                      setSelectedPrescription(null); // Reset selection when switching tabs
                    }}
                    className={`bg-transparent border-0 pb-2 px-1 fw-medium 
                      ${
                        activeCustStatus === status
                          ? "text-primary border-bottom border-primary"
                          : "text-secondary"
                      } 
                      hover:text-dark focus:outline-none`}
                    style={{ boxShadow: "none", outline: "none" }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div
              className="border-bottom"
              style={{ margin: "-8px 0px 33px 0px" }}
            ></div>

            <div className="pb-2">
              <h6 className="mb-1 h6">{activeCustStatus} Prescriptions</h6>
              {renderPrescriptionTable()}
            </div>

            <div>
              <button
                className="btn btn-primary mt-1"
                onClick={handleAssign}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AssignPowerModel;
