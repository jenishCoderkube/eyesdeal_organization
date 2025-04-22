import React, { useState } from 'react'

function AssignPowerModel({ closeAPModal }) {

    const [activeCustStatus, setActiveCustStatus] = useState("Specs");
    const custstatus = ["Specs", "Contact"];

    return (
        <section className="modal small" tabIndex="-1" role="dialog"
            style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1050,
                overflowY: 'auto',
                padding: '20px',
            }}
        >
            <div className="modal-dialog" role="document" style={{
                width: '100%',
                maxWidth: '900px',
                backgroundColor: '#fff',
                borderRadius: '5px',
                overflow: 'hidden',
                boxShadow: '0 5px 30px rgba(0,0,0,0.3)',
                padding: '0px',
            }}
            >
                <div className="modal-content border-0">
                    <div className="modal-header border-bottom pb-2">
                        <button type="button" className="btn-close small" onClick={closeAPModal} aria-label="Close"></button>
                    </div>

                    <div className="px-3 pb-3">
                        <div className=" mt-3">
                            <div className="d-flex gap-3 pb-2" style={{ minWidth: "600px" }}>
                                {custstatus.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setActiveCustStatus(status)}
                                        className={`bg-transparent border-0 pb-2 px-1 fw-medium 
                                    ${activeCustStatus === status ? 'text-primary border-bottom border-primary' : 'text-secondary'} 
                                    hover:text-dark focus:outline-none`}
                                        style={{ boxShadow: 'none', outline: 'none' }}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="border-bottom" style={{ margin: '-8px 0px 33px 0px' }}></div>

                        {activeCustStatus === "Specs" ? (
                            <>
                                <div className="pb-2">
                                    <div>
                                        <h6 className="mb-1 h6">Specs Power</h6>
                                        <div className="table-responsive">
                                            <table className="table table-bordered text-center table-sm align-middle">
                                                <thead>
                                                    <tr className="text-white " style={{ backgroundColor: "#64748b" }}>
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
                                                                style={{ backgroundColor: "#f2f7fc", color: "#64748b", padding: "12px" }}
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

                                    <table className="d-flex small justify-content-between table-responsive" border={1} style={{ borderCollapse: "collapse", border: "1px solid lightgray" }}>
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


                                    <table className="d-flex small justify-content-between my-2 table-responsive" border={1} style={{ borderCollapse: "collapse", border: "1px solid lightgray" }}>
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


                                </div>
                            </>
                        ) : (
                            <div className="text-left pb-2">
                                <h6 className="text-muted">No data found</h6>
                            </div>
                        )}
                        <div>
                            <button className="btn btn-primary mt-1">Assign</button>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default AssignPowerModel
