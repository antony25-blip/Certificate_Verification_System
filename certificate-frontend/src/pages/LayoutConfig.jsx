import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function LayoutConfig() {
  const previewRef = useRef(null);

  const [activeTemplate, setActiveTemplate] = useState("");
  const [selectedField, setSelectedField] = useState("name");
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  /* ============================
     FONT LIST (10 Fonts)
  ============================ */
  const fontList = [
    "Poppins-SemiBold.ttf",
    "Poppins-Regular.ttf",
    "Montserrat.ttf",
    "Lora.ttf",
    "Roboto.ttf",
    "Oswald.ttf",
    "Raleway.ttf",
    "Merriweather.ttf",
    "PlayfairDisplay.ttf",
    "LibreBaskerville.ttf"
  ];

  /* ============================
     FIELD CONFIGURATION MAP
  ============================ */
  const fieldMap = {
    name: {
      label: "Sample Name",
      x: "name_x",
      y: "name_y",
      size: "name_size",
      font: "name_font"
    },
    domain: {
      label: "Sample Domain",
      x: "domain_x",
      y: "domain_y",
      size: "domain_size",
      font: "body_font"
    },
    start: {
      label: "01 January 2025",
      x: "start_x",
      y: "start_y",
      size: "start_size",
      font: "body_font"
    },
    end: {
      label: "31 January 2025",
      x: "end_x",
      y: "end_y",
      size: "end_size",
      font: "body_font"
    }
  };

  /* ============================
     FORM STATE
  ============================ */
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
    body_font: "Poppins-Regular.ttf"
  });

  /* ============================
     FETCH ACTIVE TEMPLATE
  ============================ */
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
  
      // Fetch active template
      const templateRes = await api.get("/certificate/templates", {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      setActiveTemplate(templateRes.data.active);
  
      // Fetch saved layout
      const layoutRes = await api.get("/certificate/layout", {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const data = layoutRes.data;
  
      setForm({
        name_x: data.name_x,
        name_y: data.name_y,
        name_size: data.name_size,
  
        domain_x: data.domain_x,
        domain_y: data.domain_y,
        domain_size: data.domain_size,
  
        start_x: data.start_x,
        start_y: data.start_y,
        start_size: data.start_size,
  
        end_x: data.end_x,
        end_y: data.end_y,
        end_size: data.end_size,
  
        name_font: data.name_font,
        body_font: data.body_font
      });
    };
  
    fetchData();
  }, []);

  /* ============================
     MOUSE MOVE (SHOW COORDS)
  ============================ */
  const handleMouseMove = (e) => {
    const rect = previewRef.current.getBoundingClientRect();
  
    const x = (e.clientX - rect.left) / rect.width;
  
    // invert here only once
    const y = 1 - (e.clientY - rect.top) / rect.height;
  
    setCoords({
      x: x.toFixed(3),
      y: y.toFixed(3)
    });
  };

  /* ============================
     CLICK TO SET POSITION
  ============================ */
  const handleClick = () => {
    setForm({
      ...form,
      [fieldMap[selectedField].x]: parseFloat(coords.x),
      [fieldMap[selectedField].y]: parseFloat(coords.y)
    });
  };

  /* ============================
     SAVE LAYOUT
  ============================ */
  const submit = async (e) => {
    e.preventDefault();

    await api.put(
      "/certificate/layout",
      {
        ...form,
        template_file: activeTemplate
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    alert("Layout Updated Successfully!");
  };

  /* ============================
     GET CURRENT FIELD
  ============================ */
  const currentField = fieldMap[selectedField];

  /* Convert .ttf → CSS font name */
  const cssFontName = form[currentField.font].replace(".ttf", "");

  return (
    <>
      <Navbar />

      <div style={{ display: "flex", padding: "40px", gap: "40px" }}>
        {/* ============================
            LEFT SIDE - PREVIEW
        ============================ */}
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
                cursor: "crosshair"
              }}
            >
              <img
                src={`http://localhost:3000/template-previews/${activeTemplate.replace(
                  ".pdf",
                  ".1.png"
                )}`}
                alt="template"
                style={{
                  width: "100%",
                  display: "block",
                  objectFit: "contain"
                }}
              />

              {/* 🔥 SHOW ALL SAMPLE TEXTS */}
              {Object.keys(fieldMap).map((key) => {
                const field = fieldMap[key];
                const fontName = form[field.font].replace(".ttf", "");

                return (
                  <div
                    key={key}
                    style={{
                      position: "absolute",
                      left: `${form[field.x] * 100}%`,
                      top: `${(1 - form[field.y]) * 100}%`,
                      transform: "translate(-50%, -100%)",
                      fontSize: `${form[field.size]}px`,
                      fontFamily: fontName,
                      color: key === "name" ? "#b8860b" : "#000",
                      pointerEvents: "none",
                      border: selectedField === key ? "1px dashed red" : "none",
                      padding: "2px 6px"
                    }}
                  >
                    {field.label}
                  </div>
                );
              })}

              {/* 🔥 LIVE SAMPLE TEXT */}
              

              {/* COORDINATE DISPLAY */}
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "10px",
                  background: "black",
                  color: "white",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "12px"
                }}
              >
                X: {coords.x} | Y: {coords.y}
              </div>
            </div>
          )}
        </div>

        {/* ============================
            RIGHT SIDE - CONTROLS
        ============================ */}
        <div style={{ flex: 1 }}>
          <h3>Layout Controls</h3>

          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            style={{ marginBottom: "20px", padding: "8px", width: "100%" }}
          >
            <option value="name">Name</option>
            <option value="domain">Domain</option>
            <option value="start">Start Date</option>
            <option value="end">End Date</option>
          </select>

          <label>X</label>
          <input
            type="number"
            step="0.001"
            value={form[currentField.x]}
            onChange={(e) =>
              setForm({
                ...form,
                [currentField.x]: parseFloat(e.target.value)
              })
            }
            style={{ width: "100%", marginBottom: "15px", padding: "8px" }}
          />

          <label>Y</label>
          <input
            type="number"
            step="0.001"
            value={form[currentField.y]}
            onChange={(e) =>
              setForm({
                ...form,
                [currentField.y]: parseFloat(e.target.value)
              })
            }
            style={{ width: "100%", marginBottom: "15px", padding: "8px" }}
          />

          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <select
              value={form[currentField.font]}
              onChange={(e) =>
                setForm({
                  ...form,
                  [currentField.font]: e.target.value
                })
              }
              style={{ flex: 1, padding: "8px" }}
            >
              {fontList.map((font) => (
                <option key={font} value={font}>
                  {font.replace(".ttf", "")}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={form[currentField.size]}
              onChange={(e) =>
                setForm({
                  ...form,
                  [currentField.size]: parseInt(e.target.value)
                })
              }
              style={{ width: "90px", padding: "8px" }}
            />
          </div>

          <button
            onClick={submit}
            style={{
              padding: "10px",
              width: "100%",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px"
            }}
          >
            Save Layout
          </button>
        </div>
      </div>
    </>
  );
}