import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import { cashbookService } from "../../services/cashbookService";
import DeleteModal from "../../components/DeleteModal/DeleteModal";
import CommonButton from "../../components/CommonButton/CommonButton";
const AddExpenseCategory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    expenseCategory: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await cashbookService.deleteExpense(deleteId);
      if (response.success) {
        console.log("res", response?.data?.message);
        toast.success(response?.data?.message);
        setDeleteId(null);
        getCategoryData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.expenseCategory) {
      newErrors.expenseCategory = "Expense Category is a required field";
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
    console.log("Form submitted:", formData);
    const body = {
      name: formData?.expenseCategory,
    };

    setLoading(true);
    try {
      const response = await cashbookService.createExpense(body);
      if (response.success) {
        console.log("res", response.message);
        toast.success(response?.data?.message);
        getCategoryData();
        setFormData({ expenseCategory: "" });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
    // Add API call here (e.g., axios.post)
  };

  useEffect(() => {
    getCategoryData();
  }, [searchQuery]);

  const getCategoryData = async () => {
    setLoading(true);
    try {
      const response = await cashbookService.getCategory(searchQuery);
      if (response.success) {
        console.log("res", response?.data?.data?.docs);
        setCategoryData(response?.data?.data?.docs);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const hideDeleteModal = () => {
    setDeleteId(null);
  };

  useEffect(() => {
    if (deleteId) {
      setDeleteModal(true);
    } else {
      setDeleteModal(false);
    }
  }, [deleteId]);

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
              <CommonButton
                loading={loading}
                buttonText="Submit"
                onClick={handleSubmit}
                className="btn btn-primary w-auto bg-indigo-500 hover-bg-indigo-600 text-white"
              />
            </div>
          </form>
          <div
            className="card shadow-sm mt-5"
            style={{ border: "1px solid #e2e8f0" }}
          >
            <h6 className="fw-bold px-3 pt-3">Expense Category</h6>
            <div className="card-body px-0 py-3">
              <div className="mb-4 col-md-5">
                <div className="input-group px-3">
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
                    {categoryData?.length > 0 ? (
                      categoryData?.map((store, index) => (
                        <tr key={store.id}>
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3">{store.name}</td>
                          <td className="p-3">
                            <div
                              className="d-flex gap-2 align-items-center"
                              role="button"
                            >
                              <AiOutlineDelete
                                size={30}
                                className="text-danger cursor-pointer"
                                onClick={() => setDeleteId(store?._id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center p-3 text-muted">
                          No data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteModal
        show={deleteModal}
        onHide={hideDeleteModal}
        onDelete={handleDelete}
        title="Delete Expense Category"
        body="Are you sure you want to delete this record?"
      />
    </div>
  );
};

export default AddExpenseCategory;
