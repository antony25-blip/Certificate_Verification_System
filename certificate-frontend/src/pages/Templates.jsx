import { useEffect, useState } from "react";
import api from "../services/api";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [active, setActive] = useState("");
  const [preview, setPreview] = useState(null);

  const fetchTemplates = async () => {
    const res = await api.get("/certificate/templates", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    setTemplates(res.data.templates);
    setActive(res.data.active);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleUpload = async (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    await api.post("/certificate/upload-template", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    });

    fetchTemplates();
  };

  const setAsActive = async (file) => {
    await api.put(
      "/certificate/layout",
      { template_file: file },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    setActive(file);
  };

  const deleteTemplate = async (file) => {
    if (!window.confirm("Delete this template?")) return;

    await api.delete(`/certificate/template/${file}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    fetchTemplates();
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ marginBottom: "20px" }}>Select Template</h2>

      {/* Upload Button */}
      <label
        style={{
          display: "inline-block",
          padding: "12px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "30px",
        }}
      >
        + Upload Template
        <input
          type="file"
          accept="application/pdf"
          hidden
          onChange={handleUpload}
        />
      </label>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {templates.map((file) => (
          <div
            key={file}
            style={{
              border: active === file ? "3px solid #2563eb" : "1px solid #ddd",
              borderRadius: "12px",
              padding: "10px",
              cursor: "pointer",
              transition: "0.3s",
              position: "relative",
              background: "white",
              boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
            }}
          >
            {/* Preview */}
            <iframe
              src={`http://localhost:3000/templates/${file}`}
              title={file}
              width="100%"
              height="200px"
              style={{ borderRadius: "8px" }}
              onClick={() => setPreview(file)}
            />

            <p style={{ textAlign: "center", marginTop: "10px" }}>
              {file}
            </p>

            {/* Delete Button */}
            <button
              onClick={() => deleteTemplate(file)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            {/* Select Button */}
            <button
              onClick={() => setAsActive(file)}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "8px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
              }}
            >
              {active === file ? "Active Template" : "Set Active"}
            </button>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "80%",
              height: "80%",
              background: "white",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <iframe
              src={`http://localhost:3000/templates/${preview}`}
              width="100%"
              height="100%"
              title="Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}