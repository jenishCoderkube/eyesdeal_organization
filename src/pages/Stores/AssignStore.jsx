import React, {useEffect, useState} from 'react';
import Select from 'react-select';
import {storeService} from '../../services/storeService';
import {toast} from 'react-toastify';

const AssignStore = () => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeOptions, setStoreOptions] = useState(null);


  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const storeData = await storeService.getStores(); // Already returns res.data.data

      if (storeData) {
        const options = storeData.map((store) => ({
          value: store._id,
          label: store.name,
        }));
        setStoreOptions(options);
      }
    } catch (error) {
      console.log('err', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) {
      alert('Please select a store');
      return;
    }
    let userId = JSON.parse(localStorage.getItem('user'))?._id;

    const bodyData = {
      id: selectedStore.value, // Replace with actual data
      uId: userId,
    };

    try {
      const response = await storeService.assignStore(bodyData);
      if (response?.success) {
        toast.success(response.message);
        setSelectedStore("")
      }
    } catch (error) {
      console.log('err', error);
    }
  };

  return (
    <div className="container-fluid py-5 px-4 px-sm-5 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-12">
          <div className="mb-4">
            <h1 className="h2 text-dark fw-bold text-2xl md-text-3xl">
              Add Stores
            </h1>
          </div>
          <div className=" shadow-sm">
            <div className="card-body p-4 p-sm-5 p-lg-5">
              <form
                onSubmit={handleSubmit}
                className="d-flex flex-column gap-4">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <label htmlFor="store" className="form-label fw-medium m-0">
                      Store <span className="text-danger">*</span>
                    </label>
                  </div>
                  <Select
                    id="store"
                    options={storeOptions}
                    value={selectedStore}
                    onChange={setSelectedStore}
                    placeholder="Select a store..."
                    classNamePrefix="react-select"
                  />
                  <input
                    name="store"
                    type="hidden"
                    value={selectedStore ? selectedStore.value : ''}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      backgroundColor: '#6366F1',
                      borderColor: '#6366F1',
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = '#4F46E5')
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = '#6366F1')
                    }>
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignStore;
