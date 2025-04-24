import React, { useState } from "react";
import Select from "react-select";

const AssignStore = () => {
  const [selectedStore, setSelectedStore] = useState(null);

  // Sample store options (replace with actual data from API or props)
  const storeOptions = [
    { value: "65aa1d545b58e0343976de38", label: "ELITE HOSPITAL / 27" },
    { value: "store2", label: "STORE 2 / 28" },
    { value: "store3", label: "STORE 3 / 29" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStore) {
      alert("Please select a store");
      return;
    }
    console.log("Form submitted:", { store: selectedStore.value });
    // Add API call here (e.g., axios.post)
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
                className="d-flex flex-column gap-4"
              >
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
                    value={selectedStore ? selectedStore.value : ""}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      backgroundColor: "#6366F1",
                      borderColor: "#6366F1",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#4F46E5")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#6366F1")
                    }
                  >
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
