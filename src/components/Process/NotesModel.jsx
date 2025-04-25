import React, { useState } from "react";
import { toast } from "react-toastify";
import { shopProcessService } from "../../services/Process/shopProcessService";

function NotesModel({ closeNotesModal, selectedNotes, refreshSalesData }) {
  const [notes, setNotes] = useState(selectedNotes?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for loading state

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error("Notes cannot be empty");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      note: notes,
    };

    try {
      console.log("Submitting updateSale with payload:", {
        _id: selectedNotes._id,
        ...payload,
      });
      const response = await shopProcessService.updateSale(
        selectedNotes._id,
        payload
      );
      console.log("updateSale response:", response);
      if (response.success) {
        toast.success("Notes updated successfully");
        if (refreshSalesData) {
          console.log("Calling refreshSalesData");
          await refreshSalesData(); // Await to ensure refresh completes
        }
        closeNotesModal();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to update notes");
      console.error("updateSale API Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      className="modal small"
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
        overflowY: "auto",
        padding: "20px",
      }}
    >
      <div
        className="modal-dialog overflow-auto"
        role="document"
        style={{
          width: "100%",
          maxWidth: "650px",
          maxHeight: "500px",
          backgroundColor: "#fff",
          borderRadius: "5px",
          overflow: "hidden",
          boxShadow: "0 5px 30px rgba(0,0,0,0.3)",
          padding: "0px",
        }}
      >
        <div className="modal-content border-0">
          <div className="modal-header border-bottom pb-2">
            <button
              type="button"
              className="btn-close small"
              onClick={closeNotesModal}
              aria-label="Close"
            ></button>
          </div>

          <div className="px-1 pt-3">
            <div className="px-2 pb-4">
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label
                    htmlFor="systemid"
                    className="form-label mb-0 fw-semibold"
                  >
                    System ID
                  </label>
                  <input
                    type="text"
                    id="systemid"
                    className="form-control"
                    value={selectedNotes?._id || ""}
                    disabled
                  />
                </div>
                <div className="col-12">
                  <label
                    htmlFor="notes"
                    className="form-label mb-0 fw-semibold"
                  >
                    Notes
                  </label>
                  <input
                    type="text"
                    id="notes"
                    className="form-control"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotesModel;
