import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Select from "react-select";
import { toast } from "react-toastify";
import { inventoryService } from "../../../services/inventoryService";
import moment from "moment";
import ReactPaginate from "react-paginate";

const StockAuditViewCom = () => {
  const [storeData, setStoreData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const user = JSON.parse(localStorage.getItem("user"));

  const formik = useFormik({
    initialValues: {
      stores: null,
      dateFrom: moment().startOf("month").format("YYYY-MM-DD"),
      dateTo: moment().format("YYYY-MM-DD"),
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      fetchAuditData(values);
      setCurrentPage(0); // Reset to first page on new submit
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
        formik.setFieldValue("stores", {
          value: defaultStore._id,
          label: defaultStore.name,
        });
        // formik.handleSubmit();
        fetchAuditData(formik.values, true);
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
    }
  };

  // const fetchAuaditData = async () => {
  //   try {
  //     const response = await inventoryService.getStockAudit();
  //     if (response.success) {
  //       setStoreData(response?.data?.data);
  //     } else {
  //       toast.error(response.message);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching stores:", error);
  //   }
  // };
  const fetchAuditData = async (values, isFirstTime = false) => {
    const store = values?.stores?.value || user?.stores?.[0];
    setLoading(true);

    try {
      const startDate = isFirstTime
        ? moment().format("YYYY-MM-DD")
        : values.dateFrom;

      const endDate = isFirstTime
        ? moment().format("YYYY-MM-DD")
        : values.dateTo;

      const response = await inventoryService.getStockAudit({
        store,
        startDate,
        endDate,
      });

      if (response.success) {
        setAuditData(response.data.data.docs);
      } else {
        toast.error("Failed to fetch audit data");
      }
    } catch (error) {
      console.error("Error fetching audit data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (data) => {
    const csv = [
      "SRNO,Date,Store,Category,Store Qty,Count Qty",
      `${data?.srno},${data?.date},${data?.store},${data?.category},${data?.qtyStore},${data?.qty}`,
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
      <h4 className="mb-4 font-weight-bold">Stock Audit View</h4>
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
        </div>
        <div className="col">
          <label className="form-label fw-medium">Date From</label>
          <input
            type="date"
            className="form-control"
            value={formik.values.dateFrom}
            onChange={(e) => formik.setFieldValue("dateFrom", e.target.value)}
          />
        </div>
        <div className="col">
          <label className="form-label fw-medium">Date To</label>
          <input
            type="date"
            className="form-control"
            value={formik.values.dateTo}
            onChange={(e) => formik.setFieldValue("dateTo", e.target.value)}
          />
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
                  <th className="py-3">SRNO</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Store</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Store Qty</th>

                  <th className="py-3">Count Qty</th>
                  <th className="py-3">View</th>
                  <th className="py-3">Download</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData?.map((item, index) => (
                    <tr key={item._id} className="align-middle">
                      <td className="py-3">
                        {index + 1 + currentPage * itemsPerPage}
                      </td>
                      <td className="py-3">
                        {moment(item.auditDate).format("YYYY-MM-DD")}
                      </td>
                      <td className="py-3">{item.store?.name}</td>
                      <td className="py-3">{item.productCategory}</td>
                      <td className="py-3">{item?.storeQuantity || 0}</td>

                      <td className="py-3">{item.countQuantity}</td>
                      <td className="py-3">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            alert(
                              `Viewing details for ${item.product.displayName} in store ${item.store.name}`
                            )
                          }
                        >
                          View
                        </button>
                      </td>
                      <td className="py-3">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            handleDownload({
                              srno: index + 1,
                              date: item.auditDate,
                              store: item.store?.name,
                              category: item.productCategory,
                              qty: item.countQuantity,
                              qtyStore: item?.storeQuantity,
                            })
                          }
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
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

export default StockAuditViewCom;
