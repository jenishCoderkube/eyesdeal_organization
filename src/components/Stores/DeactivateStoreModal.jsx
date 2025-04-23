import React, {useRef, useState} from 'react';
import {IoMdClose} from 'react-icons/io';
import Select from 'react-select';
import { storeService} from '../../services/storeService';
import {toast} from 'react-toastify';
const DeactivateStoreModal = ({show, onHide, storeData, stores}) => {
  const [formData, setFormData] = useState({
    sendStore: null,
    confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);
  // Create store options for the "Send Store" dropdown
  const storeOptions = stores
    ?.filter((store) => store?._id !== storeData?._id)
    ?.map((store) => ({
      value: store?._id,
      label: store?.name,
    }));

  // Set the selected store in the disabled dropdown
  const selectedStoreOption = storeData
    ? {value: storeData?._id, label: storeData?.name}
    : null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors((prev) => ({...prev, [field]: ''}));
    }
  };

  const handleDownload = () => {
    console.log('Download initiated for store:', storeData);
    // Add download logic here (e.g., generate a file)
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.sendStore) {
      newErrors.sendStore = 'Please select a store to send to';
    }
    if (formData.confirmation.toLowerCase() !== 'deactivate') {
      newErrors.confirmation = 'Please type "deactivate" to confirm';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    console.log("formData",formData)
    console.log("storeData",storeData)

    const payload = {
      store: storeData?._id,
      sendStore: formData.sendStore?.value,
      inp: formData?.confirmation,
    };

    try {
      const response = await storeService.deactivateInventory(payload);
      if (response?.success) {
        toast.success(response?.message);
        setFormData("")
      }
    } catch (error) {
      console.log('Error:', error);
    }
    // Add API call to deactivate store here
    onHide();
  };
  // Handle click outside to close modal
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onHide();
    }
  };
  return (
    <>
      {show && (
        <>
          <div className="modal-backdrop fade show" style={{zIndex: 1040}} />
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{zIndex: 1050}}
            onClick={handleOutsideClick}>
            <div
              className="modal-dialog modal-dialog-centered modal-md"
              ref={modalRef}>
              <div className="modal-content bg-white rounded shadow-lg">
                <div className="modal-header bg-light border-bottom d-flex justify-content-between align-items-center px-4 py-3">
                  <h5 className="modal-title font-semibold text-dark m-0">
                    Deactivate Store
                  </h5>
                  <button
                    type="button"
                    className="btn p-0  hover:text-danger"
                    onClick={onHide}
                    aria-label="Close">
                    <IoMdClose size={26} />
                  </button>
                </div>
                <div className="modal-body p-4">
                  <form
                    onSubmit={handleSubmit}
                    className="d-flex flex-column gap-3">
                    <div className="mb-3">
                      <label
                        htmlFor="store"
                        className="form-label text-sm font-medium text-dark">
                        Deactivation Store
                      </label>
                      <Select
                        isDisabled={true}
                        value={selectedStoreOption}
                        options={[selectedStoreOption]}
                        classNamePrefix="react-select"
                        placeholder={storeData?.name || 'Select...'}
                        aria-readonly="true"
                      />
                    </div>
                    <div className="mb-3">
                      <button
                        type="button"
                        className="btn btn-primary w-auto"
                        onClick={handleDownload}>
                        Download
                      </button>
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="sendStore"
                        className="form-label text-sm font-medium text-dark">
                        Send Store
                      </label>
                      <Select
                        options={storeOptions}
                        value={formData.sendStore}
                        onChange={(option) =>
                          handleInputChange('sendStore', option)
                        }
                        placeholder="Select..."
                        classNamePrefix="react-select"
                        aria-describedby="sendStoreError"
                      />
                      {errors.sendStore && (
                        <div
                          id="sendStoreError"
                          className="text-danger mt-1 text-sm">
                          {errors.sendStore}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="confirmation"
                        className="form-label text-sm font-medium text-dark">
                        Type "deactivate" to confirm
                      </label>
                      <input
                        type="text"
                        id="confirmation"
                        className="form-control"
                        value={formData.confirmation}
                        onChange={(e) =>
                          handleInputChange('confirmation', e.target.value)
                        }
                        aria-describedby="confirmationError"
                      />
                      {errors.confirmation && (
                        <div
                          id="confirmationError"
                          className="text-danger mt-1 text-sm">
                          {errors.confirmation}
                        </div>
                      )}
                    </div>
                    <div className="d-flex justify-content-start gap-2">
                      <button type="submit" className="btn btn-primary">
                        Submit
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onHide}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DeactivateStoreModal;
