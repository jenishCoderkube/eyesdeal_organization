import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { FaSearch } from "react-icons/fa";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CommonButton from "../../components/CommonButton/CommonButton";
import { cashbookService } from "../../services/cashbookService";
import { toast } from "react-toastify";
import moment from "moment/moment";

const ViewCashbook = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [cashBooks, setCashBook] = useState([]);
  console.log("cashBooks", cashBooks?.docs);
  const today = new Date();
  const [formData, setFormData] = useState({
    mode: { label: "Cash", value: "cash" },
    store: null,
    from: new Date(today.setHours(0, 0, 0, 0)),
    to: new Date(today.setHours(23, 59, 59, 999)),
  });

  // Sample cashbook data (replace with API data)
  const cashbooks = [
    {
      id: 20,
      store: "EYESDEAL BHATAR",
      expenseCategory: "SALE",
      amount: 1350,
      balance: 15165,
      note: "254386",
      date: "16/04/2025",
      type: "credit",
    },
    {
      id: 1,
      store: "ELITE HOSPITAL",
      expenseCategory: "RENT",
      amount: 2000,
      balance: 13165,
      note: "Monthly rent",
      date: "15/04/2025",
      type: "debit",
    },
    {
      id: 2,
      store: "SAFENT",
      expenseCategory: "UTILITIES",
      amount: 500,
      balance: 12665,
      note: "Electricity bill",
      date: "14/04/2025",
      type: "debit",
    },
    {
      id: 3,
      store: "CLOSED NIKOL",
      expenseCategory: "SALE",
      amount: 1000,
      balance: 13665,
      note: "Product sale",
      date: "13/04/2025",
      type: "credit",
    },
    {
      id: 4,
      store: "EYESDEAL ADAJAN",
      expenseCategory: "MAINTENANCE",
      amount: 300,
      balance: 13365,
      note: "Equipment repair",
      date: "12/04/2025",
      type: "debit",
    },
  ];

  // Sample options for dropdowns
  const modeOptions = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "bank", label: "Bank" },
  ];

  const storeOptions = storeData?.map((vendor) => ({
    value: vendor._id,
    label: `${vendor.name}`,
  }));

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
    cashBook();
    // Add API call here (e.g., axios.post)
  };

  const filteredCashbooks = cashbooks.filter((entry) =>
    entry.store.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sample balance data
  const openingBalance = 5780;
  const closingBalance = 15165;

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
    cashBook();
  }, []);

  const cashBook = async () => {
    const storeId = formData?.store?.map((option) => option.value);
    setLoading(true);

    try {
      const response = await cashbookService.cashBook(
        formData?.from?.getTime(),
        formData?.to?.getTime(),
        storeId,
        1, // page
        20, // limit,,
        1
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
          <div className="d-flex flex-column flex-md-row gap-4  ">
            <h6 className="fw-bold">
              Opening Balance: <span>{openingBalance}</span>
            </h6>
            <h6 className="fw-bold">
              Closing Balance: <span>{closingBalance}</span>
            </h6>
          </div>
          <div className="card shadow-none border">
            <div className="card-header border-0 px-4 pt-3">
              <h5 className="fw-bold pt-3">Cashbooks</h5>
            </div>
            <div className="card-body p-0">
              <div className="mb-4 col-md-5">
                <div className="input-group ">
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
              <div className="table-responsive px-2">
                <table className="table  table-sm">
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
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-2 py-3">
                            {entry?.store?.companyName}
                          </td>
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
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center">
            <div className="text-sm ">
              Showing <span className="fw-bold ">{cashBooks.length}</span> of{" "}
              <span className="fw-bold ">{cashBooks.length}</span> results
            </div>
            <nav aria-label="Navigation">
              <ul className="d-flex list-unstyled">
                <li className="me-2">
                  <button
                    className="btn border border-secondary text-muted"
                    disabled
                  >
                    &lt;- Previous
                  </button>
                </li>
                <li>
                  <button
                    className="btn border border-secondary text-muted"
                    disabled
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
