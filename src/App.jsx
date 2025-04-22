import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
// css
import "./assets/css/style.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import "react-toastify/dist/ReactToastify.css";

import Login from "./pages/Auth/Login/Login";
import routes from "./routes/routes";
import Error from "./pages/404/Error/Error";
import Header from "./components/Header/Header";
const App = () => {
  const { pathname } = useLocation();

  return (
    <>
      {pathname !== "/login" &&
        pathname !== "/register" &&
        pathname !== "/404" && <Header />}

      <Routes>
        <Route path="/login" element={<Login />} />

        {routes.map(({ path, element, title }) => (
          <Route key={title} path={path} element={element} />
        ))}
        <Route path="/404" element={<Error />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* <Route path="/" element={<Navigate to="/media-library" replace />} /> */}

      </Routes>
    </>
  );
};

export default App;
