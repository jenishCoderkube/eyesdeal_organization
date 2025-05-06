import React, { useState } from "react";
import TransferReportsForm from "./TransferReportsForm";
import TransferReportsTable from "./TransferReportsTable";
import { reportService } from "../../../services/reportService";

const TransferReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [StoreFrom, setStoreFrom] = useState();
  const [Storeto, setStoreTo] = useState();

  const fetchTransferStockWithFilter = async ({ fromDate, toDate, storeFrom, storeTo }) => {
    try {
      const payload = {
        fromDate,
        toDate,
        ...(storeFrom && storeFrom.length && { storeFrom }),
        ...(storeTo && storeTo.length && { storeTo }),
      };
      const response = await reportService.getTransferStock(payload)
      if (response.success) {
        setFilteredData(response?.data?.data?.docs);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  }

  const handleFormSubmit = (values) => {
    const { from, to, storeFrom = [], storeTo = [] } = values;

    const fromTimestamp = new Date(from).getTime();
    const toTimestamp = new Date(to).getTime();

    const storefromId = storeFrom.map(s => s.value);
    const storetoId = storeTo.map(s => s.value);

    if (storefromId.length || storetoId.length) {
      fetchTransferStockWithFilter({
        fromDate: fromTimestamp,
        toDate: toTimestamp,
        storeFrom: storefromId,
        storeTo: storetoId
      });
    }
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Transfer Report</h1>
          </div>
          <div className=" mt-5">
            <TransferReportsForm
              onSubmit={handleFormSubmit}
              data={filteredData}
              setFromDate={setFromDate}
              setToDate={setToDate}
              setStoreFrom={setStoreFrom}
              setStoreTo={setStoreTo}
              setFilteredData={setFilteredData}
            />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Transfer Report</h6>
            <TransferReportsTable data={filteredData} fromDate={fromDate} toDate={toDate} StoreFrom={StoreFrom} Storeto={Storeto}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferReportCom;
