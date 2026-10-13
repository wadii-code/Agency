import { ImageResponse } from "next/og";
import { SPARK_MARK_PATH, SPARK_MARK_VIEWBOX } from "@/components/ui/SparkLogo";

/* Home-screen / bookmark icon for iOS, which doesn't use the SVG favicon. */
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
          backgroundColor: "#000000",
        }}
      >
        <svg viewBox={SPARK_MARK_VIEWBOX} width={112} height={86} fill="#ffffff">
          <path d={SPARK_MARK_PATH} />
        </svg>
      </div>
    ),
    size,
  );
}
