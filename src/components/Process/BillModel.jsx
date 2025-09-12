import React, { useRef, useEffect } from "react";

function BillModel({ selectedBill, closeBillModal }) {
  console.log("Selected Bill Data:", selectedBill); // Debugging line

  const modalRef = useRef(null);

  // Calculate financial details
  const receivedAmount = selectedBill.receivedAmount?.length
    ? selectedBill.receivedAmount.reduce(
        (sum, amt) => sum + (amt.amount || 0),
        0
      )
    : 0;
  const amountDue = selectedBill.netAmount - receivedAmount;

  // Handle outside click
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeBillModal();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Flatten orders into individual item rows
  const itemRows =
    selectedBill.orders?.flatMap((order, orderIndex) => {
      const items = [];
      if (order.product) {
        items.push({
          orderIndex: orderIndex + 1,
          type: "Frame",
          displayName: order.product.displayName,
          sku: order.product.sku,
          mrp: order.product.mrp || 0,
          perPieceDiscount: order.product.perPieceDiscount || 0,
          perPieceTax: order.product.perPieceTax || 0,
          perPieceAmount: order.product.perPieceAmount || 0,
          taxRate: order.product.taxRate || "N/A",
        });
      }
      if (order.rightLens) {
        items.push({
          orderIndex: orderIndex + 1,
          type: "Right Lens",
          displayName: order.rightLens.displayName,
          sku: order.rightLens.sku,
          mrp: order.rightLens.mrp || 0,
          perPieceDiscount: order.rightLens.perPieceDiscount || 0,
          perPieceTax: order.rightLens.perPieceTax || 0,
          perPieceAmount: order.rightLens.perPieceAmount || 0,
          taxRate: order.rightLens.taxRate || "N/A",
        });
      }
      if (order.leftLens) {
        items.push({
          orderIndex: orderIndex + 1,
          type: "Left Lens",
          displayName: order.leftLens.displayName,
          sku: order.leftLens.sku,
          mrp: order.leftLens.mrp || 0,
          perPieceDiscount: order.leftLens.perPieceDiscount || 0,
          perPieceTax: order.leftLens.perPieceTax || 0,
          perPieceAmount: order.leftLens.perPieceAmount || 0,
          taxRate: order.leftLens.taxRate || "N/A",
        });
      }
      return items;
    }) || [];

  return (
    <section
      className="modal"
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        overflow: "hidden",
      }}
    >
      <div
        className="modal-dialog"
        role="document"
        ref={modalRef}
        style={{
          width: "100%",
          maxWidth: "1000px", // Increased modal width
          alignItems: "center",
          display: "flex",
          margin: "0px 40px",
          padding: "0px",
        }}
      >
        <div
          className="modal-content rounded-3 shadow-lg"
          style={{
            width: "100%",
            maxHeight: "80vh",
            border: "none",
            backgroundColor: "#fff",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="modal-header border-0 p-3 m-0 d-flex justify-content-between align-items-center">
            <h5 className="modal-title fw-bold" style={{ fontSize: "1.4rem" }}>
              Bill Details
            </h5>
            <button
              type="button"
              className="btn-close"
              style={{ width: "48px", height: "48px", fontSize: "1.2rem" }}
              onClick={closeBillModal}
              aria-label="Close"
            ></button>
          </div>
          <div
            className="modal-body"
            style={{
              fontSize: "0.95rem", // Slightly smaller font size
              lineHeight: "1.5",
              overflowY: "auto",
              flex: 1,
            }}
          >
            <div className="mb-3">
              <p className="mb-2">
                <strong>Bill No:</strong> {selectedBill.saleNumber}
              </p>
              <p className="mb-2">
                <strong>Sales Person:</strong>{" "}
                {selectedBill.salesRep?.name || "N/A"}
              </p>
              <p className="mb-2">
                <strong>Customer Name:</strong> {selectedBill.customerName} (
                {selectedBill.customerPhone})
              </p>
              <p className="mb-2">
                <strong>Store:</strong> {selectedBill.store?.name || "N/A"}
              </p>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr className="fw-semibold text-primary bg-light">
                    <th className="py-3 px-3" style={{ minWidth: "50px" }}>
                      Order #
                    </th>
                    <th className="py-3 px-3" style={{ minWidth: "120px" }}>
                      Item Type
                    </th>
                    <th className="py-3 px-3" style={{ minWidth: "180px" }}>
                      SKU
                    </th>
                    <th className="py-3 px-3" style={{ minWidth: "250px" }}>
                      Display Name
                    </th>
                    <th className="py-3 px-3" style={{ minWidth: "120px" }}>
                      Tax Rate
                    </th>
                    <th className="py-3 px-3" style={{ minWidth: "100px" }}>
                      MRP
                    </th>
                    <th className="py-3 px-3" style={{ minWidth: "100px" }}>
                      Discount
                    </th>
                    <th className="py-3 px-3" style={{ minWidth: "100px" }}>
                      Tax Amount
                    </th>
                    <th className="py-3 px-3" style={{ minWidth: "100px" }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {itemRows.map((item, index) => (
                    <tr key={`${item.orderIndex}-${item.type}-${index}`}>
                      <td className="py-3 px-3">{item.orderIndex}</td>
                      <td className="py-3 px-3">{item.type}</td>
                      <td className="py-3 px-3">{item.sku || "N/A"}</td>
                      <td className="py-3 px-3">{item.displayName || "N/A"}</td>
                      <td className="py-3 px-3">{item.taxRate}</td>
                      <td className="py-3 px-3">₹{item.mrp.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        ₹{item.perPieceDiscount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        ₹{item.perPieceTax.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        ₹{item.perPieceAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <p className="mb-2">
                <strong>Final Amount:</strong> ₹
                {selectedBill.netAmount.toFixed(2)}
              </p>
              <p className="mb-2">
                <strong>Received Amount:</strong> ₹{receivedAmount.toFixed(2)}
              </p>
              <p className="mb-2">
                <strong>Amount Due:</strong> ₹{amountDue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BillModel;
