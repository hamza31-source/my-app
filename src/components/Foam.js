import { useState } from "react";

export default function Foam(props) {
  const upper = () => {
    console.log("uppercase clicked" + text);
    let newtext = text.toUpperCase();
    settext(newtext);
    props.showalert("converted to uppercase","success");
  };
  const lower = () => {
    console.log("uppercase clicked" + text);
    let newtext = text.toLowerCase();
    settext(newtext);
    props.showalert("converted to lowercase","success");

  };
  const clear = () => {
    console.log("uppercase clicked" + text);
    let newtext = " ";
    settext(newtext);
    props.showalert("clear","success");

  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "myTextFile.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    props.showalert("downloaded","success");

  };

  const handle = (event) => {
    console.log("onchange");
    settext(event.target.value);
  };

  const [text, settext] = useState(" ");

  return (
    <>
      <div
        className="container"
        style={{
        color: props.mode === "dark" ? "white" : "black",
        }}
      >
        <h1>{props.heading}</h1>
        <div className="mb-3">
          <textarea
            className="form-control"
            value={text}
            rows="10"
            style={{
              backgroundColor: props.mode === "dark" ? "grey" : "white",
              color: props.mode === "dark" ? "white" : "black",
            }}
            onChange={handle}
            id="mybox"
          ></textarea>
        </div>
        <button className="btn btn-primary mx-2" onClick={upper}>
          upper
        </button>
        <button className="btn btn-primary mx-2" onClick={lower}>
          lower
        </button>
        <button className="btn btn-primary mx-2" onClick={clear}>
          clear
        </button>
        <button className="btn btn-primary mx-2" onClick={download}>
          download
        </button>
      </div>
      <div
        className="container"
        style={{
          color: props.mode === "dark" ? "white" : "black",
        }}
      >
        <h1>your text summary</h1>
        <p>
       {text.trim().length===0
       ?"0 word and 0characters"
       :`${text.trim().split(/\s+/).length} words and ${text.length} character`}
       
        </p>
        <p>{0.008 * text.split(" ").length} mins</p>
      </div>
    </>
  );
}
