import React from 'react'

function BillModel({ selectedBill, closeBillModal }) {
    return (
        <section className="modal " tabIndex="-1" role="dialog"
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
            }}
        >
            <div className="modal-dialog" role="document" style={{
                width: '100%',
                maxWidth: '700px',
                alignItems: 'center',
                display: 'flex',
                margin: "0px 30px",
                padding: '0px',
            }}
            >
                <div
                    className="modal-content rounded-0 lh-1"
                    style={{
                        width: '100%',
                        minheight: "400px",
                        border: 'none',
                    }}
                >
                    <div
                        className="modal-header border-bottom"
                        style={{
                            paddingBottom: '10px',
                            paddingTop: '10px'
                        }}
                    >
                        <button type="button" className="btn-close small" onClick={closeBillModal} aria-label="Close"></button>
                    </div>
                    <div className="modal-body small">
                        <p className="small">Bill No: {selectedBill.billNumber}</p>
                        <p className="small">Sales Person: S.PATEL</p>
                        <p className="small">Customer Name: {selectedBill.customerName}({selectedBill.phone})</p>
                        <p className="small">Store: EYEDEAL BHARUCH</p>
                        <div className="d-flex flex-wrap justify-content-between small">
                            <div className="me-4 mb-2">
                                <p><strong>Product</strong></p>
                                <p>I-GOG-FR-500dsfbfdb</p>
                            </div>
                            <div className="me-4 mb-2">
                                <p><strong>Tax</strong></p>
                                <p>12 (Inc)</p>
                            </div>
                            <div className="me-4 mb-2">
                                <p><strong>MRP</strong></p>
                                <p>500</p>
                            </div>
                            <div className="me-4 mb-2">
                                <p><strong>Discount</strong></p>
                                <p>100</p>
                            </div>
                            <div className="me-4 mb-2">
                                <p><strong>Tax Amount</strong></p>
                                <p>40.86</p>
                            </div>
                            <div className="mb-2">
                                <p><strong>Total</strong></p>
                                <p>400</p>
                            </div>
                        </div>
                        <p className="small">Final Amount: 400</p>
                        <p className="small">Received Amount: 400</p>
                        <p className="small">Amount Due: 0</p>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default BillModel
