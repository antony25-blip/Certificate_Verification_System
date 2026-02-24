import { useEffect, useState } from "react";
import api from "../services/api";

export default function UploadExcel() {
  const [excels, setExcels] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [active, setActive] = useState([]);

  const fetchActive = async () => {
    try {
      const res = await api.get("/certificate/excel/active", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      setActive(res.data.active || []);
    } catch (error) {
      console.error("Failed to fetch active excel", error);
    }
  };

  const fetchExcels = async () => {
    try {
      const res = await api.get("/certificate/excel-list", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // ✅ Sort oldest → newest
      const sorted = res.data.files.sort((a, b) => {
        const timeA = parseInt(a.split("-")[0]);
        const timeB = parseInt(b.split("-")[0]);
        return timeA - timeB;
      });

      setExcels(sorted);

    } catch (error) {
      console.error("Fetch Excel Error:", error);
    }
  };

  useEffect(() => {
    fetchExcels();
    fetchActive();   
  }, []);

  // ✅ Upload (fixed duplicate error + correct ordering)
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const res = await api.post("/certificate/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      // ✅ Only show important messages
      if (res.data.insertedRows > 0) {
        alert(`Inserted ${res.data.insertedRows} certificates`);
      }
  
      // ✅ Always add file to list
      setExcels((prev) => [...prev, res.data.filename]);
  
    } catch (error) {
      alert(error.response?.data?.message || "Upload failed");
    }
  };
  const deleteExcel = async (file) => {
    try {
      await api.delete(`/certificate/excel/${file}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setExcels(excels.filter((f) => f !== file));

    } catch (error) {
      alert("Delete failed");
    }
  };

  const cleanFileName = (file) => {
    const parts = file.split("-");
    parts.shift();
    return parts.join("-");
  };

  const toggleActive = async (file) => {
    let updated;
  
    if (active.includes(file)) {
      updated = active.filter((f) => f !== file);
    } else {
      updated = [...active, file];
    }
  
    setActive(updated);
  
    try {
      await api.put(
        "/certificate/excel/active",
        { files: updated },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Active update failed", error);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ marginBottom: "20px" }}>Excel Management</h2>

      {/* Upload Button */}
      <label
        style={{
          padding: "12px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        + Upload Excel
        <input
          type="file"
          accept=".xlsx"
          hidden
          onChange={handleUpload}
        />
      </label>

      {/* Edit Button */}
      <button
        onClick={() => setEditMode(!editMode)}
        style={{
          float: "right",
          padding: "10px 20px",
          background: editMode ? "#ef4444" : "#10b981",
          color: "white",
          border: "none",
          borderRadius: "8px",
        }}
      >
        {editMode ? "Done" : "Edit"}
      </button>

      <div
        style={{
          clear: "both",
          marginTop: "40px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "25px",
        }}
      >
        {excels.map((file, index) => (
          <div
            key={file}
            onClick={() => toggleActive(file)}
            style={{
              background: "#a7f3d0",
              border: active.includes(file)
                ? "3px solid #2563eb"
                : "2px solid #10b981",
              borderRadius: "15px",
              padding: "25px",
              position: "relative",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>
              📊 Excel {index + 1}
            </h3>

            <p style={{ fontSize: "14px" }}>
              {cleanFileName(file)}
            </p>

            {/* Open */}
            <a
              href={`http://localhost:3000/uploads/${file}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: "inline-block",
                marginTop: "15px",
                padding: "8px 14px",
                background: "#2563eb",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              Open
            </a>

            {/* Delete */}
            {editMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteExcel(file);
                }}
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  background: "white",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}