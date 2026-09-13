import { ImageResponse } from "next/og";

// Apple touch icon for iOS "Add to Home Screen". iOS ignores transparency and
// applies its own mask, so we fill the full teal square (no rounding here).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <svg
          width="118"
          height="118"
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
