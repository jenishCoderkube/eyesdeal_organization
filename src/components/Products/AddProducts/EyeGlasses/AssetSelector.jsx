import React, { useState, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaFolder, FaArrowLeft } from "react-icons/fa";
import image1 from "../../../../../public/eyesdeal_baloon.png"; // Adjust paths as needed
import image2 from "../../../../../public/eyesdeal_baloon.png";
import image3 from "../../../../../public/eyesdeal_baloon.png";
import image4 from "../../../../../public/eyesdeal_baloon.png";

const assetStructure = {
  eyesDealErp: {
    subfolder: {
      images: [
        { name: "image1.jpg", src: image1 },
        { name: "image2.jpg", src: image2 },
      ],
    },
  },
  eyesdeal: {
    images: [{ name: "image3.jpg", src: image3 }],
  },
  formats: {
    images: [{ name: "image4.jpg", src: image4 }],
  },
};

function AssetSelector({ show, onHide, onSelectImage }) {
  const [currentPath, setCurrentPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Get current folder content
  const getCurrentContent = () => {
    let current = assetStructure;
    for (const folder of currentPath) {
      current = current[folder];
    }
    return current;
  };

  // Get all images for search
  const getAllImages = () => {
    const images = [];
    const traverse = (obj, path = []) => {
      if (obj.images) {
        obj.images.forEach((img) => {
          images.push({ ...img, path: [...path] });
        });
      }
      Object.keys(obj).forEach((key) => {
        if (key !== "images") {
          traverse(obj[key], [...path, key]);
        }
      });
    };
    traverse(assetStructure);
    return images;
  };

  const currentContent = getCurrentContent();
  const allImages = getAllImages();

  // Filter images based on search query
  const filteredImages = useMemo(() => {
    if (!searchQuery) return [];
    return allImages.filter((img) =>
      img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handle folder click
  const handleFolderClick = (folder) => {
    setCurrentPath([...currentPath, folder]);
  };

  // Handle back navigation
  const handleBack = () => {
    setCurrentPath(currentPath.slice(0, -1));
  };

  // Handle image selection
  const handleImageSelect = (image) => {
    onSelectImage(image.src);
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      dialogClassName="max-w-2xl"
    >
      <Modal.Header className="border-bottom px-4 py-3">
        <Modal.Title as="div" className="font-semibold text-dark">
          Select Assets
        </Modal.Title>
        <Button
          variant="link"
          className="text-muted p-0"
          onClick={onHide}
          aria-label="Close"
        >
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7.95 6.536l4.242-4.243a1 1 0 111.415 1.414L9.364 7.95l4.243 4.242a1 1 0 11-1.415 1.415L7.95 9.364l-4.243 4.243a1 1 0 01-1.414-1.415L6.536 7.95 2.293 3.707a1 1 0 011.414-1.414L7.95 6.536z" />
          </svg>
        </Button>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form.Control
          type="text"
          placeholder="search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        {searchQuery && filteredImages.length > 0 && (
          <div className="mb-4">
            <h6>Search Results</h6>
            <div className="row row-cols-4 g-4">
              {filteredImages.map((img, index) => (
                <div
                  key={index}
                  className="col pointer"
                  onClick={() => handleImageSelect(img)}
                >
                  <img
                    src={img.src}
                    alt={img.name}
                    className="img-fluid rounded"
                    style={{ height: "70px", objectFit: "cover" }}
                  />
                  <p className="text-center text-truncate mt-2">{img.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="d-flex flex-column gap-4">
          <div>
            <h6>Folders</h6>
            <div className="row row-cols-4 g-4 mt-3">
              {currentPath.length > 0 && (
                <div className="col d-flex align-items-center">
                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={handleBack}
                  >
                    <FaArrowLeft className="me-2" /> Back
                  </Button>
                </div>
              )}
              {Object.keys(currentContent)
                .filter((key) => key !== "images")
                .map((folder) => (
                  <div
                    key={folder}
                    className="col d-flex flex-column align-items-center pointer"
                    onClick={() => handleFolderClick(folder)}
                  >
                    <FaFolder size={70} color="#4b5e aa" />
                    <p className="text-center text-truncate mt-2">{folder}</p>
                  </div>
                ))}
            </div>
          </div>
          {currentContent.images && currentContent.images.length > 0 && (
            <div>
              <h6>Assets</h6>
              <div className="row row-cols-4 g-4 mt-3">
                {currentContent.images.map((img, index) => (
                  <div
                    key={index}
                    className="col d-flex flex-column align-items-center pointer"
                    onClick={() => handleImageSelect(img)}
                  >
                    <img
                      src={img.src}
                      alt={img.name}
                      className="img-fluid rounded"
                      style={{ height: "70px", objectFit: "cover" }}
                    />
                    <p className="text-center text-truncate mt-2">{img.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => {
            const selectedImg = currentContent.images?.[0];
            if (selectedImg) handleImageSelect(selectedImg);
          }}
          disabled={
            !currentContent.images || currentContent.images.length === 0
          }
        >
          Select
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AssetSelector;
