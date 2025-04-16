import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useDispatch } from "react-redux";
import { addPrescription } from "../../store/Power/specsPowerSlice";

const SpecsPowerModal = ({ show, onHide, editData }) => {
  const [formData, setFormData] = useState({
    doctorName: "",
    prescribedBy: null,
    type: "specs",
    right: {
      distance: { sph: null, cyl: null, axis: null, vs: null, add: null },
      near: { sph: null, cyl: null, axis: null, vs: null },
      psm: "",
      pd: "",
      fh: "",
    },
    left: {
      distance: { sph: null, cyl: null, axis: null, vs: null, add: null },
      near: { sph: null, cyl: null, axis: null, vs: null },
      psm: "",
      pd: "",
      fh: "",
    },
    ipd: "",
    asize: "",
    bsize: "",
    dbl: "",
    fth: "",
    pdesign: "",
    ftype: "",
    de: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setFormData(editData); // Set all fields with editData
    } else {
      setFormData({
        doctorName: "",
        prescribedBy: null,
        type: "specs",
        right: {
          distance: { sph: null, cyl: null, axis: null, vs: null, add: null },
          near: { sph: null, cyl: null, axis: null, vs: null },
          psm: "",
          pd: "",
          fh: "",
        },
        left: {
          distance: { sph: null, cyl: null, axis: null, vs: null, add: null },
          near: { sph: null, cyl: null, axis: null, vs: null },
          psm: "",
          pd: "",
          fh: "",
        },
        ipd: "",
        asize: "",
        bsize: "",
        dbl: "",
        fth: "",
        pdesign: "",
        ftype: "",
        de: "",
      }); // Reset to default when adding new
    }
  }, [editData]);

  const dispatch = useDispatch();

  const prescribedByOptions = [
    { value: "Doctor1", label: "Doctor 1" },
    { value: "Doctor2", label: "Doctor 2" },
  ];

  const powerOptions = [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
  ];

  const visionOptions = [
    { value: "20/20", label: "20/20" },
    { value: "20/40", label: "20/40" },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.doctorName.trim())
      newErrors.doctorName = "Doctor Name is required";
    if (!formData.prescribedBy)
      newErrors.prescribedBy = "Prescribed By is required";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    dispatch(addPrescription(formData));
    setErrors({});
    onHide(); // Close modal after submission
  };

  const handleInputChange = (field, value, nestedPath = null) => {
    if (nestedPath) {
      const [side, subField] = nestedPath.split(".");
      if (subField === "distance" || subField === "near") {
        setFormData((prev) => ({
          ...prev,
          [side]: {
            ...prev[side],
            [subField]: {
              ...prev[side][subField],
              [field]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [side]: {
            ...prev[side],
            [field]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <>
      {show && (
        <>
          {/* Modal Backdrop */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
          ></div>

          {/* Modal Content */}
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-custom-size">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Power</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={onHide}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6 col-lg-3">
                        <label className="form-label custom-label_user">
                          prescriptionId <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control custom-disabled"
                          value="new"
                          readOnly
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <label className="form-label custom-label_user">
                          Doctor Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.doctorName}
                          onChange={(e) =>
                            handleInputChange("doctorName", e.target.value)
                          }
                        />
                        {errors.doctorName && (
                          <div className="text-danger mt-1">
                            {errors.doctorName}
                          </div>
                        )}
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <label className="form-label custom-label_user">
                          Type <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control custom-disabled"
                          value="specs"
                          readOnly
                        />
                      </div>
                      <div className="col-12 col-md-6 col-lg-3">
                        <label className="form-label custom-label_user">
                          Prescribed By <span className="text-danger">*</span>
                        </label>
                        <Select
                          options={prescribedByOptions}
                          value={formData.prescribedBy}
                          onChange={(option) =>
                            handleInputChange("prescribedBy", option)
                          }
                          placeholder="Select..."
                        />
                        {errors.prescribedBy && (
                          <div className="text-danger mt-1">
                            {errors.prescribedBy}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="p-0 mb-1">Specs Power</p>
                    <div>
                      <table className="table table-bordered contact_power_table">
                        <thead>
                          <tr>
                            <th></th>
                            <th>RESPH</th>
                            <th>RECYL</th>
                            <th>RAXIS</th>
                            <th>RVISION</th>
                            <th>ADD</th>
                            <th>||</th>
                            <th>LESPH</th>
                            <th>LECYL</th>
                            <th>LAXIS</th>
                            <th>LEVISION</th>
                            <th>Add</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-center">D</td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.right.distance.sph}
                                onChange={(option) =>
                                  handleInputChange(
                                    "sph",
                                    option,
                                    "right.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.right.distance.cyl}
                                onChange={(option) =>
                                  handleInputChange(
                                    "cyl",
                                    option,
                                    "right.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.right.distance.axis}
                                onChange={(option) =>
                                  handleInputChange(
                                    "axis",
                                    option,
                                    "right.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={visionOptions}
                                value={formData.right.distance.vs}
                                onChange={(option) =>
                                  handleInputChange(
                                    "vs",
                                    option,
                                    "right.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.right.distance.add}
                                onChange={(option) =>
                                  handleInputChange(
                                    "add",
                                    option,
                                    "right.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td></td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.left.distance.sph}
                                onChange={(option) =>
                                  handleInputChange(
                                    "sph",
                                    option,
                                    "left.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.left.distance.cyl}
                                onChange={(option) =>
                                  handleInputChange(
                                    "cyl",
                                    option,
                                    "left.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.left.distance.axis}
                                onChange={(option) =>
                                  handleInputChange(
                                    "axis",
                                    option,
                                    "left.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={visionOptions}
                                value={formData.left.distance.vs}
                                onChange={(option) =>
                                  handleInputChange(
                                    "vs",
                                    option,
                                    "left.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.left.distance.add}
                                onChange={(option) =>
                                  handleInputChange(
                                    "add",
                                    option,
                                    "left.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                          </tr>
                          <tr>
                            <td className="text-center">N</td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.right.near.sph}
                                onChange={(option) =>
                                  handleInputChange("sph", option, "right.near")
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.right.near.cyl}
                                onChange={(option) =>
                                  handleInputChange("cyl", option, "right.near")
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.right.near.axis}
                                onChange={(option) =>
                                  handleInputChange(
                                    "axis",
                                    option,
                                    "right.near"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={visionOptions}
                                value={formData.right.near.vs}
                                onChange={(option) =>
                                  handleInputChange("vs", option, "right.near")
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td></td>
                            <td></td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.left.near.sph}
                                onChange={(option) =>
                                  handleInputChange("sph", option, "left.near")
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.left.near.cyl}
                                onChange={(option) =>
                                  handleInputChange("cyl", option, "left.near")
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={formData.left.near.axis}
                                onChange={(option) =>
                                  handleInputChange("axis", option, "left.near")
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={visionOptions}
                                value={formData.left.near.vs}
                                onChange={(option) =>
                                  handleInputChange("vs", option, "left.near")
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="row g-3 mt-2 border p-2">
                      {[
                        { label: "Psm(R)", field: "right.psm" },
                        { label: "Pd(R)", field: "right.pd" },
                        { label: "Fh(R)", field: "right.fh" },
                        { label: "IPD", field: "ipd" },
                        { label: "Psm(L)", field: "left.psm" },
                        { label: "Pd(L)", field: "left.pd" },
                        { label: "Fh(L)", field: "left.fh" },
                      ].map(({ label, field }) => (
                        <div className="col-6 col-md-3 col-lg-auto" key={label}>
                          <label className="form-label">{label}</label>
                          <input
                            type="text"
                            className="form-control"
                            value={
                              field.includes(".")
                                ? formData[field.split(".")[0]][
                                    field.split(".")[1]
                                  ]
                                : formData[field] || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                field.includes(".")
                                  ? field.split(".")[1]
                                  : field,
                                e.target.value,
                                field.includes(".") ? field.split(".")[0] : null
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div className="row g-3 mt-2 border p-2">
                      {[
                        "asize",
                        "bsize",
                        "dbl",
                        "fth",
                        "pdesign",
                        "ftype",
                        "de",
                      ].map((field) => (
                        <div className="col-6 col-md-3 col-lg-auto" key={field}>
                          <label className="form-label">
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData[field] || ""}
                            onChange={(e) =>
                              handleInputChange(field, e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                    {editData ? (
                      <button type="submit" className="btn btn-primary mt-4">
                        OK
                      </button>
                    ) : (
                      <button type="submit" className="btn btn-primary mt-4">
                        Add
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SpecsPowerModal;
