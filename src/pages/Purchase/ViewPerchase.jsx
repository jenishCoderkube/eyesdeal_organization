import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { purchaseService } from "../../services/purchaseService";
import { printLogs } from "../../utils/constants";
import { toast } from "react-toastify";
import moment from "moment";
import PurchaseModal from "../../components/Perchase/PurchaseModal";
function ViewPurchase() {
  const [vendor, setVendor] = useState(null);
  const [store, setStore] = useState(null);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [search, setSearch] = useState("");
  const [vendorData, setVendorData] = useState([]);
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  console.log("purchaseData", purchaseData);

  const handleSubmit = (e) => {
    // e.preventDefault();
    // getPurchaseLogs();
    // Handle form submission
  };

  useEffect(() => {
    getVendor();
    getStores();
  }, []);

  const getPurchaseLogs = async () => {
    const vendorId = vendor.map((option) => option.value);
    const storeId = store.map((option) => option.value);

    try {
      const response = await purchaseService.getPurchaseLog(
        fromDate.getTime(),
        toDate.getTime(),
        storeId,
        vendorId
      );
      if (response.success) {
        console.log("response", response?.data?.data);
        setPurchaseData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };
  const getVendor = async () => {
    setLoading(true);
    try {
      const response = await purchaseService.getVendors();
      if (response.success) {
        setVendorData(response?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
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
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const vendorOptions = vendorData?.docs?.map((vendor) => ({
    value: vendor._id,
    label: vendor.companyName,
  }));

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name} / ${vendor.companyName}`,
  }));

  const btnSubmit = (e) => {
    e.preventDefault();
    getPurchaseLogs();
  };
  const handleViewClick = (purchase) => {
    setSelectedPurchase(purchase);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPurchase(null);
  };

  return (
    <div className="container-fluid p-md-5">
      <div className=" border-0 mb-4 px-md-3">
        <div className="">
          <form>
            <div className="row g-3">
              <div className="col-md-3">
                <label htmlFor="vendorName" className="form-label fw-medium">
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
                <label htmlFor="store" className="form-label fw-medium">
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
                <label htmlFor="from" className="form-label fw-medium">
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
                <label htmlFor="to" className="form-label fw-medium">
                  DATE TO
                </label>
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div className="col-12 mt-3 ">
                <button
                  onClick={(e) => btnSubmit(e)}
                  type="submit"
                  className="btn btn-primary"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="px-md-3">
        <div className="card p-3">
          <div className="">
            <h2 className="h5 mb-0 py-3">Purchases</h2>
          </div>
          <div className="">
            <div className="mb-3">
              <div className="input-group w-25">
                <span className="input-group-text">
                  <svg
                    className="bi"
                    width="16"
                    height="16"
                    fill="currentColor"
                  >
                    <use xlinkHref="/node_modules/bootstrap-icons/bootstrap-icons.svg#search" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="table-responsive">
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
                  {purchaseData?.docs?.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item?.vendor?.companyName}</td>
                      <td>{item?.store?.companyName}</td>
                      <td>{moment(item?.invoiceDate).format("DD-MM-YYYY")}</td>
                      <td>{item?.totalQuantity}</td>
                      <td>{item?.netAmount}</td>
                      <td role="button" onClick={() => handleViewClick(item)}>
                        <i className="bi bi-eye text-primary"></i>
                      </td>
                      <td>
                        <div className="btn btn-sm btn-primary">DOWNLOAD</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between align-items-center ">
              <div className="text-muted fw-normal">
                Showing <span className="fw-medium">1</span> to{" "}
                <span className="fw-medium">0</span> of{" "}
                <span className="fw-medium">0</span> results
              </div>
              <nav
                className=" sm:mb-0 sm:order-1"
                role="navigation"
                aria-label="Navigation"
              >
                <ul className="d-flex justify-content-center  list-unstyled">
                  <li className="me-3">
                    <button
                      className="btn bg-white border border-3  text-secondary disabled:cursor-not-allowed disabled:text-muted disabled:border-muted"
                      disabled
                    >
                      <FaArrowLeft className="me-1  text-secondary" /> Previous
                    </button>
                  </li>
                  <li>
                    <button
                      className="btn bg-white border border-3 text-secondary disabled:cursor-not-allowed disabled:text-muted disabled:border-muted"
                      disabled
                    >
                      Next <FaArrowRight className="ms-1  text-secondary" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
      <PurchaseModal
        show={showModal}
        onHide={handleCloseModal}
        purchase={selectedPurchase}
      />
    </div>
  );
}

export default ViewPurchase;
