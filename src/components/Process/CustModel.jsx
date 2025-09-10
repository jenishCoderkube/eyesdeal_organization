import React, { useState } from "react";

function CustModel({ closeCustModal, activeStatus }) {
  const [activeCustStatus, setActiveCustStatus] = useState("Specs");
  const custstatus = ["Specs", "Contact"];

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
              onClick={closeCustModal}
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

            {activeCustStatus === "Specs" ? (
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
                        className="form-control bg-white"
                        disabled
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      {activeStatus === "New Order" ? (
                        <>
                          <label
                            htmlFor="employeename"
                            className="form-label  mb-0"
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
                            className="form-label  mb-0"
                          >
                            Doctor Name
                          </label>
                          <input
                            type="text"
                            id="doctorname"
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
                        className="form-control"
                        disabled
                      />
                    </div>
                    <div className="col-6 col-md-3">
                      <label htmlFor="prescribeBy" className="form-label mb-0">
                        Prescribed By
                      </label>
                      <input
                        type="text"
                        id="prescribeBy"
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
                          <tr
                            className="text-white "
                            style={{ backgroundColor: "#64748b" }}
                          >
                            {[
                              "",
                              "RESPH",
                              "RECYL",
                              "REXIS",
                              "RVISION",
                              "ADD",
                              "ll",
                              "LESPH",
                              "LECYL",
                              "LEXIS",
                              "LVISION",
                              "ADD",
                            ].map((heading, idx) => (
                              <th
                                key={idx}
                                className="border-top border-bottom  small fw-semibold"
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
                            <td>+1.00</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>+2.00</td>
                            <td rowSpan={2}></td>
                            <td>+0.75</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td>+2.00</td>
                          </tr>
                          <tr>
                            <td>N</td>
                            <td>+3.00</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td rowSpan={2}></td>
                            <td>+2.75</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <table
                    className="d-flex small justify-content-between table-responsive"
                    border={1}
                    style={{
                      borderCollapse: "collapse",
                      border: "1px solid lightgray",
                    }}
                  >
                    <tr>
                      <td>Psm(R)</td>
                      <td>99</td>
                    </tr>
                    <tr>
                      <td>Pd(R)</td>
                      <td>99</td>
                    </tr>
                    <tr>
                      <td>Fh(R)</td>
                      <td>99</td>
                    </tr>
                    <tr>
                      <td>IPD(R)</td>
                      <td>99</td>
                    </tr>
                    <tr>
                      <td>Psm(L)</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Pd(L)</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Fh(L)</td>
                      <td>99</td>
                    </tr>
                  </table>

                  <table
                    className="d-flex small justify-content-between my-2 table-responsive"
                    border={1}
                    style={{
                      borderCollapse: "collapse",
                      border: "1px solid lightgray",
                    }}
                  >
                    <tr>
                      <td>Asize</td>
                      <td>99</td>
                    </tr>
                    <tr>
                      <td>Bsize</td>
                      <td>99</td>
                    </tr>
                    <tr>
                      <td>DBL</td>
                      <td>99</td>
                    </tr>
                    <tr>
                      <td>Fth</td>
                      <td>99</td>
                    </tr>
                    <tr>
                      <td>Pdesign</td>
                      <td>99</td>
                    </tr>
                    <tr>
                      <td>Ftype</td>
                      <td>99</td>
                    </tr>
                    <tr>
                      <td>DE</td>
                      <td>99</td>
                    </tr>
                  </table>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p>
                        Showing <strong>1</strong> to <strong>1</strong> of{" "}
                        <strong>1</strong> results
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <div>
                        <button type="button" className="btn border">
                          Previous
                        </button>
                      </div>
                      <div>
                        <button type="button" className="btn border">
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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

export default CustModel;
