import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useDispatch } from "react-redux";
import {
  addPrescription,
  editPrescription,
} from "../../store/Power/specsPowerSlice";

const ContactsPowerModal = ({ show, onHide, editData }) => {
  const [formData, setFormData] = useState({
    doctorName: "",
    prescribedBy: "",
    type: "contacts",
    right: {
      distance: { sph: "", cyl: "", axis: "", add: "" },
      near: { sph: "", cyl: "", axis: "" },
      k: "",
      dia: "",
      bc: "",
    },
    left: {
      distance: { sph: "", cyl: "", axis: "", add: "" },
      near: { sph: "", cyl: "", axis: "" },
      k: "",
      dia: "",
      bc: "",
    },
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    if (editData) {
      setFormData({ ...editData, type: "contacts" });
    } else {
      setFormData({
        doctorName: "",
        prescribedBy: "",
        type: "contacts",
        right: {
          distance: { sph: "", cyl: "", axis: "", add: "" },
          near: { sph: "", cyl: "", axis: "" },
          k: "",
          dia: "",
          bc: "",
        },
        left: {
          distance: { sph: "", cyl: "", axis: "", add: "" },
          near: { sph: "", cyl: "", axis: "" },
          k: "",
          dia: "",
          bc: "",
        },
      });
    }
  }, [editData]);

  const prescribedByOptions = [
    { value: "doctor", label: "Doctor" },
    { value: "employee", label: "Employee" },
    { value: "old specs", label: "Old Specs" },
  ];

  const powerOptions = Array.from({ length: 73 }, (_, i) => {
    const value = (i - 36) * 0.25;
    const formattedValue = value.toFixed(2);
    return {
      value: formattedValue,
      label: value >= 0 ? `+${formattedValue}` : formattedValue,
    };
  });

  const cylOptions = Array.from({ length: 33 }, (_, i) => {
    const value = (i - 16) * 0.25;
    const formattedValue = value.toFixed(2);
    return {
      value: formattedValue,
      label: value >= 0 ? `+${formattedValue}` : formattedValue,
    };
  });

  const axisOptions = Array.from({ length: 37 }, (_, i) => ({
    value: (i * 5).toString(),
    label: (i * 5).toString(),
  }));

  const addOptions = [
    { value: "LOW", label: "LOW" },
    { value: "HIGH", label: "HIGH" },
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

    const formattedData = {
      ...formData,
      id: editData ? editData.id : Date.now().toString(),
      createdAt: editData ? editData.createdAt : new Date().toISOString(),
    };

    if (editData) {
      dispatch(editPrescription(formattedData));
    } else {
      dispatch(addPrescription(formattedData));
    }
    setErrors({});
    onHide();
  };

  const formatToLabel = (num) => {
    const formatted = num.toFixed(2);
    return num >= 0 ? `+${formatted}` : formatted;
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

    if (nestedPath) {
      const side = nestedPath.split(".")[0];
      const section = nestedPath.split(".")[1];

      if (section === "distance") {
        if (field === "sph" || field === "add") {
          const distSph =
            field === "sph" ? value : formData[side].distance.sph || "";
          const addVal =
            field === "add" ? value : formData[side].distance.add || "";
          if (distSph !== "" && addVal !== "") {
            const distNum = parseFloat(distSph);
            const addNum = addVal === "HIGH" ? 2.5 : addVal === "LOW" ? 1.0 : 0;
            if (!isNaN(distNum)) {
              const nearNum = distNum + addNum;
              const nearLabel = formatToLabel(nearNum);
              setFormData((prev) => ({
                ...prev,
                [side]: {
                  ...prev[side],
                  near: { ...prev[side].near, sph: nearLabel },
                },
              }));
            }
          } else if (field === "sph" && distSph !== "") {
            setFormData((prev) => ({
              ...prev,
              [side]: {
                ...prev[side],
                near: { ...prev[side].near, sph: distSph },
              },
            }));
          }
        }
        if (field === "cyl") {
          setFormData((prev) => ({
            ...prev,
            [side]: {
              ...prev[side],
              near: { ...prev[side].near, cyl: value },
            },
          }));
        }
        if (field === "axis") {
          setFormData((prev) => ({
            ...prev,
            [side]: {
              ...prev[side],
              near: { ...prev[side].near, axis: value },
            },
          }));
        }
      }
      if (section === "near" && field === "sph") {
        const addVal = formData[side].distance.add || "";
        if (addVal !== "") {
          const nearNum = parseFloat(value);
          const addNum = addVal === "HIGH" ? 2.5 : addVal === "LOW" ? 1.0 : 0;
          if (!isNaN(nearNum)) {
            const distNum = nearNum - addNum;
            const distLabel = formatToLabel(distNum);
            setFormData((prev) => ({
              ...prev,
              [side]: {
                ...prev[side],
                distance: { ...prev[side].distance, sph: distLabel },
              },
            }));
          }
        }
      }
    }
  };

  return (
    <>
      {show && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
          ></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-custom-size">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editData ? "Edit Contact Power" : "Add Contact Power"}
                  </h5>
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
                          value={prescribedByOptions.find(
                            (opt) => opt.value === formData.prescribedBy
                          )}
                          onChange={(option) =>
                            handleInputChange("prescribedBy", option.value)
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
                    <div className="px-2">
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
                                value={powerOptions.find(
                                  (opt) =>
                                    opt.label === formData.right.distance.sph
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "sph",
                                    option.label,
                                    "right.distance"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 38;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={cylOptions}
                                value={cylOptions.find(
                                  (opt) =>
                                    opt.label === formData.right.distance.cyl
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "cyl",
                                    option.label,
                                    "right.distance"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 15;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={axisOptions}
                                value={axisOptions.find(
                                  (opt) =>
                                    opt.value === formData.right.distance.axis
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "axis",
                                    option.value,
                                    "right.distance"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 0;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={addOptions}
                                value={addOptions.find(
                                  (opt) =>
                                    opt.label === formData.right.distance.add
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "add",
                                    option.label,
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
                                value={powerOptions.find(
                                  (opt) =>
                                    opt.label === formData.left.distance.sph
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "sph",
                                    option.label,
                                    "left.distance"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 38;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={cylOptions}
                                value={cylOptions.find(
                                  (opt) =>
                                    opt.label === formData.left.distance.cyl
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "cyl",
                                    option.label,
                                    "left.distance"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 15;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={axisOptions}
                                value={axisOptions.find(
                                  (opt) =>
                                    opt.value === formData.left.distance.axis
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "axis",
                                    option.value,
                                    "left.distance"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 0;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={addOptions}
                                value={addOptions.find(
                                  (opt) =>
                                    opt.label === formData.left.distance.add
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "add",
                                    option.label,
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
                                value={powerOptions.find(
                                  (opt) => opt.label === formData.right.near.sph
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "sph",
                                    option.label,
                                    "right.near"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 39;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={cylOptions}
                                value={cylOptions.find(
                                  (opt) => opt.label === formData.right.near.cyl
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "cyl",
                                    option.label,
                                    "right.near"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 16;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={axisOptions}
                                value={axisOptions.find(
                                  (opt) =>
                                    opt.value === formData.right.near.axis
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "axis",
                                    option.value,
                                    "right.near"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 0;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                                placeholder="Select..."
                              />
                            </td>
                            <td></td>
                            <td></td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={powerOptions.find(
                                  (opt) => opt.label === formData.left.near.sph
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "sph",
                                    option.label,
                                    "left.near"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 39;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={cylOptions}
                                value={cylOptions.find(
                                  (opt) => opt.label === formData.left.near.cyl
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "cyl",
                                    option.label,
                                    "left.near"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 16;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={axisOptions}
                                value={axisOptions.find(
                                  (opt) => opt.value === formData.left.near.axis
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "axis",
                                    option.value,
                                    "left.near"
                                  )
                                }
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 0;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
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
                    <button
                      type="submit"
                      className="btn custom-button-bgcolor mt-4"
                    >
                      {editData ? "Update" : "Add"}
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
