import moment from "moment";
import React from "react";
import { Modal, Button } from "react-bootstrap";

const StockAuditDetailsModal = ({ show, onHide, auditItem }) => {
  console.log("auditItem", auditItem);

  const auditItemData = auditItem?.items || [];
  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Stock Audit Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="border p-3 rounded bg-light mb-3">
          <div className="row g-2">
            <div className="col-md-3">
              <strong>Store:</strong> {auditItem?.store?.name || "N/A"}
            </div>
            <div className="col-md-3">
              <strong>Category:</strong> {auditItem?.productCategory || "N/A"}
            </div>
            <div className="col-md-3">
              <strong>Audit Date:</strong>{" "}
              {auditItem?.auditDate
                ? moment(auditItem.auditDate).format("YYYY-MM-DD")
                : "N/A"}
            </div>
            <div className="col-md-3">
              <strong>Brand:</strong> {auditItem?.brand?.name || "N/A"}
            </div>
          </div>
        </div>

        {auditItem?.items && auditItem?.items.length > 0 ? (
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <table className="table">
                  <thead>
                    <tr>
                      <th>SRNO</th>
                      <th>Product SKU</th>
                      <th>Store Qty</th>
                      <th>Count Qty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditItem?.items.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item?.product?.sku || "N/A"}</td>
                        <td>{item?.storeQuantity ?? 0}</td>
                        <td>{item?.countQuantity ?? 0}</td>
                        <td>
                          <span
                            style={{
                              color: item?.status === "Match" ? "green" : "red",
                            }}
                          >
                            {item?.status || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div>No data available</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StockAuditDetailsModal;
