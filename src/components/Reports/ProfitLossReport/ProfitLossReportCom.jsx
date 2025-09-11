import React, { useState, useEffect } from "react";
import ProfitLossReportsForm from "./ProfitLossReportsForm";
import ProfitLossReportsTable from "./ProfitLossReportsTable";
import { reportService } from "../../../services/reportService";

const ProfitLossReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [amountData, setAmountData] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const now = new Date();
    const from = new Date(now);
    from.setHours(0, 0, 0, 0); // start of today
    const to = new Date(now);
    to.setHours(23, 59, 59, 999); // end of today

    const fromDate = from.getTime();
    const toDate = to.getTime();
    const defaultStoreIds = Array.isArray(user?.stores) ? user.stores : [];
    // Log initial fetch dates
    console.log("[ProfitLoss] Initial dates:", {
      fromDate,
      toDate,
      fromLocal: new Date(fromDate).toLocaleString(),
      toLocal: new Date(toDate).toLocaleString(),
    });
    if (defaultStoreIds?.length) {
      console.log("[ProfitLoss] Initial stores:", defaultStoreIds);
    }

    fetchOrders({
      stores: defaultStoreIds,
      fromDate,
      toDate,
      page: 1,
    });
    fetchAmount({
      stores: defaultStoreIds,
      fromDate,
      toDate,
      page: 1,
    });
  }, []);

  const fetchOrders = ({ fromDate, toDate, page, stores }) => {
    console.log("[ProfitLoss] fetchOrders dates:", {
      fromDate,
      toDate,
      fromLocal: new Date(fromDate).toLocaleString(),
      toLocal: new Date(toDate).toLocaleString(),
      page,
      stores,
    });
    reportService
      .fetchOrders({
        fromDate,
        toDate,
        page,
        ...(stores?.length ? { stores } : {}),
      })
      .then((res) => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch((e) => console.log("Failed to get orders: ", e));
  };

  const fetchOrdersWithFilter = ({ fromDate, toDate, brands, stores }) => {
    console.log("[ProfitLoss] fetchOrdersWithFilter dates:", {
      fromDate,
      toDate,
      fromLocal: new Date(fromDate).toLocaleString(),
      toLocal: new Date(toDate).toLocaleString(),
      brands,
      stores,
    });
    reportService
      .fetchOrders({ fromDate, toDate, brands, stores })
      .then((res) => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch((e) => console.log("Failed to get orders: ", e));
  };

  const fetchAmount = ({ fromDate, toDate, page, stores }) => {
    console.log("[ProfitLoss] fetchAmount dates:", {
      fromDate,
      toDate,
      fromLocal: new Date(fromDate).toLocaleString(),
      toLocal: new Date(toDate).toLocaleString(),
      page,
      stores,
    });
    reportService
      .getAmount({
        fromDate,
        toDate,
        page,
        ...(stores?.length ? { stores } : {}),
      })
      .then((res) => {
        setAmountData(res.data?.data?.docs);
      })
      .catch((e) => console.log("Failed to get amount: ", e));
  };

  const fetchAmountWithFilter = ({ fromDate, toDate, brands, stores }) => {
    console.log("[ProfitLoss] fetchAmountWithFilter dates:", {
      fromDate,
      toDate,
      fromLocal: new Date(fromDate).toLocaleString(),
      toLocal: new Date(toDate).toLocaleString(),
      brands,
      stores,
    });
    reportService
      .getAmount({ fromDate, toDate, brands, stores })
      .then((res) => {
        setAmountData(res.data?.data?.docs);
      })
      .catch((e) => console.log("Failed to get orders: ", e));
  };

  const handleFormSubmit = (values) => {
    const { from, to, brands = [], store = [] } = values;

    const fromStart = new Date(from);
    fromStart.setHours(0, 0, 0, 0);
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999);

    const fromTimestamp = fromStart.getTime();
    const toTimestamp = toEnd.getTime();

    const brandIds = brands.map((b) => b.value);
    const storeIds = store.map((s) => s.value);

    // Log form submit dates
    console.log("[ProfitLoss] Form submit dates:", {
      fromDate: fromTimestamp,
      toDate: toTimestamp,
      fromLocal: new Date(fromTimestamp).toLocaleString(),
      toLocal: new Date(toTimestamp).toLocaleString(),
      brands: brandIds,
      stores: storeIds,
    });

    if (brandIds.length || storeIds.length) {
      fetchOrdersWithFilter({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
        brands: brandIds,
        stores: storeIds,
      });
      fetchAmountWithFilter({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
        brands: brandIds,
        stores: storeIds,
      });
    } else {
      fetchOrders({ fromDate: fromTimestamp, toDate: toTimestamp, page: 1 });
      fetchAmount({ fromDate: fromTimestamp, toDate: toTimestamp, page: 1 });
    }
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Profit Loss Report</h1>
          </div>
          <div className="mt-5">
            <ProfitLossReportsForm
              onSubmit={handleFormSubmit}
              data={filteredData}
            />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Profit Loss Report</h6>
            <ProfitLossReportsTable
              data={filteredData}
              amountData={amountData?.[0]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReportCom;
