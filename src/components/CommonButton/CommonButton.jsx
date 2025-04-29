// src/components/CommonButton.jsx
import React from "react";

const CommonButton = ({
  loading,
  isSubmitting,
  isValid,
  className,
  buttonText = "Submit",
  ...rest
}) => {
  return (
    <div className="col-12">
      <button
        className={`btn custom-button-bgcolor w-100 ${className}`}
        type="submit"
        {...rest}
        // disabled={isSubmitting || !isValid}
      >
        {!loading && <span className="indicator-label">{buttonText}</span>}
        {loading && (
          <span className="indicator-progress" style={{ display: "block" }}>
            Please wait...
            <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default CommonButton;
