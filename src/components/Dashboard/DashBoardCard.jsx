import React, { useState, useEffect } from "react";
import { dashBoardService } from "../../services/dashboardService";

function DashBoardCard() {
  const cardStyle = {
    maxWidth: "100%",
    height: "100%",
    border: "1px solid #dee2e6",
    overflow: "hidden",
    boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)",
    textAlign: "center",
    marginBottom: "1rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    backgroundColor: "#fff",
  };

  const headerStyle = {
    fontSize: "1.25rem",
    fontWeight: "bold",
    padding: "0.75rem",
    borderBottom: "1px solid #dee2e6",
    height: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  };

  const bodyStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "1rem",
    fontSize: "1.125rem",
  };

  const loaderStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100%",
  };

  const [cardData, setCardData] = useState([
    { title: "Today's Sale", value: 0 },
    { title: "This Week's Sale", value: 0 },
    { title: "This Month's Sale", value: 0 },
    { title: "Previous Month's Sale", value: 0 },
  ]);

  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        let dashboardResponse = await dashBoardService.getDashboard();
        const mainData = dashboardResponse.data;
        const apiData = mainData.data[0];

        setCardData([
          { title: "Total Sales (Count)", value: mainData.totalSales },
          { title: "Total Purchases (Count)", value: mainData.totalPurchases },
          { title: "Active Vendors", value: mainData.totalVendorsActive },
          { title: "Today's Sale (Amount)", value: apiData.todaySales },
          { title: "This Week's Sale (Amount)", value: apiData.weekSales },
          { title: "This Month's Sale (Amount)", value: apiData.monthSales },
          {
            title: "Previous Month's Sale (Amount)",
            value: apiData.prevMonthSales,
          },
        ]);
        setSalesData(mainData.salesData || []);
        setPurchaseData(mainData.purchaseData || []);
        setVendorData(mainData.vendorData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={loaderStyle}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="containe1">
      <div className="row">
        {cardData.map((card, index) => (
          <div key={index} className="col-12 col-sm-6 col-lg-3 d-flex mb-3">
            <div style={cardStyle} className="w-100">
              <div className="px-3 mb ^{2}">
                <header style={headerStyle}>{card.title}</header>
                <div style={bodyStyle}>
                  <div>{card.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Table */}
      <h4>Today Sales</h4>
      <div className="py-3">
        <table className="table table-striped table-bordered">
          <thead className="table-light">
            <tr>
              <th scope="col" className="ps-3">
                Customer
              </th>
              <th scope="col" className="ps-3">
                Phone
              </th>
              <th scope="col" className="ps-3">
                Total Amount
              </th>
              <th scope="col" className="ps-3">
                Net Amount
              </th>
              <th scope="col" className="ps-3">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {salesData && salesData.length > 0 ? (
              salesData.map((sale) => (
                <tr key={sale._id}>
                  <td className="px-3">{sale.customerName || "N/A"}</td>
                  <td className="px-3">{sale.customerPhone || "N/A"}</td>
                  <td className="px-3">{sale.totalAmount || "N/A"}</td>
                  <td className="px-3">{sale.netAmount || "N/A"}</td>
                  <td className="px-3">
                    {sale.createdAt
                      ? new Date(sale.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-3">
                  No sales available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Purchases Table */}
      <h4>Today Purchases</h4>
      <div className="py-3">
        <table className="table table-striped table-bordered">
          <thead className="table-light">
            <tr>
              <th scope="col" className="ps-3">
                Vendor
              </th>
              <th scope="col" className="ps-3">
                Invoice
              </th>
              <th scope="col" className="ps-3">
                Total Amount
              </th>
              <th scope="col" className="ps-3">
                Net Amount
              </th>
              <th scope="col" className="ps-3">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {purchaseData && purchaseData.length > 0 ? (
              purchaseData.map((purchase) => (
                <tr key={purchase._id}>
                  <td className="px-3">
                    {purchase.vendor?.companyName || "N/A"}
                  </td>
                  <td className="px-3">{purchase.invoiceNumber || "N/A"}</td>
                  <td className="px-3">{purchase.totalAmount || "N/A"}</td>
                  <td className="px-3">{purchase.netAmount || "N/A"}</td>
                  <td className="px-3">
                    {purchase.createdAt
                      ? new Date(purchase.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-3">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Vendors Table */}
      <h4>Active Vendors</h4>
      <div className="py-3">
        <table className="table table-striped table-bordered">
          <thead className="table-light">
            <tr>
              <th scope="col" className="ps-3">
                Company Name
              </th>
              <th scope="col" className="ps-3">
                Phone
              </th>
              <th scope="col" className="ps-3">
                City
              </th>
              <th scope="col" className="ps-3">
                State
              </th>
            </tr>
          </thead>
          <tbody>
            {vendorData && vendorData.length > 0 ? (
              vendorData.map((vendor) => (
                <tr key={vendor._id}>
                  <td className="px-3">{vendor.companyName || "N/A"}</td>
                  <td className="px-3">{vendor.phone || "N/A"}</td>
                  <td className="px-3">{vendor.city || "N/A"}</td>
                  <td className="px-3">{vendor.state || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-3">
                  No vendors available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashBoardCard;
