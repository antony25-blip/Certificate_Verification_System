import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function UploadTemplate() {
  const [file, setFile] = useState(null);

  const upload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    await api.post("/certificate/upload-template", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Template Uploaded Successfully!");
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Upload Template / Font</h2>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={upload}>Upload</button>
        </div>
      </div>
    </>
  );
}