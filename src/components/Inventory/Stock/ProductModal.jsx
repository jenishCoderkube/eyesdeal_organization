import React from "react";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductModal = ({ show, handleClose, products }) => {
  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="text-dark font-semibold">
          Product Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="text-xs d-inline-flex font-medium bg-secondary-subtle text-secondary rounded-pill text-black text-center px-2 py-1 mb-4">
          Number Of Products: {products?.length}
        </div>
        <div className="table-responsive">
          <table className="table table-sm">
            <thead className="text-xs text-uppercase text-muted bg-light border">
              <tr>
                <th className="custom-perchase-th">Barcode</th>
                <th className="custom-perchase-th">Product Name</th>
                <th className="custom-perchase-th">SKU</th>
                <th className="custom-perchase-th">Stock Quantity</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {products?.length > 0 ? (
                products.map((product, index) => (
                  <tr key={index}>
                    <td>{product.productId?.newBarcode}</td>
                    <td>{product.productId?.displayName}</td>
                    <td>{product.productId?.sku}</td>
                    <td>{product?.stockQuantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-3">
                    No products available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal.Body>
      <Modal.Footer className="bg-light border-top">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClose}
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
