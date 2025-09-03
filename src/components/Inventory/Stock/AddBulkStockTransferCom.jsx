import React, { useState, useEffect } from "react";
import Select from "react-select";
import "bootstrap/dist/css/bootstrap.min.css";
import { inventoryService } from "../../../services/inventoryService";
import { toast } from "react-toastify";

const AddBulkStockTransferCom = () => {
  // State for form fields
  const [from, setFrom] = useState(null); // Initialize as null, will set default later
  const [to, setTo] = useState(null);
  const [file, setFile] = useState(null); // State for file input
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
    } else {
      toast.error("Please upload a valid CSV file");
      setFile(null);
      e.target.value = null; // Reset file input
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!from || !to || !file) {
      toast.error(
        "Please select source store, destination store, and upload a CSV file"
      );
      return;
    }

    if (from.value === to.value) {
      toast.error("Source and destination stores cannot be the same");
      return;
    }

    setLoading(true);
    try {
      const response = await inventoryService.bulkStockTransferUpload(
        from.value,
        to.value,
        file
      );
      if (response.success) {
        toast.success("Stock transfer successfully");
        // Reset form
        setTo(null);
        setFile(null);
        document.getElementById("bulkUploadFile").value = null; // Reset file input
      } else {
        toast.error(response.message || "Failed to upload stock transfer");
      }
    } catch (error) {
      toast.error("Error uploading stock transfer");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStores();
  }, []);

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getStores();
      if (response.success) {
        const stores = response?.data?.data || [];
        setStoreData(stores);

        // Set default 'from' based on user's store ID
        if (user.stores && user.stores.length > 0) {
          const userStoreId = user.stores[0]; // Use first store ID
          const defaultStore = stores.find(
            (store) => store._id === userStoreId
          );
          if (defaultStore) {
            setFrom({
              value: defaultStore._id,
              label: `${defaultStore.name}${
                defaultStore.storeNumber ? ` / ${defaultStore.storeNumber}` : ""
              }`,
            });
          } else {
            // Fallback to hardcoded default if no matching store is found
            setFrom({
              value: "27",
              label: "ELITE HOSPITAL / 27",
            });
          }
        } else {
          // Fallback to hardcoded default if no stores in user data
          setFrom({
            value: "27",
            label: "ELITE HOSPITAL / 27",
          });
        }
      } else {
        toast.error(response.message);
        // Set fallback default if API fails
        setFrom({
          value: "27",
          label: "ELITE HOSPITAL / 27",
        });
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
      // Set fallback default on error
      setFrom({
        value: "27",
        label: "ELITE HOSPITAL / 27",
      });
    } finally {
      setLoading(false);
    }
  };

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}${
      vendor.storeNumber ? ` / ${vendor.storeNumber}` : ""
    }`,
  }));

  return (
    <div className="container-fluid px-md-5 px-2 py-5">
      <h1 className="h2 text-dark fw-bold mb-4 px-md-5 px-2">
        Add Bulk Stock Transfer
      </h1>
      <div className="px-md-5">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <div>
                  <label htmlFor="from" className="form-label font-weight-500">
                    From
                  </label>
                  <Select
                    id="from"
                    value={from}
                    onChange={setFrom}
                    options={storeOptions}
                    isDisabled={true}
                    className="w-100"
                    isLoading={loading}
                    placeholder="Select..."
                  />
                </div>
              </div>
              <div className="col-12">
                <div>
                  <label htmlFor="to" className="form-label font-weight-500">
                    To
                  </label>
                  <Select
                    id="to"
                    value={to}
                    onChange={setTo}
                    options={storeOptions}
                    placeholder="Select..."
                    className="w-100"
                    isLoading={loading}
                  />
                </div>
              </div>
              <div className="col-12">
                <div>
                  <label
                    htmlFor="bulkUploadFile"
                    className="form-label font-weight-500"
                  >
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    id="bulkUploadFile"
                    className="form-control"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="col-12">
                <button
                  type="submit"
                  className="btn custom-button-bgcolor"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBulkStockTransferCom;
