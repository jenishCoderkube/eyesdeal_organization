import React, {useEffect, useState} from 'react';

import {Link, useNavigate} from 'react-router-dom';
import {useFormik} from 'formik';

import {toast} from 'react-toastify';
import {
  loginInitialValues,
  loginValidationSchema,
} from '../../../Validation/formValidation';
import constants from '../../../utils/constants';
import CommonButton from '../../../components/CommonButton/CommonButton';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const formik = useFormik({
    initialValues: loginInitialValues,
    validationSchema: loginValidationSchema,

    onSubmit: (values) => {
      const {phone} = values;

      setLoading(true);
      try {
        const body = {
          phone: phone,
        };
      } catch (error) {
        console.log('catch error message: ', error);
      }
      // Perform authentication logic here...

      // For demonstration purposes, let's assume authentication is successful
      // Redirect the user to the home page
      // localStorage.setItem(constants.USER, email); // Storing user in localStorage
      // navigate('/');
    },
  });

  useEffect(() => {
    const USER = localStorage.getItem(constants.USER);
    if (USER) {
      navigate('/');
    }
  }, []);

  return (
    <main>
      <div className="container">
        <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
          <div className="container-fluid">
            <div className="row vh-100">
              {/* Left side - Form */}
              <div className="col-md-6 d-flex flex-column justify-content-center align-items-center p-5">
                {/* Logo */}
                <div className="mb-4 text-center">
                  <img
                    src="/eyesdealLogo.jpg"
                    alt="Eyesdeal Logo"
                    style={{height: '100px'}}
                  />
                  <h2 className="mt-3 fw-bold">Eyesdeal</h2>
                </div>

                {/* Phone Form */}
                <form
                  style={{width: '100%', maxWidth: '400px'}}
                  onSubmit={formik.handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      Phone<span className="text-danger">*</span>
                    </label>
                    <div >
                      {/* <span className="input-group-text">+91</span> */}
                      <input
                        type="text"
                        className={`form-control ${
                          formik.touched.phone && formik.errors.phone
                            ? 'is-invalid'
                            : ''
                        }`}
                        id="phone"
                        name="phone"
                        value={formik.values.phone}
                        onChange={(e) => {
                          formik.setFieldValue(
                            'phone',
                            e.target.value?.trimStart(),
                          );
                        }}
                        onBlur={formik.handleBlur}
                        placeholder="Enter phone number"
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <div className="invalid-feedback">
                          {formik.errors.phone}
                        </div>
                      )}
                    </div>
                  </div>


                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      Password<span className="text-danger">*</span>
                    </label>
                    <div >
                      {/* <span className="input-group-text">+91</span> */}
                      <input
                        type="text"
                        className={`form-control ${
                          formik.touched.password && formik.errors.password
                            ? 'is-invalid'
                            : ''
                        }`}
                        id="password"
                        name="password"
                        value={formik.values.password}
                        onChange={(e) => {
                          formik.setFieldValue(
                            'password',
                            e.target.value?.trimStart(),
                          );
                        }}
                        onBlur={formik.handleBlur}
                        placeholder="Enter password"
                      />
                      {formik.touched.password && formik.errors.password && (
                        <div className="invalid-feedback">
                          {formik.errors.password}
                        </div>
                      )}
                    </div>
                  </div>
                  <CommonButton
                    loading={loading}
                    // isSubmitting={formik.isSubmitting}
                    // isValid={formik.isValid}
                    buttonText="Login"
                  />
                </form>
              </div>

              {/* Right side - Image */}
              {/* <div
                  className="col-md-6 d-none d-md-block p-0"
                  style={{
                    backgroundImage: '/eyesdeal_banner.jpeg',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}> */}
              {/* Optional: Add a semi-transparent overlay */}
              <div className="col-md-6 d-none d-md-block p-0">
                <img
                  src="/eyesdeal_banner.jpeg"
                  alt="Eyesdeal Logo"
                  //  className='h-auto'
                  style={{height: '500px'}}
                />
              </div>
              {/* </div> */}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
