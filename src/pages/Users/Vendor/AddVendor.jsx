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
import { IoIosCloseCircleOutline } from "react-icons/io";
import EditVendorModal from "../../../components/Users/Vendor/EditVendorModal";

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
  GST: Yup.string().trim(),
});

const AddVendors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [showcontactInput, setShowContactInput] = useState(false);
  const [formData, setFormData] = useState([
    {
      name: "",
      phone: "",
    },
  ]);

  // Memoized dummy vendor data
  const vendors = useMemo(
    () => [
      {
        _id: "67ff63f53601ef3b05908dac",
        companyName: "VISION RX",
        phone: "+918401773899",
        type: "lens_vendor",
        email: "",
        country: "IN",
        state: "GJ",
        city: "Surat",
        pincode: "395003",
        address: "VARACHA BOMBE MARKIT",
        GST: "",
      },
      {
        _id: "67ff63f53601ef3b05908dad",
        companyName: "RAVI RAJ VARACCHA",
        phone: "+919033278758",
        type: "lens_vendor",
        email: "",
        country: "IN",
        state: "GJ",
        city: "Surat",
        pincode: "395003",
        address: "VARACHA BOMBE MARKIT",
        GST: "",
      },
      ...Array.from({ length: 10 }, (_, index) => ({
        _id: `67ff63f53601ef3b05908${index + 100}`,
        companyName: `Vendor ${index + 3}`,
        phone: `+919${String(100000000 + index).padStart(9, "0")}`,
        type: ["lens_vendor", "frame_vendor", "accessory_vendor"][
          Math.floor(Math.random() * 3)
        ],
        email: "",
        country: "IN",
        state: "GJ",
        city: "Surat",
        pin桌上: "39500" + (index % 10),
        address: "Sample Address " + (index + 3),
        GST: "",
      })),
    ],
    []
  );

  // Filter function
  const filterGlobally = useMemo(
    () => (data, query) => {
      if (!query) return data;
      const lowerQuery = query.toLowerCase();
      return data.filter((item) =>
        [
          String(item._id),
          item.companyName,
          String(item.phone),
          item.type,
          item.email,
        ].some((field) => field.toLowerCase().includes(lowerQuery))
      );
    },
    []
  );

  // Debounced filter
  useEffect(() => {
    const debouncedFilter = debounce((query) => {
      setFilteredData(filterGlobally(vendors, query));
    }, 200);

    debouncedFilter(searchQuery);

    return () => clearTimeout(debouncedFilter.timeout);
  }, [searchQuery, vendors, filterGlobally]);

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
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
  const handleDelete = (id) => {
    alert("Are you sure you want to delete?");
    console.log(`Delete vendor with id: ${id}`);
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
      GST: "",
    },
    validationSchema,
    onSubmit: (values) => {
      console.log("Create Vendor:", values);
      setShowForm(false);
    },
  });

  const handleAddPhone = () => {
    setShowContactInput((prev) => !prev);
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
            <div className="invalid-feedback">{formik.errors.phone}</div>
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
          {showcontactInput && (
            <>
              <div className="w-100">
                <IoIosCloseCircleOutline onClick={handleAddPhone} size={24} />
                <label className="form-label fw-medium" htmlFor="companyName">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full form-control"
                  name="name"
                  placeholder="Enter name"
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
                  inputStyle={{ width: "100%" }}
                  placeholder="1 (702) 123-4567"
                />
              </div>
            </>
          )}
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
          <label className="form-label fw-medium" htmlFor="GST">
            GST Number
          </label>
          <input
            type="text"
            name="GST"
            className={`form-control ${
              formik.touched.GST && formik.errors.GST ? "is-invalid" : ""
            }`}
            value={formik.values.GST}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter GST number"
          />
          {formik.touched.GST && formik.errors.GST && (
            <div className="invalid-feedback">{formik.errors.GST}</div>
          )}
        </div>
        <div>
          <button className="btn bg-primary text-white" type="submit">
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
              className="text-secondary text-black"
              href="#"
              onClick={() => setShowForm((prev) => !prev)}
            >
              Create Vendor
            </a>
          </div>
          {showForm && renderForm(createFormik)}

          <div className="card shadow-sm mt-3 border">
            <h6 className="fw-bold px-3 pt-3">Vendors</h6>
            <div className="card-body px-0 py-3">
              <div className="mb-4 col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch
                      className="text-muted"
                      style={{ color: "#94a3b8" }}
                    />
                  </span>
                  <input
                    type="search"
                    className="form-control border-start-0"
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
        editVendor={editVendor}
      />
    </div>
  );
};

export default AddVendors;
