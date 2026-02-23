import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function AddCertificate() {
  const [form, setForm] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    await api.post("/certificate", form, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    alert("Certificate Added Successfully!");
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Add Certificate</h2>
          <form onSubmit={submit}>
            <input name="certificate_id" placeholder="Certificate ID" onChange={handleChange} />
            <input name="student_name" placeholder="Student Name" onChange={handleChange} />
            <input name="domain" placeholder="Domain" onChange={handleChange} />
            <input type="date" name="start_date" onChange={handleChange} />
            <input type="date" name="end_date" onChange={handleChange} />
            <button type="submit">Save Certificate</button>
          </form>
        </div>
      </div>
    </>
  );
}