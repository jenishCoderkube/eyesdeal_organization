import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
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

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

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
  const [filteredData, setFilteredData] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [showcontactInput, setShowContactInput] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [formData, setFormData] = useState([
    {
      name: "",
      phone: "",
    },
  ]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = (searchKey = "") => {
    userService
      .getVendors(searchKey)
      .then((res) => {
        setVendors(res.data?.data?.docs);
        setDataLoaded(true);
      })
      .catch((e) => console.log("Error fetching vendors: ", e));
  };

  // Debounced filter
  useEffect(() => {
    if (!dataLoaded) return;
    const debouncedFilter = debounce((query) => {
      fetchVendors(query);
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery]);

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const addVendor = async (data) => {
    const response = await userService.addVendor(data);
    if (response.success) {
      toast.success(response.message);
      fetchVendors();
      setShowForm(false);
    } else {
      toast.error(response.message);
    }
  };

  // Table data
  const tableData = filteredData || vendors;

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "_id",
        header: "SRNO",
        cell: ({ row }) => (
          <div className="text-left break-words">{row.index + 1}</div>
        ),
      },
      {
        accessorKey: "companyName",
        header: "Company Name",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue()}</div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <div className="text-left break-words">
            {getValue() === "lens_vendor"
              ? "Lens Vendor"
              : getValue() === "frame_vendor"
              ? "Frame Vendor"
              : "Accessory Vendor"}
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <div className="text-left break-words">{getValue() || "-"}</div>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="d-flex align-items-center">
            <FiEdit2
              size={18}
              className="text-primary cursor-pointer me-2"
              onClick={() => handleEdit(row.original)}
            />
            <MdDeleteOutline
              size={24}
              className="text-danger cursor-pointer"
              onClick={() => handleDelete(row.original._id)}
            />
          </div>
        ),
      },
    ],
    []
  );

  // Table setup
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
    },
  });

  // Handle edit
  const handleEdit = (vendor) => {
    setEditVendor(vendor);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    alert("Are you sure you want to delete?");
    console.log(`Delete vendor with id: ${id}`);
    const response = await userService.deleteVendor(id);
    if (response.success) {
      fetchVendors();
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  // Formik for create form
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

  const updateVendor = async (data) => {
    const response = await userService.updateVendor(data);
    if (response.success) {
      toast.success(response.message);
      fetchVendors();
      setShowEditModal(false);
    } else {
      toast.error(response.message);
    }
  };

  const handleAddPhone = () => {
    createFormik.setFieldValue("contactNumber", [
      ...createFormik.values.contactNumber,
      { name: "", phone: "+91" },
    ]);
  };

  // Country, state, city options
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

  // Handle country/state changes
  const handleCountryChange = (option, formik) => {
    formik.setFieldValue("country", option);
    formik.setFieldValue("state", null);
    formik.setFieldValue("city", null);
  };

  const handleStateChange = (option, formik) => {
    formik.setFieldValue("state", option);
    formik.setFieldValue("city", null);
  };

  // Type options
  const typeOptions = [
    { value: "lens_vendor", label: "Lens Vendor" },
    { value: "frame_vendor", label: "Frame Vendor" },
    { value: "accessory_vendor", label: "Accessory Vendor" },
  ];

  // Pagination
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, tableData.length);
  const totalRows = tableData.length;

  const handleNameChange = (e, index) => {
    const { value } = e.target;
    let contactNumber = createFormik.values.contactNumber;
    contactNumber[index].name = value;
    createFormik.setFieldValue("contactNumber", contactNumber);
  };

  const handlePhoneChange = (phone, index) => {
    let contactNumber = createFormik.values.contactNumber;
    contactNumber[index].phone = phone;
    createFormik.setFieldValue("contactNumber", contactNumber);
  };

  const handleRemoveContact = (contactIndex) => {
    const contactNumber = createFormik.values.contactNumber.filter(
      (item, index) => index !== contactIndex
    );
    createFormik.setFieldValue("contactNumber", contactNumber);
  };

  // Render form
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
          {/* <IoIosAddCircle onClick={handleAddPhone} size={24} /> */}
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
            <div className="ms-3 mt-3">
              <div className="w-100 position-relative">
                <IoIosClose
                  size={25}
                  color="red"
                  className="remove-icon"
                  onClick={() => handleRemoveContact(index)}
                />
                <label className="form-label fw-medium" htmlFor="companyName">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full form-control"
                  name="name"
                  placeholder="Enter name"
                  value={contact?.name}
                  onChange={(e) => handleNameChange(e, index)}
                />
              </div>
              <div className="w-100 mt-3">
                <label className="form-label fw-medium" htmlFor="phone">
                  Phone <span className="text-danger">*</span>
                </label>
                <PhoneInput
                  country={"in"}
                  inputClass={`form-control "is-invalid`}
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
            <a
              className="text-secondary text-decoration-underline text-black"
              href="#"
              onClick={() => setShowForm((prev) => !prev)}
            >
              Create Vendor
            </a>
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
                <table className="table table-sm">
                  <thead className="text-xs text-uppercase text-muted bg-light border-top border-bottom border">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} role="row">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="p-3 text-left custom-perchase-th"
                            role="columnheader"
                          >
                            <div className="fw-semibold text-left break-words">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="text-sm">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} role="row">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="p-3" role="cell">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3 px-3">
                <div>
                  Showing {startRow} to {endRow} of {totalRows} results
                </div>
                <div className="btn-group">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Next
                  </button>
                </div>
              </div>
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
