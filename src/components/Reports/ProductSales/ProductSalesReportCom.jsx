import React, { useEffect, useState } from "react";
import SalesReportsForm from "./SalesReportsForm";
import SalesReportsTable from "./SalesReportsTable";
import "bootstrap/dist/css/bootstrap.min.css";
import { reportService } from "../../../services/reportService";

const ProductSalesReportCom = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [amountData, setAmountData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    fetchOrdersByPage(currentPage, yesterday.getTime(), today.getTime());
    fetchAmount({ fromDate: yesterday.getTime(), toDate: today.getTime()});
  }, []);

  const fetchOrdersByPage = (page, dateFrom, dateTo) => {
    reportService.fetchOrders({ page, fromDate: dateFrom, toDate: dateTo })
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get orders: ", e))
  }

  const fetchOrders = (dateFrom, dateTo) => {
    reportService.fetchOrders({ fromDate: dateFrom, toDate: dateTo })
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get orders: ", e))
  }

  const fetchOrdersWithFilter = ({ fromDate, toDate, brands, stores }) => {
    reportService.fetchOrders({ fromDate, toDate, brands, stores })
      .then(res => {
        setFilteredData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get orders: ", e))
  }

  const fetchAmount = (fromDate, toDate) => {
    reportService.getAmount(fromDate, toDate)
      .then(res => {
        setAmountData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get amount: ", e))
  }

  const fetchAmountWithFilter = ({ fromDate, toDate, brands, stores }) => {
    reportService.getAmount({ fromDate, toDate, brands, stores })
      .then(res => {
        setAmountData(res.data?.data?.docs);
      })
      .catch(e => console.log("Failed to get orders: ", e))
  }

  const handleFormSubmit = (values) => {
    if (values) {
      const { from, to, page = 1, brand = [], store = [] } = values;
      setCurrentPage(page);

      const fromTimestamp = new Date(from).getTime();
      const toTimestamp = new Date(to).getTime();

      const brandIds = brand.map(b => b.value);
      const storeIds = store.map(s => s.value);

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
        fetchOrders(fromTimestamp, toTimestamp);
        fetchAmount(fromTimestamp, toTimestamp);
      }
    }
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Product Sales Report</h1>
          </div>
          <div className=" mt-5">
            <SalesReportsForm onSubmit={handleFormSubmit} />
          </div>
          <div className="card shadow-none border p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Product Report</h6>
            <SalesReportsTable data={filteredData} amountData={amountData[0]?.totalAmount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSalesReportCom;
