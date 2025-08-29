import React, { useEffect, useState, useCallback, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "react-select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { workshopService } from "../../../services/Process/workshopService";
import NewOrderTable from "./NewOrderTable";
import InProcessTable from "./InProcessTable";
import InFittingTable from "./InFittingTable";
import ReadyTable from "./ReadyTable";

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

function WorkshopProcessCom() {
  const [activeStatus, setActiveStatus] = useState("New Order");
  const [storeData, setStoreData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    limit: 100,
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  });
  const [statusCounts, setStatusCounts] = useState({
    newOrder: 0,
    inProcess: 0,
    inFitting: 0,
    ready: 0,
  });
  const [loading, setLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const isInitialLoad = useRef(true);
  const currentFilters = useRef({
    stores: [],
    search: "",
    status: "inWorkshop",
    page: 1,
    limit: 100,
  });
  const lastSalesCallParams = useRef(null);
  const lastCountsCallParams = useRef(null);

  const formik = useFormik({
    initialValues: {
      stores: [],
      search: "",
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      const newFilters = {
        ...currentFilters.current,
        stores: values.stores.length
          ? values.stores.map((store) => store.value)
          : [],
        search: "", // Explicitly exclude search on form submit
        page: 1, // Reset to page 1
      };
      isInitialLoad.current = false;
      currentFilters.current = newFilters;
      fetchSalesAndCounts(newFilters, true);
    },
  });

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await workshopService.getStores();
      if (response.success) {
        setStoreData(response.data.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching stores");
    } finally {
      setLoading(false);
    }
  };

  const getStatusForTab = useCallback((status) => {
    switch (status) {
      case "In Process":
        return "inLab";
      case "In Fitting":
        return "inFitting";
      case "Ready":
        return "ready";
      case "New Order":
      default:
        return "inWorkshop";
    }
  }, []);

  const clearOrders = useCallback(() => {
    setOrders([]);
    setPagination({
      totalDocs: 0,
      limit: 100,
      page: 1,
      totalPages: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
    });
    lastSalesCallParams.current = null;
  }, []);

  const fetchSalesData = useCallback(async (filters, forceRefresh = false) => {
    const callKey = JSON.stringify({
      stores: filters.stores,
      status: filters.status,
      search: filters.search,
      page: filters.page,
      limit: filters.limit,
      populate: true,
    });

    if (!forceRefresh && lastSalesCallParams.current === callKey) {
      return;
    }

    setLoading(true);
    lastSalesCallParams.current = callKey;

    try {
      const params = {
        status: filters.status,
        search: filters.search || "",
        page: filters.page,
        limit: filters.limit,
        populate: true,
      };
      if (filters.stores.length) {
        params.stores = filters.stores;
      }

      const response = await workshopService.getSales(params);
      if (response.success) {
        // Ensure orders is an array
        const newOrders = Array.isArray(response.data.data.docs)
          ? response.data.data.docs
          : [];
        setOrders(newOrders);
        setPagination({
          totalDocs: response.data.data.totalDocs || 0,
          limit: response.data.data.limit || 100,
          page: response.data.data.page || 1,
          totalPages: response.data.data.totalPages || 1,
          hasPrevPage: response.data.data.hasPrevPage || false,
          hasNextPage: response.data.data.hasNextPage || false,
          prevPage: response.data.data.prevPage || null,
          nextPage: response.data.data.nextPage || null,
        });
      } else {
        toast.error(response.message);
        setOrders([]);
        setPagination({
          totalDocs: 0,
          limit: 100,
          page: 1,
          totalPages: 1,
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        });
      }
    } catch (error) {
      setOrders([]);
      toast.error("Error fetching orders data");
      setPagination({
        totalDocs: 0,
        limit: 100,
        page: 1,
        totalPages: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCounts = useCallback(async (filters, forceRefresh = false) => {
    const callKey = JSON.stringify({
      stores: filters.stores,
    });

    if (!forceRefresh && lastCountsCallParams.current === callKey) {
      return;
    }

    lastCountsCallParams.current = callKey;

    try {
      const params = {
        statuses: ["inWorkshop", "inLab", "inFitting", "ready"],
      };
      if (filters.stores.length) {
        params.stores = filters.stores;
      }

      const response = await workshopService.getOrderCount(params);
      if (response.success) {
        if (response.data.data.docs.length > 0) {
          const orderCounts = response.data.data.docs[0];
          setStatusCounts((prev) => ({
            ...prev,
            newOrder: orderCounts.inWorkshopCount || 0,
            inProcess: orderCounts.inLabCount || 0,
            inFitting: orderCounts.inFittingCount || 0,
            ready: orderCounts.readyCount || 0,
          }));
        } else {
          setStatusCounts((prev) => ({
            ...prev,
            newOrder: 0,
            inProcess: 0,
            inFitting: 0,
            ready: 0,
          }));
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching counts");
    }
  }, []);

  const fetchSalesAndCounts = useCallback(
    (filters, forceRefresh = false) => {
      setTabLoading(true);
      Promise.all([
        fetchSalesData(filters, forceRefresh),
        fetchCounts(filters, forceRefresh),
      ]).finally(() => {
        setTabLoading(false);
      });
    },
    [fetchSalesData, fetchCounts]
  );

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      const newFilters = {
        ...currentFilters.current,
        search: searchValue,
        page: 1, // Reset to page 1 on search
      };
      currentFilters.current = newFilters;
      // Fetch sales with search, counts without search
      fetchSalesData(newFilters, true);
      fetchCounts({ ...newFilters, search: "" }, true);
    }, 300),
    [fetchSalesData, fetchCounts]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    formik.setFieldValue("search", searchValue);
    debouncedSearch(searchValue);
  };

  // Handle page change
  const handlePageChange = (page) => {
    const newFilters = {
      ...currentFilters.current,
      page,
    };
    currentFilters.current = newFilters;
    fetchSalesData(newFilters);
  };

  // Handle initial page load
  useEffect(() => {
    clearOrders();
    setTabLoading(true);

    if (isInitialLoad.current) {
      getStores();
      const initialFilters = {
        stores: [],
        search: "",
        status: "inWorkshop",
        page: 1,
        limit: 100,
      };
      currentFilters.current = initialFilters;
      fetchSalesAndCounts(initialFilters);
      isInitialLoad.current = false;
    }
  }, [clearOrders, fetchSalesAndCounts]);

  // Handle tab changes
  useEffect(() => {
    if (!isInitialLoad.current) {
      clearOrders();
      const filters = {
        ...currentFilters.current,
        status: getStatusForTab(activeStatus),
        page: 1, // Reset to page 1 on tab change
      };
      currentFilters.current = filters;
      fetchSalesData(filters);
    }
  }, [activeStatus, getStatusForTab, clearOrders, fetchSalesData]);

  // Automatically set default store from localStorage
  useEffect(() => {
    const storedStoreId = user?.stores?.[0];
    console.log("User:", user);
    console.log("Stored Store ID:", storedStoreId);
    if (storedStoreId && storeData.length > 0) {
      const defaultStore = storeData.find(
        (store) => store._id === storedStoreId
      );
      console.log("Default Store:", defaultStore);
      if (defaultStore) {
        formik.setFieldValue("stores", [
          {
            value: defaultStore._id,
            label: defaultStore.name,
          },
        ]);
        console.log("Formik Stores Value Set:", formik.values.stores);
      } else {
        console.log("No matching store found for ID:", storedStoreId);
      }
    } else {
      console.log("No stored store ID or storeData is empty");
    }
  }, [storeData]);

  const storeOptions = storeData.map((store) => ({
    value: store._id,
    label: store.name,
  }));

  const statuses = [
    { name: "New Order", count: statusCounts.newOrder },
    { name: "In Process", count: statusCounts.inProcess },
    { name: "In Fitting", count: statusCounts.inFitting },
    { name: "Ready", count: statusCounts.ready },
  ];

  return (
    <div className="mt-4 px-3">
      <form onSubmit={formik.handleSubmit}>
        <div className="row g-1 align-items-end">
          <div className="col-12 col-md-6">
            <div className="row g-3 align-items-end">
              <div className="col-6">
                <label className="form-label fw-semibold">Stores</label>
                <Select
                  options={storeOptions}
                  value={formik.values.stores}
                  onChange={(selected) =>
                    formik.setFieldValue("stores", selected || [])
                  }
                  isMulti
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select stores..."
                  isLoading={loading}
                  isDisabled={loading}
                />
                {formik.touched.stores && formik.errors.stores && (
                  <div className="text-danger">{formik.errors.stores}</div>
                )}
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold">Search</label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  className="form-control"
                  placeholder="Search..."
                  value={formik.values.search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-4">
          Submit
        </button>
      </form>

      <div className="overflow-x-auto mt-4">
        <div className="d-flex gap-3 pb-2" style={{ minWidth: "600px" }}>
          {statuses.map((status) => (
            <button
              key={status.name}
              onClick={() => setActiveStatus(status.name)}
              className={`bg-transparent border-0 pb-2 px-1 fw-medium ${
                activeStatus === status.name
                  ? "common-text-color border-bottom common-tab-border-color"
                  : "text-secondary"
              } hover:text-dark focus:outline-none`}
              style={{ boxShadow: "none", outline: "none" }}
            >
              {status.name} ({status.count})
            </button>
          ))}
        </div>
      </div>

      <div
        className="border-bottom"
        style={{ margin: "-9px 0px 33px 0px" }}
      ></div>

      {activeStatus === "New Order" ? (
        <NewOrderTable
          orders={orders}
          loading={loading || tabLoading}
          refreshSalesData={() =>
            fetchSalesAndCounts(currentFilters.current, true)
          }
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      ) : activeStatus === "In Process" ? (
        <InProcessTable
          orders={orders}
          loading={loading || tabLoading}
          refreshSalesData={() =>
            fetchSalesAndCounts(currentFilters.current, true)
          }
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      ) : activeStatus === "In Fitting" ? (
        <InFittingTable
          orders={orders}
          loading={loading || tabLoading}
          refreshSalesData={() =>
            fetchSalesAndCounts(currentFilters.current, true)
          }
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      ) : activeStatus === "Ready" ? (
        <ReadyTable
          orders={orders}
          loading={loading || tabLoading}
          refreshSalesData={() =>
            fetchSalesAndCounts(currentFilters.current, true)
          }
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default WorkshopProcessCom;
