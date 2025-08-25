import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaArrowLeft, FaArrowRight, FaSearch } from "react-icons/fa";
import { purchaseService } from "../../services/purchaseService";
import { printLogs } from "../../utils/constants";
import { toast } from "react-toastify";
import moment from "moment";
import PurchaseModal from "../../components/Perchase/PurchaseModal";
import CommonButton from "../../components/CommonButton/CommonButton";
function ViewPurchase() {
  const [vendor, setVendor] = useState(null);
  const [store, setStore] = useState(null);
  const [fromDate, setFromDate] = useState(() => {
    const previousDate = new Date();
    previousDate.setDate(previousDate.getDate() - 1);
    return previousDate;
  });
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
  }, []); // run only once when component mounts

  useEffect(() => {
    const storedStoreId = JSON.parse(localStorage.getItem("user"))?.stores?.[0];
    if (storedStoreId && storeData.length > 0) {
      const defaultStore = storeData.find(
        (store) => store._id === storedStoreId
      );
      if (defaultStore) {
        setStore([
          {
            value: defaultStore._id,
            label: defaultStore.name,
          },
        ]);
      }
    }
  }, [storeData]); // run when storeData updates

  const getPurchaseLogs = async () => {
    const vendorId = vendor.map((option) => option.value);
    const storeId = store.map((option) => option.value);
    setLoading(true);

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
    label: `${vendor.name}`,
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

  const filteredData = purchaseData?.docs?.filter((item) => {
    const searchText = search.toLowerCase();
    return (
      item?.vendor?.companyName?.toLowerCase().includes(searchText) ||
      item?.store?.companyName?.toLowerCase().includes(searchText) ||
      moment(item?.invoiceDate).format("DD-MM-YYYY").includes(searchText) ||
      String(item?.totalQuantity).includes(searchText) ||
      String(item?.netAmount).includes(searchText)
    );
  });
  console.log("filteredData", filteredData);

  const handleDownload = async (e) => {
    e.preventDefault();

    let finalData = []; // Initialize the finalData array

    filteredData?.forEach((item) => {
      const selected = item?.products; // Assuming 'products' is an array
      selected?.forEach((product) => {
        // Loop through each product
        const sku = product?.product?.sku;
        const newBarcode = product?.product?.newBarcode;
        const sellPrice = product?.product?.sellPrice;
        const quantity = parseInt(product.quantity) || 0;

        console.log("Selected Product:", quantity);

        // Push to finalData based on quantity
        for (let i = 0; i < quantity; i++) {
          finalData.push({
            sku: sku,
            barcode: newBarcode,
            price: sellPrice,
          });
        }
      });
    });

    // Wrap finalData inside an object with a 'data' key
    const result = {
      data: finalData,
    };

    console.log("result", result); // This will log the final object in the desired format

    setLoading(true);

    try {
      const response = await purchaseService.exportCsv(result);

      if (response.success) {
        const csvData = response.data; // string: e.g., "sku,barcode,price\n7STAR-9005-46,10027,1350"

        // Create a Blob from the CSV string
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        // Create a temporary download link
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "barcodes.csv"); // Set the desired filename
        document.body.appendChild(link);
        link.click(); // Trigger the download
        document.body.removeChild(link); // Clean up
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }

    // Call your API here with `finalData`
  };

  return (
    <div className="container-fluid p-md-5">
      <div className=" border-0 mb-4 px-md-3">
        <div className="">
          <form>
            <div className="row g-3">
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
              <div className="col-12 mt-3 ">
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
            <h4 className="h6 mb-0 p-3 fw-bold">Purchases</h4>
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
                  {purchaseData?.docs?.length > 0 ? (
                    purchaseData?.docs?.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item?.vendor?.companyName}</td>
                        <td>{item?.store?.companyName}</td>
                        <td>
                          {moment(item?.invoiceDate).format("DD-MM-YYYY")}
                        </td>
                        <td>{item?.totalQuantity}</td>
                        <td>{item?.netAmount}</td>
                        <td role="button" onClick={() => handleViewClick(item)}>
                          <i className="bi bi-eye text-primary"></i>
                        </td>
                        <td>
                          <div
                            onClick={(e) => handleDownload(e)}
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
            </div>
            <div className="d-flex px-3 justify-content-between align-items-center ">
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
