import React, { useState, useEffect } from "react";
import VendorListForm from "./VendorListForm";
import VendorListTable from "./VendorListTable";
import { vendorshopService } from "../../../services/Process/vendorshopService"; // Adjusted path and name

const VendorListCom = () => {
  const [stores, setStores] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch stores, vendors, and initial table data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch stores
        const storesResponse = await vendorshopService.getStores();
        if (storesResponse.data?.success) {
          setStores(
            storesResponse.data?.data.map((store) => ({
              value: store._id,
              label: store.name,
            }))
          );
        }

        // Fetch vendors
        const vendorsResponse = await vendorshopService.getVendors();

        if (vendorsResponse.success) {
          setVendors(
            vendorsResponse.data?.data?.docs?.map((vendor) => ({
              value: vendor._id,
              label: vendor.companyName,
            }))
          );
        }

        // Fetch initial table data (job works with default filters)
        const defaultFilters = {
          populate: true,
          status: "pending",
          page: 1, // Added to match the request URL
        };
        const jobWorksResponse = await vendorshopService.getJobWorks(
          defaultFilters
        );
        if (jobWorksResponse.success) {
          setFilteredData(jobWorksResponse.data.data.docs || []);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      const filters = {
        populate: true,
        status: "pending",
        stores: values.store ? [values.store.value] : [],
        vendors: values.vendor ? [values.vendor.value] : [],
        page: 1, // Added to match the request URL
      };
      const response = await vendorshopService.getJobWorks(filters);
      if (response.success) {
        setFilteredData(response.data.data.docs || []);
      } else {
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error filtering data:", error);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto px-3 pt-2">
      <div className="row justify-content-center">
        <div className="col-12">
          <div>
            <VendorListForm
              onSubmit={handleFormSubmit}
              stores={stores}
              vendors={vendors}
              loading={loading}
            />
          </div>
          <div className="card shadow-none border p-0 mt-3">
            <h6 className="fw-bold px-3 pt-3">Job Works</h6>
            <VendorListTable data={filteredData} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorListCom;
