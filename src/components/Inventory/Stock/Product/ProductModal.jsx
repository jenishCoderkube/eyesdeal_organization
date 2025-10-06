import React, { useState } from "react";
import { Modal, Button, FormControl, InputGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // Ensure Bootstrap Icons is imported

const ProductModal = ({ show, onClose, products, onConfirm, onDelete }) => {
  // Initialize quantities with 0 for each product
  const [quantities, setQuantities] = useState(
    products.reduce((acc, p) => ({ ...acc, [p._id]: 1 }), {})
  );

  // Update quantities when products change (e.g., after deletion)
  React.useEffect(() => {
    setQuantities((prev) => {
      const newQuantities = products.reduce(
        (acc, p) => ({ ...acc, [p._id]: prev[p._id] || 0 }),
        {}
      );
      return newQuantities;
    });
  }, [products]);

  // Handle quantity change (increment/decrement)
  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta), // Ensure quantity doesn't go below 0
    }));
  };

  // Handle delete (notify parent and remove from quantities)
  const handleDelete = (id) => {
    onDelete(id); // Notify parent to remove from selectedIds
    setQuantities((prev) => {
      const { [id]: _, ...rest } = prev; // Remove the product from quantities
      return rest;
    });
  };

  // Handle confirm (pass only products with quantity > 0)
  const handleConfirm = () => {
    const selectedProducts = Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({
        product: productId,
        quantity: Number(quantity),
      }));
    onConfirm(selectedProducts);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>Selected Products</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          maxHeight: "60vh", // Limit height to 60% of viewport height
          overflowY: "auto", // Enable scrolling inside the body
          padding: "1rem",
        }}
      >
        {products.length === 0 ? (
          <p className="text-muted text-center">No products selected.</p>
        ) : (
          products.map((p) => (
            <div
              key={p._id}
              className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div className="d-flex align-items-center">
                <span className="me-2">{p.sku || "—"}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <InputGroup style={{ maxWidth: "150px" }}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleQuantityChange(p._id, -1)}
                    disabled={quantities[p._id] === 0}
                  >
                    −
                  </Button>
                  <FormControl
                    value={quantities[p._id] || 0}
                    readOnly
                    className="text-center"
                    style={{ width: "60px" }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleQuantityChange(p._id, 1)}
                  >
                    +
                  </Button>
                </InputGroup>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(p._id)}
                  title="Remove product"
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
            </div>
          ))
        )}
      </Modal.Body>
      <Modal.Footer
        className="bg-light"
        style={{
          position: "sticky",
          bottom: 0,
          borderTop: "1px solid #dee2e6",
          padding: "0.75rem",
        }}
      >
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={Object.values(quantities).every((q) => q === 0)}
        >
          Add to Cart
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
