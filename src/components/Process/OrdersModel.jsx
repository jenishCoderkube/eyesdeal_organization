import { se } from 'date-fns/locale';
import React, { useEffect, useState } from 'react'
import { FaAngleDown, FaAngleRight } from 'react-icons/fa6';

function OrdersModel({ closeOrderModel, SalesOrderData }) {

    const [orders, setOrders] = useState([]);

    const custstatus = ["Orders", "Order Notes"];
    const [activeCustStatus, setActiveCustStatus] = useState("Orders");
    const [expandedRows, setExpandedRows] = useState([]);
    const toggleSplit = (index) => {
        setExpandedRows((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    useEffect(() => {
        if (SalesOrderData?.docs?.length) {
            const combined = SalesOrderData.docs.flatMap(doc =>
                doc.orders.map(order => ({
                    id: order._id,
                    billNo: order.billNumber,
                    date: order.createdAt,
                    amount: doc.netAmount,

                    product: order.product?.sku || '',
                    lens: order.lens?.sku || '',

                    productMrp: order.product?.mrp || 0,
                    lensMrp: order.lens?.mrp || 0,

                    productDiscount: order.product?.perPieceDiscount || 0,
                    lensDiscount: order.lens?.perPieceDiscount || 0,

                    productTotal: order.product?.perPieceAmount || 0,
                    lensTotal: order.lens?.perPieceAmount || 0,
                }))
            );
            setOrders(combined);
        }
    }, [SalesOrderData]);

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
                                        <table className="table table-sm text-center table-bordered" style={{ borderCollapse: "collapse", border: "1px solid lightgray", width: "100%" }}>
                                            <thead>
                                                <tr>
                                                    <th className='w-25'>Date</th>
                                                    <th className='w-25'>Bill No</th>
                                                    <th className='w-25'>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.length > 0 ? (
                                                    orders.map((order, index) => (
                                                        <React.Fragment key={order._id || index}>

                                                            <tr >
                                                                <td>{formatDate(order.date)}</td>
                                                                <td>{order.billNo}</td>
                                                                <td
                                                                    className="cursor-pointer"
                                                                    onClick={() => toggleSplit(index)}
                                                                    style={{ userSelect: 'none' }}
                                                                >
                                                                    {order.amount}{" "}
                                                                    {expandedRows.includes(index) ? (
                                                                        <FaAngleDown className="ms-2" />
                                                                    ) : (
                                                                        <FaAngleRight className="ms-2" />
                                                                    )}
                                                                </td>
                                                            </tr>

                                                            {expandedRows.includes(index) && (
                                                                <tr className='mx-3'>
                                                                    <td colSpan="3" className="p-0">
                                                                        <div className="table-responsive mx-3">
                                                                            <table className="table mb-0" style={{ border: "none" }}>
                                                                                <thead>
                                                                                    <tr className="small fw-semibold text-primary-emphasis bg-light">
                                                                                        <th className="py-2 px-2">Product</th>
                                                                                        <th className="py-2 px-2">Lens</th>
                                                                                        <th className="py-2 px-2">MRP</th>
                                                                                        <th className="py-2 px-2">Discount</th>
                                                                                        <th className="py-2 px-2">Total</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td style={{ minWidth: '110px' }}>{order.product}</td>
                                                                                        <td style={{ minWidth: '110px' }}>{order.lens}</td>
                                                                                        <td style={{ minWidth: '70px', textAlign: "left" }}>
                                                                                            <div>
                                                                                                <p className="mb-1">Product: {order.productMrp}</p>
                                                                                                <p className="mb-0">Lens: {order.lensMrp}</p>
                                                                                            </div>

                                                                                        </td>
                                                                                        <td style={{ minWidth: '70px', textAlign: "left" }}>
                                                                                            <div>
                                                                                                <p className="mb-1">Product: {order.productDiscount}</p>
                                                                                                <p className="mb-0">Lens: {order.lensDiscount}</p>
                                                                                            </div>

                                                                                        </td>
                                                                                        <td style={{ minWidth: '70px', textAlign: "left" }}>
                                                                                            <div>
                                                                                                <p className="mb-1">Product: {order.productTotal}</p>
                                                                                                <p className="mb-0">Lens: {order.lensTotal}</p>
                                                                                            </div>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="3" className="text-center text-muted">No orders found</td>
                                                    </tr>
                                                )}


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
