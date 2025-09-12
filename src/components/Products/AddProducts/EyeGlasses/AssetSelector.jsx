import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaFolder, FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import productViewService from "../../../../services/Products/productViewService";

function AssetSelector({ show, onHide, onSelectImage }) {
  const [currentPath, setCurrentPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [baseUrl, setBaseUrl] = useState(""); // Store baseUrl from API

  // Construct currentFolder from currentPath
  const currentFolder = useMemo(() => {
    return currentPath.length === 0 ? "/" : `${currentPath.join("/")}/`;
  }, [currentPath]);

  // Helper function to check if a file is an image
  const isImageFile = (filename) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
    return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  };

  // Fetch media library data
  useEffect(() => {
    if (!show) return; // Skip if modal is not open

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productViewService.getMediaLibrary(
          currentFolder
        );
        if (response.success) {
          const { resp, baseUrl: apiBaseUrl } = response.data;

          // Store baseUrl for stripping later
          setBaseUrl(apiBaseUrl);

          // Extract folders from CommonPrefixes
          const fetchedFolders = resp.CommonPrefixes
            ? resp.CommonPrefixes.map((prefix) => {
                const folderName = prefix.Prefix.replace(
                  currentFolder,
                  ""
                ).replace("/", "");
                return folderName;
              }).filter(Boolean)
            : [];

          // Extract files from Contents
          const fetchedFiles = resp.Contents
            ? resp.Contents.map((item) => ({
                name: item.Key.split("/").pop(),
                src: `${apiBaseUrl}${item.Key}`,
                path: `/${item.Key}`, // Store path for selection
              }))
            : [];

          setFolders(fetchedFolders);
          setFiles(fetchedFiles);

          // Update allImages for search
          setAllImages((prev) => {
            const newImages = fetchedFiles.map((file) => ({
              name: file.name,
              src: file.src,
              path: file.path,
              pathArray: currentPath,
            }));
            const uniqueImages = [...prev, ...newImages].reduce((acc, img) => {
              if (!acc.some((existing) => existing.src === img.src)) {
                acc.push(img);
              }
              return acc;
            }, []);
            return uniqueImages;
          });
        } else {
          throw new Error(response.message || "Failed to fetch media library");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load assets. Please try again.");
        toast.error("Failed to load assets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [show, currentFolder]);

  // Filter images based on search query
  const filteredImages = useMemo(() => {
    if (!searchQuery) return [];
    return allImages.filter((img) =>
      img.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allImages]);

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
    if (!isImageFile(image.name)) return; // Ignore non-image files
    setSelectedImages((prev) => {
      if (prev.includes(image.src)) {
        return prev.filter((src) => src !== image.src);
      } else {
        return [...prev, image.src];
      }
    });
  };

  // Handle confirm selection
  const handleConfirmSelection = () => {
    // Strip baseUrl from selected images, keep only the path
    const paths = selectedImages.map((src) => {
      const path = src.replace(baseUrl, "");
      return path.startsWith("/") ? path : `${path}`;
    });
    onSelectImage(paths);
    setSelectedImages([]); // Reset selection
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        setSelectedImages([]); // Reset selection on close
        onHide();
      }}
      centered
      size="xl"
      dialogClassName="max-w-2xl"
    >
      <Modal.Header className="border-bottom px-4 py-3">
        <Modal.Title as="div" className="font-semibold text-dark">
          Select Assets
        </Modal.Title>
        <Button
          variant="link"
          className="text-muted p-0"
          onClick={() => {
            setSelectedImages([]); // Reset selection on close
            onHide();
          }}
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
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleConfirmSelection}
            disabled={selectedImages.length === 0}
          >
            Select ({selectedImages.length})
          </Button>
        </Modal.Footer>
        <Form.Control
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        {loading && <div className="text-center">Loading...</div>}
        {error && <div className="text-danger text-center">{error}</div>}
        {!loading && !error && (
          <>
            {searchQuery && filteredImages.length > 0 && (
              <div className="mb-4">
                <h6>Search Results</h6>
                <div className="row row-cols-4 g-4">
                  {filteredImages.map((img, index) => (
                    <div
                      key={index}
                      className={`col ${
                        isImageFile(img.name) ? "pointer" : ""
                      }`}
                      onClick={() => handleImageSelect(img)}
                      style={{
                        cursor: isImageFile(img.name) ? "pointer" : "default",
                        position: "relative",
                      }}
                    >
                      <img
                        src={img.src}
                        alt={img.name}
                        className="img-fluid rounded"
                        style={{
                          height: "70px",
                          objectFit: "cover",
                          border: selectedImages.includes(img.src)
                            ? "3px solid #007bff"
                            : "none",
                        }}
                      />
                      <p className="text-center text-truncate mt-2">
                        {img.name}
                      </p>
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
                  {folders.map((folder) => (
                    <div
                      key={folder}
                      className="col d-flex flex-column align-items-center pointer"
                      onClick={() => handleFolderClick(folder)}
                    >
                      <FaFolder size={70} color="#4b5eaa" />
                      <p className="text-center text-truncate mt-2">{folder}</p>
                    </div>
                  ))}
                </div>
              </div>
              {files.length > 0 && (
                <div>
                  <h6>Assets</h6>
                  <div className="row row-cols-4 g-4 mt-3">
                    {files.map((img, index) => (
                      <div
                        key={index}
                        className={`col ${
                          isImageFile(img.name) ? "pointer" : ""
                        }`}
                        onClick={() => handleImageSelect(img)}
                        style={{
                          cursor: isImageFile(img.name) ? "pointer" : "default",
                          position: "relative",
                        }}
                      >
                        <img
                          src={img.src}
                          alt={img.name}
                          className="img-fluid rounded"
                          style={{
                            height: "70px",
                            objectFit: "cover",
                            border: selectedImages.includes(img.src)
                              ? "3px solid #007bff"
                              : "none",
                          }}
                        />
                        <p className="text-center text-truncate mt-2">
                          {img.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default AssetSelector;
