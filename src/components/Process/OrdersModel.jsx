import { se } from 'date-fns/locale';
import React, { useEffect, useState } from 'react'

function OrdersModel({ closeOrderModel, activeStatus, selectedCust }) {

    const [activeCustomer, setActiveCustomer] = useState([]);
    const [activeCustStatus, setActiveCustStatus] = useState("Orders");
    const custstatus = ["Orders", "Order Notes"];

    useEffect(() => {
        setActiveCustomer(selectedCust[0]);
    }, [selectedCust])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-GB"); // DD/MM/YYYY format
    };

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
                maxWidth: '1000px',
                backgroundColor: '#fff',
                borderRadius: '5px',
                overflow: 'hidden',
                boxShadow: '0 5px 30px rgba(0,0,0,0.3)',
                padding: '0px',
            }}
            >
                <div className="modal-content border-0">
                    <div className="modal-header border-bottom pb-2">

                        <h5 className="modal-title mb-0 h6 fw-bold">View Orders</h5>

                        <button type="button" className="btn-close small" onClick={closeOrderModel} aria-label="Close"></button>
                    </div>

                    <div className="px-3">
                        <div className="overflow-x-auto mt-4">
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


                        <>
                            {activeCustStatus === "Orders" ? (
                                <>
                                    <div className="px-3 pb-4">

                                        <table className="table table-sm text-center table-bordered" style={{borderCollapse: "collapse", border: "1px solid lightgray", width: "100%" }}>
                                            <thead>
                                                <tr>
                                                    <th className='w-25'>Date</th>
                                                    <th className='w-25'>Bill No</th>
                                                    <th className='w-25'>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>16/08/2004</td>
                                                    <td>999999</td>
                                                    <td>9999</td>
                                                </tr>
                                            </tbody>
                                        </table>               

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <p>Showing <strong>1</strong> to <strong>1</strong> of <strong>1</strong> results</p>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <div>
                                                    <button className="btn border">Previous</button>
                                                </div>
                                                <div>
                                                    <button className="btn border">Next</button>
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
                        </>



                    </div>
                </div>

            </div>
        </section>
    )
}

export default OrdersModel
