import React, { useState, useEffect } from "react";
import CashReportsForm from "./CashReportsForm";
import CashReportsTable from "./CashReportsTable";
import { reportService } from "../../../services/reportService";

const CashReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);

  const defaultType = ["credit"];
  const defaultMode = ["cash", "bank", "card"];

  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    fetchCashbook({
      fromDate: yesterday.getTime(),
      toDate: today.getTime(),
      type: defaultType,
      mode: defaultMode,
    });
  }, []);

  const fetchCashbook = ({ fromDate, toDate, type, mode }) => {
    const payload = {
      fromDate,
      toDate,
      ...(type && type.length && { type }),
      ...(mode && mode.length && { mode }),
    };
    reportService
      .getCashbook(payload)
      .then((res) => {
        const combinedDocs = res.data?.flatMap((entry) => {
          const docs = entry?.data?.data?.docs || [];
          return docs.map((doc) => ({ ...doc, mode: entry.mode }));
        });
        setFilteredData(combinedDocs);
      })
      .catch((e) => console.log("Failed to get jobWorks: ", e));
  };

  const fetchCashbookWithFilter = ({
    fromDate,
    toDate,
    limit,
    type,
    stores,
    mode,
  }) => {
    const payload = {
      fromDate,
      toDate,
      limit,
      ...(type && type.length && { type }),
      ...(stores && stores.length && { stores }),
      ...(mode && mode.length && { mode }),
    };
    reportService
      .getCashbook(payload)
      .then((res) => {
        const combinedDocs = res.data?.flatMap((entry) => {
          const docs = entry?.data?.data?.docs || [];
          return docs.map((doc) => ({ ...doc, mode: entry.mode }));
        });

        setFilteredData(combinedDocs);
      })
      .catch((e) => console.log("Failed to get jobWorks: ", e));
  };

  const handleFormSubmit = (values) => {
    const { from, to, type = [], store = [], mode = [] } = values;

    const fromTimestamp = new Date(from).getTime();
    const toTimestamp = new Date(to).getTime();

    const typenames = type.map((t) => t.value);
    const storeIds = store.map((s) => s.value);
    const modenames = mode.map((m) => m.value);

    if (modenames.length === 0) {
      setFilteredData([]);
      console.warn("Mode is required. Skipping API call.");
      return;
    }

    if (
      modenames.length === 0 &&
      typenames.length === 0 &&
      storeIds.length === 0
    ) {
      setFilteredData([]);
      console.warn("No filters selected. Skipping API call.");
      return;
    }

    fetchCashbookWithFilter({
      fromDate: fromTimestamp,
      toDate: toTimestamp,
      limit: 10000,
      type: typenames,
      stores: storeIds,
      mode: modenames,
    });
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Cash Report</h1>
          </div>
          <div className=" mt-5">
            <CashReportsForm onSubmit={handleFormSubmit} data={filteredData} />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Cashbook Report</h6>
            <CashReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashReportCom;
