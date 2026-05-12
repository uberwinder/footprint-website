import { Link } from "wouter";

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#111", color: "#fff", fontSize: "12px", textAlign: "center", paddingTop: "28px", paddingBottom: "28px" }}>
      <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
        <Link href="/support" style={{ color: "#aaa", textDecoration: "none" }}>
          Support
        </Link>
        <Link href="/contact" style={{ color: "#aaa", textDecoration: "none" }}>
          Contact
        </Link>
        <Link href="/security" style={{ color: "#aaa", textDecoration: "none" }}>
          Security
        </Link>
      </div>
      <div style={{ color: "#666" }}>
        © 2026 Footprint Technologies · info@footprintnavigator.com
      </div>
    </footer>
  );
}
