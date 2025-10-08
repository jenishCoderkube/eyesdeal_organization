import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import moment from "moment";
import ReactPaginate from "react-paginate";
import { inventoryService } from "../../../services/inventoryService";

const UniversalStockOrderCom = () => {
  const [storeData, setStoreData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const user = JSON.parse(localStorage.getItem("user")) || { stores: [] };

  const formik = useFormik({
    initialValues: {
      stores: null,
      dateFrom: moment().startOf("month").format("YYYY-MM-DD"),
      dateTo: moment().format("YYYY-MM-DD"),
    },
    validationSchema: Yup.object({
      stores: Yup.object().nullable().required("Store is required"),
      dateFrom: Yup.date().required("Date From is required"),
      dateTo: Yup.date().required("Date To is required"),
    }),
    onSubmit: (values) => {
      fetchAuditData(values);
      setCurrentPage(0);
    },
  });

  useEffect(() => {
    fetchStores();
  }, []);

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
    }
  };

  // useEffect(() => {
  //   // Mock stores
  //   const mockStores = [
  //     { _id: "1", name: "Bhatar" },
  //     { _id: "2", name: "Navsari" },
  //   ];
  //   setStoreData(mockStores);
  // }, []);

  useEffect(() => {
    if (storeData.length > 0) {
      formik.setFieldValue("stores", {
        value: storeData[0]._id,
        label: storeData[0].name,
      });
      fetchAuditData(formik.values, true);
    }
  }, [storeData]);

  const fetchAuditData = async (values, isFirstTime = false) => {
    setLoading(true);

    try {
      // Mock data with dates in September 2025 to match default form values
      const mockAuditData = [
        {
          ordNo: 1,
          date: "2025-09-01",
          store: "",
          category: "Electronics",
          sku: "SKU123",
          qty: 12,
          paymentStatus: "Unpaid",
          orderStatus: "Pending",
        },
        {
          ordNo: 2,
          date: "2025-09-02",
          store: "",
          category: "Groceries",
          sku: "SKU456",
          qty: 45,
          paymentStatus: "Success",
          orderStatus: "Submitted",
        },
        {
          ordNo: 3,
          date: "2025-09-03",
          store: "Navsari",
          category: "Clothing",
          sku: "SKU789",
          qty: 20,
          paymentStatus: "Success",
          orderStatus: "Approved",
        },
        {
          ordNo: 4,
          date: "2025-09-04",
          store: "",
          category: "Toys",
          sku: "SKU012",
          qty: 8,
          paymentStatus: "Unpaid",
          orderStatus: "Pending",
        },
        {
          ordNo: 5,
          date: "2025-09-05",
          store: "Navsari",
          category: "Books",
          sku: "SKU345",
          qty: 15,
          paymentStatus: "Success",
          orderStatus: "Received",
        },
        {
          ordNo: 6,
          date: "2025-09-06",
          store: "",
          category: "Shoes",
          sku: "SKU678",
          qty: 30,
          paymentStatus: "Success",
          orderStatus: "Approved",
        },
        {
          ordNo: 7,
          date: "2025-09-07",
          store: "Navsari",
          category: "Bags",
          sku: "SKU901",
          qty: 18,
          paymentStatus: "Unpaid",
          orderStatus: "View photo",
        },
        {
          ordNo: 1,
          date: "2025-09-01",
          store: "",
          category: "Electronics",
          sku: "SKU123",
          qty: 12,
          paymentStatus: "Unpaid",
          orderStatus: "Pending",
        },
        {
          ordNo: 2,
          date: "2025-09-02",
          store: "",
          category: "Groceries",
          sku: "SKU456",
          qty: 45,
          paymentStatus: "Success",
          orderStatus: "Submitted",
        },
        {
          ordNo: 3,
          date: "2025-09-03",
          store: "Navsari",
          category: "Clothing",
          sku: "SKU789",
          qty: 20,
          paymentStatus: "Success",
          orderStatus: "Approved",
        },
        {
          ordNo: 4,
          date: "2025-09-04",
          store: "",
          category: "Toys",
          sku: "SKU012",
          qty: 8,
          paymentStatus: "Unpaid",
          orderStatus: "Pending",
        },
        {
          ordNo: 5,
          date: "2025-09-05",
          store: "Navsari",
          category: "Books",
          sku: "SKU345",
          qty: 15,
          paymentStatus: "Success",
          orderStatus: "Received",
        },
        {
          ordNo: 6,
          date: "2025-09-06",
          store: "",
          category: "Shoes",
          sku: "SKU678",
          qty: 30,
          paymentStatus: "Success",
          orderStatus: "Approved",
        },
        {
          ordNo: 7,
          date: "2025-09-07",
          store: "Navsari",
          category: "Bags",
          sku: "SKU901",
          qty: 18,
          paymentStatus: "Unpaid",
          orderStatus: "View photo",
        },
      ];

      // Filter data based on form values
      let filteredData = mockAuditData;
      if (values.stores || values.dateFrom || values.dateTo) {
        filteredData = mockAuditData.filter((item) => {
          const itemDate = moment(item.date);
          const dateFrom = moment(values.dateFrom);
          const dateTo = moment(values.dateTo);
          return (
            (!values.stores || item.store === values.stores.label) &&
            itemDate.isBetween(dateFrom, dateTo, undefined, "[]")
          );
        });
      }

      // If no data after filtering, fallback to all mock data on first load
      if (filteredData.length === 0 && isFirstTime) {
        filteredData = mockAuditData;
      }

      setAuditData(filteredData);
    } catch (error) {
      console.error("Error fetching audit data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (data) => {
    const csv = [
      "ORDNO,Date,Store,Category,SKU,Qty,Payment Status,Order Status",
      `${data.ordNo},${data.date},${data.store},${data.category},${data.sku},${data.qty},${data.paymentStatus},${data.orderStatus}`,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `stock_audit_${data.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const storeOptions = storeData.map((store) => ({
    value: store._id,
    label: store.name,
  }));

  const paginatedData = auditData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  return (
    <div className="card-body p-4">
      <h4 className="mb-4 font-weight-bold">Universal Stock Order View</h4>
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
      <div className="table-responsive mt-3">
        {loading ? (
          <div className="text-center py-5">Loading...</div>
        ) : (
          <>
            <table className="table table-striped table-hover">
              <thead className="border-top">
                <tr>
                  <th className="py-3">ORDNO</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Store</th>
                  <th className="py-3">SKU & Barcode</th>
                  <th className="py-3">Image</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Upload</th>
                  <th className="py-3">Shipping Address</th>

                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr key={index} className="align-middle">
                      <td className="py-3">{item.ordNo}</td>
                      <td className="py-3">
                        {moment(item.date).format("D-M-YYYY")}
                      </td>
                      <td className="py-3">{item.store}</td>
                      <td className="py-3">{item.sku}</td>

                      <td className="py-3">
                        <button
                          className="btn btn-outline-info btn-sm"
                          onClick={() =>
                            alert(
                              `Viewing image for ${item.sku} on ${item.date}`
                            )
                          }
                        >
                          📷
                        </button>
                      </td>
                      <td className="py-3">
                        {item.orderStatus === "View photo" ? (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              alert(
                                `Viewing photo for ${item.sku} on ${item.date}`
                              )
                            }
                          >
                            View photo
                          </button>
                        ) : (
                          <span className="badge bg-primary">
                            {item.orderStatus}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <button
                          className="btn btn-primary btn-sm text-white"
                          onClick={() =>
                            document
                              .getElementById(`uploadFile-${index}`)
                              .click()
                          }
                        >
                          Upload Photo-video
                        </button>
                        <input
                          type="file"
                          id={`uploadFile-${index}`}
                          accept="image/*,video/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              alert(`Uploaded: ${file.name}`);
                            }
                          }}
                        />
                      </td>

                      <td className="py-3">
                        <button
                          className="btn btn-primary btn-sm text-white"
                          onClick={() =>
                            alert(`Viewing address for ${item.address}`)
                          }
                        >
                          View Address
                        </button>
                      </td>

                      {/* <td className="py-3">
                        <span
                          className={`badge ${
                            item.paymentStatus === "Success"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </td> */}
                      {/* <td className="py-3">
                        <Select
                          options={storeOptions}
                          defaultValue={storeOptions.find(
                            (option) => option.label === item.store
                          )}
                          classNamePrefix="react-select"
                          className="w-100"
                        />
                      </td> */}

                      <td className="py-3">
                        <button
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() =>
                            alert(
                              `Viewing details for ${item.category} on ${item.date}`
                            )
                          }
                        >
                          View
                        </button>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleDownload(item)}
                        >
                          Download
                        </button>
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
                pageCount={Math.ceil(auditData.length / itemsPerPage)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                activeClassName={"active"}
                pageClassName={"page-item"}
                pageLinkClassName={"page-link"}
                previousClassName={"page-item"}
                previousLinkClassName={"page-link"}
                nextClassName={"page-item"}
                nextLinkClassName={"page-link"}
                breakClassName={"page-item"}
                breakLinkClassName={"page-link"}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UniversalStockOrderCom;
