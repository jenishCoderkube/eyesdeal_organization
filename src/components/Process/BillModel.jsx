import React from "react";

function BillModel({ selectedBill, closeBillModal }) {
  // Calculate financial details
  const receivedAmount = selectedBill.receivedAmount?.length
    ? selectedBill.receivedAmount.reduce(
        (sum, amt) => sum + (amt.amount || 0),
        0
      )
    : 0;
  const amountDue = selectedBill.netAmount - receivedAmount;

  return (
    <section
      className="modal"
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
      }}
    >
      <div
        className="modal-dialog"
        role="document"
        style={{
          width: "100%",
          maxWidth: "700px",
          alignItems: "center",
          display: "flex",
          margin: "0px 30px",
          padding: "0px",
        }}
      >
        <div
          className="modal-content rounded-0 lh-1"
          style={{
            width: "100%",
            minHeight: "400px",
            border: "none",
          }}
        >
          <div
            className="modal-header border-bottom"
            style={{
              paddingBottom: "10px",
              paddingTop: "10px",
            }}
          >
            <button
              type="button"
              className="btn-close small"
              onClick={closeBillModal}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body small">
            <p className="small">Bill No: {selectedBill.saleNumber}</p>
            <p className="small">
              Sales Person: {selectedBill.salesRep?.name || "N/A"}
            </p>
            <p className="small">
              Customer Name: {selectedBill.customerName} (
              {selectedBill.customerPhone})
            </p>
            <p className="small">Store: {selectedBill.store?.name || "N/A"}</p>
            <div className="d-flex flex-wrap justify-content-between small">
              {selectedBill.orders?.map((order, index) => (
                <React.Fragment key={order._id || index}>
                  <div className="me-4  mb-2" style={{ maxWidth: "180px" }}>
                    <p>
                      <strong>Product</strong>
                    </p>
                    <p>
                      {order.product?.sku || order.lens?.sku || "N/A"} (
                      {order.product?.displayName ||
                        order.lens?.displayName ||
                        "N/A"}
                      )
                    </p>
                  </div>
                  <div className="me-4 mb-2">
                    <p>
                      <strong>Tax</strong>
                    </p>
                    <p>
                      {order.product?.taxRate || order.lens?.taxRate || "N/A"}
                    </p>
                  </div>
                  <div className="me-4 mb-2">
                    <p>
                      <strong>MRP</strong>
                    </p>
                    <p>{order.product?.mrp || order.lens?.mrp || 0}</p>
                  </div>
                  <div className="me-4 mb-2">
                    <p>
                      <strong>Discount</strong>
                    </p>
                    <p>
                      {order.product?.perPieceDiscount ||
                        order.lens?.perPieceDiscount ||
                        0}
                    </p>
                  </div>
                  <div className="me-4 mb-2">
                    <p>
                      <strong>Tax Amount</strong>
                    </p>
                    <p>
                      {order.product?.perPieceTax ||
                        order.lens?.perPieceTax ||
                        0}
                    </p>
                  </div>
                  <div className="mb-2">
                    <p>
                      <strong>Total</strong>
                    </p>
                    <p>
                      {order.product?.perPieceAmount ||
                        order.lens?.perPieceAmount ||
                        0}
                    </p>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <p className="small">Final Amount: {selectedBill.netAmount}</p>
            <p className="small">Received Amount: {receivedAmount}</p>
            <p className="small">Amount Due: {amountDue}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BillModel;
