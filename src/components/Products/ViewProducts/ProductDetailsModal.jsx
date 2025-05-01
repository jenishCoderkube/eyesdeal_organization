import React from "react";
import { Modal, Button, Container, Row, Col } from "react-bootstrap";

function ProductDetailsModal({ show, onHide, product }) {
  if (!product) return null;

  const fields = [
    { label: "Category", value: product.__t || "-" },
    { label: "Color Number", value: product.colorNumber || "-" },
    { label: "SKU", value: product.sku || "-" },
    { label: "Display Name", value: product.displayName || "-" },
    { label: "Cost Price", value: product.costPrice ?? "-" },
    { label: "Tax", value: product.tax ?? "-" },
    { label: "Brand", value: product.brand?.name || "-" },
    { label: "Resell Price", value: product.resellerPrice ?? "-" },
    { label: "Discount", value: product.discount ?? "0" },
    { label: "Incentive Amount", value: product.incentiveAmount ?? "0" },
    { label: "MRP", value: product.MRP ?? "-" },
    { label: "Barcode", value: product.newBarcode ?? "-" },
    { label: "Unit", value: product.unit?.name || "-" },
    { label: "Model Number", value: product.modelNumber || "-" },
    { label: "Manage Stock", value: product.manageStock ? "Yes" : "No" },
    { label: "Inclusive Tax", value: product.inclusiveTax ? "Yes" : "No" },
    { label: "Gender", value: product.gender || "-" },
    { label: "Frame Size", value: product.frameSize || "-" },
    { label: "Warranty", value: product.warranty || "-" },
    {
      label: "Inventory Quantity",
      value: product.inventory?.totalQuantity ?? "-",
    },
  ];

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="xl"
      aria-labelledby="product-details-modal"
    >
      <Modal.Header closeButton className="border-bottom px-4 py-3">
        <Modal.Title
          id="product-details-modal"
          className="font-weight-bold text-dark"
        >
          Product Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Container>
          <Row>
            {fields.map((field, index) => (
              <Col key={index} xs={12} md={6} lg={4} className="mb-3">
                <div
                  className="p-3 border font-weight-600 rounded-sm bg-white shadow-sm"
                  style={{ borderColor: "#e2e8f0" }}
                >
                  <span className="text-black">{field.label}</span>:{" "}
                  {field.value}
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer className="border-top px-4 py-3">
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductDetailsModal;
