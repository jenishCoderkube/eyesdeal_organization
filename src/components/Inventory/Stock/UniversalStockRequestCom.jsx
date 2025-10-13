import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import moment from "moment";
import ReactPaginate from "react-paginate";
import { inventoryService } from "../../../services/inventoryService";
import { purchaseService } from "../../../services/purchaseService";
import { Modal, Carousel, Button } from "react-bootstrap";

const ImageSliderModal = ({ show, onHide, images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

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
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const UniversalStockRequestCom = () => {
  const [storeData, setStoreData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [rowStoreOptions, setRowStoreOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRowStores, setSelectedRowStores] = useState({});
  const [rowStoreLoading, setRowStoreLoading] = useState({});

  const [selectedRows, setSelectedRows] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalDocs: 0,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const user = JSON.parse(localStorage.getItem("user")) || { stores: [] };
  const baseImageUrl =
    "https://s3.ap-south-1.amazonaws.com/eyesdeal.blinklinksolutions.com/";

  const formik = useFormik({
    initialValues: {
      stores: [],
      dateFrom: moment().startOf("month").format("YYYY-MM-DD"),
      dateTo: moment().format("YYYY-MM-DD"),
    },
    validationSchema: Yup.object({
      stores: Yup.array()
        .of(
          Yup.object().shape({
            value: Yup.string().required(),
            label: Yup.string().required(),
          })
        )
        .nullable(),

      dateFrom: Yup.date().required("Start date is required"),
      dateTo: Yup.date().required("End date is required"),
    }),
    onSubmit: (values) => {
      fetchAuditData(values);
    },
  });

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const storedStoreId = user?.stores?.[0];
    if (storedStoreId && storeData.length > 0) {
      const defaultStore = storeData.find(
        (store) => store._id === storedStoreId
      );
      if (defaultStore) {
        const defaultValues = {
          ...formik.values,
          stores: [
            {
              value: defaultStore._id,
              label: defaultStore.name,
            },
          ],
        };
        formik.setValues(defaultValues);
        fetchAuditData(defaultValues, true); // ✅ use updated values directly
      }
    }
  }, [storeData]);

  const fetchStores = async () => {
    try {
      const response = await inventoryService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to fetch stores");
    }
  };

  const fetchAuditData = async (values, isInitial = false, newPage) => {
    const storeId = values?.stores?.length
      ? values.stores.map((s) => s.value)
      : [];

    setLoading(true);

    try {
      const response = await purchaseService.getUniversalStock(
        values.dateFrom,
        values.dateTo,
        storeId,
        newPage || pagination.page,
        pagination.limit
      );

      if (response.success) {
        const container = response.data.data;
        const mappedData = container.docs.map((item) => ({
          ordNo: item._id,
          date: item.createdAt,
          store: item.store.name,
          category: item.product.__t,
          sku: item.product.sku,
          qty: item.qty || 1,
          paymentStatus: item.paymentStatus,
          orderStatus: item.orderStatus,
          image: item.product.photos[0],
          photos: item.product.photos, // Store all photos
          productId: item.product._id,
          orderMedia:
            item?.product?.orderMedia ||
            "https://www.w3schools.com/html/mov_bbb.mp4",
        }));

        setAuditData(mappedData);
        setSelectedRowStores("");
        setPagination({
          page: container.page,
          limit: container.limit,
          totalDocs: container.totalDocs,
          totalPages: container.totalPages,
          hasPrevPage: container.hasPrevPage,
          hasNextPage: container.hasNextPage,
        });
      } else {
        toast.error(response.message || "Failed to fetch purchase data");
      }
    } catch (error) {
      console.error("Error fetching purchase data:", error);
      toast.error("Failed to fetch purchase data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStoresForProduct = async (productId, ordNo) => {
    if (rowStoreOptions[ordNo]) return; // already loaded

    setRowStoreLoading((prev) => ({ ...prev, [ordNo]: true }));

    try {
      const response = await inventoryService.getStoresForUniverlStock({
        productId,
      });
      const storesData = response?.data?.data || [];

      if (response?.data?.success && Array.isArray(storesData)) {
        const storeOptions = storesData.map((item) => ({
          value: item.store?._id,
          label: item.store?.name,
          availableQuantity: item.availableQuantity ?? 0,
        }));

        setRowStoreOptions((prev) => ({
          ...prev,
          [ordNo]: storeOptions,
        }));
      } else {
        toast.error(
          response?.data?.message || "Failed to fetch stores for product"
        );
      }
    } catch (error) {
      console.error(`Error fetching stores for productId ${productId}:`, error);
      toast.error("Failed to fetch stores for product");
    } finally {
      setRowStoreLoading((prev) => ({ ...prev, [ordNo]: false }));
    }
  };

  const handleDownload = (data) => {
    const csv = [
      "ORDNO,Date,Store,Category,SKU,Qty,Payment Status,Order Status",
      `${data.ordNo},${moment(data.date).format("D-M-YYYY")},${data.store},${
        data.category
      },${data.sku},${data.qty},${data.paymentStatus},${data.orderStatus}`,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `stock_audit_${moment(data.date).format("D-M-YYYY")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewMoreImages = (photos) => {
    const fullImageUrls = photos.map((photo) => `${baseImageUrl}${photo}`);
    setSelectedImages(fullImageUrls);
    setShowImageModal(true);
  };

  const storeOptions = storeData.map((store) => ({
    value: store._id,
    label: store.name,
  }));

  const handlePageClick = (event) => {
    const newPage = event.selected + 1;
    setCurrentPage(event.selected);
    fetchAuditData(formik.values, false, newPage);
  };

  return (
    <div className="card-body p-4">
      <h4 className="mb-4 font-weight-bold">Universal Stock Request View</h4>
      <form
        onSubmit={formik.handleSubmit}
        className="row row-cols-1 row-cols-md-4 g-3 align-items-end"
      >
        <div className="col">
          <label className="form-label fw-medium">Stores</label>
          <Select
            options={storeOptions}
            value={formik.values.stores}
            onChange={(option) => formik.setFieldValue("stores", option)}
            placeholder="Select..."
            classNamePrefix="react-select"
            className="w-100"
            isMulti
          />
          {formik.touched.stores && formik.errors.stores && (
            <div className="text-danger">{formik.errors.stores}</div>
          )}
        </div>
        <div className="col">
          <label className="form-label fw-medium">Date From</label>
          <input
            type="date"
            className="form-control"
            value={formik.values.dateFrom}
            onChange={(e) => formik.setFieldValue("dateFrom", e.target.value)}
          />
          {formik.touched.dateFrom && formik.errors.dateFrom && (
            <div className="text-danger">{formik.errors.dateFrom}</div>
          )}
        </div>
        <div className="col">
          <label className="form-label fw-medium">Date To</label>
          <input
            type="date"
            className="form-control"
            value={formik.values.dateTo}
            onChange={(e) => formik.setFieldValue("dateTo", e.target.value)}
          />
          {formik.touched.dateTo && formik.errors.dateTo && (
            <div className="text-danger">{formik.errors.dateTo}</div>
          )}
        </div>
        <div className="col">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
      <div className="col mt-3">
        <button
          type="button"
          className="btn btn-primary"
          disabled={Object.keys(selectedRows).length === 0}
          onClick={() => {
            const selectedData = auditData
              .filter((item) => selectedRows[item.ordNo])
              .map((item) => ({
                ordNo: item.ordNo,
                store: item.store,
                sku: item.sku,
                qty: item.qty,
                selectedStore: selectedRowStores[item.ordNo], // the store selected for this row
              }));

            if (
              selectedData.some(
                (row) => !row.selectedStore || !row.selectedStore.value
              )
            ) {
              // If any selected row doesn't have a store selected
              toast.warn("Please select a store for all selected rows!");
              return;
            }

            // If all selected rows have stores, proceed
            console.log("📝 Selected Rows with Stores:", selectedData);
            alert("currently in development");
            // toast.success(`${selectedData.length} orders ready to submit`);
            // Continue your submit logic here...
          }}
        >
          Submit Order
        </button>
      </div>

      <div className="table-responsive mt-3">
        {loading ? (
          <div className="text-center py-5">Loading...</div>
        ) : (
          <>
            <table className="table  table-striped table-hover">
              <thead className="border-top">
                <tr>
                  {/* <th className="py-3">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectAll(checked);
                        if (checked) {
                          const allRows = {};
                          auditData.forEach((item) => {
                            allRows[item.ordNo] = true;
                          });
                          setSelectedRows(allRows);
                        } else {
                          setSelectedRows({});
                        }
                      }}
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                      }}
                    />
                  </th> */}

                  <th className="py-3">ORDNO</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Store</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">SKU & Barcode</th>
                  <th className="py-3">Qty</th>
                  <th className="py-3">Image</th>
                  <th className="py-3">Payment Status</th>
                  <th className="py-3">Store Select</th>
                  <th className="py-3">Order Status</th>
                  <th className="py-3">Order Image/Video</th>
                </tr>
              </thead>
              <tbody>
                {auditData.length > 0 ? (
                  auditData.map((item, index) => (
                    <tr key={index} className="align-middle">
                      <td className="py-3">
                        <div className=" d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!selectedRows[item.ordNo]}
                            style={{
                              width: "18px",
                              height: "18px",
                              cursor: "pointer",
                            }}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedRows((prev) => {
                                const updated = { ...prev };
                                if (checked) updated[item.ordNo] = true;
                                else delete updated[item.ordNo];

                                // update selectAll if all rows are checked
                                setSelectAll(
                                  Object.keys(updated).length ===
                                    auditData.length
                                );
                                return updated;
                              });
                            }}
                          />
                          {index + 1 + (pagination.page - 1) * pagination.limit}
                        </div>
                      </td>
                      <td className="py-3">
                        {moment(item.date).format("D-M-YYYY")}
                      </td>
                      <td className="py-3">{item.store}</td>
                      <td className="py-3">{item.category}</td>
                      <td className="py-3">{item.sku}</td>
                      <td className="py-3">{item.qty}</td>
                      <td className="py-3">
                        {item.image ? (
                          <>
                            <img
                              src={`${baseImageUrl}${item.image}`}
                              alt="Product"
                              className="img-fluid rounded"
                              style={{ width: "50px", height: "50px" }}
                            />
                            <div>
                              <a
                                href="#"
                                className="text-primary text-decoration-underline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleViewMoreImages(item.photos);
                                }}
                              >
                                View More
                              </a>
                            </div>
                          </>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`badge ${
                            item.paymentStatus === "Success"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <Select
                          options={rowStoreOptions[item.ordNo] || []}
                          onMenuOpen={() =>
                            fetchStoresForProduct(item.productId, item.ordNo)
                          }
                          value={selectedRowStores[item.ordNo] || null}
                          isLoading={rowStoreLoading[item.ordNo] || false}
                          isClearable
                          onChange={(selectedOption) => {
                            setSelectedRowStores((prev) => {
                              const updated = { ...prev };

                              if (selectedOption) {
                                updated[item.ordNo] = selectedOption;
                              } else {
                                delete updated[item.ordNo];
                              }

                              return updated;
                            });
                          }}
                          classNamePrefix="react-select"
                          className="w-100"
                          placeholder={
                            rowStoreOptions[item.ordNo]
                              ? "Select store..."
                              : "Show available stores..."
                          }
                          getOptionLabel={(option) =>
                            `${option.label} (Qty: ${option.availableQuantity})`
                          }
                          styles={{
                            container: (provided) => ({
                              ...provided,
                              width: "300px", // fixed container width
                            }),
                            control: (provided) => ({
                              ...provided,
                              minWidth: "300px",
                              maxWidth: "300px",
                              overflow: "hidden", // important: prevent control from expanding
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis", // long selected values will be truncated
                              maxWidth: "100%",
                            }),
                            menu: (provided) => ({
                              ...provided,
                              width: "300px", // menu width matches control
                            }),
                          }}
                        />
                      </td>
                      <td className="py-3">
                        <span
                          className={`badge ${
                            item.paymentStatus === "Success"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {item.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {item.orderMedia ? (
                          item.orderMedia.endsWith(".mp4") ||
                          item.orderMedia.endsWith(".mov") ? (
                            <video
                              src={item?.orderMedia}
                              width="60"
                              height="60"
                              style={{
                                borderRadius: "8px",
                                cursor: "pointer",
                                objectFit: "cover",
                              }}
                              onClick={() =>
                                window.open(item.orderMedia, "_blank")
                              }
                              muted
                            />
                          ) : (
                            <img
                              src={item?.orderMedia}
                              alt="Order Media"
                              width="60"
                              height="60"
                              style={{
                                borderRadius: "8px",
                                cursor: "pointer",
                                objectFit: "cover",
                              }}
                              onClick={() =>
                                window.open(item.orderMedia, "_blank")
                              }
                            />
                          )
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-5">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="d-flex justify-content-center mt-4">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                pageCount={pagination.totalPages}
                forcePage={pagination.page - 1}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={"pagination mb-2"}
                activeClassName={"active"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={`page-item ${
                  !pagination.hasPrevPage ? "disabled" : ""
                }`}
                previousLinkClassName={"page-link"}
                nextClassName={`page-item ${
                  !pagination.hasNextPage ? "disabled" : ""
                }`}
                nextLinkClassName={"page-link"}
                breakClassName={"page-item"}
                breakLinkClassName={"page-link"}
              />
            </div>
          </>
        )}
      </div>
      <ImageSliderModal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        images={selectedImages}
      />
    </div>
  );
};

export default UniversalStockRequestCom;
