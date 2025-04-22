import React, { useState, useMemo } from "react";
import VendorReportsForm from "./VendorReportsForm";
import VendorReportsTable from "./VendorReportsTable";

const VendorReportCom = () => {
  // Dummy data (5 entries)
  const initialData = useMemo(
    () => [
      {
        id: 1,
        store: "EYESDEAL BARDOLI",
        vendorName: "NICE OPTICAL VADODRA",
        date: "22/04/2025",
        billNo: "VN001",
        sku: "SV-BLUE-CUT UV 400 1.56",
        status: "Received",
        costPrice: 4000,
      },
      {
        id: 2,
        store: "CITY OPTICS",
        vendorName: "VISION SUPPLIERS",
        date: "22/04/2025",
        billNo: "VN002",
        sku: "I-GOG-SG-1450",
        status: "Damaged",
        costPrice: 2500,
      },
      {
        id: 3,
        store: "ELITE HOSPITAL",
        vendorName: "OPTIC DISTRIBUTORS",
        date: "23/04/2025",
        billNo: "VN003",
        sku: "RB-FR-1001",
        status: "Pending",
        costPrice: 3000,
      },
      {
        id: 4,
        store: "EYESDEAL BARDOLI",
        vendorName: "NICE OPTICAL VADODRA",
        date: "21/04/2025",
        billNo: "VN004",
        sku: "OK-SG-2002",
        status: "Received",
        costPrice: 4500,
      },
      {
        id: 5,
        store: "CITY OPTICS",
        vendorName: "VISION SUPPLIERS",
        date: "22/04/2025",
        billNo: "VN005",
        sku: "FZ-FR-3003",
        status: "Received",
        costPrice: 3200,
      },
    ],
    []
  );

  const [filteredData, setFilteredData] = useState(initialData);

  const handleFormSubmit = (values) => {
    const filtered = initialData.filter((item) => {
      const itemDate = new Date(item.date.split("/").reverse().join("-"));
      const fromDate = values.from;
      const toDate = values.to;
      return (
        (!values.store ||
          values.store.length === 0 ||
          values.store.some((s) => s.value === item.store)) &&
        (!values.vendorName ||
          values.vendorName.length === 0 ||
          values.vendorName.some((v) => v.value === item.vendorName)) &&
        (!values.status ||
          values.status.length === 0 ||
          values.status.some((s) => s.value === item.status)) &&
        (!fromDate || itemDate >= fromDate) &&
        (!toDate || itemDate <= toDate)
      );
    });
    setFilteredData(filtered);
  };

  return (
    <div className="max-width-95 mx-auto px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Vendor Report</h1>
          </div>
          <div className="card border-0 mt-5">
            <VendorReportsForm
              onSubmit={handleFormSubmit}
              data={filteredData}
            />
          </div>
          <div className="card p-0 mt-5">
            <h6 className="fw-bold px-3 pt-3">Vendor Report</h6>
            <VendorReportsTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorReportCom;
