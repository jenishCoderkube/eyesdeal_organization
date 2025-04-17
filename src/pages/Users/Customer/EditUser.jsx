import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import UserEditDetailForm from "../../../components/Customer/UserEditDetailForm";
import SpecsPowerModal from "../../../components/Customer/SpecsPowerModal";
import ContactsPowerModal from "../../../components/Customer/ContactsPowerModal";
import "../../../assets/css/Customer/AddCustomer_style.css";

const EditCustomer = () => {
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const location = useLocation();
  const user = location.state?.user || {};

  return (
    <div className="bg-white rounded-sm mb-8">
      <div className="px-4 py-8 w-full max-w-9xl mx-auto">
        <UserEditDetailForm
          onAddSpecs={() => setShowSpecsModal(true)}
          onAddContacts={() => setShowContactsModal(true)}
          initialData={user}
          isEdit={true}
        />
        <SpecsPowerModal
          show={showSpecsModal}
          onHide={() => setShowSpecsModal(false)}
        />
        <ContactsPowerModal
          show={showContactsModal}
          onHide={() => setShowContactsModal(false)}
        />
      </div>
    </div>
  );
};

export default EditCustomer;
