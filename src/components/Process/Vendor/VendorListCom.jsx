import React, { useState, useEffect } from "react";
import VendorListForm from "./VendorListForm";
import VendorListTable from "./VendorListTable";
import { vendorshopService } from "../../../services/Process/vendorshopService";

const VendorListCom = () => {
  const [stores, setStores] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    limit: 50,
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  });
  const user = JSON.parse(localStorage.getItem("user"));
  const [defaultStore, setDefaultStore] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);

  // Fetch stores, vendors, and initial table data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch stores
        const storesResponse = await vendorshopService.getStores();
        let defaultStoreOptions = [];

        if (storesResponse.data?.success) {
          const storeOptions = storesResponse.data?.data.map((store) => ({
            value: store._id,
            label: store.name,
          }));
          setStores(storeOptions);

          // Set default store based on user.stores[0]
          if (user?.stores?.length) {
            defaultStoreOptions = storeOptions.filter((option) =>
              user.stores.includes(option.value)
            );
            setDefaultStore(defaultStoreOptions); // now array of stores
          }
        }

        // Fetch vendors (independent of stores success)
        const vendorsResponse = await vendorshopService.getVendors();
        if (vendorsResponse.success) {
          setVendors(
            vendorsResponse.data?.data?.docs?.map((vendor) => ({
              value: vendor._id,
              label: vendor.companyName,
            }))
          );
        }

        // Fetch initial job works data with default store filters
        const defaultFilters = {
          populate: true,
          status: "pending",
          page: 1,
          limit: 50,
          stores: defaultStoreOptions?.length
            ? defaultStoreOptions.map((s) => s.value)
            : [],
        };
        setCurrentFilters(defaultFilters);

        const jobWorksResponse = await vendorshopService.getJobWorks(
          defaultFilters
        );
        if (jobWorksResponse.success) {
          setFilteredData(jobWorksResponse.data.data.docs || []);
          setPagination({
            totalDocs: jobWorksResponse.data.data.totalDocs,
            limit: jobWorksResponse.data.data.limit,
            page: jobWorksResponse.data.data.page,
            totalPages: jobWorksResponse.data.data.totalPages,
            hasPrevPage: jobWorksResponse.data.data.hasPrevPage,
            hasNextPage: jobWorksResponse.data.data.hasNextPage,
            prevPage: jobWorksResponse.data.data.prevPage,
            nextPage: jobWorksResponse.data.data.nextPage,
          });
        } else {
          setFilteredData([]);
          setPagination({
            totalDocs: 0,
            limit: 50,
            page: 1,
            totalPages: 1,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: null,
            nextPage: null,
          });
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle form submission with filters
  const handleFormSubmit = async (values) => {
    setLoading(true);
    try {
      const filters = {
        populate: true,
        status: "pending",
        stores: values.store?.length ? values.store.map((s) => s.value) : [],
        vendors: values.vendor ? [values.vendor.value] : [],
        page: 1,
        limit: 50,
      };
      setSelectedVendor(values.vendor || null);
      setSelectedStore(values.store || null);
      setCurrentFilters(filters);

      const response = await vendorshopService.getJobWorks(filters);
      if (response.success) {
        setFilteredData(response.data.data.docs || []);
        setPagination({
          totalDocs: response.data.data.totalDocs,
          limit: response.data.data.limit,
          page: response.data.data.page,
          totalPages: response.data.data.totalPages,
          hasPrevPage: response.data.data.hasPrevPage,
          hasNextPage: response.data.data.hasNextPage,
          prevPage: response.data.data.prevPage,
          nextPage: response.data.data.nextPage,
        });
      } else {
        setFilteredData([]);
        setPagination({
          totalDocs: 0,
          limit: 50,
          page: 1,
          totalPages: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        });
      }
    } catch (error) {
      console.error("Error filtering data:", error);
      setFilteredData([]);
      setSelectedVendor(null);
      setSelectedStore(null);
    } finally {
      setLoading(false);
    }
  };
  const fetchJobWorks = async (filters) => {
    setLoading(true);
    try {
      const response = await vendorshopService.getJobWorks(filters);
      if (response.success) {
        setFilteredData(response.data.data.docs || []);
        setPagination({
          totalDocs: response.data.data.totalDocs,
          limit: response.data.data.limit,
          page: response.data.data.page,
          totalPages: response.data.data.totalPages,
          hasPrevPage: response.data.data.hasPrevPage,
          hasNextPage: response.data.data.hasNextPage,
          prevPage: response.data.data.prevPage,
          nextPage: response.data.data.nextPage,
        });
      } else {
        setFilteredData([]);
      }
    } catch (err) {
      console.error("Error fetching job works:", err);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search change (debounced if needed)
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    fetchJobWorks({
      ...currentFilters,
      page: 1,
      search: query, // <-- pass search value to API
    });
  };

  // Handle page change
  const handlePageChange = async (page) => {
    setLoading(true);
    try {
      const newFilters = { ...currentFilters, page };
      setCurrentFilters(newFilters);
      const response = await vendorshopService.getJobWorks(newFilters);
      if (response.success) {
        setFilteredData(response?.data?.data?.docs || []);
        setPagination({
          totalDocs: response?.data?.data?.totalDocs,
          limit: response?.data?.data?.limit,
          page: response?.data?.data?.page,
          totalPages: response?.data?.data?.totalPages,
          hasPrevPage: response?.data?.data?.hasPrevPage,
          hasNextPage: response?.data?.data?.hasNextPage,
          prevPage: response?.data?.data?.prevPage,
          nextPage: response?.data?.data?.nextPage,
        });
      } else {
        setFilteredData([]);
        setPagination({
          totalDocs: 0,
          limit: 50,
          page: 1,
          totalPages: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        });
      }
    } catch (error) {
      console.error("Error changing page:", error);
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
              initialStore={defaultStore} // now an array
            />
          </div>
          <div className="card shadow-none border p-0 mt-3">
            <h6 className="fw-bold px-3 pt-3">Job Works</h6>
            <VendorListTable
              data={filteredData}
              loading={loading}
              selectedVendor={selectedVendor}
              selectedStore={selectedStore}
              pagination={pagination}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange} // <-- pass
              searchQuery={searchQuery} // <-- pass
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorListCom;
