import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { workshopService } from "../../../services/Process/workshopService";
import NewOrderTable from "./NewOrderTable";
import InProcessTable from "./InProcessTable";
import InFittingTable from "./InFittingTable";
import ReadyTable from "./ReadyTable";

// Debounce utility to prevent rapid API calls
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
  const [orders, setOrders] = useState([]); // Changed from tableData/productTableData
  const [statusCounts, setStatusCounts] = useState({
    newOrder: 0,
    inProcess: 0,
    inFitting: 0,
    ready: 0,
  });
  const [loading, setLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);

  const isInitialLoad = useRef(true);
  const currentFilters = useRef({
    stores: [],
    startDate: null,
    endDate: null,
    search: "",
    status: "inWorkshop",
  });
  const lastSalesCallParams = useRef(null);
  const lastCountsCallParams = useRef(null);

  // Calculate default dates: today and one month ago
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const formik = useFormik({
    initialValues: {
      startDate: oneMonthAgo,
      endDate: today,
      stores: [],
      search: "",
    },
    validationSchema: Yup.object({}),
    onSubmit: (values) => {
      const newFilters = {
        stores: values.stores.length
          ? values.stores.map((store) => store.value)
          : [],
        startDate: values.startDate,
        endDate: values.endDate,
        search: values.search,
        status: getStatusForTab(activeStatus),
      };
      isInitialLoad.current = false;
      currentFilters.current = newFilters;
      fetchSalesAndCounts(newFilters, true); // Force refresh on form submit
    },
  });

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await workshopService.getStores();
      if (response.success) {
        setStoreData(response.data.data);
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
    lastSalesCallParams.current = null;
  }, []);

  const fetchSalesData = useCallback(async (filters, forceRefresh = false) => {
    const callKey = JSON.stringify({
      stores: filters.stores,
      status: filters.status,
      search: filters.search,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
      populate: true,
    });

    // Removed duplicate check to ensure API call on tab change
    setLoading(true);
    lastSalesCallParams.current = callKey;

    try {
      const params = {
        status: filters.status,
        search: filters.search || "",
        startDate: filters.startDate,
        endDate: filters.endDate,
        populate: true,
      };
      if (filters.stores.length) {
        params.stores = filters.stores;
      }

      const response = await workshopService.getSales(params);
      if (response.success) {
        setOrders(response.data.data.docs); // Pass raw docs directly
      } else {
        toast.error(response.message);
        setOrders([]);
      }
    } catch (error) {
      setOrders([]);
      toast.error("Error fetching orders data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCounts = useCallback(async (filters, forceRefresh = false) => {
    const callKey = JSON.stringify({
      stores: filters.stores,
      search: filters.search,
    });

    if (!forceRefresh && lastCountsCallParams.current === callKey) {
      // console.log("Skipping counts API call due to identical parameters");
      return;
    }

    lastCountsCallParams.current = callKey;

    try {
      const params = {
        search: filters.search || "",

        statuses: ["inWorkshop", "inLab", "inFitting", "ready"],
      };
      if (filters.stores.length) {
        params.stores = filters.stores;
      }

      const response = await workshopService.getOrderCount(params);
      if (response.success && response.data.data.docs[0]) {
        const orderCounts = response.data.data.docs[0];
        setStatusCounts((prev) => ({
          ...prev,
          newOrder: orderCounts.inWorkshopCount || 0,
          inProcess: orderCounts.inLabCount || 0,
          inFitting: orderCounts.inFittingCount || 0,
          ready: orderCounts.readyCount || 0,
        }));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Error fetching counts");
    }
  }, []);

  const fetchSalesAndCounts = useCallback(
    debounce((filters, forceRefresh = false) => {
      setTabLoading(true);
      Promise.all([
        fetchSalesData(filters, forceRefresh),
        fetchCounts(filters, forceRefresh),
      ]).finally(() => {
        setTabLoading(false);
      });
    }, 300),
    [fetchSalesData, fetchCounts]
  );

  // Handle initial page load (page refresh)
  useEffect(() => {
    clearOrders();
    setTabLoading(true);

    if (isInitialLoad.current) {
      getStores();
      const initialFilters = {
        stores: [],
        startDate: formik.values.startDate,
        endDate: formik.values.endDate,
        search: formik.values.search,
        status: "inWorkshop",
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
      };
      currentFilters.current = filters;
      fetchSalesData(filters);
    }
  }, [activeStatus, getStatusForTab, clearOrders, fetchSalesData]);

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
          <div className="col-12 col-md-6 d-flex flex-nowrap gap-3 align-items-end pe-3">
            <div className="col-6 col-md-4">
              <label htmlFor="startDate" className="form-label fw-semibold">
                Start Date
              </label>
              <DatePicker
                selected={formik.values.startDate}
                onChange={(date) => formik.setFieldValue("startDate", date)}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                isClearable
                autoComplete="off"
              />
            </div>
            <div className="col-6 col-md-4">
              <label htmlFor="endDate" className="form-label fw-semibold">
                End Date
              </label>
              <DatePicker
                selected={formik.values.endDate}
                onChange={(date) => formik.setFieldValue("endDate", date)}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                isClearable
                autoComplete="off"
              />
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="row g-3 align-items-end">
              <div className="col-6">
                <label className="form-label fw-semibold">Search</label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  className="form-control"
                  placeholder="Search..."
                  value={formik.values.search}
                  onChange={formik.handleChange}
                />
              </div>
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
                />
                {formik.touched.stores && formik.errors.stores && (
                  <div className="text-danger">{formik.errors.stores}</div>
                )}
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
        />
      ) : activeStatus === "In Process" ? (
        <InProcessTable
          orders={orders}
          loading={loading || tabLoading}
          refreshSalesData={() =>
            fetchSalesAndCounts(currentFilters.current, true)
          }
        />
      ) : activeStatus === "In Fitting" ? (
        <InFittingTable
          orders={orders}
          loading={loading || tabLoading}
          refreshSalesData={() =>
            fetchSalesAndCounts(currentFilters.current, true)
          }
        />
      ) : activeStatus === "Ready" ? (
        <ReadyTable
          orders={orders}
          loading={loading || tabLoading}
          refreshSalesData={() =>
            fetchSalesAndCounts(currentFilters.current, true)
          }
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default WorkshopProcessCom;
