import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import UserEditDetailForm from "../../../components/Customer/UserEditDetailForm";
import SpecsPowerModal from "../../../components/Customer/SpecsPowerModal";
import ContactsPowerModal from "../../../components/Customer/ContactsPowerModal";
import "../../../assets/css/Customer/AddCustomer_style.css";
import { saleService } from "../../../services/saleService";

const EditCustomer = () => {
  const [showSpecsModal, setShowSpecsModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const [modal, setModal] = useState({
    show: false,
    type: null,
    editData: null,
  });
  const location = useLocation();
  // const user = location.state?.user || {};
  // In EditCustomer.js
  const handleAddSpecs = () => {
    setModal({ show: true, type: "specs", editData: null });
  };

  const handleAddContacts = () => {
    setModal({ show: true, type: "contacts", editData: null });
  };

  const handleEditPrescription = (prescription) => {
    setModal({
      show: true,
      type: prescription.type || prescription.__t,
      editData: prescription,
    });
  };
  const handleCloseModal = () => {
    setModal({ show: false, type: null, editData: null });
  };

  useEffect(() => {
    if (id) fetchUserData(id);
  }, [id]);

  const fetchUserData = async (userId) => {
    try {
      const response = await saleService.getUser(userId);
      if (response.success) {
        setUser(response.data.data.docs[0]);
      } else {
        console.error("Failed to fetch user:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const firstPrescription = user?.prescriptions[0];

  return (
    <div className="bg-white rounded-sm mb-8">
      <div className="px-4 py-8 w-full max-w-9xl mx-auto">
        <UserEditDetailForm
          onAddSpecs={handleAddSpecs}
          onAddContacts={handleAddContacts}
          onEditPrescription={handleEditPrescription}
          initialData={user}
          isEdit={true}
        />
        <SpecsPowerModal
          show={modal.show && modal.type === "specs"}
          onHide={handleCloseModal}
          editData={modal.editData}
        />
        <ContactsPowerModal
          show={modal.show && modal.type === "contacts"}
          onHide={handleCloseModal}
          editData={modal.editData}
        />
      </div>
    </div>
  );
};

export default EditCustomer;
