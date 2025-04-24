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

  const location = useLocation();
  // const user = location.state?.user || {};

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
          onAddSpecs={() => {
            setShowSpecsModal(true);
            // Reset the prescription data when opening the modal
            setShowSpecsModal(firstPrescription);
          }}
          onAddContacts={() => {
            setShowContactsModal(true);
            // Reset the prescription data when opening the modal
            setShowContactsModal(firstPrescription);
          }}
          initialData={user}
          isEdit={true}
        />

        <SpecsPowerModal
          show={showSpecsModal}
          onHide={() => setShowSpecsModal(false)}
          editData={firstPrescription}
        />

        <ContactsPowerModal
          show={showContactsModal}
          onHide={() => setShowContactsModal(false)}
          editData={firstPrescription}
        />
      </div>
    </div>
  );
};

export default EditCustomer;
