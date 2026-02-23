import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function CertificateView() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/certificate/${id}`)
      .then(res => setData(res.data))
      .catch(() => alert("Certificate not found"));
  }, [id]);

  if (!data) return null;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Certificate Details</h2>
          <p><b>Name:</b> {data.student_name}</p>
          <p><b>Domain:</b> {data.domain}</p>
          <p><b>Start:</b> {data.start_date?.split("T")[0]}</p>
          <p><b>End:</b> {data.end_date?.split("T")[0]}</p>

          <button
            onClick={() =>
              window.open(`http://localhost:3000/api/certificate/${id}/download`)
            }
          >
            Download Certificate
          </button>
        </div>
      </div>
    </>
  );
}