import React, { useEffect, useState } from "react";

function PrescriptionModel({
  closePrescriptionModel,
  activeStatus,
  selectedCust,
}) {
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [activeCustStatus, setActiveCustStatus] = useState("Specs");
  const [currentIndex, setCurrentIndex] = useState(0); // Track current prescription
  const custstatus = ["Specs", "Contacts"];
  console.log("selectedCust", selectedCust);
  const filteredPrescriptions =
    selectedCust?.filter(
      (cust) => cust.__t.toLowerCase() === activeCustStatus.toLowerCase()
    ) || [];
  useEffect(() => {
    if (filteredPrescriptions.length > 0) {
      setActiveCustomer(
        filteredPrescriptions[currentIndex] || filteredPrescriptions[0]
      );
    } else {
      setActiveCustomer(null);
    }
  }, [filteredPrescriptions, currentIndex]);

  // Reset to first when tab changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCustStatus]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };
  // Navigation
  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < filteredPrescriptions.length - 1)
      setCurrentIndex((prev) => prev + 1);
  };

  // console.log(
  //   " activeCustomer",
  //   activeCustomer,
  //   activeCustomer.__t === "contacts"
  // );

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
          maxWidth: "1000px",
          backgroundColor: "#fff",
          borderRadius: "5px",
          overflow: "hidden",
          boxShadow: "0 5px 30px rgba(0,0,0,0.3)",
          padding: "0px",
        }}
      >
        <div className="modal-content border-0">
          <div className="modal-header border-bottom pb-2">
            <h5 className="modal-title mb-0 h6 fw-bold">View Prescriptions</h5>
            <button
              type="button"
              className="btn-close small"
              onClick={closePrescriptionModel}
              aria-label="Close"
            ></button>
          </div>

          <div className="px-3">
            <div className="overflow-x-auto mt-4">
              <div className="d-flex gap-3 pb-2" style={{ minWidth: "600px" }}>
                {custstatus.map((status) => (
                  <button
                    key={status}
                    onClick={() => setActiveCustStatus(status)}
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

            {activeCustomer ? (
              <>
                {activeCustStatus === "Specs" &&
                activeCustomer.__t === "specs" ? (
                  <>
                    <div className="px-3 pb-4">
                      <div className="row g-3 mb-3">
                        <div className="col-6 col-md-3">
                          <label htmlFor="date" className="form-label mb-0">
                            Date
                          </label>
                          <input
                            type="text"
                            id="date"
                            value={formatDate(activeCustomer.updatedAt)}
                            className="form-control bg-white"
                            disabled
                          />
                        </div>
                        <div className="col-6 col-md-3">
                          {activeStatus === "New Order" ? (
                            <>
                              <label
                                htmlFor="employeename"
                                className="form-label mb-0"
                              >
                                Employee Name
                              </label>
                              <input
                                type="text"
                                id="employeename"
                                className="form-control bg-white"
                                disabled
                              />
                            </>
                          ) : (
                            <>
                              <label
                                htmlFor="doctorname"
                                className="form-label mb-0"
                              >
                                Doctor Name
                              </label>
                              <input
                                type="text"
                                id="doctorname"
                                value={activeCustomer.doctorName || ""}
                                className="form-control bg-white"
                                disabled
                              />
                            </>
                          )}
                        </div>
                        <div className="col-6 col-md-3">
                          <label htmlFor="type" className="form-label mb-0">
                            Type
                          </label>
                          <input
                            type="text"
                            id="type"
                            value={activeCustomer.__t || ""}
                            className="form-control"
                            disabled
                          />
                        </div>
                        <div className="col-6 col-md-3">
                          <label
                            htmlFor="prescribeBy"
                            className="form-label mb-0"
                          >
                            Prescribed By
                          </label>
                          <input
                            type="text"
                            id="prescribeBy"
                            value={activeCustomer.prescribedBy || ""}
                            className="form-control bg-white"
                            disabled
                          />
                        </div>
                      </div>

                      {/* Specs Power Table */}
                      <div>
                        <h6 className="mb-1 h6">Specs Power</h6>
                        <div className="table-responsive px-2">
                          <table className="table table-bordered text-center table-sm align-middle">
                            <thead>
                              <tr>
                                {[
                                  "",
                                  "RESPH",
                                  "RECYL",
                                  "RAXIS",
                                  "RVISION",
                                  "ADD",
                                  "||",
                                  "LESPH",
                                  "LECYL",
                                  "LAXIS",
                                  "LVISION",
                                  "ADD",
                                ].map((heading, idx) => (
                                  <th
                                    key={idx}
                                    className="border-top border-bottom small fw-semibold"
                                    style={{
                                      backgroundColor: "#f2f7fc",
                                      color: "#64748b",
                                      padding: "12px",
                                    }}
                                  >
                                    {heading}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>D</td>
                                <td>
                                  {activeCustomer?.right?.distance?.sph || ""}
                                </td>
                                <td>
                                  {activeCustomer?.right?.distance?.cyl || ""}
                                </td>
                                <td>
                                  {activeCustomer?.right?.distance?.axis || ""}
                                </td>
                                <td>
                                  {activeCustomer?.right?.distance?.vs || ""}
                                </td>
                                <td>
                                  {activeCustomer?.right?.distance?.add || ""}
                                </td>
                                <td rowSpan={2}></td>
                                <td>
                                  {activeCustomer?.left?.distance?.sph || ""}
                                </td>
                                <td>
                                  {activeCustomer?.left?.distance?.cyl || ""}
                                </td>
                                <td>
                                  {activeCustomer?.left?.distance?.axis || ""}
                                </td>
                                <td>
                                  {activeCustomer?.left?.distance?.vs || ""}
                                </td>
                                <td>
                                  {activeCustomer?.left?.distance?.add || ""}
                                </td>
                              </tr>
                              <tr>
                                <td>N</td>
                                <td>
                                  {activeCustomer?.right?.near?.sph || ""}
                                </td>
                                <td>
                                  {activeCustomer?.right?.near?.cyl || ""}
                                </td>
                                <td>
                                  {activeCustomer?.right?.near?.axis || ""}
                                </td>
                                <td>{activeCustomer?.right?.near?.vs || ""}</td>
                                <td></td>
                                <td>{activeCustomer?.left?.near?.sph || ""}</td>
                                <td>{activeCustomer?.left?.near?.cyl || ""}</td>
                                <td>
                                  {activeCustomer?.left?.near?.axis || ""}
                                </td>
                                <td>{activeCustomer?.left?.near?.vs || ""}</td>
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <table
                        className="table table-sm text-center"
                        style={{ border: "1px solid lightgray", width: "100%" }}
                      >
                        <thead>
                          <tr>
                            <td>Psm(R)</td>
                            <td>{activeCustomer?.right?.psm || ""}</td>
                            <td>Pd(R)</td>
                            <td>{activeCustomer?.right?.pd || ""}</td>
                            <td>Fh(R)</td>
                            <td>{activeCustomer?.right?.fh || ""}</td>
                            <td>IPD</td>
                            <td>{activeCustomer?.ipd || ""}</td>
                            <td>Psm(L)</td>
                            <td>{activeCustomer?.left?.psm || ""}</td>
                            <td>Pd(L)</td>
                            <td>{activeCustomer?.left?.pd || ""}</td>
                            <td>Fh(L)</td>
                            <td>{activeCustomer?.left?.fh || ""}</td>
                          </tr>
                        </thead>
                      </table>

                      <table
                        className="table table-sm text-center"
                        style={{ border: "1px solid lightgray", width: "100%" }}
                      >
                        <thead>
                          <tr>
                            <td>Asize</td>
                            <td>{activeCustomer?.aSize || ""}</td>
                            <td>Bsize</td>
                            <td>{activeCustomer?.bSize || ""}</td>
                            <td>DBL</td>
                            <td>{activeCustomer?.dbl || ""}</td>
                            <td>Fth</td>
                            <td>{activeCustomer?.fth || ""}</td>
                            <td>Pdesign</td>
                            <td>{activeCustomer?.pDesign || ""}</td>
                            <td>Ftype</td>
                            <td>{activeCustomer?.ft || ""}</td>
                            <td>DE</td>
                            <td>{activeCustomer?.de || ""}</td>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        <p className="mb-0 small text-muted">
                          Showing <strong>{currentIndex + 1}</strong> of{" "}
                          <strong>{filteredPrescriptions.length}</strong>{" "}
                          {activeCustStatus}
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn border"
                          onClick={handlePrevious}
                          disabled={currentIndex === 0}
                        >
                          Previous
                        </button>
                        <button
                          className="btn border"
                          onClick={handleNext}
                          disabled={
                            currentIndex === filteredPrescriptions.length - 1
                          }
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                ) : activeCustStatus === "Contacts" &&
                  activeCustomer.__t === "contacts" ? (
                  <>
                    <div className="px-3 pb-4">
                      <div className="row g-3 mb-3">
                        <div className="col-6 col-md-3">
                          <label htmlFor="date" className="form-label mb-0">
                            Date
                          </label>
                          <input
                            type="text"
                            id="date"
                            value={formatDate(activeCustomer.updatedAt)}
                            className="form-control bg-white"
                            disabled
                          />
                        </div>
                        <div className="col-6 col-md-3">
                          {activeStatus === "New Order" ? (
                            <>
                              <label
                                htmlFor="employeename"
                                className="form-label mb-0"
                              >
                                Employee Name
                              </label>
                              <input
                                type="text"
                                id="employeename"
                                className="form-control bg-white"
                                disabled
                              />
                            </>
                          ) : (
                            <>
                              <label
                                htmlFor="doctorname"
                                className="form-label mb-0"
                              >
                                Doctor Name
                              </label>
                              <input
                                type="text"
                                id="doctorname"
                                value={activeCustomer.doctorName || ""}
                                className="form-control bg-white"
                                disabled
                              />
                            </>
                          )}
                        </div>
                        <div className="col-6 col-md-3">
                          <label htmlFor="type" className="form-label mb-0">
                            Type
                          </label>
                          <input
                            type="text"
                            id="type"
                            value={activeCustomer.__t || ""}
                            className="form-control"
                            disabled
                          />
                        </div>
                        <div className="col-6 col-md-3">
                          <label
                            htmlFor="prescribeBy"
                            className="form-label mb-0"
                          >
                            Prescribed By
                          </label>
                          <input
                            type="text"
                            id="prescribeBy"
                            value={activeCustomer.prescribedBy || ""}
                            className="form-control bg-white"
                            disabled
                          />
                        </div>
                      </div>

                      {/* Contact Power Table */}
                      <div>
                        <h6 className="mb-1 h6">Contact Power</h6>
                        <div className="table-responsive px-2">
                          <table className="table table-bordered text-center table-sm align-middle">
                            <thead>
                              <tr>
                                {[
                                  "",
                                  "RESPH",
                                  "RECYL",
                                  "RAXIS",
                                  "ADD",
                                  "||",
                                  "LESPH",
                                  "LECYL",
                                  "LAXIS",
                                  "Add",
                                ].map((heading, idx) => (
                                  <th
                                    key={idx}
                                    className="border-top border-bottom small fw-semibold"
                                    style={{
                                      backgroundColor: "#f2f7fc",
                                      color: "#64748b",
                                      padding: "12px",
                                    }}
                                  >
                                    {heading}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>D</td>
                                <td>
                                  {activeCustomer?.right?.distance?.sph || ""}
                                </td>
                                <td>
                                  {activeCustomer?.right?.distance?.cyl || ""}
                                </td>
                                <td>
                                  {activeCustomer?.right?.distance?.axis || ""}
                                </td>
                                <td>
                                  {activeCustomer?.right?.distance?.add || ""}
                                </td>
                                <td rowSpan={2}></td>
                                <td>
                                  {activeCustomer?.left?.distance?.sph || ""}
                                </td>
                                <td>
                                  {activeCustomer?.left?.distance?.cyl || ""}
                                </td>
                                <td>
                                  {activeCustomer?.left?.distance?.axis || ""}
                                </td>
                                <td>
                                  {activeCustomer?.left?.distance?.add || ""}
                                </td>
                              </tr>
                              <tr>
                                <td>N</td>
                                <td>
                                  {activeCustomer?.right?.near?.sph || ""}
                                </td>
                                <td>
                                  {activeCustomer?.right?.near?.cyl || ""}
                                </td>
                                <td>
                                  {activeCustomer?.right?.near?.axis || ""}
                                </td>
                                <td></td>
                                <td>{activeCustomer?.left?.near?.sph || ""}</td>
                                <td>{activeCustomer?.left?.near?.cyl || ""}</td>
                                <td>
                                  {activeCustomer?.left?.near?.axis || ""}
                                </td>
                                <td></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <table
                        className="table table-sm text-center"
                        style={{ border: "1px solid lightgray", width: "100%" }}
                      >
                        <thead>
                          <tr>
                            <td>K(R)</td>
                            <td>{activeCustomer?.right?.k || ""}</td>
                            <td>Dia(R)</td>
                            <td>{activeCustomer?.right?.dia || ""}</td>
                            <td>Bc(R)</td>
                            <td>{activeCustomer?.right?.bc || ""}</td>
                            <td>K(L)</td>
                            <td>{activeCustomer?.left?.k || ""}</td>
                            <td>Dia(L)</td>
                            <td>{activeCustomer?.left?.dia || ""}</td>
                            <td>Bc(L)</td>
                            <td>{activeCustomer?.left?.bc || ""}</td>
                          </tr>
                        </thead>
                      </table>

                      {/* <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p>
                            Showing <strong>{currentIndex + 1}</strong> to{" "}
                            <strong>{currentIndex + 1}</strong> of{" "}
                            <strong>{selectedCust.length}</strong> results
                          </p>
                        </div>
                        <div className="d-flex gap-2">
                          <div>
                            <button
                              className="btn border"
                              onClick={handlePrevious}
                              disabled={currentIndex === 0}
                            >
                              Previous
                            </button>
                          </div>
                          <div>
                            <button
                              className="btn border"
                              onClick={handleNext}
                              disabled={
                                currentIndex === selectedCust.length - 1
                              }
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div> */}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        <p className="mb-0 small text-muted">
                          Showing <strong>{currentIndex + 1}</strong> of{" "}
                          <strong>{filteredPrescriptions.length}</strong>{" "}
                          {activeCustStatus}
                        </p>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn border"
                          onClick={handlePrevious}
                          disabled={currentIndex === 0}
                        >
                          Previous
                        </button>
                        <button
                          className="btn border"
                          onClick={handleNext}
                          disabled={
                            currentIndex === filteredPrescriptions.length - 1
                          }
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-left pb-2">
                    <h6 className="text-muted">No data found</h6>
                  </div>
                )}
              </>
            ) : (
              <div className="text-left pb-2">
                <h6 className="text-muted">No data found</h6>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PrescriptionModel;
