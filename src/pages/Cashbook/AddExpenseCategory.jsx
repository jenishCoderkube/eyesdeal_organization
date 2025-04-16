import React, { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
const AddExpenseCategory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    expenseCategory: "",
  });
  const [errors, setErrors] = useState({});
  // Dummy store data
  const stores = [
    {
      id: 1,

      storeName: "ELITE HOSPITAL",
    },
    {
      id: 2,

      storeName: "SAFENT",
    },
    {
      id: 3,

      storeName: "CLOSED NIKOL",
    },
    {
      id: 4,

      storeName: "EYESDEAL ADAJAN",
    },
    {
      id: 5,

      storeName: "EYESDEAL UDHANA",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDelete = (id) => {
    alert("Are you sure you want to delete");
    console.log(`Delete store with id: ${id}`);
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.expenseCategory) {
      newErrors.expenseCategory = "expenseCategory is a required field";
    }
    return newErrors;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    console.log("Form submitted:", formData);
    // Add API call here (e.g., axios.post)
  };
  const filteredStores = stores.filter((store) =>
    store.storeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid py-5 px-4 px-sm-5 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="mb-4">
            <h1 className="h3 text-dark fw-bold">Expense Category</h1>
          </div>
          <div className=" mt-5">
            <p className="">Create Expense Category</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12">
                <label
                  htmlFor="amount"
                  className="form-label fw-medium text-sm"
                >
                  Expense Category <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="expenseCategory"
                  name="expenseCategory"
                  className="form-control"
                  step="0.001"
                  value={formData.expenseCategory}
                  onChange={(e) =>
                    handleInputChange("expenseCategory", e.target.value)
                  }
                  aria-describedby="expenseCategoryError"
                />
                {errors.expenseCategory && (
                  <div
                    id="expenseCategoryError"
                    className="text-danger text-xs mt-1"
                  >
                    {errors.expenseCategory}
                  </div>
                )}
              </div>
            </div>
            <div className="col-12 mt-3">
              <button type="submit" className="btn btn-primary px-3 py-2">
                Submit
              </button>
            </div>
          </form>
          <div
            className="card shadow-sm mt-5"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">Expense Category</h6>
            <div className="card-body px-0 py-3">
              <div className="mb-4 col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch className="text-muted custom-search-icon" />
                  </span>
                  <input
                    type="search"
                    className="form-control border-start-0 py-2"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-responsive">
                <table className="table  table-sm">
                  <thead className="text-xs text-uppercase text-muted bg-light border-top border-bottom">
                    <tr>
                      <th
                        scope="col"
                        className="p-3 text-left custom-perchase-th"
                      >
                        SRNO
                      </th>
                      <th
                        scope="col"
                        className="p-3 text-left custom-perchase-th"
                      >
                        Name
                      </th>

                      <th
                        scope="col"
                        className="p-3 text-left custom-perchase-th"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredStores.map((store) => (
                      <tr key={store.id}>
                        <td className="p-3">{store.id}</td>

                        <td className="p-3">{store.storeName}</td>

                        <td className="p-3">
                          <div className="d-flex gap-2 align-items-center">
                            <AiOutlineDelete
                              size={30}
                              className="text-danger cursor-pointer"
                              onClick={() => handleDelete(store.id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseCategory;
