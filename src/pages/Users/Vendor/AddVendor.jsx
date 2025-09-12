import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { useFormik } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import { IoIosAddCircle, IoIosClose } from "react-icons/io";
import EditVendorModal from "../../../components/Users/Vendor/EditVendorModal";
import { userService } from "../../../services/userService";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { useDebounce } from "use-debounce";

// Validation schema
const validationSchema = Yup.object({
  companyName: Yup.string().trim().required("Company Name is required"),
  phone: Yup.string()
    .min(4, "Phone number is required")
    .required("Phone number is required"),
  email: Yup.string().email("Invalid email address"),
  type: Yup.object().nullable(),
  country: Yup.object().nullable().required("Country is required"),
  state: Yup.object().nullable().required("State is required"),
  city: Yup.object().nullable().required("City is required"),
  pincode: Yup.string().trim().required("Pincode is required"),
  address: Yup.string().trim(),
  GSTNumber: Yup.string().trim(),
  contactNumber: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string(),
        phone: Yup.string(),
      })
    )
    .notRequired(),
});

const AddVendors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debouncedSearch] = useDebounce(searchQuery, 400);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetchVendors(pagination.page, debouncedSearch, controller.signal);
    return () => controller.abort(); // Cancel request on cleanup
  }, [pagination.page, debouncedSearch]);

  const fetchVendors = async (page = 1, search = "") => {
    setLoading(true);
    const controller = new AbortController(); // Create AbortController
    try {
      const res = await userService.getVendors(
        {
          page,
          limit: pagination.limit,
          search,
        },
        { signal: controller.signal } // Pass signal to API call
      );
      if (res.success) {
        setVendors(res.data?.data?.docs || []);
        setPagination({
          page: res.data?.data?.page || 1,
          limit: res.data?.data?.limit || 20,
          totalDocs: res.data?.data?.totalDocs || 0,
          totalPages: res.data?.data?.totalPages || 0,
          hasNextPage: res.data?.data?.hasNextPage || false,
          hasPrevPage: res.data?.data?.hasPrevPage || false,
        });
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error fetching vendors:", error);
        toast.error("Failed to fetch vendors");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event) => {
    setPagination((prev) => ({ ...prev, page: event.selected + 1 }));
  };

  const addVendor = async (data) => {
    const response = await userService.addVendor(data);
    if (response.success) {
      toast.success(response.message);
      fetchVendors(pagination.page, debouncedSearch);
      setShowForm(false);
    } else {
      toast.error(response.message);
    }
  };

  const updateVendor = async (data) => {
    const response = await userService.updateVendor(data);
    if (response.success) {
      toast.success(response.message);
      fetchVendors(pagination.page, debouncedSearch);
      setShowEditModal(false);
    } else {
      toast.error(response.message);
    }
  };

  const handleEdit = (vendor) => {
    setEditVendor(vendor);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete?")) {
      const response = await userService.deleteVendor(id);
      if (response.success) {
        toast.success(response.message);
        fetchVendors(pagination.page, debouncedSearch);
      } else {
        toast.error(response.message);
      }
    }
  };

  const createFormik = useFormik({
    initialValues: {
      companyName: "",
      phone: "+91",
      email: "",
      type: null,
      country: null,
      state: null,
      city: null,
      pincode: "",
      address: "",
      GSTNumber: "",
      contactNumber: [],
    },
    validationSchema,
    onSubmit: (values) => {
      const data = {
        ...values,
        country: values.country.label,
        state: values.state.label,
        city: values.city.label,
        type: values.type?.value,
        contactPerson: values.contactNumber,
      };
      addVendor(data);
    },
  });

  const handleAddPhone = () => {
    createFormik.setFieldValue("contactNumber", [
      ...createFormik.values.contactNumber,
      { name: "", phone: "+91" },
    ]);
  };

  const handleNameChange = (e, index) => {
    const { value } = e.target;
    let contactNumber = [...createFormik.values.contactNumber];
    contactNumber[index].name = value;
    createFormik.setFieldValue("contactNumber", contactNumber);
  };

  const handlePhoneChange = (phone, index) => {
    let contactNumber = [...createFormik.values.contactNumber];
    contactNumber[index].phone = phone;
    createFormik.setFieldValue("contactNumber", contactNumber);
  };

  const handleRemoveContact = (contactIndex) => {
    const contactNumber = createFormik.values.contactNumber.filter(
      (item, index) => index !== contactIndex
    );
    createFormik.setFieldValue("contactNumber", contactNumber);
  };

  const countryOptions = Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

  const stateOptions = createFormik.values.country
    ? State.getStatesOfCountry(createFormik.values.country.value).map(
        (state) => ({
          value: state.isoCode,
          label: state.name,
        })
      )
    : [];

  const cityOptions =
    createFormik.values.country && createFormik.values.state
      ? City.getCitiesOfState(
          createFormik.values.country.value,
          createFormik.values.state.value
        ).map((city) => ({
          value: city.name,
          label: city.name,
        }))
      : [];

  const handleCountryChange = (option, formik) => {
    formik.setFieldValue("country", option);
    formik.setFieldValue("state", null);
    formik.setFieldValue("city", null);
  };

  const handleStateChange = (option, formik) => {
    formik.setFieldValue("state", option);
    formik.setFieldValue("city", null);
  };

  const typeOptions = [
    { value: "lens_vendor", label: "Lens Vendor" },
    { value: "frame_vendor", label: "Frame Vendor" },
    { value: "accessory_vendor", label: "Accessory Vendor" },
  ];

  const renderForm = (formik) => (
    <div className="card-body">
      <form
        className="d-flex flex-column"
        style={{ gap: "1rem" }}
        onSubmit={formik.handleSubmit}
      >
        <div className="w-100">
          <label className="form-label fw-medium" htmlFor="companyName">
            Company Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            className={`form-control ${
              formik.touched.companyName && formik.errors.companyName
                ? "is-invalid"
                : ""
            }`}
            value={formik.values.companyName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter company name"
          />
          {formik.touched.companyName && formik.errors.companyName && (
            <div className="invalid-feedback">{formik.errors.companyName}</div>
          )}
        </div>
        <div className="w-100">
          <label className="form-label fw-medium" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            name="email"
            className={`form-control ${
              formik.touched.email && formik.errors.email ? "is-invalid" : ""
            }`}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter email"
          />
          {formik.touched.email && formik.errors.email && (
            <div className="invalid-feedback">{formik.errors.email}</div>
          )}
        </div>
        <div className="w-100">
          <label className="form-label fw-medium" htmlFor="phone">
            Phone <span className="text-danger">*</span>
          </label>
          <PhoneInput
            country={"in"}
            value={formik.values.phone}
            onChange={(phone) => formik.setFieldValue("phone", phone)}
            onBlur={() => formik.setFieldTouched("phone", true)}
            inputClass={`form-control ${
              formik.touched.phone && formik.errors.phone ? "is-invalid" : ""
            }`}
            containerClass="w-100"
            inputStyle={{ width: "100%" }}
            placeholder="1 (702) 123-4567"
          />
          {formik.touched.phone && formik.errors.phone && (
            <div className="invalid-feedback-color">{formik.errors.phone}</div>
          )}
        </div>
        <div className="w-100">
          <label className="form-label fw-medium" htmlFor="type">
            Type
          </label>
          <Select
            options={typeOptions}
            value={formik.values.type}
            onChange={(option) => formik.setFieldValue("type", option)}
            onBlur={() => formik.setFieldTouched("type", true)}
            placeholder="Select..."
            classNamePrefix="react-select"
          />
          {formik.touched.type && formik.errors.type && (
            <div className="text-danger mt-1">{formik.errors.type}</div>
          )}
        </div>
        <div className="w-100">
          <label className="form-label fw-medium" htmlFor="type">
            Contact Person
          </label>
          <br />
          <button
            className="btn btn-outline-primary"
            onClick={(e) => {
              e.preventDefault();
              handleAddPhone();
            }}
          >
            Add Phone
          </button>
          {createFormik.values.contactNumber.map((contact, index) => (
            <div className="ms-3 mt-3" key={index}>
              <div className="w-100 position-relative">
                <IoIosClose
                  size={25}
                  color="red"
                  className="remove-icon"
                  onClick={() => handleRemoveContact(index)}
                />
                <label
                  className="form-label fw-medium"
                  htmlFor={`name-${index}`}
                >
                  Name
                </label>
                <input
                  type="text"
                  className="w-100 form-control"
                  name={`name-${index}`}
                  placeholder="Enter name"
                  value={contact?.name}
                  onChange={(e) => handleNameChange(e, index)}
                />
              </div>
              <div className="w-100 mt-3">
                <label
                  className="form-label fw-medium"
                  htmlFor={`phone-${index}`}
                >
                  Phone <span className="text-danger">*</span>
                </label>
                <PhoneInput
                  country={"in"}
                  inputClass="form-control"
                  containerClass="w-100"
                  value={contact?.phone}
                  onChange={(phone) => handlePhoneChange(phone, index)}
                  inputStyle={{ width: "100%" }}
                  placeholder="1 (702) 123-4567"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="w-100">
          <label className="form-label fw-medium" htmlFor="country">
            Country <span className="text-danger">*</span>
          </label>
          <Select
            options={countryOptions}
            value={formik.values.country}
            onChange={(option) => handleCountryChange(option, formik)}
            onBlur={() => formik.setFieldTouched("country", true)}
            placeholder="Select country..."
            classNamePrefix="react-select"
          />
          {formik.touched.country && formik.errors.country && (
            <div className="text-danger mt-1">{formik.errors.country}</div>
          )}
        </div>
        <div className="w-100">
          <label className="form-label fw-medium" htmlFor="state">
            State <span className="text-danger">*</span>
          </label>
          <Select
            options={stateOptions}
            value={formik.values.state}
            onChange={(option) => handleStateChange(option, formik)}
            onBlur={() => formik.setFieldTouched("state", true)}
            placeholder="Select state..."
            isDisabled={!formik.values.country}
            classNamePrefix="react-select"
          />
          {formik.touched.state && formik.errors.state && (
            <div className="text-danger mt-1">{formik.errors.state}</div>
          )}
        </div>
        <div className="w-100">
          <label className="form-label fw-medium" htmlFor="city">
            City <span className="text-danger">*</span>
          </label>
          <Select
            options={cityOptions}
            value={formik.values.city}
            onChange={(option) => formik.setFieldValue("city", option)}
            onBlur={() => formik.setFieldTouched("city", true)}
            placeholder="Select city..."
            isDisabled={!formik.values.state}
            classNamePrefix="react-select"
          />
          {formik.touched.city && formik.errors.city && (
            <div className="text-danger mt-1">{formik.errors.city}</div>
          )}
        </div>
        <div className="w-100">
          <label className="form-label fw-medium" htmlFor="pincode">
            Pincode <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="pincode"
            className={`form-control ${
              formik.touched.pincode && formik.errors.pincode
                ? "is-invalid"
                : ""
            }`}
            value={formik.values.pincode}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter pincode"
          />
          {formik.touched.pincode && formik.errors.pincode && (
            <div className="invalid-feedback">{formik.errors.pincode}</div>
          )}
        </div>
        <div className="w-100">
          <label className="form-label fw-medium" htmlFor="address">
            Address
          </label>
          <textarea
            name="address"
            className="form-control"
            rows="5"
            value={formik.values.address}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter address"
          />
        </div>
        <div className="w-100">
          <label className="form-label fw-medium" htmlFor="GSTNumber">
            GST Number
          </label>
          <input
            type="text"
            name="GSTNumber"
            className={`form-control ${
              formik.touched.GSTNumber && formik.errors.GSTNumber
                ? "is-invalid"
                : ""
            }`}
            value={formik.values.GSTNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter GST number"
          />
          {formik.touched.GSTNumber && formik.errors.GSTNumber && (
            <div className="invalid-feedback">{formik.errors.GSTNumber}</div>
          )}
        </div>
        <div>
          <button className="btn custom-button-bgcolor" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-11">
          <div>
            <h1 className="h2 text-dark fw-bold">Vendors</h1>
          </div>

          <div className="mt-5">
            <button
              className="bg-primary text-white btn"
              onClick={() => setShowForm((prev) => !prev)}
            >
              {showForm ? "Close Form" : "Create Vendor"}
            </button>
          </div>
          {showForm && renderForm(createFormik)}

          <div className="card shadow-sm mt-3 border px-2">
            <h6 className="fw-bold px-3 pt-3">Vendors</h6>
            <div className="card-body px-0 py-3">
              <div className="mb-4 col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch
                      className="text-muted custom-search-icon"
                      style={{ color: "#94a3b8" }}
                    />
                  </span>
                  <input
                    type="search"
                    className="form-control border-start-0 py-2"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead className="text-xs text-uppercase text-muted bg-light border-top border-bottom">
                    <tr>
                      <th className="p-3 text-left">SRNO</th>
                      <th className="p-3 text-left">Company Name</th>
                      <th className="p-3 text-left">Phone</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center p-3">
                          Loading...
                        </td>
                      </tr>
                    ) : vendors.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center p-3">
                          No vendors found
                        </td>
                      </tr>
                    ) : (
                      vendors.map((vendor, index) => (
                        <tr key={vendor._id}>
                          <td className="p-3">
                            {(pagination.page - 1) * pagination.limit +
                              index +
                              1}
                          </td>
                          <td className="p-3">{vendor.companyName}</td>
                          <td className="p-3">{vendor.phone}</td>
                          <td className="p-3">
                            {vendor.type === "lens_vendor"
                              ? "Lens Vendor"
                              : vendor.type === "frame_vendor"
                              ? "Frame Vendor"
                              : "Accessory Vendor"}
                          </td>
                          <td className="p-3">{vendor.email || "-"}</td>
                          <td className="p-3">
                            <div className="d-flex align-items-center">
                              <FiEdit2
                                size={18}
                                className="text-primary cursor-pointer me-2"
                                onClick={() => handleEdit(vendor)}
                              />
                              <MdDeleteOutline
                                size={24}
                                className="text-danger cursor-pointer"
                                onClick={() => handleDelete(vendor._id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {!loading && vendors.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                  <div>
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.totalDocs
                    )}{" "}
                    of {pagination.totalDocs} results
                  </div>
                  <ReactPaginate
                    breakLabel="..."
                    nextLabel="Next >"
                    onPageChange={handlePageChange}
                    pageRangeDisplayed={3}
                    pageCount={pagination.totalPages}
                    previousLabel="< Prev"
                    renderOnZeroPageCount={null}
                    forcePage={pagination.page - 1}
                    containerClassName="pagination mb-0"
                    pageClassName="page-item"
                    pageLinkClassName="page-link"
                    previousClassName="page-item"
                    previousLinkClassName="page-link"
                    nextClassName="page-item"
                    nextLinkClassName="page-link"
                    activeClassName="active"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <EditVendorModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        onSubmit={updateVendor}
        editVendor={editVendor}
      />
    </div>
  );
};

export default AddVendors;
