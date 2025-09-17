import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaArrowLeft, FaArrowRight, FaSearch } from "react-icons/fa";
import { purchaseService } from "../../services/purchaseService";
import { toast } from "react-toastify";
import moment from "moment";
import PurchaseModal from "../../components/Perchase/PurchaseModal";
import CommonButton from "../../components/CommonButton/CommonButton";
import LensModal from "../../components/Perchase/LensModal";

function ViewPurchase() {
  const [vendor, setVendor] = useState([]);
  const [store, setStore] = useState([]);
  const [fromDate, setFromDate] = useState(() => {
    const previousDate = new Date();
    previousDate.setMonth(previousDate.getMonth() - 1);
    return previousDate;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10); // you can make this selectable
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [toDate, setToDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [vendorData, setVendorData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [filterType, setFilterType] = useState({
    value: "vendor",
    label: "Purchase",
  });
  const [invoiceData, setInvoiceData] = useState([]);

  const filterOptions = [
    { value: "vendor", label: "Purchase" },
    { value: "invoice", label: "Vendor Invoice" },
  ];
  const indexOfFirstRow =
    totalResults > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
  const indexOfLastRow =
    totalResults > 0 ? Math.min(currentPage * rowsPerPage, totalResults) : 0;

  // Fetch vendors and stores on component mount
  useEffect(() => {
    getVendors(); // Call getVendors by default
    getStores();
  }, []);

  const [defaultStoreSet, setDefaultStoreSet] = useState(false);

  // Set default store from localStorage once
  useEffect(() => {
    if (storeData.length === 0 || defaultStoreSet) return;

    const storedStoreId = JSON.parse(localStorage.getItem("user"))?.stores?.[0];
    if (storedStoreId) {
      const defaultStore = storeData.find(
        (store) => store._id === storedStoreId
      );
      if (defaultStore) {
        const defaultStoreOption = [
          { value: defaultStore._id, label: defaultStore.name },
        ];
        setStore(defaultStoreOption);
      }
    }
    setDefaultStoreSet(true); // mark that default store has been applied
  }, [storeData, defaultStoreSet]);

  // Fetch purchase logs when store, vendor, or date changes
  useEffect(() => {
    // Only fetch if store is set
    if (store.length === 0) return;

    getPurchaseLogs();
  }, [store, vendor, fromDate, toDate]);

  const getVendors = async () => {
    setLoading(true);
    try {
      const response = await purchaseService.getVendors();
      if (response.success) {
        setVendorData(response?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Vendor fetch error:", error);
      toast.error("Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await purchaseService.getStores();
      if (response.success) {
        setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Store fetch error:", error);
      toast.error("Failed to fetch stores");
    } finally {
      setLoading(false);
    }
  };

  const getInvoices = async (page = 1) => {
    const vendorId = vendor.map((option) => option.value);
    const storeId = store.map((option) => option.value);
    setLoading(true);
    try {
      const response = await purchaseService.getInvoices(
        fromDate.getTime(),
        toDate.getTime(),
        storeId,
        vendorId,
        page,
        rowsPerPage // ✅ pass limit
      );
      if (response.success) {
        setInvoiceData(response?.data?.data?.data); // page data
        setTotalPages(response?.data?.data?.totalPages);
        setTotalResults(response?.data?.data?.totalRecords);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Invoice fetch error:", error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const storeId = store.map((option) => option.value);

  const getPurchaseLogs = async (page = 1) => {
    const vendorId = vendor.map((option) => option.value);
    setLoading(true);
    try {
      const response = await purchaseService.getPurchaseLog(
        fromDate.getTime(),
        toDate.getTime(),
        storeId,
        vendorId,
        page,
        rowsPerPage
      );
      if (response.success) {
        setPurchaseData(response?.data?.data?.docs);
        setTotalPages(response?.data?.data?.totalPages);
        setTotalResults(response?.data?.data?.totalDocs);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Purchase log fetch error:", error);
      toast.error("Failed to fetch purchase logs");
    } finally {
      setLoading(false);
    }
  };

  const vendorOptions = vendorData?.docs?.map((vendor) => ({
    value: vendor._id,
    label: vendor.companyName,
  }));

  const storeOptions = storeData?.map((store) => ({
    value: store._id,
    label: store.name,
  }));

  const btnSubmit = (e) => {
    setCurrentPage(1);
    e.preventDefault();
    if (filterType.value === "vendor") {
      setPurchaseData([]);
      getPurchaseLogs(1);
    } else if (filterType.value === "invoice") {
      setInvoiceData([]);
      const vendorId = vendor.map((option) => option.value); // get selected vendor(s)
      getInvoices(1);
    }
  };

  const handleViewClick = (purchase) => {
    setSelectedPurchase(purchase);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPurchase(null);
  };

  const filteredData = purchaseData?.filter((item) => {
    const searchText = search.toLowerCase();
    return (
      item?.vendor?.companyName?.toLowerCase().includes(searchText) ||
      item?.store?.companyName?.toLowerCase().includes(searchText) ||
      moment(item?.invoiceDate).format("DD-MM-YYYY").includes(searchText) ||
      String(item?.totalQuantity).includes(searchText) ||
      String(item?.netAmount).includes(searchText)
    );
  });

  const filteredInvoiceData = invoiceData?.filter((item) => {
    const searchText = search.toLowerCase();
    return (
      item?.vendor?.companyName?.toLowerCase().includes(searchText) ||
      item?.store?.companyName?.toLowerCase().includes(searchText) ||
      item?.invoiceNumber?.toLowerCase().includes(searchText) ||
      moment(item?.invoiceDate).format("DD-MM-YYYY").includes(searchText)
    );
  });

  const handleDownload = async (e, invoice) => {
    e.preventDefault();

    const lens = invoice?.lens;
    if (!lens?.item) {
      toast.error("No lens data found in invoice");
      return;
    }

    // Build CSV rows (newBarcode, sku, MRP)
    const finalData = [
      {
        sku: lens.item?.sku,
        barcode: lens.item?.newBarcode,
        price: lens.item?.MRP,
      },
    ];

    const result = { data: finalData };
    setLoading(true);

    try {
      const response = await purchaseService.exportCsv(result);
      if (response.success) {
        const csvData = response.data;
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice_${invoice?.invoiceNumber}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Export CSV error:", error);
      toast.error("Failed to export CSV");
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadforPurchase = async (e, invoice) => {
    e.preventDefault();
    console.log("products", invoice?.products);

    const products = invoice?.products;
    if (!products?.length) {
      toast.error("No products found in invoice");
      return;
    }

    // Build CSV rows (newBarcode, sku, MRP) safely
    const finalData = products
      .filter(
        (p) =>
          p?.product &&
          p?.product?.sku &&
          p?.product?.newBarcode &&
          p?.product?.MRP
      ) // ✅ only valid products
      .map((p) => ({
        sku: p.product.sku,
        barcode: p.product.newBarcode,
        price: p.product.MRP,
      }));

    if (!finalData.length) {
      toast.error("No valid product data to export");
      return;
    }

    const result = { data: finalData };
    setLoading(true);

    try {
      const response = await purchaseService.exportCsv(result);
      if (response.success) {
        const csvData = response.data;
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `invoice_${invoice?.invoiceNumber || "purchase"}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Export CSV error:", error);
      toast.error("Failed to export CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-md-5">
      <div className="border-0 mb-4 px-md-3">
        <div className="">
          <form>
            <div className="row g-3">
              <div className="col-md-3">
                <label
                  htmlFor="filterType"
                  className="form-label font-weight-600"
                >
                  FILTER BY
                </label>
                <Select
                  options={filterOptions}
                  value={filterType}
                  onChange={(selected) => {
                    setFilterType(selected);
                  }}
                  placeholder="Select filter"
                />
              </div>
              <div className="col-md-3">
                <label
                  htmlFor="vendorName"
                  className="form-label font-weight-600"
                >
                  SELECT VENDOR
                </label>
                <Select
                  options={vendorOptions}
                  value={vendor}
                  isMulti
                  onChange={setVendor}
                  placeholder="Select..."
                  className="basic-select"
                  classNamePrefix="select"
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="store" className="form-label font-weight-600">
                  STORES
                </label>
                <Select
                  options={storeOptions}
                  value={store}
                  isMulti
                  onChange={setStore}
                  placeholder="Select..."
                  className="basic-select"
                  classNamePrefix="select"
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="from" className="form-label font-weight-600">
                  DATE FROM
                </label>
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div className="col-md-3">
                <label htmlFor="to" className="form-label font-weight-600">
                  DATE TO
                </label>
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div className="col-12 mt-3">
                <CommonButton
                  loading={loading}
                  buttonText="Submit"
                  onClick={(e) => btnSubmit(e)}
                  className="btn btn-primary w-auto bg-indigo-500 hover-bg-indigo-600 text-white"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="px-md-3">
        <div className="card shadow-none border">
          <div className="">
            <h4 className="h6 mb-0 p-3 fw-bold">
              {filterType.value === "invoice" ? "Invoices" : "Purchases"}
            </h4>
          </div>
          <div className="">
            <div className="mb-3 mx-2">
              <div className="input-group w-25">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch
                    className="text-muted custom-search-icon"
                    style={{ color: "#94a3b8" }}
                  />
                </span>
                <input
                  type="search"
                  className="form-control border-start-0 py-2"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="table-responsive px-2">
              {filterType.value === "invoice" ? (
                <table className="table border-top table-hover">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="custom-perchase-th py-3">
                        SRNO
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        INVOICE NO
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        VENDOR
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        STORE
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        DATE
                      </th>

                      <th scope="col" className="custom-perchase-th">
                        AMOUNT
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        ACTION
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        BARCODE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoiceData?.length > 0 ? (
                      filteredInvoiceData.map((invoice, index) => {
                        const job = invoice?.jobWorks?.[0]; // safely get first job
                        const sale = invoice?.sale;
                        const lens = job?.lens;

                        return (
                          <tr key={invoice._id || index}>
                            <td>{indexOfFirstRow + index}</td>{" "}
                            {/* Calculate SRNO */}
                            <td>{invoice?.invoiceNumber || "N/A"}</td>
                            <td>{invoice?.vendor?.companyName || "N/A"}</td>
                            <td>{invoice?.store?.name || "N/A"}</td>
                            <td>
                              {invoice?.updatedAt
                                ? moment(invoice?.updatedAt).format(
                                    "DD-MM-YYYY"
                                  )
                                : "N/A"}
                            </td>
                            {console.log(invoice, "testtttttt")}
                            <td>
                              {/* {sale?.netAmount ??
                                job?.amount ?? */}
                              {invoice?.totalAmount}
                              {/* "N/A"} */}
                            </td>
                            <td
                              role="button"
                              onClick={() => handleViewClick(invoice)}
                            >
                              <i className="bi bi-eye text-primary"></i>
                            </td>
                            <td>
                              <div
                                onClick={(e) => handleDownload(e, invoice)}
                                className="btn btn-sm btn-primary"
                              >
                                DOWNLOAD
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="10"
                          className="px-4 py-3 text-center custom-perchase-th"
                        >
                          No data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="table border-top table-hover">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="custom-perchase-th py-3">
                        SRNO
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        VENDOR
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        STORE
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        DATE
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        QTY
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        AMOUNT
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        ACTION
                      </th>
                      <th scope="col" className="custom-perchase-th">
                        BARCODE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData?.length > 0 ? (
                      filteredData?.map((item, index) => (
                        <tr key={index}>
                          <td>{indexOfFirstRow + index}</td>{" "}
                          {/* Calculate SRNO */}
                          <td>{item?.vendor?.companyName}</td>
                          <td>{item?.store?.name || "N/A"}</td>
                          <td>
                            {moment(item?.invoiceDate).format("DD-MM-YYYY")}
                          </td>
                          <td>{item?.totalQuantity}</td>
                          <td>{item?.netAmount}</td>
                          <td
                            role="button"
                            onClick={() => handleViewClick(item)}
                          >
                            <i className="bi bi-eye text-primary"></i>
                          </td>
                          <td>
                            <div
                              onClick={(e) =>
                                handleDownloadforPurchase(e, item)
                              }
                              className="btn btn-sm btn-primary"
                            >
                              DOWNLOAD
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-4 py-3 text-center custom-perchase-th"
                        >
                          No data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            <div className="d-flex px-3 justify-content-between align-items-center">
              <div className="text-muted fw-normal">
                Showing <span className="fw-medium">{indexOfFirstRow}</span> to{" "}
                <span className="fw-medium">{indexOfLastRow}</span> of{" "}
                <span className="fw-medium">{totalResults || 0}</span> results
              </div>
              <nav role="navigation" aria-label="Navigation">
                <ul className="d-flex justify-content-center list-unstyled">
                  <li className="me-3">
                    <button
                      className="btn bg-white border"
                      type="button"
                      onClick={() => {
                        const newPage = currentPage - 1;
                        setCurrentPage(newPage);
                        filterType.value === "invoice"
                          ? getInvoices(newPage)
                          : getPurchaseLogs(newPage);
                      }}
                      disabled={currentPage === 1}
                    >
                      <FaArrowLeft className="me-1" /> Previous
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn bg-white border"
                      type="button"
                      onClick={() => {
                        const newPage = currentPage + 1;
                        setCurrentPage(newPage);
                        filterType.value === "invoice"
                          ? getInvoices(newPage)
                          : getPurchaseLogs(newPage);
                      }}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next <FaArrowRight className="ms-1" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {filterType.value === "vendor" && (
        <PurchaseModal
          show={showModal}
          onHide={handleCloseModal}
          purchase={selectedPurchase}
          filterType={filterType.value}
          onUpdate={getInvoices}
          currentPage={currentPage}
        />
      )}
      {filterType.value === "invoice" && (
        <LensModal
          show={showModal}
          onHide={handleCloseModal}
          purchase={selectedPurchase}
          filterType={filterType.value}
          onUpdate={() => getInvoices(currentPage)}
          currentPage={currentPage}
        />
      )}
    </div>
  );
}

export default ViewPurchase;
