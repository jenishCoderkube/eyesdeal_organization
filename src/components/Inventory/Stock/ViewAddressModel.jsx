import React from "react";
import { Button, Modal } from "react-bootstrap";
import { defalutImageBasePath } from "../../../utils/constants";

const ViewAddressModel = ({ show, onHide, storeData }) => {
  if (!storeData) return null;
  console.log("storeData", storeData);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Store Address Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-2">
          <strong>Store Name:</strong> {storeData.name || "-"}
        </div>
        <div className="mb-2">
          <strong>Company Name:</strong> {storeData.companyName || "-"}
        </div>
        <div className="mb-2">
          <strong>Address:</strong> {storeData.address || "-"}
        </div>
        <div className="mb-2">
          <strong>City:</strong> {storeData.city || "-"}, {storeData.state},{" "}
          {storeData.country}
        </div>
        <div className="mb-2">
          <strong>Pincode:</strong> {storeData.pincode || "-"}
        </div>
        <div className="mb-2">
          <strong>GST Number:</strong> {storeData.GSTNumber || "-"}
        </div>
        <div className="mb-2">
          <strong>Phone:</strong>{" "}
          {storeData.phones && storeData.phones.length > 0
            ? storeData.phones.join(", ")
            : "-"}
        </div>
        <div className="mb-2">
          <strong>Email:</strong>{" "}
          {storeData.emails && storeData.emails.length > 0
            ? storeData.emails.join(", ")
            : "-"}
        </div>

        {/* {storeData.photos && storeData.photos.length > 0 && (
          <div className="mt-3 text-center">
            <img
              src={defalutImageBasePath + storeData.photos[0]}
              alt="Store"
              style={{
                width: "100%",
                maxHeight: "200px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
        )} */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewAddressModel;
