import React, { useState } from "react";
import { Modal, Button, Carousel } from "react-bootstrap";
import moment from "moment";
import { defalutImageBasePath } from "../../../utils/constants";

const StockAuditDetailsModal = ({ show, onHide, auditItem }) => {
  console.log("auditItem", auditItem);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Stock Audit Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {auditItem ? (
          <div className="container">
            {/* Top Row - Image + Product Details */}
            <div className="row mb-4">
              <div className="col-md-5">
                {auditItem?.product?.photos?.length > 0 ? (
                  <Carousel interval={null}>
                    {auditItem.product.photos?.map((photo, idx) => (
                      <Carousel.Item key={idx}>
                        <img
                          className="d-block w-100 rounded shadow-sm"
                          src={defalutImageBasePath + photo}
                          alt={`Product ${idx + 1}`}
                          style={{
                            maxHeight: "300px",
                            objectFit: "contain",
                          }}
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    No Image Found
                  </div>
                )}
              </div>

              <div className="col-md-7">
                <h5 className="text-primary">Product Details</h5>
                <p>
                  <strong>Display Name:</strong>{" "}
                  {auditItem?.product?.displayName || "N/A"}
                </p>
                <p>
                  <strong>Model Number:</strong>{" "}
                  {auditItem?.product?.modelNumber || "N/A"}
                </p>
                <p>
                  <strong>Color Number:</strong>{" "}
                  {auditItem?.product?.colorNumber || "N/A"}
                </p>
                <p>
                  <strong>Frame Size:</strong>{" "}
                  {auditItem?.product?.frameSize || "N/A"}
                </p>
                <p>
                  <strong>MRP:</strong> ₹{auditItem?.product?.MRP || 0}
                </p>
              </div>
            </div>

            {/* Bottom Row - Store + Audit Details */}
            <div className="row">
              <div className="col-md-6">
                <h5 className="text-success">Store Details</h5>
                <p>
                  <strong>Name:</strong> {auditItem?.store?.name || "N/A"}
                </p>
                <p>
                  <strong>Company:</strong>{" "}
                  {auditItem?.store?.companyName || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong> {auditItem?.store?.address || ""},{" "}
                  {auditItem?.store?.city || ""},{" "}
                  {auditItem?.store?.state || ""},{" "}
                  {auditItem?.store?.country || ""} -{" "}
                  {auditItem?.store?.pincode || ""}
                </p>
              </div>

              <div className="col-md-6">
                <h5 className="text-warning">Audit Details</h5>
                <p>
                  <strong>Category:</strong>{" "}
                  {auditItem?.productCategory || "N/A"}
                </p>
                <p>
                  <strong>Brand:</strong> {auditItem?.brand?.name || "N/A"}
                </p>
                <p>
                  <strong>Store Qty:</strong> {auditItem?.storeQuantity ?? 0}
                </p>
                <p>
                  <strong>Count Qty:</strong> {auditItem?.countQuantity ?? 0}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color: auditItem?.status === "Match" ? "green" : "red",
                    }}
                  >
                    {auditItem?.status || "N/A"}
                  </span>
                </p>
                <p>
                  <strong>Audit Date:</strong>{" "}
                  {auditItem?.auditDate
                    ? moment(auditItem.auditDate).format("YYYY-MM-DD HH:mm:ss")
                    : "N/A"}
                </p>
                <p>
                  <strong>Created:</strong>{" "}
                  {auditItem?.createdAt
                    ? moment(auditItem.createdAt).format("YYYY-MM-DD HH:mm:ss")
                    : "N/A"}
                </p>
                <p>
                  <strong>Updated:</strong>{" "}
                  {auditItem?.updatedAt
                    ? moment(auditItem.updatedAt).format("YYYY-MM-DD HH:mm:ss")
                    : "N/A"}
                </p>
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
