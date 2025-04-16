import React, { useEffect, useState } from "react";
import Select from "react-select";
import { addPrescription } from "../../store/Power/specsPowerSlice";
import { useDispatch } from "react-redux";

const ContactsPowerModal = ({ show, onHide, editData }) => {
  const [formData, setFormData] = useState({
    doctorName: "",
    prescribedBy: null,
    type: "contacts",
    right: {
      distance: { sph: null, cyl: null, axis: null, add: null },
      near: { sph: null, cyl: null, axis: null },
      k: "",
      dia: "",
      bc: "",
    },
    left: {
      distance: { sph: null, cyl: null, axis: null, add: null },
      near: { sph: null, cyl: null, axis: null },
      k: "",
      dia: "",
      bc: "",
    },
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    if (editData) {
      setFormData(editData); // Set all fields with editData
    } else {
      setFormData({
        doctorName: "",
        prescribedBy: null,
        type: "contacts",
        right: {
          distance: { sph: null, cyl: null, axis: null, add: null },
          near: { sph: null, cyl: null, axis: null },
          k: "",
          dia: "",
          bc: "",
        },
        left: {
          distance: { sph: null, cyl: null, axis: null, add: null },
          near: { sph: null, cyl: null, axis: null },
          k: "",
          dia: "",
          bc: "",
        },
      }); // Reset to default when adding new
    }
  }, [editData]);
  const prescribedByOptions = [
    { value: "Doctor1", label: "Doctor 1" },
    { value: "Doctor2", label: "Doctor 2" },
  ];

  const powerOptions = [
    { value: "0", label: "0" },
    { value: "1", label: "1" },
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
    dispatch(addPrescription(formData)); // Dispatch to Redux
    setErrors({});
    onHide(); // Close modal

    // Proceed with form submission
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
                  <h5 className="modal-title">Add Contact Power</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={onHide}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-4">
                        <label className="form-label">
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
                      <div className="col-12 col-md-4">
                        <label className="form-label">
                          Type <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control custom-disabled"
                          value="contacts"
                          readOnly
                        />
                      </div>
                      <div className="col-12 col-md-4">
                        <label className="form-label">
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
                    <p className="add_power">Contact Power</p>
                    <div className="table-responsive">
                      <table className="table table-bordered contact_power_table">
                        <thead>
                          <tr>
                            <th></th>
                            <th>RESPH</th>
                            <th>RECYL</th>
                            <th>RAXIS</th>
                            <th>ADD</th>
                            <th>||</th>
                            <th>LESPH</th>
                            <th>LECYL</th>
                            <th>LAXIS</th>
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
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="row g-3 mt-2 border p-2">
                      {[
                        { label: "K(R)", field: "right.k" },
                        { label: "dia(R)", field: "right.dia" },
                        { label: "Bc(R)", field: "right.bc" },
                        { label: "K(L)", field: "left.k" },
                        { label: "dia(L)", field: "left.dia" },
                        { label: "Bc(L)", field: "left.bc" },
                      ].map(({ label, field }) => (
                        <div className="col-12 col-md-4" key={label}>
                          <label className="form-label">{label}</label>
                          <input
                            type="text"
                            className="form-control"
                            value={
                              formData[field.split(".")[0]][
                                field.split(".")[1]
                              ] || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                field.split(".")[1],
                                e.target.value,
                                field.split(".")[0]
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <button type="submit" className="btn btn-primary mt-4">
                      {editData ? "Edit" : "Add"}
                    </button>
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

export default ContactsPowerModal;
