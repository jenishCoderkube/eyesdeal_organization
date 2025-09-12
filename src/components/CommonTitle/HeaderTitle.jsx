import React from "react";

const HeaderTitle = ({ title = "DashBoard" }) => {
  return <h1 className="header_title mt-2">{title}</h1>;
};

export default HeaderTitle;
