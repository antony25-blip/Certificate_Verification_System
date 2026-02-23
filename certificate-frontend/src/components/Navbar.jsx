import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div style={{
      background: "white",
      padding: "15px 40px",
      boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
      display: "flex",
      justifyContent: "space-between"
    }}>
      <h3>Certificate System</h3>
      <div>
        <Link to="/" style={{ marginRight: 20 }}>Home</Link>
        <Link to="/search" style={{ marginRight: 20 }}>Verify</Link>
        <Link to="/admin/login">Admin</Link>
      </div>
    </div>
  );
}