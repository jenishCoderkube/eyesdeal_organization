import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useDispatch } from "react-redux";
import { addPrescription } from "../../store/Power/specsPowerSlice";

const SpecsPowerModal = ({ show, onHide, editData }) => {
  const [formData, setFormData] = useState({
    doctorName: "",
    prescribedBy: "",
    type: "specs",
    right: {
      distance: { sph: "", cyl: "", axis: "", vs: "", add: "" },
      near: { sph: "", cyl: "", axis: "", vs: "" },
      psm: "",
      pd: "",
      fh: "",
    },
    left: {
      distance: { sph: "", cyl: "", axis: "", vs: "", add: "" },
      near: { sph: "", cyl: "", axis: "", vs: "" },
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
      setFormData(editData);
    } else {
      setFormData({
        doctorName: "",
        prescribedBy: "",
        type: "specs",
        right: {
          distance: { sph: "", cyl: "", axis: "", vs: "", add: "" },
          near: { sph: "", cyl: "", axis: "", vs: "" },
          psm: "",
          pd: "",
          fh: "",
        },
        left: {
          distance: { sph: "", cyl: "", axis: "", vs: "", add: "" },
          near: { sph: "", cyl: "", axis: "", vs: "" },
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
    }
  }, [editData]);

  const dispatch = useDispatch();

  const prescribedByOptions = [
    { value: "doctor", label: "Doctor" },
    { value: "employee", label: "Employee" },
    { value: "old specs", label: "Old Specs" },
  ];

  const powerOptions = Array.from({ length: 193 }, (_, i) => {
    const value = (i - 96) * 0.25; // Generates -24.00 to +24.00 with 0.25 intervals
    const formattedValue = value.toFixed(2);
    return {
      value: formattedValue,
      label: value >= 0 ? `+${formattedValue}` : formattedValue,
    };
  });
  const cylOptions = Array.from({ length: 65 }, (_, i) => {
    const value = (i - 32) * 0.25; // -8.00 to +8.00 with 0.25 interval
    const formattedValue = value.toFixed(2);
    return {
      value: formattedValue,
      label: value >= 0 ? `+${formattedValue}` : formattedValue,
    };
  });

  const axisOptions = Array.from({ length: 37 }, (_, i) => ({
    value: (i * 5).toString(), // 0 to 180 with 5 interval
    label: (i * 5).toString(),
  }));

  const distanceVisionOptions = [
    { value: "6/5", label: "6/5" },
    { value: "6/6", label: "6/6" },
    { value: "6/9", label: "6/9" },
    { value: "6/12", label: "6/12" },
    { value: "6/18", label: "6/18" },
    { value: "6/24", label: "6/24" },
    { value: "6/36", label: "6/36" },
  ];

  const nearVisionOptions = [
    { value: "N/5", label: "N/5" },
    { value: "N/6", label: "N/6" },
    { value: "N/8", label: "N/8" },
    { value: "N/10", label: "N/10" },
    { value: "N/12", label: "N/12" },
    { value: "N/18", label: "N/18" },
    { value: "N/24", label: "N/24" },
    { value: "N/36", label: "N/36" },
  ];

  const addOptions = Array.from({ length: 13 }, (_, i) => {
    const value = i * 0.25; // 0.00 to +3.00 with 0.25 interval
    const formattedValue = value.toFixed(2);
    return {
      value: formattedValue,
      label: value > 0 ? `+${formattedValue}` : formattedValue,
    };
  });

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

    // Keep empty values as empty strings
    const formattedData = {
      ...formData,
      right: {
        ...formData.right,
        distance: {
          sph: formData.right.distance.sph || "",
          cyl: formData.right.distance.cyl || "",
          axis: formData.right.distance.axis || "",
          vs: formData.right.distance.vs || "",
          add: formData.right.distance.add || "",
        },
        near: {
          sph: formData.right.near.sph || "",
          cyl: formData.right.near.cyl || "",
          axis: formData.right.near.axis || "",
          vs: formData.right.near.vs || "",
        },
      },
      left: {
        ...formData.left,
        distance: {
          sph: formData.left.distance.sph || "",
          cyl: formData.left.distance.cyl || "",
          axis: formData.left.distance.axis || "",
          vs: formData.left.distance.vs || "",
          add: formData.left.distance.add || "",
        },
        near: {
          sph: formData.left.near.sph || "",
          cyl: formData.left.near.cyl || "",
          axis: formData.left.near.axis || "",
          vs: formData.left.near.vs || "",
        },
      },
    };

    dispatch(addPrescription(formattedData));
    setErrors({});
    onHide();
  };
  const formatToLabel = (num) => {
    const formatted = num.toFixed(2);
    return num >= 0 ? `+${formatted}` : formatted;
  };
  const handleInputChange = (field, value, nestedPath = null) => {
    // Update the primary field
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

    // Auto-fill/copy logic
    if (nestedPath) {
      const side = nestedPath.split(".")[0]; // "right" or "left"
      const section = nestedPath.split(".")[1]; // "distance" or "near"

      // Logic for distance changes (SPH, ADD, CYL, AXIS, VS)
      if (section === "distance") {
        if (field === "sph" || field === "add") {
          // Update near SPH based on distance SPH and ADD
          const distSph =
            field === "sph" ? value : formData[side].distance.sph || "";
          const addVal =
            field === "add" ? value : formData[side].distance.add || "";

          if (distSph !== "" && addVal !== "") {
            const distNum = parseFloat(distSph);
            const addNum = parseFloat(addVal);
            if (!isNaN(distNum) && !isNaN(addNum)) {
              const nearNum = distNum + addNum;
              const nearLabel = formatToLabel(nearNum);
              setFormData((prev) => ({
                ...prev,
                [side]: {
                  ...prev[side],
                  near: {
                    ...prev[side].near,
                    sph: nearLabel,
                  },
                },
              }));
            }
          } else if (field === "sph" && distSph !== "") {
            // If ADD is empty, copy distance SPH to near SPH
            setFormData((prev) => ({
              ...prev,
              [side]: {
                ...prev[side],
                near: {
                  ...prev[side].near,
                  sph: distSph,
                },
              },
            }));
          }
        }

        // Copy CYL from distance to near
        if (field === "cyl") {
          setFormData((prev) => ({
            ...prev,
            [side]: {
              ...prev[side],
              near: {
                ...prev[side].near,
                cyl: value,
              },
            },
          }));
        }

        // Copy AXIS from distance to near
        if (field === "axis") {
          setFormData((prev) => ({
            ...prev,
            [side]: {
              ...prev[side],
              near: {
                ...prev[side].near,
                axis: value,
              },
            },
          }));
        }

        // Transform VS from "6/X" to "N/X" for near
        if (field === "vs" && value.startsWith("6/")) {
          const numberPart = value.split("/")[1];
          const nearVs = `N/${numberPart}`;
          if (nearVisionOptions.some((opt) => opt.value === nearVs)) {
            setFormData((prev) => ({
              ...prev,
              [side]: {
                ...prev[side],
                near: {
                  ...prev[side].near,
                  vs: nearVs,
                },
              },
            }));
          }
        }
      }

      // Logic for near SPH changes: Update distance SPH
      if (section === "near" && field === "sph") {
        const addVal = formData[side].distance.add || "";
        if (addVal !== "") {
          const nearNum = parseFloat(value);
          const addNum = parseFloat(addVal);
          if (!isNaN(nearNum) && !isNaN(addNum)) {
            const distNum = nearNum - addNum;
            const distLabel = formatToLabel(distNum);
            setFormData((prev) => ({
              ...prev,
              [side]: {
                ...prev[side],
                distance: {
                  ...prev[side].distance,
                  sph: distLabel,
                },
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
                          value={editData?._id}
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
                                value={powerOptions.find(
                                  (opt) =>
                                    opt.label === formData?.right?.distance?.sph
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "sph",
                                    option.label,
                                    "right.distance"
                                  )
                                }
                                placeholder="Select..."
                                onMenuOpen={() => {
                                  setTimeout(() => {
                                    const menuList = document.querySelector(
                                      ".react-select__menu-list"
                                    );
                                    if (menuList) {
                                      const zeroIndex = 106;
                                      const optionHeight = 35;
                                      menuList.scrollTop =
                                        zeroIndex * optionHeight;
                                    }
                                  }, 0);
                                }}
                                classNamePrefix="react-select"
                              />
                            </td>
                            <td>
                              <Select
                                options={cylOptions}
                                value={cylOptions.find(
                                  (opt) =>
                                    opt.label === formData?.right?.distance?.cyl
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
                                      const zeroIndex = 33;
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
                                    opt.value ===
                                    formData?.right?.distance?.axis
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "axis",
                                    option.value,
                                    "right.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={distanceVisionOptions}
                                value={distanceVisionOptions.find(
                                  (opt) =>
                                    opt.value === formData?.right?.distance?.vs
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "vs",
                                    option.value,
                                    "right.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={addOptions}
                                value={addOptions.find(
                                  (opt) =>
                                    opt.label === formData?.right?.distance?.add
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "add",
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
                            <td>
                              <Select
                                options={powerOptions}
                                value={powerOptions.find(
                                  (opt) =>
                                    opt.label === formData?.left?.distance?.sph
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
                                      const zeroIndex = 106;
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
                                    opt.label === formData?.left?.distance?.cyl
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
                                      const zeroIndex = 33;
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
                                    opt.value === formData?.left?.distance?.axis
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
                                options={distanceVisionOptions}
                                value={distanceVisionOptions.find(
                                  (opt) =>
                                    opt.value === formData?.left?.distance?.vs
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "vs",
                                    option.value,
                                    "left.distance"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={addOptions}
                                value={addOptions.find(
                                  (opt) =>
                                    opt.label === formData?.left?.distance?.add
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "add",
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
                          </tr>
                          <tr>
                            <td className="text-center">N</td>
                            <td>
                              <Select
                                options={powerOptions}
                                value={powerOptions.find(
                                  (opt) =>
                                    opt.label === formData?.right?.near?.sph
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
                                      const zeroIndex = 106;
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
                                    opt.label === formData?.right?.near?.cyl
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
                                      const zeroIndex = 33;
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
                                    opt.value === formData?.right?.near?.axis
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "axis",
                                    option.value,
                                    "right.near"
                                  )
                                }
                                placeholder="Select..."
                              />
                            </td>
                            <td>
                              <Select
                                options={nearVisionOptions}
                                value={nearVisionOptions.find(
                                  (opt) =>
                                    opt.value === formData?.right?.near?.vs
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "vs",
                                    option.value,
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
                                value={powerOptions.find(
                                  (opt) =>
                                    opt.label === formData?.left?.near?.sph
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
                                      const zeroIndex = 106;
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
                                    opt.label === formData?.left?.near?.cyl
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
                                      const zeroIndex = 33;
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
                                    opt.value === formData?.left?.near?.axis
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
                            <td>
                              <Select
                                options={nearVisionOptions}
                                value={nearVisionOptions.find(
                                  (opt) =>
                                    opt.value === formData?.left?.near?.vs
                                )}
                                onChange={(option) =>
                                  handleInputChange(
                                    "vs",
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
                        "aSize",
                        "bSize",
                        "dbl",
                        "fth",
                        "pDesign",
                        "ft",
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
                      <button
                        type="submit"
                        className="btn custom-button-bgcolor mt-4"
                      >
                        OK
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="btn custom-button-bgcolor mt-4"
                      >
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
