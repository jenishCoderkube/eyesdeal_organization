import React, { useState } from "react";
import { Modal, Button, Nav, Tab } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomerNameModal = ({ show, onHide, selectedRow }) => {
  const [activeTab, setActiveTab] = useState("specs");

  // Format date to DD/MM/YYYY
  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Use selectedRow.powerAtTime.specs or fallback to empty values
  const prescriptionData = {
    createdAt: formatDate(selectedRow?.createdAt) || "",
    createdAtDate: selectedRow?.createdAt
      ? new Date(selectedRow.createdAt)
      : null,
    doctorName: selectedRow?.powerAtTime?.specs?.doctorName || "",
    type: selectedRow?.powerAtTime?.specs?.__t || "specs",
    prescribeBy: selectedRow?.powerAtTime?.specs?.prescribedBy || "",
    specsPower: {
      right: {
        distance: {
          sph: selectedRow?.powerAtTime?.specs?.right?.distance?.sph || "",
          cyl: selectedRow?.powerAtTime?.specs?.right?.distance?.cyl || "",
          axis: selectedRow?.powerAtTime?.specs?.right?.distance?.axis || "",
          vision: selectedRow?.powerAtTime?.specs?.right?.distance?.vs || "",
          add: selectedRow?.powerAtTime?.specs?.right?.distance?.add || "",
        },
        near: {
          sph: selectedRow?.powerAtTime?.specs?.right?.near?.sph || "",
          cyl: selectedRow?.powerAtTime?.specs?.right?.near?.cyl || "",
          axis: selectedRow?.powerAtTime?.specs?.right?.near?.axis || "",
          vision: selectedRow?.powerAtTime?.specs?.right?.near?.vs || "",
        },
      },
      left: {
        distance: {
          sph: selectedRow?.powerAtTime?.specs?.left?.distance?.sph || "",
          cyl: selectedRow?.powerAtTime?.specs?.left?.distance?.cyl || "",
          axis: selectedRow?.powerAtTime?.specs?.left?.distance?.axis || "",
          vision: selectedRow?.powerAtTime?.specs?.left?.distance?.vs || "",
          add: selectedRow?.powerAtTime?.specs?.left?.distance?.add || "",
        },
        near: {
          sph: selectedRow?.powerAtTime?.specs?.left?.near?.sph || "",
          cyl: selectedRow?.powerAtTime?.specs?.left?.near?.cyl || "",
          axis: selectedRow?.powerAtTime?.specs?.left?.near?.axis || "",
          vision: selectedRow?.powerAtTime?.specs?.left?.near?.vs || "",
        },
      },
    },
    additionalFields: {
      right: {
        psm: selectedRow?.powerAtTime?.specs?.right?.psm || "",
        pd: selectedRow?.powerAtTime?.specs?.right?.pd || "",
        fh: selectedRow?.powerAtTime?.specs?.right?.fh || "",
      },
      left: {
        psm: selectedRow?.powerAtTime?.specs?.left?.psm || "",
        pd: selectedRow?.powerAtTime?.specs?.left?.pd || "",
        fh: selectedRow?.powerAtTime?.specs?.left?.fh || "",
      },
      ipd: selectedRow?.powerAtTime?.specs?.ipd || "",
    },
    frameFields: {
      asize: selectedRow?.powerAtTime?.specs?.aSize || "",
      bsize: selectedRow?.powerAtTime?.specs?.bSize || "",
      dbl: selectedRow?.powerAtTime?.specs?.dbl || "",
      fth: selectedRow?.powerAtTime?.specs?.fth || "",
      pdesign: selectedRow?.powerAtTime?.specs?.pDesign || "",
      ftype: selectedRow?.powerAtTime?.specs?.ft || "",
      de: selectedRow?.powerAtTime?.specs?.de || "",
    },
  };

  // Options for react-select
  const typeOptions = [{ value: "specs", label: "Specs" }];
  const prescribeByOptions = [
    { value: "employee", label: "Employee" },
    { value: "doctor", label: "Doctor" },
    { value: "optometrist", label: "Optometrist" },
  ];

  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header className="px-4 py-3 border-bottom border-slate-200 d-flex justify-content-between align-items-center">
        <Modal.Title className="font-semibold text-slate-800">
          View Prescriptions
        </Modal.Title>
        <Button
          variant="link"
          onClick={onHide}
          className="p-0"
          style={{ lineHeight: 0 }}
        >
          <FaTimes
            className="text-secondary"
            style={{ width: "24px", height: "24px" }}
          />
        </Button>
      </Modal.Header>
      <Modal.Body className="p-4" style={{ overflow: "hidden" }}>
        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
          <Nav
            variant="tabs"
            className="relative mb-4 mt-3 border-top-0 border-start-0 border-end-0 border-bottom border-slate-200"
          >
            <Nav.Item className="me-4">
              <Nav.Link
                eventKey="specs"
                className={`pb-3 text-sm font-medium ${
                  activeTab === "specs"
                    ? "text-indigo-500 border-top-0 border-start-0 border-end-0 border-bottom border-primary border-3"
                    : "text-slate-500 hover:text-slate-600"
                }`}
                style={{
                  color: activeTab === "specs" ? "#6366f1" : "black",
                }}
              >
                Specs
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="me-4">
              <Nav.Link
                eventKey="contact"
                disabled
                className={`pb-3 text-sm font-medium ${
                  activeTab === "contact"
                    ? "text-indigo-500 border-top-0 border-start-0 border-end-0 border-bottom border-primary border-3"
                    : "text-slate-500 hover:text-slate-600"
                }`}
                style={{
                  color: activeTab === "contact" ? "#6366f1" : "black",
                }}
              >
                Contact
              </Nav.Link>
            </Nav.Item>
            <div
              className="absolute bottom-0 w-100 h-px bg-slate-200"
              aria-hidden="true"
            />
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="specs" className="overflow-auto">
              <div className="p-4">
                <div className="d-flex flex-column flex-md-row gap-4 mb-3">
                  <div className="flex-grow-1">
                    <label className="d-block text-sm font-medium mb-1">
                      Date
                    </label>
                    <DatePicker
                      selected={prescriptionData.createdAtDate}
                      dateFormat="dd/MM/yyyy"
                      className="form-control"
                      readOnly
                    />
                  </div>
                  <div className="flex-grow-1">
                    <label className="d-block text-sm font-medium mb-1">
                      Doctor Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={prescriptionData.doctorName}
                      readOnly
                    />
                  </div>
                  <div className="flex-grow-1">
                    <label className="d-block text-sm font-medium mb-1">
                      Type
                    </label>
                    <Select
                      options={typeOptions}
                      value={typeOptions.find(
                        (opt) => opt.value === prescriptionData.type
                      )}
                      isDisabled
                    />
                  </div>
                  <div className="flex-grow-1">
                    <label className="d-block text-sm font-medium mb-1">
                      Prescribe By
                    </label>
                    <Select
                      options={prescribeByOptions}
                      value={prescribeByOptions.find(
                        (opt) => opt.value === prescriptionData.prescribeBy
                      )}
                      isDisabled
                    />
                  </div>
                </div>
                <h4
                  className="mt-2 mb-3 fw-normal"
                  style={{ fontSize: "17px" }}
                >
                  Specs Power
                </h4>
                <table className="table table-bordered table-sm w-100">
                  <thead className="text-xs text-uppercase text-slate-500 bg-light">
                    <tr>
                      <th className="border border-slate-300 px-2 py-3"></th>
                      <th className="border custom-perchase-th px-2 py-3">
                        RESPH
                      </th>
                      <th className="border custom-perchase-th px-2 py-3">
                        RECYL
                      </th>
                      <th className="border custom-perchase-th px-2 py-3">
                        RAXIS
                      </th>
                      <th className="border custom-perchase-th px-2 py-3">
                        RVISION
                      </th>
                      <th className="border custom-perchase-th px-2 py-3">
                        ADD
                      </th>
                      <th className="border custom-perchase-th px-2 py-3">
                        ||
                      </th>
                      <th className="border custom-perchase-th px-2 py-3">
                        LESPH
                      </th>
                      <th className="border custom-perchase-th px-2 py-3">
                        LECYL
                      </th>
                      <th className="border custom-perchase-th px-2 py-3">
                        LAXIS
                      </th>
                      <th className="border custom-perchase-th px-2 py-3">
                        LVISION
                      </th>
                      <th className="border custom-perchase-th px-2 py-3">
                        ADD
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 text-center max-w-20px">
                        D
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.right.distance.sph}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.right.distance.cyl}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.right.distance.axis}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.right.distance.vision}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.right.distance.add}
                      </td>
                      <td className="border border-slate-300"></td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.left.distance.sph}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.left.distance.cyl}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.left.distance.axis}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.left.distance.vision}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.left.distance.add}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 text-center max-w-20px">
                        N
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.right.near.sph}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.right.near.cyl}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.right.near.axis}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.right.near.vision}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px"></td>
                      <td className="border border-slate-300"></td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.left.near.sph}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.left.near.cyl}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.left.near.axis}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px">
                        {prescriptionData.specsPower.left.near.vision}
                      </td>
                      <td className="border border-slate-300 p-2 max-w-70px"></td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-2 border p-2">
                  <div className="d-flex justify-content-around flex-wrap gap-3">
                    {[
                      {
                        label: "Psm(R)",
                        value: prescriptionData.additionalFields.right.psm,
                      },
                      {
                        label: "Pd(R)",
                        value: prescriptionData.additionalFields.right.pd,
                      },
                      {
                        label: "Fh(R)",
                        value: prescriptionData.additionalFields.right.fh,
                      },
                      {
                        label: "IPD",
                        value: prescriptionData.additionalFields.ipd,
                      },
                      {
                        label: "Psm(L)",
                        value: prescriptionData.additionalFields.left.psm,
                      },
                      {
                        label: "Pd(L)",
                        value: prescriptionData.additionalFields.left.pd,
                      },
                      {
                        label: "Fh(L)",
                        value: prescriptionData.additionalFields.left.fh,
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-sm text-slate-600">
                        {label}: {value || "-"}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 border p-2">
                  <div className="d-flex justify-content-around flex-wrap gap-3">
                    {[
                      {
                        label: "Asize",
                        value: prescriptionData.frameFields.asize,
                      },
                      {
                        label: "Bsize",
                        value: prescriptionData.frameFields.bsize,
                      },
                      { label: "DBL", value: prescriptionData.frameFields.dbl },
                      { label: "Fth", value: prescriptionData.frameFields.fth },
                      {
                        label: "Pdesign",
                        value: prescriptionData.frameFields.pdesign,
                      },
                      {
                        label: "Ftype",
                        value: prescriptionData.frameFields.ftype,
                      },
                      { label: "DE", value: prescriptionData.frameFields.de },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-sm text-slate-600">
                        {label}: {value || "-"}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-4">
                  <div className="text-sm text-slate-500 mb-3 mb-sm-0">
                    Showing{" "}
                    <span className="font-medium text-slate-600">1</span> to{" "}
                    <span className="font-medium text-slate-600">1</span> of{" "}
                    <span className="font-medium text-slate-600">1</span>{" "}
                    results
                  </div>
                  <div className="btn-group">
                    <Button variant="outline-primary" className="me-2" disabled>
                      Previous
                    </Button>
                    <Button variant="outline-primary" disabled>
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </Tab.Pane>
            <Tab.Pane eventKey="contact">
              <p className="p-4">
                Contact lens details will be displayed here.
              </p>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
    </Modal>
  );
};

export default CustomerNameModal;
