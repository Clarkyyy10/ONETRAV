import { ImageResponse } from "next/og";

// Generated PWA / favicon icon — the ONETRAVEL mark (two overlapping rings)
// rendered white on the locked teal accent. Served by Next at /icon.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e7c73",
          borderRadius: 112,
        }}
      >
        <svg
          width="320"
          height="320"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth={2.1}
        >
          <circle cx="9" cy="12" r="5.2" />
          <circle cx="15" cy="12" r="5.2" opacity={0.65} />
        </svg>
      </div>
    ),
    { ...size },
  );
}
