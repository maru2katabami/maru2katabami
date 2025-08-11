export default function manifest() {
  return {
    name: "maru2katabami",
    short_name: "M2K",
    description: "",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/m2k.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/m2k.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}