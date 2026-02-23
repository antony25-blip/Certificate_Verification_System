import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function SearchCertificate() {
  const [id, setId] = useState("");
  const [data, setData] = useState(null);

  const search = async () => {
    const res = await api.get(`/certificate/${id}`);
    setData(res.data);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Verify Certificate</h2>
          <input
            placeholder="Enter Certificate ID"
            onChange={(e) => setId(e.target.value)}
          />
          <button onClick={search}>Search</button>

          {data && (
            <div style={{ marginTop: 20 }}>
              <p><b>Name:</b> {data.student_name}</p>
              <p><b>Domain:</b> {data.domain}</p>
              <button onClick={() =>
                window.open(`http://localhost:3000/api/certificate/${id}/download`)
              }>
                Download Certificate
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}