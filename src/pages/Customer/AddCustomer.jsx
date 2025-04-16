import React, { useState } from "react";

import UserDetailForm from "../../components/Customer/UserDetailForm";
import SpecsPowerModal from "../../components/Customer/SpecsPowerModal";
import ContactsPowerModal from "../../components/Customer/ContactsPowerModal";
import "../../assets/css/Customer/AddCustomer_style.css";

const AddCustomer = () => {
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);

  return (
    <div className="bg-white rounded-sm  mb-8">
      <div className="px-4 py-8 w-full max-w-9xl  mx-auto">
        <UserDetailForm
          onAddSpecs={() => setShowSpecsModal(true)}
          onAddContacts={() => setShowContactsModal(true)}
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

export default AddCustomer;
