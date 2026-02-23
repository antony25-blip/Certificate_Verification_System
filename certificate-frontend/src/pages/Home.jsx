import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="container">
        <div className="card" style={{ textAlign: "center" }}>
          <h1>Certificate Verification System</h1>
          <p>Verify internship and training certificates instantly.</p>
          <Link to="/search">
            <button>Verify Certificate</button>
          </Link>
        </div>
      </div>
    </>
  );
}