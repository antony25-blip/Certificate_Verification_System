import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function LayoutConfig() {
  const [form, setForm] = useState({
    name_x: 0.5,
    name_y: 0.6,
    name_size: 42,
    domain_x: 0.5,
    domain_y: 0.5,
    domain_size: 18,
    start_x: 0.4,
    start_y: 0.45,
    start_size: 16,
    end_x: 0.6,
    end_y: 0.45,
    end_size: 16,
    name_font: "Poppins-SemiBold.ttf",
    body_font: "Poppins-Regular.ttf",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    await api.put("/certificate/layout", form, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    alert("Layout Updated Successfully!");
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Layout Configuration</h2>
          {Object.keys(form).map((key) => (
            <input
              key={key}
              name={key}
              placeholder={key}
              onChange={handleChange}
            />
          ))}
          <button onClick={submit}>Save Layout</button>
        </div>
      </div>
    </>
  );
}