import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import moment from "moment";
import ReactPaginate from "react-paginate";
import { inventoryService } from "../../../services/inventoryService";
import { purchaseService } from "../../../services/purchaseService";

const UniversalStockRequestCom = () => {
  const [storeData, setStoreData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [rowStoreOptions, setRowStoreOptions] = useState({}); // Store options per row
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
    hasPrevPage: false,
    hasNextPage: false,
  });
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
      toast.error("Failed to fetch stores");
    }
  };

  useEffect(() => {
    if (storeData.length > 0) {
      formik.setFieldValue("stores", {
        value: storeData[0]._id,
        label: storeData[0].name,
      });
      fetchAuditData(formik.values, true);
    }
  }, [storeData]);


 
const fetchAuditData = async (values, isInitial = false, newPage) => {
  const storeId = values?.stores?.value ? [values.stores.value] : user?.stores || [];
  setLoading(true);

  try {
    const response = await purchaseService.getUniversalStock(
      values.dateFrom,
      values.dateTo,
      storeId,
      isInitial ? 1 : newPage || 1,
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
        productId: item.product._id,
      }));

      setAuditData(mappedData);

      // ✅ Removed the API call for each product here

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

  // Prevent refetching if already loaded
  if (rowStoreOptions[ordNo]) return;

  try {
    const response = await inventoryService.getStoresForUniverlStock({ productId });

    // ✅ Correct nested data extraction
    const storesData = response?.data?.data || [];

    if (response?.data?.success && Array.isArray(storesData)) {
      // ✅ Convert store data to react-select format
      const storeOptions = storesData.map((item) => ({
        value: item.store?._id,
        label: item.store?.name,
        availableQuantity: item.availableQuantity ?? 0,
      }));

      // ✅ Update only that row’s dropdown options
   setRowStoreOptions((prev) => ({
        ...prev,
        [ordNo]: storeOptions,
      }));
console.log(storeOptions,"this is all row");

    } else {
      toast.error(response?.data?.message || "Failed to fetch stores for product");
    }
  } catch (error) {
    console.error(`❌ Error fetching stores for productId ${productId}:`, error);
    toast.error("Failed to fetch stores for product");
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
    link.setAttribute("download", `stock_audit_${moment(data.date).format("D-M-YYYY")}.csv`);
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
    fetchAuditData(formik.values, false, event.selected + 1);
  };

//    console.log(`Fetching stores for productId: ${productId}, ordNo: ${ordNo}`);
// console.log("API response:", response);
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
        <button type="submit" className="btn btn-primary">
          Submit Order
        </button>
      </div>
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
                  <th className="py-3">Category</th>
                  <th className="py-3">SKU & Barcode</th>
                  <th className="py-3">Qty</th>
                  <th className="py-3">Image</th>
                  <th className="py-3">Payment Status</th>
                  <th className="py-3">Store Select</th>
                  <th className="py-3">Order Status</th>
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
                      <td className="py-3">{item.category}</td>
                      <td className="py-3">{item.sku}</td>
                      <td className="py-3">{item.qty}</td>
                      <td className="py-3">
                        <button
                          className="btn btn-outline-info btn-sm"
                          onClick={() => alert(`Viewing image: ${item.image}`)}
                        >
                          📷
                        </button>
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
    onMenuOpen={() => fetchStoresForProduct(item.productId, item.ordNo)}
    classNamePrefix="react-select"
    className="w-100"
    // isLoading={!rowStoreOptions[item.ordNo]} 
    placeholder={
      rowStoreOptions[item.ordNo]
        ? "Select store..."
        : "show available stores..."
    }
    getOptionLabel={(option) => `${option.label} (Qty: ${option.availableQuantity})`}
  />
</td>


                      <td className="py-3">
                        {item.orderStatus === "View photo" ? (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              alert(`Viewing photo for ${item.sku} on ${item.date}`)
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
                          className="btn btn-outline-primary btn-sm me-2"
                          onClick={() =>
                            alert(
                              `Viewing details for ${item.category} on ${moment(
                                item.date
                              ).format("D-M-YYYY")}`
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
                pageCount={pagination.totalPages}
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

export default UniversalStockRequestCom;