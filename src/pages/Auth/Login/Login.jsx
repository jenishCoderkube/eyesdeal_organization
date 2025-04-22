import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import { toast } from "react-toastify";
import {
  loginInitialValues,
  loginValidationSchema,
} from "../../../Validation/formValidation";
import { authService } from "../../../services/authService";
import CommonButton from "../../../components/CommonButton/CommonButton";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

  const formik = useFormik({
    initialValues: loginInitialValues,
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      const { phone, password } = values;
      setLoading(true);
      try {
        const response = await authService.login(phone, password);
        if (response.success) {
          toast.success(response.message);
          navigate("/");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Authentication failed");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleNext = async () => {
    // First validate the phone number format
    const phone = formik.values.phone;
    if (!phone || phone.length < 10 || phone.length > 15) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.checkUser(phone);
      if (response.success) {
        setShowPasswordField(true);
      } else {
        toast.error(response.message || "User not found");
      }
    } catch (error) {
      console.error("Check user error:", error);
      toast.error("Error checking user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main
        className="bg-light"
        style={{ height: "100vh", overflow: "hidden" }}
      >
        <div className="container-fluid h-100">
          <div className="row h-100">
            {/* Left Side - Form */}
            <div className="col-12 col-md-6 d-flex flex-column align-items-center p-4">
              <div className="container-fluid">
                <div className="d-flex align-items-center">
                  <img
                    src="/eyesdealLogo.jpg"
                    alt="Eyesdeal Logo"
                    className="img-fluid"
                    style={{ maxWidth: "90px", maxHeight: "60px" }}
                  />
                  <h2 className="ms-2 fw-bold fs-3 font-serif">Eyesdeal</h2>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={formik.handleSubmit}
                className="w-100 my-auto"
                style={{ maxWidth: "400px" }}
              >
                <div>
                  <h3 className="fw-bolder">Eyesdeal</h3>
                </div>
                {/* Phone Input */}
                <div className="mb-3 mt-4">
                  <label htmlFor="phone" className="form-label fw-medium">
                    Phone <span className="text-danger">*</span>
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={formik.values.phone}
                    onChange={(phone) => formik.setFieldValue("phone", phone)}
                    onBlur={() => formik.setFieldTouched("phone", true)}
                    inputClass={`form-control ${
                      formik.touched.phone && formik.errors.phone
                        ? "is-invalid"
                        : ""
                    }`}
                    containerClass="w-100"
                    inputStyle={{ width: "100%" }}
                    placeholder="Enter phone number"
                    disabled={showPasswordField}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <div className="invalid-feedback">
                      {formik.errors.phone}
                    </div>
                  )}
                </div>

                {/* Password Input - Conditionally Rendered */}
                {showPasswordField && (
                  <>
                    <div className="mb-3">
                      <label
                        htmlFor="password"
                        className="form-label fw-medium"
                      >
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type={showPass ? "text" : "password"}
                        className={`form-control ${
                          formik.touched.password && formik.errors.password
                            ? "is-invalid"
                            : ""
                        }`}
                        id="password"
                        name="password"
                        value={formik.values.password}
                        onChange={(e) =>
                          formik.setFieldValue(
                            "password",
                            e.target.value?.trimStart()
                          )
                        }
                        onBlur={formik.handleBlur}
                        placeholder="Enter password"
                      />
                      {formik.touched.password && formik.errors.password && (
                        <div className="invalid-feedback">
                          {formik.errors.password}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Button - Next or Sign In */}
                <div className="d-flex justify-content-end">
                  {!showPasswordField ? (
                    <CommonButton
                      loading={loading}
                      buttonText="Next"
                      onClick={handleNext}
                      className="btn btn-primary w-auto bg-indigo-500 hover-bg-indigo-600 text-white"
                    />
                  ) : (
                    <CommonButton
                      loading={loading}
                      buttonText="Sign In"
                      type="submit"
                      className="btn btn-primary w-auto bg-indigo-500 hover-bg-indigo-600 text-white"
                    />
                  )}
                </div>
              </form>
            </div>

            {/* Right Side - Image (Hidden on small screens) */}
            <div className="col-md-6 d-none d-md-block p-0 position-relative">
              <div>
                <img
                  src="/eyesdeal_baloon.png"
                  alt="eyesdeal_baloon"
                  className="img-fluid position-absolute"
                  style={{
                    objectFit: "cover",
                    zIndex: "100",
                    top: "25%",
                    left: "-75px",
                    width: "218px",
                    height: "224px",
                  }}
                />
              </div>
              <img
                src="/eyesdeal_banner.jpeg"
                alt="Eyesdeal Banner"
                className="img-fluid"
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  width: "50%",
                  height: "100vh",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;
