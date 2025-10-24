import { useState, useEffect, useMemo } from "react";

const overlays = [
  {
    name: "Flower",
    src: "https://res.cloudinary.com/dni2zk7ht/image/upload/v1761195481/2x6_flower_overlay_qhp9u7.png",
  },
  {
    name: "Halloween",
    src: "https://res.cloudinary.com/dni2zk7ht/image/upload/v1761195480/2x6_halloween_1_overlay_w8zjjh.png",
  },
];

export default function OverlayComposer({
  imageBlobs,
}: {
  imageBlobs: Blob[];
}) {
  const [selectedOverlay, setSelectedOverlay] = useState(overlays[0]);
  const [overlayLoaded, setOverlayLoaded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("none");

  const imageUrls = useMemo(() => {
    const urls = imageBlobs.map((blob) => URL.createObjectURL(blob));
    return urls;
  }, [imageBlobs]);

  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  useEffect(() => {
    setOverlayLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedOverlay.src;
    img.onload = () => setOverlayLoaded(true);
  }, [selectedOverlay]);

  const filters: Record<string, string> = {
    none: "none",
    grayscale: "grayscale(1)",
    sepia: "sepia(0.8)",
    bright: "brightness(1.2)",
    contrast: "contrast(1.3)",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        id="preview"
        className="relative w-[600px] h-[1800px] bg-black overflow-hidden border-[8px] border-yellow-400 rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.75)]"
      >
        {imageUrls.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`photo-${i}`}
            className="absolute rounded-xl object-cover transition-transform duration-300"
            style={{
              top: 100 + i * 400 + "px",
              left: "80px",
              width: "440px",
              height: "360px",
              filter: filters[selectedFilter],
            }}
          />
        ))}

        {overlayLoaded && (
          <img
            src={selectedOverlay.src}
            crossOrigin="anonymous"
            alt="overlay"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500"
            style={{ opacity: 1 }}
          />
        )}
      </div>

      {/* 🎨 Template Selector */}
      <div className="flex gap-3 flex-wrap justify-center mt-4">
        {overlays.map((o) => (
          <button
            key={o.name}
            onClick={() => setSelectedOverlay(o)}
            className={`relative w-24 h-32 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              selectedOverlay.name === o.name
                ? "border-pink-400 scale-105"
                : "border-gray-600 hover:border-gray-400"
            }`}
          >
            <img
              src={o.src}
              crossOrigin="anonymous"
              alt={o.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-xs text-white text-center py-1">
              {o.name}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap justify-center mt-2">
        {Object.keys(filters).map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedFilter === f
                ? "bg-emerald-500 text-white shadow-lg"
                : "bg-gray-800 text-gray-200 hover:bg-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
