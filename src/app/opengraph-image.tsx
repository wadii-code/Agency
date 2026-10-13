import { ImageResponse } from "next/og";
import { SPARK_MARK_PATH, SPARK_MARK_VIEWBOX } from "@/components/ui/SparkLogo";
import { categories, categoryOrder } from "@/lib/taxonomy";

/* Social share card (Open Graph; X falls back to it too), rendered at build time. */
export const alt = "SPARK: we build websites & digital solutions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DOT_COLORS = ["#00bae2", "#ff8709", "#fec5fb", "#9d95ff", "#0ae448"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "#ffffff",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(circle at 18% 0%, rgba(37,31,64,1), rgba(0,0,0,0) 62%), radial-gradient(circle at 100% 100%, rgba(37,31,73,0.9), rgba(0,0,0,0) 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg viewBox={SPARK_MARK_VIEWBOX} width={70} height={54} fill="#ffffff">
            <path d={SPARK_MARK_PATH} />
          </svg>
          <span style={{ fontSize: 38, fontWeight: 700, letterSpacing: 4 }}>SPARK</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 100,
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: -2,
            textTransform: "uppercase",
          }}
        >
          <span>We build websites</span>
          <span>& digital solutions</span>
        </div>

        <div style={{ display: "flex", gap: 34, fontSize: 24, color: "#8e8a9f" }}>
          {categoryOrder.map((id, i) => (
            <span key={id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: 10, backgroundColor: DOT_COLORS[i] }} />
              {categories[id].short}
            </span>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
