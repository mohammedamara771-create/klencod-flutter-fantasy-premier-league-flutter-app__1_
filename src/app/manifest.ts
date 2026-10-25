import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "فانتازي أرينا — إحصاءات فانتازي البريميرليج",
    short_name: "فانتازي أرينا",
    description:
      "تطبيق عربي شامل لفانتازي الدوري الإنجليزي: كل الإحصاءات، فورمة اللاعبين، xG/xA، التشكيلات والمباريات ببيانات رسمية.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#07060f",
    theme_color: "#07060f",
    dir: "rtl",
    lang: "ar",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    ],
  };
}
