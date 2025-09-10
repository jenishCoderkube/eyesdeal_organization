import React, { useState, useEffect } from "react";
import CashReportsForm from "./CashReportsForm";
import CashReportsTable from "./CashReportsTable";
import { reportService } from "../../../services/reportService";

const CashReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);

  const defaultType = ["credit"];
  const defaultMode = ["cash", "bank", "card"];

  useEffect(() => {
    const now = new Date();
    const from = new Date(now);
    from.setHours(0, 0, 0, 0); // start of today (align with ViewCashbook)

    const to = new Date(now);
    to.setHours(23, 59, 59, 999); // end of today (align with ViewCashbook)

    fetchCashbook({
      fromDate: from.getTime(),
      toDate: to.getTime(),
      type: defaultType,
      mode: defaultMode,
    });
  }, []);

  const fetchCashbook = ({ fromDate, toDate, type, mode, store }) => {
    const payload = {
      fromDate,
      toDate,
      ...(type && type.length && { type }),
      ...(store && store.length && { store }),

      ...(mode && mode.length && { mode }),
    };
    // Log initial fetch dates
    console.log("Initial fetchCashbook dates:", {
      fromDate,
      toDate,
      fromLocal: new Date(fromDate).toLocaleString(),
      toLocal: new Date(toDate).toLocaleString(),
    });
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
    // Log filtered fetch dates
    console.log("Filtered fetchCashbook dates:", {
      fromDate,
      toDate,
      fromLocal: new Date(fromDate).toLocaleString(),
      toLocal: new Date(toDate).toLocaleString(),
      type,
      stores,
      mode,
    });
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

    const fromStart = new Date(from);
    fromStart.setHours(0, 0, 0, 0); // normalize to start of day
    const toEnd = new Date(to);
    toEnd.setHours(23, 59, 59, 999); // normalize to end of day

    const fromTimestamp = fromStart.getTime();
    const toTimestamp = toEnd.getTime();

    const typenames = type.map((t) => t.value);
    const storeIds = store.map((s) => s.value);
    const modenames = mode.map((m) => m.value);

    // Log form submit dates
    console.log("Form submit dates:", {
      fromDate: fromTimestamp,
      toDate: toTimestamp,
      fromLocal: new Date(fromTimestamp).toLocaleString(),
      toLocal: new Date(toTimestamp).toLocaleString(),
      type: typenames,
      stores: storeIds,
      mode: modenames,
    });

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
