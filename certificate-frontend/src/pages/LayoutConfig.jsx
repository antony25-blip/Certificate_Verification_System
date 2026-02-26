import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function LayoutConfig() {
  const previewRef = useRef(null);

  const [activeTemplate, setActiveTemplate] = useState("");
  const [selectedField, setSelectedField] = useState("name");
  const [coords, setCoords] = useState({ x: 0, y: 0 });

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

  // 🔥 Fetch Active Template
  useEffect(() => {
    const fetchActiveTemplate = async () => {
      const res = await api.get("/certificate/templates", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setActiveTemplate(res.data.active);
    };

    fetchActiveTemplate();
  }, []);

  // 🔥 Mouse Move Logic
  const handleMouseMove = (e) => {
    const rect = previewRef.current.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;

    setCoords({
      x: x.toFixed(3),
      y: y.toFixed(3),
    });
  };

  // 🔥 Click to Set Position
  const handleClick = () => {
    const updated = { ...form };

    updated[`${selectedField}_x`] = coords.x;
    updated[`${selectedField}_y`] = coords.y;

    setForm(updated);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
  
    await api.put(
      "/certificate/layout",
      {
        ...form,
        template_file: activeTemplate   // 🔥 ADD THIS LINE
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  
    alert("Layout Updated Successfully!");
  };
  return (
    <>
      <Navbar />

      <div style={{ display: "flex", padding: "40px", gap: "40px" }}>
        {/* LEFT SIDE - TEMPLATE PREVIEW */}
        <div style={{ flex: 2 }}>
          <h3>Template Preview</h3>

          {activeTemplate && (
            <div
              ref={previewRef}
              onMouseMove={handleMouseMove}
              onClick={handleClick}
              style={{
                position: "relative",
                border: "2px solid #2563eb",
                cursor: "crosshair",
              }}
            >
              <img
                src={`http://localhost:3000/template-previews/${activeTemplate.replace(".pdf", ".1.png")}`}
                alt="template"
                style={{ width: "100%", display: "block" }}
              />

              {/* Live Coordinates Display */}
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "10px",
                  background: "black",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              >
                X: {coords.x} | Y: {coords.y}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - INPUT PANEL */}
        <div style={{ flex: 1 }}>
          <h3>Layout Controls</h3>

          {/* Field Selector */}
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            style={{ marginBottom: "20px", padding: "8px" }}
          >
            <option value="name">Name</option>
            <option value="domain">Domain</option>
            <option value="start">Start Date</option>
            <option value="end">End Date</option>
          </select>

          {Object.keys(form).map((key) => (
            <input
              key={key}
              name={key}
              value={form[key]}
              placeholder={key}
              onChange={handleChange}
              style={{
                width: "100%",
                marginBottom: "10px",
                padding: "8px",
              }}
            />
          ))}

          <button
            onClick={submit}
            style={{
              marginTop: "20px",
              padding: "10px",
              width: "100%",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
            }}
          >
            Save Layout
          </button>
        </div>
      </div>
    </>
  );
}