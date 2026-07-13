import { useEffect, useState } from "react";

export function AnnouncementBanner() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://footprint-api.onrender.com/api/trial-count")
      .then((r) => r.json())
      .then((data: { count?: number }) => {
        if (typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {
        // Silently fail — banner still shows with "—"
      });
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        borderBottom: "1px solid #1a1a1a",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 16px",
        gap: "2px",
        minHeight: "44px",
        boxSizing: "border-box",
      }}
    >
      <p style={{ margin: 0, fontSize: "13px", color: "#ffffff", textAlign: "center", lineHeight: 1.4 }}>
        Users who join the beta get free access and lifetime discounts.{" "}
        <a
          href="https://footprintnavigator.com/signup"
          style={{ color: "#007BFF", textDecoration: "underline" }}
        >
          Join the movement here
        </a>
      </p>
      <p style={{ margin: 0, fontSize: "12px", color: "#999999", textAlign: "center", lineHeight: 1.4 }}>
        Current trial customers: {count !== null ? count : "—"}
      </p>
    </div>
  );
}
