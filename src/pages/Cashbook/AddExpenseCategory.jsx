import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import { cashbookService } from "../../services/cashbookService";
import DeleteModal from "../../components/DeleteModal/DeleteModal";
import CommonButton from "../../components/CommonButton/CommonButton";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const AddExpenseCategory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    expenseCategory: "",
  });
  const [errors, setErrors] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.expenseCategory.trim()) {
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
    const body = {
      name: formData.expenseCategory.trim(),
    };

    setLoading(true);
    try {
      const response = await cashbookService.createExpense(body);
      if (response.success) {
        toast.success(
          response.data?.message || "Expense category created successfully"
        );
        setFormData({ expenseCategory: "" });
        getCategoryData(pagination.page, pagination.limit, searchQuery);
      } else {
        toast.error(response.message || "Failed to create expense category");
      }
    } catch (error) {
      console.error("Create expense error:", error);
      toast.error("Failed to create expense category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await cashbookService.deleteExpense(deleteId);
      if (response.success) {
        toast.success(
          response.data?.message || "Expense category deleted successfully"
        );
        setDeleteId(null);
        getCategoryData(pagination.page, pagination.limit, searchQuery);
      } else {
        toast.error(response.message || "Failed to delete expense category");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete expense category");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryData = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await cashbookService.getCategory({
        page,
        limit,
        search,
      });
      if (response.success) {
        setCategoryData(response.data?.data?.docs || []);
        setPagination({
          page: response.data?.data?.page || 1,
          limit: response.data?.data?.limit || 10,
          totalDocs: response.data?.data?.totalDocs || 0,
          totalPages: response.data?.data?.totalPages || 1,
          hasNextPage: response.data?.data?.hasNextPage || false,
          hasPrevPage: response.data?.data?.hasPrevPage || false,
        });
      } else {
        throw new Error(response.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Fetch category error:", error);
      setError("Failed to load categories. Please try again.");
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const hideDeleteModal = () => {
    setDeleteId(null);
    setDeleteModal(false);
  };

  // Fetch data on mount and when page, limit, or search changes
  useEffect(() => {
    const debouncedFetch = debounce(() => {
      getCategoryData(pagination.page, pagination.limit, searchQuery);
    }, 300);

    debouncedFetch();

    return () => clearTimeout(debouncedFetch.timeout);
  }, [pagination.page, pagination.limit, searchQuery]);

  // Handle delete modal visibility
  useEffect(() => {
    setDeleteModal(!!deleteId);
  }, [deleteId]);

  // Handle search input change
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on search
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPagination((prev) => ({ ...prev, limit: newSize, page: 1 }));
  };

  // Calculate the range of displayed rows
  const startRow = (pagination.page - 1) * pagination.limit + 1;
  const endRow = Math.min(
    pagination.page * pagination.limit,
    pagination.totalDocs
  );
  const totalRows = pagination.totalDocs;

  return (
    <div className="container-fluid py-5 px-4 px-sm-5 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="mb-4">
            <h1 className="h3 text-dark fw-bold">Expense Category</h1>
          </div>
          <div className="mt-5">
            <p>Create Expense Category</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12">
                <label
                  htmlFor="expenseCategory"
                  className="form-label font-weight-500 text-sm"
                >
                  Expense Category <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="expenseCategory"
                  name="expenseCategory"
                  className={`form-control ${
                    errors.expenseCategory ? "is-invalid" : ""
                  }`}
                  value={formData.expenseCategory}
                  onChange={(e) =>
                    handleInputChange("expenseCategory", e.target.value)
                  }
                  aria-describedby="expenseCategoryError"
                />
                {errors.expenseCategory && (
                  <div
                    id="expenseCategoryError"
                    className="invalid-feedback text-xs mt-1"
                  >
                    {errors.expenseCategory}
                  </div>
                )}
              </div>
            </div>
            <div className="col-12 mt-3">
              <CommonButton
                loading={loading}
                buttonText={loading ? "Submitting..." : "Submit"}
                onClick={handleSubmit}
                className="btn btn-primary w-auto bg-indigo-500 hover:bg-indigo-600 text-white"
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
                    onChange={handleSearch}
                  />
                </div>
              </div>
              {loading && <div className="text-center">Loading...</div>}
              {error && <div className="text-danger text-center">{error}</div>}
              {!loading && !error && categoryData.length === 0 && (
                <div className="text-center text-muted">
                  No categories found
                </div>
              )}
              {!loading && !error && categoryData.length > 0 && (
                <>
                  <div className="table-responsive px-2">
                    <table className="table table-sm">
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
                            Created At
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
                        {categoryData.map((category, index) => (
                          <tr key={category._id}>
                            <td className="p-3">
                              {(pagination.page - 1) * pagination.limit +
                                index +
                                1}
                            </td>
                            <td className="p-3">{category.name}</td>
                            <td className="p-3">
                              {new Date(
                                category.createdAt
                              ).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <div
                                className="d-flex gap-2 align-items-center"
                                role="button"
                              >
                                <AiOutlineDelete
                                  size={30}
                                  className="text-danger cursor-pointer"
                                  onClick={() => setDeleteId(category._id)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                    <div>
                      Showing {startRow} to {endRow} of {totalRows} results
                    </div>
                    <div
                      className="d-flex align-items-center"
                      style={{ gap: "1rem" }}
                    >
                      <div className="btn-group">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page - 1,
                            }))
                          }
                          disabled={!pagination.hasPrevPage}
                        >
                          Previous
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page + 1,
                            }))
                          }
                          disabled={!pagination.hasNextPage}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
