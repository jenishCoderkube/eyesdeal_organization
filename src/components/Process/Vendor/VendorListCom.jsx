import React, { useMemo, useState } from "react";
import VendorListForm from "./VendorListForm";
import VendorListTable from "./VendorListTable";

const VendorListCom = () => {
  const initialData = useMemo(
    () => [
      {
        _id: "64e9b8fb2b0d16aaf5bedfd8",
        date: "23/04/2025",
        store: "EYESDEAL UDHANA",
        billNo: "2355014",
        customerName: "JUWERIYA MEMON",
        vendorNote: "",
        lensSKU: "BLUE CUT 1.56",
        side: "right",
        power: {
          dist: { sph: "-2.25", cyl: "-0.75", axis: "5", add: "", vision: "" },
          near: { sph: "-2.25", cyl: "-0.75", axis: "5", add: "", vision: "" },
        },
        vendor: "PRINCE LENSES",
        prescribeBy: "employee",
        doctorName: "AMAN DESHMUKH",
        additionalFields: {
          right: { psm: "32", pd: "30", fh: "28" },
          left: { psm: "31", pd: "29", fh: "27" },
          ipd: "60",
        },
        frameFields: {
          asize: "54",
          bsize: "38",
          dbl: "17",
          fth: "4",
          pdesign: "Progressive",
          ftype: "Full Rim",
          de: "2.5",
        },
      },
      {
        _id: "64e9b8fb2b0d16aaf5bedfd9",
        date: "22/04/2025",
        store: "EYESDEAL BARDOLI",
        billNo: "2355015",
        customerName: "RAHUL SHARMA",
        vendorNote: "Urgent delivery",
        lensSKU: "PHOTOCHROMIC 1.59",
        side: "left",
        power: {
          dist: { sph: "-1.50", cyl: "-0.50", axis: "10", add: "", vision: "" },
          near: { sph: "-1.50", cyl: "-0.50", axis: "10", add: "", vision: "" },
        },
        vendor: "VISION SUPPLIERS",
        prescribeBy: "doctor",
        doctorName: "VIKAS PATEL",
        additionalFields: {
          right: { psm: "33", pd: "31", fh: "29" },
          left: { psm: "32", pd: "30", fh: "28" },
          ipd: "62",
        },
        frameFields: {
          asize: "52",
          bsize: "36",
          dbl: "16",
          fth: "3.5",
          pdesign: "Single Vision",
          ftype: "Half Rim",
          de: "2.0",
        },
      },
      {
        _id: "64e9b8fb2b0d16aaf5bedfda",
        date: "21/04/2025",
        store: "CITY OPTICS",
        billNo: "2355016",
        customerName: "PRIYA PATEL",
        vendorNote: "",
        lensSKU: "ANTI-GLARE 1.61",
        side: "both",
        power: {
          dist: { sph: "-3.00", cyl: "-1.00", axis: "15", add: "", vision: "" },
          near: { sph: "-3.00", cyl: "-1.00", axis: "15", add: "", vision: "" },
        },
        vendor: "OPTIC DISTRIBUTORS",
        prescribeBy: "optometrist",
        doctorName: "NEHA SHAH",
        additionalFields: {
          right: { psm: "34", pd: "32", fh: "30" },
          left: { psm: "33", pd: "31", fh: "29" },
          ipd: "64",
        },
        frameFields: {
          asize: "50",
          bsize: "34",
          dbl: "18",
          fth: "4.5",
          pdesign: "Bifocal",
          ftype: "Rimless",
          de: "3.0",
        },
      },
      {
        _id: "64e9b8fb2b0d16aaf5bedfdb",
        date: "20/04/2025",
        store: "ELITE HOSPITAL",
        billNo: "2355017",
        customerName: "AMIT KUMAR",
        vendorNote: "Custom order",
        lensSKU: "PROGRESSIVE 1.67",
        side: "right",
        power: {
          dist: {
            sph: "+1.25",
            cyl: "-0.25",
            axis: "20",
            add: "+2.00",
            vision: "",
          },
          near: {
            sph: "+1.25",
            cyl: "-0.25",
            axis: "20",
            add: "+2.00",
            vision: "",
          },
        },
        vendor: "LENS CRAFTERS",
        prescribeBy: "employee",
        doctorName: "RAJESH MEHTA",
        additionalFields: {
          right: { psm: "35", pd: "33", fh: "31" },
          left: { psm: "34", pd: "32", fh: "30" },
          ipd: "66",
        },
        frameFields: {
          asize: "56",
          bsize: "40",
          dbl: "19",
          fth: "5",
          pdesign: "Progressive",
          ftype: "Full Rim",
          de: "2.8",
        },
      },
      {
        _id: "64e9b8fb2b0d16aaf5bedfdc",
        date: "19/04/2025",
        store: "EYESDEAL BARDOLI",
        billNo: "2355018",
        customerName: "SNEHA DESAI",
        vendorNote: "",
        lensSKU: "BLUE CUT 1.56",
        side: "left",
        power: {
          dist: { sph: "-2.75", cyl: "-1.25", axis: "25", add: "", vision: "" },
          near: { sph: "-2.75", cyl: "-1.25", axis: "25", add: "", vision: "" },
        },
        vendor: "PRINCE LENSES",
        prescribeBy: "doctor",
        doctorName: "POOJA VERMA",
        additionalFields: {
          right: { psm: "36", pd: "34", fh: "32" },
          left: { psm: "35", pd: "33", fh: "31" },
          ipd: "68",
        },
        frameFields: {
          asize: "53",
          bsize: "37",
          dbl: "15",
          fth: "4",
          pdesign: "Single Vision",
          ftype: "Half Rim",
          de: "2.3",
        },
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
        (!values.store || item.store === values.store.value) &&
        (!values.vendor || item.vendor === values.vendor.value) &&
        (!fromDate || itemDate >= fromDate) &&
        (!toDate || itemDate <= toDate)
      );
    });
    setFilteredData(filtered);
  };

  return (
    <div className="mx-auto px-3 pt-2">
      <div className="row justify-content-center">
        <div className="col-12">
          <div>
            <VendorListForm onSubmit={handleFormSubmit} />
          </div>
          <div className="card shadow-none border p-0 mt-3">
            <h6 className="fw-bold px-3 pt-3">Job Works</h6>
            <VendorListTable data={filteredData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorListCom;
