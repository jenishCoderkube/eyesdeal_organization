// No JS-based show logic needed — it opens via data-bs-toggle
const EditStoreModal = ({ selectedStore, onChange, onSubmit }) => {
  if (!selectedStore) return null;

  return (
    <div
      className="modal fade"
      id="editStoreModal"
      tabIndex="-1"
      aria-labelledby="editStoreModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="editStoreModalLabel">
              Edit Store
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form id="editStoreForm" onSubmit={onSubmit}>
              <div className="mb-3">
                <label className="form-label">Store Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={selectedStore.storeName}
                  onChange={(e) =>
                    onChange({ ...selectedStore, storeName: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Billing Sequence</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedStore.billingSequence}
                  onChange={(e) =>
                    onChange({
                      ...selectedStore,
                      billingSequence: e.target.value,
                    })
                  }
                />
              </div>
              {/* Add more fields as needed */}
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="editStoreForm"
              className="btn btn-primary"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStoreModal;
