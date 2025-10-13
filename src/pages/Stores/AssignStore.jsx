import React, { useEffect, useState } from "react";
import Select from "react-select";
import { storeService } from "../../services/storeService";
import { toast } from "react-toastify";

const AssignStore = () => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeOptions, setStoreOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const storeData = await storeService.getStores(); // Already returns res.data.data

      if (storeData) {
        const options = storeData?.map((store) => ({
          value: store._id,
          label: store.name,
        }));
        setStoreOptions(options);

        // Check for storeInfoId in localStorage and set default selection
        let user = JSON.parse(localStorage.getItem("user"));
        const storeInfoId =
          user?.stores?.[0] || localStorage.getItem("storeInfoId");
        if (storeInfoId) {
          const defaultStore = options.find(
            (option) => option.value === storeInfoId
          );
          if (defaultStore) {
            setSelectedStore(defaultStore);
          }
        }
      }
    } catch (error) {
      console.log("err", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) {
      alert("Please select a store");
      return;
    }
    let userId = JSON.parse(localStorage.getItem("user"))?._id;

    const bodyData = {
      id: selectedStore.value,
      uId: userId,
    };

    try {
      setLoading(true);
      const response = await storeService.assignStore(bodyData);

      if (response?.data.success) {
        const newStoreId = response?.data?.data.stores[0];
        localStorage.setItem("storeInfoId", newStoreId);

        // Update the stores array in the user object in localStorage
        let user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          user.stores = [newStoreId]; // Replace the stores array with the new store ID
          console.log("user", newStoreId, user);

          localStorage.setItem("user", JSON.stringify(user));
        }

        toast.success(response?.data.message);
      }
    } catch (error) {
      console.log("err", error);
      toast.error("Failed to assign store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-5 px-4 px-sm-5 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-12">
          <div className="mb-4">
            <h1 className="h2 text-dark fw-bold text-2xl md-text-3xl">
              Assign Stores
            </h1>
          </div>
          <div className="shadow-sm">
            <div className="card-body p-4 p-sm-5 p-lg-5">
              <form
                onSubmit={handleSubmit}
                className="d-flex flex-column gap-4"
              >
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <label
                      htmlFor="store"
                      className="form-label font-weight-500 m-0"
                    >
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
                    value={selectedStore ? selectedStore.value : ""}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="btn custom-button-bgcolor"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Loading...
                      </>
                    ) : (
                      "Submit"
                    )}
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
