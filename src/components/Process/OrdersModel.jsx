import React, { useEffect, useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";

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
      const combined = SalesOrderData.docs.flatMap((doc) =>
        doc.orders.map((order) => ({
          id: order._id,
          billNo: order.billNumber,
          date: order.createdAt,
          amount: doc.netAmount,
          product: order.product?.sku || "",
          lens: order.lens?.sku || "",
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
    <div
      className="modal fade show"
      tabIndex="-1"
      role="dialog"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">View Orders</h5>
            <button
              type="button"
              className="btn-close"
              onClick={closeOrderModel}
              aria-label="Close"
            ></button>
          </div>
          <div
            className="modal-body"
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            <div className="d-flex gap-3 pb-2">
              {custstatus.map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveCustStatus(status)}
                  className={`bg-transparent border-0 pb-2 px-1 fw-medium ${
                    activeCustStatus === status
                      ? "text-primary border-bottom border-primary"
                      : "text-secondary"
                  } hover:text-dark focus:outline-none`}
                  style={{ boxShadow: "none", outline: "none" }}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="border-bottom mb-4"></div>

            {activeCustStatus === "Orders" ? (
              <>
                <table className="table table-sm text-center table-bordered">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: "25%" }}>
                        Date
                      </th>
                      <th scope="col" style={{ width: "25%" }}>
                        Bill No
                      </th>
                      <th scope="col" style={{ width: "25%" }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((order, index) => (
                        <React.Fragment key={order._id || index}>
                          <tr>
                            <td>{formatDate(order.date)}</td>
                            <td>{order.billNo}</td>
                            <td
                              className="cursor-pointer"
                              onClick={() => toggleSplit(index)}
                              style={{ userSelect: "none" }}
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
                            <tr>
                              <td colSpan="3" className="p-0">
                                <div className="table-responsive mx-3">
                                  <table className="table mb-0">
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
                                        <td style={{ minWidth: "110px" }}>
                                          {order.product}
                                        </td>
                                        <td style={{ minWidth: "110px" }}>
                                          {order.lens}
                                        </td>
                                        <td
                                          style={{
                                            minWidth: "70px",
                                            textAlign: "left",
                                          }}
                                        >
                                          <div>
                                            <p className="mb-1">
                                              Product: {order.productMrp}
                                            </p>
                                            <p className="mb-0">
                                              Lens: {order.lensMrp}
                                            </p>
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            minWidth: "70px",
                                            textAlign: "left",
                                          }}
                                        >
                                          <div>
                                            <p className="mb-1">
                                              Product: {order.productDiscount}
                                            </p>
                                            <p className="mb-0">
                                              Lens: {order.lensDiscount}
                                            </p>
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            minWidth: "70px",
                                            textAlign: "left",
                                          }}
                                        >
                                          <div>
                                            <p className="mb-1">
                                              Product: {order.productTotal}
                                            </p>
                                            <p className="mb-0">
                                              Lens: {order.lensTotal}
                                            </p>
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
                        <td colSpan="3" className="text-center text-muted">
                          No orders found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p>
                      Showing <strong>1</strong> to <strong>1</strong> of{" "}
                      <strong>1</strong> results
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary">
                      Previous
                    </button>
                    <button className="btn btn-outline-secondary">Next</button>
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
    </div>
  );
}

export default OrdersModel;
