import React, { useState } from "react";
import { defalutImageBasePath } from "../../../../utils/constants";
import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";

const BASE_URL = defalutImageBasePath;

const ProductTable = ({ products, selectedIds, onSelectChange }) => {
  const [modalProduct, setModalProduct] = useState(null);

  const handleSelectAll = (checked) => {
    if (checked) {
      onSelectChange(
        products?.map((p) => p._id),
        true
      );
    } else {
      onSelectChange([], false);
    }
  };

  const handleSelectOne = (id, checked) => {
    onSelectChange([id], checked); // Pass `id` as an array and include `checked`
  };

  const handleCloseModal = () => setModalProduct(null);

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>
              <input
                type="checkbox"
                checked={
                  products?.length > 0 && selectedIds.length === products.length
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
                style={{
                  width: "20px", // Adjust size as needed
                  height: "20px", // Adjust size as needed
                }}
              />
            </th>
            <th>Photo</th>
            <th>SKU</th>
            <th>Cost Price</th>
            <th>MRP</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((p) => (
            <tr key={p._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(p._id)}
                  onChange={(e) => handleSelectOne(p._id, e.target.checked)}
                  style={{
                    width: "18px", // Adjust size as needed
                    height: "18px", // Adjust size as needed
                  }}
                />
              </td>
              <td>
                {p.photos && p.photos.length > 0 ? (
                  <img
                    src={BASE_URL + p.photos[0]}
                    alt={p.sku}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      background: "#f0f0f0",
                      borderRadius: "4px",
                    }}
                  />
                )}
              </td>
              <td>{p.sku || "—"}</td>
              <td>{p?.costPrice ?? "—"}₹</td>
              <td>{p?.MRP ?? "—"}₹</td>
              <td>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setModalProduct(p)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {modalProduct && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalProduct.sku || "Product Details"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Left: Image Slider */}
                  <div className="col-md-6 mb-3">
                    {modalProduct.photos && modalProduct.photos.length > 0 ? (
                      <Carousel variant="dark">
                        {modalProduct.photos.map((photo, idx) => (
                          <Carousel.Item key={idx}>
                            <img
                              className="d-block w-100 rounded"
                              src={BASE_URL + photo}
                              alt={`slide-${idx}`}
                              style={{
                                maxHeight: "400px",
                                objectFit: "contain",
                              }}
                            />
                          </Carousel.Item>
                        ))}
                      </Carousel>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "400px",
                          background: "#f0f0f0",
                          borderRadius: "4px",
                        }}
                      />
                    )}
                  </div>

                  {/* Right: Main Info */}
                  <div className="col-md-6">
                    <table className="table table-borderless mb-0">
                      <tbody>
                        <tr>
                          <th>Brand:</th>
                          <td>{modalProduct.brand?.name || "—"}</td>
                        </tr>
                        <tr>
                          <th>Model Number:</th>
                          <td>{modalProduct.modelNumber || "—"}</td>
                        </tr>
                        <tr>
                          <th>Frame Type:</th>
                          <td>{modalProduct.frameType?.name || "—"}</td>
                        </tr>
                        <tr>
                          <th>Frame Shape:</th>
                          <td>{modalProduct.frameShape?.name || "—"}</td>
                        </tr>
                        <tr>
                          <th>Frame Material:</th>
                          <td>{modalProduct.frameMaterial?.name || "—"}</td>
                        </tr>
                        <tr>
                          <th>Temple Material:</th>
                          <td>{modalProduct.templeMaterial?.name || "—"}</td>
                        </tr>
                        <tr>
                          <th>MRP:</th>
                          <td>{modalProduct.MRP ?? "—"}₹</td>
                        </tr>
                        <tr>
                          <th>Cost Price:</th>
                          <td>{modalProduct.costPrice ?? "—"}₹</td>
                        </tr>
                        <tr>
                          <th>Sell Price:</th>
                          <td>{modalProduct.sellPrice ?? "—"}₹</td>
                        </tr>
                        <tr>
                          <th>Features:</th>
                          <td>
                            {modalProduct.features &&
                            modalProduct.features.length > 0
                              ? modalProduct.features
                                  .map((f) => f.name)
                                  .join(", ")
                              : "—"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Below Slider: Additional Info */}
                <div className="mt-4">
                  <h6>Description</h6>
                  <p>{modalProduct.description || "—"}</p>
                  <h6>Other Info</h6>
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <th>Frame Collection:</th>
                        <td>{modalProduct.frameCollection?.name || "—"}</td>
                      </tr>
                      <tr>
                        <th>Frame Size:</th>
                        <td>{modalProduct.frameSize || "—"}</td>
                      </tr>
                      <tr>
                        <th>Gender:</th>
                        <td>{modalProduct.gender || "—"}</td>
                      </tr>
                      <tr>
                        <th>Prescription Type:</th>
                        <td>{modalProduct.prescriptionType?.name || "—"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
