import React from "react";
// import { Link } from "react-router-dom";
export default function Navbar(props) {
  const navbarStyle = props.theme === "light" ? "light" : "dark";

  return (
    <nav className={`navbar navbar-expand-lg navbar-${navbarStyle} bg-${props.theme}`}>
      <div className="container-fluid">
        <a className="navbar-brand" href="#">{props.title}</a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#">
                Home
              </a>
            </li>
            {/* <li className="nav-item">
              <Link className="nav-link" to="/Aboutus">About</Link>
            </li> */}
          </ul>

          {/* Theme Toggles */}
          <div className={`form-check form-switch text-${props.textColor} mx-2`}>
            <input
              className="form-check-input"
              onClick={props.togglemode}
              type="checkbox"
              role="switch"
              id="darkModeSwitch"
            />
            <label className="form-check-label" htmlFor="darkModeSwitch">Dark Mode</label>
          </div>

          <div className={`form-check form-switch text-${props.textColor} mx-2`}>
            <input
              className="form-check-input"
              onClick={props.togglemode2}
              type="checkbox"
              role="switch"
              id="redModeSwitch"
            />
            <label className="form-check-label" htmlFor="redModeSwitch">Red Mode</label>
          </div>

          <div className={`form-check form-switch text-${props.textColor} mx-2`}>
            <input
              className="form-check-input"
              onClick={props.togglemode1}
              type="checkbox"
              role="switch"
              id="blueModeSwitch"
            />
            <label className="form-check-label" htmlFor="blueModeSwitch">Blue Mode</label>
          </div>
        </div>
      </div>
    </nav>
  );
}
