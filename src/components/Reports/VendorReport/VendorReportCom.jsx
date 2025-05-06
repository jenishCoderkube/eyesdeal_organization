import React, { useState, useEffect } from "react";
import VendorReportsForm from "./VendorReportsForm";
import VendorReportsTable from "./VendorReportsTable";
import { reportService } from "../../../services/reportService";

const VendorReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [storesNames, setstoresNames] = useState([]);
  const defaultStatus = ["received", "damaged"];

  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    fetchJobWorks({ page: 1, fromDate: yesterday.getTime(), toDate: today.getTime(), status: defaultStatus });
  }, []);

  const fetchJobWorks = ({ page, fromDate, toDate, status }) => {
    const payload = {
      ...(page !== undefined && { page }),
      fromDate,
      toDate,
      ...(status && status.length && { status })
    };
    reportService.getJobWorksData(payload)
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get jobWorks: ", e))
  }

  const fetchJobWorksWithFilter = ({ fromDate, toDate, status, stores, vendor }) => {
    const payload = {
      fromDate,
      toDate,
      ...(status && status.length && { status }),
      ...(stores && stores.length && { stores }),
      ...(vendor && vendor.length && { vendor }),
    };
    reportService.getJobWorksData(payload)
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get jobWorks: ", e))
  }

  const handleFormSubmit = (values) => {
    const { from, to, vendorName = [], store = [], status = [] } = values;

    const fromTimestamp = new Date(from).getTime();
    const toTimestamp = new Date(to).getTime();

    const vendornames = vendorName.map(v => v.value);
    const storeIds = store.map(s => s.value);
    const statusnames = status.map(s => s.value);

    if (vendornames.length || storeIds.length || statusnames.length) {
      fetchJobWorksWithFilter({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
        stores: storeIds,
        status: statusnames,
        vendor: vendornames
      });
    }
    else {
      fetchJobWorks({ fromDate: fromTimestamp, toDate: toTimestamp });
    }
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Vendor Report</h1>
          </div>
          <div className=" mt-5">
            <VendorReportsForm
              onSubmit={handleFormSubmit}
              data={filteredData}
              setstoresNames={setstoresNames}
            />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Vendor Report</h6>
            <VendorReportsTable storesNames={storesNames} data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorReportCom;
