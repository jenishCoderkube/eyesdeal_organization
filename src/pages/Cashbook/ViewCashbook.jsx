import React, { useEffect, useState, useCallback } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CommonButton from "../../components/CommonButton/CommonButton";
import { cashbookService } from "../../services/cashbookService";
import { toast } from "react-toastify";
import moment from "moment/moment";
import { debounce } from "lodash";

const ViewCashbook = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [cashBooks, setCashBook] = useState({
    docs: [],
    totalDocs: 0,
    limit: 20,
    page: 1,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const today = new Date();
  const [formData, setFormData] = useState({
    mode: { label: "Cash", value: "cash" },
    store: null,
    from: new Date(today.setHours(0, 0, 0, 0)),
    to: new Date(today.setHours(23, 59, 59, 999)),
  });

  // Sample options for dropdowns
  const modeOptions = [
    { value: "cash", label: "Cash" },
    { value: "card", label: "UPI" },
    { value: "bank", label: "Bank" },
  ];

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      cashBook(query, currentPage);
    }, 300),
    [formData, currentPage]
  );

  useEffect(() => {
    if (cashBooks) {
      console.log("cashBooks", cashBooks);
    }
  }, [cashBooks]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = (id) => {
    alert("Are you sure you want to delete?");
    console.log(`Delete cashbook entry with id: ${id}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData?.from);
    setCurrentPage(1); // Reset to first page on form submit
    cashBook(searchQuery, 1);
  };

  useEffect(() => {
    getStores();
  }, []);

  const getStores = async () => {
    setLoading(true);
    try {
      const response = await cashbookService.viewCashBook();
      if (response.success) {
        setStoreData(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cashBook(searchQuery, currentPage);
  }, [currentPage]);

  const cashBook = async (search = "", page = 1) => {
    const storeId = formData?.store?.map((option) => option.value);
    setLoading(true);

    try {
      const response = await cashbookService.cashBook(
        formData?.from?.getTime(),
        formData?.to?.getTime(),
        storeId,
        page,
        limit,
        1,
        search,
        formData?.mode?.value
      );
      if (response.success) {
        console.log("response", response);
        setCashBook(response?.data?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
    debouncedSearch(query);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= cashBooks.totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container-fluid py-5 px-4 px-sm-5 px-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div className="mb-4">
            <h1 className="h3 text-dark fw-bold">
              View {formData.mode.label} book
            </h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="row g-4 mb-4">
              <div className="col-12 col-md-6 col-lg-3">
                <label
                  htmlFor="mode"
                  className="form-label font-weight-500 text-sm"
                >
                  Mode
                </label>
                <Select
                  id="mode"
                  options={modeOptions}
                  value={formData.mode}
                  onChange={(option) => handleInputChange("mode", option)}
                  placeholder="Select..."
                  classNamePrefix="react-select"
                />
                <input
                  name="mode"
                  type="hidden"
                  value={formData.mode ? formData.mode.value : ""}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <label
                  htmlFor="store"
                  className="form-label font-weight-500 text-sm"
                >
                  Stores
                </label>
                <Select
                  id="store"
                  options={storeOptions}
                  isMulti
                  value={formData.store}
                  onChange={(option) => handleInputChange("store", option)}
                  placeholder="Select..."
                  classNamePrefix="react-select"
                />
                <input
                  name="store"
                  type="hidden"
                  value={formData.store ? formData.store.value : ""}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <label
                  htmlFor="from"
                  className="form-label font-weight-500 text-sm"
                >
                  From
                </label>
                <DatePicker
                  selected={formData.from ? new Date(formData.from) : null}
                  onChange={(date) => handleInputChange("from", date)}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div className="col-12 col-md-6 col-lg-3">
                <label
                  htmlFor="to"
                  className="form-label font-weight-500 text-sm"
                >
                  To
                </label>
                <DatePicker
                  selected={formData.to ? new Date(formData.to) : null}
                  onChange={(date) => handleInputChange("to", date)}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div className="col-12">
                <CommonButton
                  loading={loading}
                  buttonText="Submit"
                  onClick={handleSubmit}
                  className="btn btn-primary w-auto bg-indigo-500 hover-bg-indigo-600 text-white"
                />
              </div>
            </div>
          </form>
          {/* <div className="d-flex flex-column flex-md-row gap-4">
            <h6 className="fw-bold">
              Opening Balance: <span>{openingBalance}</span>
            </h6>
            <h6 className="fw-bold">
              Closing Balance: <span>{closingBalance}</span>
            </h6>
          </div> */}
          <div className="card shadow-none border">
            <div className="card-header border-0 px-4 pt-3">
              <h5 className="fw-bold pt-3">Cashbooks</h5>
            </div>
            <div className="card-body p-0">
              <div className="mb-4 col-md-5">
                <div className="input-group px-4">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch className="text-muted custom-search-icon" />
                  </span>
                  <input
                    type="search"
                    className="form-control border-start-0 py-2"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              <div className="table-responsive px-2">
                <table className="table table-sm">
                  <thead className="text-xs text-uppercase text-muted bg-light border-top border-bottom">
                    <tr>
                      <th className="px-4 py-3 text-left custom-perchase-th">
                        SRNO
                      </th>
                      <th className="px-2 py-3 text-left custom-perchase-th">
                        Store
                      </th>
                      <th className="px-2 py-3 text-left custom-perchase-th">
                        Expense Category
                      </th>
                      <th className="px-2 py-3 text-left custom-perchase-th">
                        Amount
                      </th>
                      <th className="px-2 py-3 text-left custom-perchase-th">
                        Balance
                      </th>
                      <th className="px-2 py-3 text-left custom-perchase-th">
                        Note
                      </th>
                      <th className="px-2 py-3 text-left custom-perchase-th">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left custom-perchase-th">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-200">
                    {cashBooks?.docs?.length > 0 ? (
                      cashBooks.docs.map((entry, index) => (
                        <tr key={entry._id}>
                          <td className="px-4 py-3">
                            {(currentPage - 1) * limit + index + 1}
                          </td>
                          <td className="px-2 py-3">{entry?.store?.name}</td>
                          <td className="px-2 py-3">
                            {entry?.expenseCategory}
                          </td>
                          <td className="px-2 py-3">{entry?.amount}</td>
                          <td className="px-2 py-3">{entry?.balance}</td>
                          <td className="px-2 py-3">{entry?.notes}</td>
                          <td className="px-2 py-3">
                            {moment(entry?.createdAt).format("DD/MM/YYYY")}
                          </td>
                          <td className="px-4 py-3">{entry?.type}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-4 py-3 custom-perchase-th text-center"
                        >
                          No data found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-4">
            <div className="text-sm">
              Showing <span className="fw-bold">{cashBooks.docs.length}</span>{" "}
              of <span className="fw-bold">{cashBooks.totalDocs}</span> results
            </div>
            <nav aria-label="Navigation">
              <ul className="d-flex list-unstyled align-items-center">
                <li className="me-2">
                  <button
                    className="btn border border-secondary text-muted"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!cashBooks.hasPrevPage}
                  >
                    &lt;- Previous
                  </button>
                </li>
                {Array.from(
                  { length: cashBooks.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <li key={page} className="me-2">
                    <button
                      className={`btn border border-secondary ${
                        currentPage === page
                          ? "bg-indigo-500 text-white"
                          : "text-muted"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    className="btn border border-secondary text-muted"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!cashBooks.hasNextPage}
                  >
                    Next -&gt;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCashbook;
