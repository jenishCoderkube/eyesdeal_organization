import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import constants, {getUser} from '../../utils/constants';

const Header = () => {
  const navigate = useLocation();
  const user = JSON.parse(getUser());

  console.log('user ----->', user);
  const logout = async () => {
  //   localStorage.removeItem(constants.USER);
  //   window.location.reload();
  //   navigate('/login');
  };
  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      <div className="d-flex align-items-center justify-content-between">
        {user?.type === '0' ? (
          <Link
            to={'/superadmindashboard'}
            className="logo d-flex align-items-center"
            style={{textDecoration: 'none'}}>
            {/* <img src="assets/img/logo.png" alt="" /> */}
            <span className="d-none d-lg-block">Education Admin</span>
          </Link>
        ) : (
          <Link
            to={'/'}
            className="logo d-flex align-items-center"
            style={{textDecoration: 'none'}}>
            {/* <img src="assets/img/logo.png" alt="" /> */}
            <span className="d-none d-lg-block">Education Admin</span>
          </Link>
        )}

        <i
          className="bi bi-list toggle-sidebar-btn"
          onClick={() => document.body.classList.toggle('toggle-sidebar')}></i>
      </div>
      {/* End Logo */}

      {/* End Search Bar */}
      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          {/* End Messages Nav */}
          <li className="nav-item dropdown pe-3">
            <a
              className="nav-link nav-profile d-flex align-items-center pe-0"
              href="#"
              data-bs-toggle="dropdown">
              {/* <img
                src="assets/img/profile-img.jpg"
                alt="Profile"
                className="rounded-circle"
              /> */}
              <span className="d-none d-md-block dropdown-toggle ps-2">
                {user?.adminName}
              </span>
            </a>
            {/* End Profile Iamge Icon */}
            <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
              <li className="dropdown-header">
                <h6>{user?.adminName}</h6>
                <span>{user?.email}</span>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                {user?.type === '0' ? (
                  <Link
                    className="dropdown-item d-flex align-items-center"
                    to="/superadmin-profile">
                    <i className="bi bi-person" />
                    <span>My Profile</span>
                  </Link>
                ) : (
                  <Link
                    className="dropdown-item d-flex align-items-center"
                    to="/adminprofile">
                    <i className="bi bi-person" />
                    <span>My Profile</span>
                  </Link>
                )}
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <Link
                  onClick={logout}
                  to={'/login'}
                  className="dropdown-item d-flex align-items-center">
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </Link>
              </li>
            </ul>
            {/* End Profile Dropdown Items */}
          </li>
          {/* End Profile Nav */}
        </ul>
      </nav>
      {/* End Icons Navigation */}
    </header>
  );
};

export default Header;
