// AddCustomer.jsx
import React, { useState } from "react";
import UserDetailForm from "../../../components/Customer/UserDetailForm";
import SpecsPowerModal from "../../../components/Customer/SpecsPowerModal";
import ContactsPowerModal from "../../../components/Customer/ContactsPowerModal";
import "../../../assets/css/Customer/AddCustomer_style.css";

const AddCustomer = () => {
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [editSpecsData, setEditSpecsData] = useState(null);
  const [editContactsData, setEditContactsData] = useState(null);

  const handleAddSpecs = () => {
    setEditSpecsData(null); // Clear edit data for "add" mode
    setShowSpecsModal(true);
  };

  const handleEditSpecs = (prescription) => {
    setEditSpecsData(prescription); // Set the prescription data for "edit" mode
    setShowSpecsModal(true);
  };

  const handleEditContacts = (contact) => {
    setEditContactsData(contact); // Set the contact data for "edit" mode
    setShowContactsModal(true);
  };
  return (
    <div className="bg-white rounded-sm mb-8">
      <div className="px-4 py-8 w-full max-w-9xl mx-auto">
        <UserDetailForm
          onAddSpecs={handleAddSpecs}
          onAddContacts={() => {
            setShowContactsModal(true);
            setEditContactsData(null); // Clear edit data for "add" mode
          }}
          onEditSpecs={handleEditSpecs} // Pass the edit handler
          onEditContacts={handleEditContacts} // Pass the edit handler
        />
        <SpecsPowerModal
          show={showSpecsModal}
          onHide={() => setShowSpecsModal(false)}
          editData={editSpecsData} // Pass the edit data to the modal
        />
        <ContactsPowerModal
          show={showContactsModal}
          onHide={() => setShowContactsModal(false)}
          editData={editContactsData} // Pass the edit data to the modal
        />
      </div>
    </div>
  );
};

export default AddCustomer;
