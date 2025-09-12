import React, { useState } from "react";
import { Modal, Carousel } from "react-bootstrap";

const ImageSliderModalProduct = ({ show, onHide, images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Handle carousel slide change
  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  // Handle dot click
  const handleDotClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Product Images</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {images.length > 0 ? (
          <>
            <Carousel
              activeIndex={activeIndex}
              onSelect={handleSelect}
              prevIcon={
                <span
                  className="carousel-control-prev-icon"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    width: "40px",
                    height: "40px",

                    borderRadius: "50%",
                  }}
                />
              }
              nextIcon={
                <span
                  className="carousel-control-next-icon"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                  }}
                />
              }
            >
              {images.map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="d-block w-100"
                    style={{ maxHeight: "500px", objectFit: "contain" }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
            <div className="d-flex justify-content-center mt-3">
              {images.map((_, index) => (
                <span
                  key={index}
                  onClick={() => handleDotClick(index)}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: index === activeIndex ? "#007bff" : "#ccc",
                    margin: "0 5px",
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <p>No images available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageSliderModalProduct;
