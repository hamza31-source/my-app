import './App.css';
import Navbar from './components/Navbar';
import Foam from './components/Foam';
// import Aboutus from './components/Aboutus';
import Alert from './components/Alert';
import { useState } from 'react';
// import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [mode, setMode] = useState("light");
  const [alert, setAlert] = useState(null);
  const [visible, setVisible] = useState(true);
  const [bluemode, setBluemode] = useState("light");
  const [redmode, setRedmode] = useState("light");

  const showalert = (message, type) => {
    setAlert({ message, type });
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setAlert(null);
      }, 500);
    }, 2000);
  };

  const togglemode = () => {
    if (mode === "light") {
      setMode("dark");
      document.body.style.backgroundColor = "black";
      showalert("Dark mode is activated", "success");
      document.title = "TextUtils - Dark Mode";
    } else {
      setMode("light");
      document.body.style.backgroundColor = "white";
      showalert("Light mode is activated", "success");
    }
  };

  const togglemode1 = () => {
    if (bluemode === "light") {
      setBluemode("blue");
      document.body.style.backgroundColor = "blue";
      showalert("Blue mode is activated", "success");
    } else {
      setBluemode("light");
      document.body.style.backgroundColor = "white";
      showalert("Light mode is activated", "success");
    }
  };

  const togglemode2 = () => {
    if (redmode === "light") {
      setRedmode("red");
      document.body.style.backgroundColor = "red";
      showalert("Red mode is activated", "success");
    } else {
      setRedmode("light");
      document.body.style.backgroundColor = "white";
      showalert("Light mode is activated", "success");
    }
  };

  const theme = bluemode !== "light" ? "primary"
              : redmode !== "light" ? "danger"
              : mode === "dark" ? "dark"
              : "light";

  const getTextColor = () => {
    return theme === "dark" || theme === "primary" || theme === "danger"
      ? "light"
      : "dark";
  };

  return (
  //  <HashRouter>
  <>
      <Navbar
        title="TextUtils"
        about="About Us"
        mode={mode}
        togglemode={togglemode}
        blue={bluemode}
        red={redmode}
        togglemode1={togglemode1}
        togglemode2={togglemode2}
        textColor={getTextColor()}
        theme={theme}
      />
      <Alert alert={alert} visible={visible} />
      <div className="container my-3">
        <Foam heading="Enter text" mode={mode} showalert={showalert} />
        {/* <Routes> */}
          {/* <Route exact path="/aboutus" element={<Aboutus showalert={showalert} />} /> */}
        {/* </Routes> */}
      </div>
 {/* </HashRouter>  */}
 </>
); 
}

export default App;
