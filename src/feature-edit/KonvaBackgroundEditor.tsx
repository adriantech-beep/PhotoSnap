import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Group } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Images,
  LayoutList,
  SlidersHorizontal,
  Printer,
  Save,
} from "lucide-react";

import type { Stage as KonvaStage } from "konva/lib/Stage";
import type { Image as KonvaImageType } from "konva/lib/shapes/Image";
import type { Filter } from "konva/lib/Node";

const cloudName = "dni2zk7ht";

/* ----------------------------- DATA ----------------------------- */

const backgrounds = [
  {
    name: "Christmas Tree",
    src: `https://res.cloudinary.com/${cloudName}/image/upload/v1760967808/Christmas-Tree-Bg_b772km.jpg`,
  },
  {
    name: "Christmas Alley",
    src: `https://res.cloudinary.com/${cloudName}/image/upload/v1760967808/Christmas-Alley-Bg_xwmdkt.jpg`,
  },
  {
    name: "Nipa Hut",
    src: `https://res.cloudinary.com/${cloudName}/image/upload/v1760967808/Christmas-NipaHut_fcam5s.jpg`,
  },
  {
    name: "Pine Trees",
    src: `https://res.cloudinary.com/${cloudName}/image/upload/v1760967809/Christmas-PineTrees_cbouc5.jpg`,
  },
  {
    name: "Light Blurred",
    src: `https://res.cloudinary.com/${cloudName}/image/upload/v1760967808/Christmas-Light-Blurred-Bg_yqmuce.jpg`,
  },
];

type LayoutSpec = { name: string; width: number; height: number };
const layouts: LayoutSpec[] = [
  { name: "4x6", width: 640, height: 960 },
  { name: "5x7", width: 700, height: 980 },
  { name: "Square", width: 640, height: 640 },
  { name: "Landscape", width: 960, height: 640 },
  { name: "A4", width: 794, height: 1123 },
  { name: "Photo Strip 2x6", width: 600, height: 1800 }, // classic strip
];

type FilterOption = {
  name: string;
  fns: Filter[]; // now strongly typed
  brightness?: number; // -1..1
  contrast?: number; // -100..100
};

const filterOptions: FilterOption[] = [
  { name: "Normal", fns: [] },
  { name: "Grayscale", fns: [Konva.Filters.Grayscale] },
  { name: "Sepia", fns: [Konva.Filters.Sepia] },
  { name: "Bright", fns: [Konva.Filters.Brighten], brightness: 0.2 },
  { name: "Contrast", fns: [Konva.Filters.Contrast], contrast: 30 },
];

type TemplateMode = "single" | "strip";

/* ----------------------------- PROPS ----------------------------- */

interface KonvaBackgroundEditorProps {
  imageUrl: string; // subject (with bg already removed)
  onDone: (dataUrl: string) => void;
}

/* --------------------------- COMPONENT --------------------------- */

export default function KonvaBackgroundEditor({
  imageUrl,
  onDone,
}: KonvaBackgroundEditorProps) {
  const [templateMode, setTemplateMode] = useState<TemplateMode>("single");
  const [selectedBg, setSelectedBg] = useState(backgrounds[0].src);
  const [layout, setLayout] = useState<LayoutSpec>(layouts[0]);

  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(
    filterOptions[0]
  );
  const [brightness, setBrightness] = useState<number>(
    selectedFilter.brightness ?? 0
  );
  const [contrast, setContrast] = useState<number>(
    selectedFilter.contrast ?? 0
  );

  const [subject] = useImage(imageUrl, "anonymous");
  const [background] = useImage(selectedBg, "anonymous");

  // Refs
  const stageRef = useRef<KonvaStage | null>(null);
  const subjectRef = useRef<KonvaImageType | null>(null);
  const stripRefs = useRef<(KonvaImageType | null)[]>([null, null, null, null]);

  // STRIP frames: track per-frame transform (x, y, scale) for the subject copy
  type FrameTransform = { x: number; y: number; scale: number };
  const [frameTransforms, setFrameTransforms] = useState<FrameTransform[]>([
    { x: 0, y: 0, scale: 1 },
    { x: 0, y: 0, scale: 1 },
    { x: 0, y: 0, scale: 1 },
    { x: 0, y: 0, scale: 1 },
  ]);

  // When changing filter option, reset sliders to that option defaults
  useEffect(() => {
    setBrightness(selectedFilter.brightness ?? 0);
    setContrast(selectedFilter.contrast ?? 0);
  }, [selectedFilter]);

  // Apply filters to single-subject image
  useEffect(() => {
    if (!subjectRef.current) return;
    const img = subjectRef.current;
    img.cache();
    img.filters(selectedFilter.fns);
    if (selectedFilter.fns.includes(Konva.Filters.Brighten)) {
      img.brightness(brightness); // -1..1
    } else {
      img.brightness(0);
    }
    if (selectedFilter.fns.includes(Konva.Filters.Contrast)) {
      img.contrast(contrast); // -100..100
    } else {
      img.contrast(0);
    }
    img.getLayer()?.batchDraw();
  }, [selectedFilter, brightness, contrast, subject]);

  // Apply filters to strip subjects (all 4)
  useEffect(() => {
    stripRefs.current.forEach((ref) => {
      if (!ref) return;
      ref.cache();
      ref.filters(selectedFilter.fns);
      if (selectedFilter.fns.includes(Konva.Filters.Brighten)) {
        ref.brightness(brightness);
      } else {
        ref.brightness(0);
      }
      if (selectedFilter.fns.includes(Konva.Filters.Contrast)) {
        ref.contrast(contrast);
      } else {
        ref.contrast(0);
      }
      ref.getLayer()?.batchDraw();
    });
  }, [selectedFilter, brightness, contrast, subject]);

  // Utility: export & print
  const handleExport = () => {
    const stage = stageRef.current;
    if (!stage) return;
    onDone(stage.toDataURL({ pixelRatio: 2 }));
  };

  const handlePrint = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const dataUrl = stage.toDataURL({ pixelRatio: 2 });
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<img src="${dataUrl}" style="width:100%">`);
    w.print();
  };

  // Derived strip frame layout
  const stripFramePadding = 30;
  const stripBgRadius = 24;
  const stripFrames = useMemo(() => {
    // 4 frames vertically stacked inside the strip with padding
    const frameCount = 4;
    const gutter = 20;
    const innerW = layout.width - stripFramePadding * 2;
    const innerH = layout.height - stripFramePadding * 2;
    const frameH = (innerH - gutter * (frameCount - 1)) / frameCount;
    const frames = new Array(frameCount).fill(0).map((_, i) => ({
      x: stripFramePadding,
      y: stripFramePadding + i * (frameH + gutter),
      width: innerW,
      height: frameH,
      radius: 18,
    }));
    return frames as {
      x: number;
      y: number;
      width: number;
      height: number;
      radius: number;
    }[];
  }, [layout]);

  // Keep transforms reasonable when layout changes
  useEffect(() => {
    setFrameTransforms((prev) => prev.map(() => ({ x: 0, y: 0, scale: 1 })));
  }, [layout]);

  // Subject initial size/position in single mode
  const singleSubjectRect = useMemo(() => {
    const w = layout.width * 0.5;
    const h = layout.height * 0.5;
    return {
      x: (layout.width - w) / 2,
      y: (layout.height - h) / 2,
      width: w,
      height: h,
    };
  }, [layout]);

  // Helpers for drag/scale in strip mode
  const onDragMoveFrame = (idx: number, e: any) => {
    const node = e.target as KonvaImageType;
    setFrameTransforms((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], x: node.x(), y: node.y() };
      return next;
    });
  };

  const onWheelScaleFrame = (idx: number, e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.06;
    const oldScale = frameTransforms[idx].scale;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setFrameTransforms((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], scale: Math.max(0.2, Math.min(newScale, 5)) };
      return next;
    });
  };

  // UI state (panels)
  const [activePanel, setActivePanel] = useState<
    null | "templates" | "layouts" | "filters"
  >(null);

  /* ------------------------------ UI ------------------------------ */

  return (
    <div className="relative flex items-center justify-center gap-6 w-full h-full min-h-[760px] bg-gradient-to-br from-[#0b0f19] via-black to-[#10151f] p-6 rounded-2xl shadow-2xl">
      {/* Left round toolbar */}
      <div className="flex flex-col items-center gap-5">
        {/* Templates */}
        <motion.button
          onClick={() =>
            setActivePanel(activePanel === "templates" ? null : "templates")
          }
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all bg-fuchsia-500`}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Templates"
        >
          <Images size={26} />
        </motion.button>

        {/* Layouts */}
        <motion.button
          onClick={() =>
            setActivePanel(activePanel === "layouts" ? null : "layouts")
          }
          className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all bg-sky-500"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Layouts"
        >
          <LayoutList size={26} />
        </motion.button>

        {/* Filters */}
        <motion.button
          onClick={() =>
            setActivePanel(activePanel === "filters" ? null : "filters")
          }
          className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all bg-emerald-500"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Filters"
        >
          <SlidersHorizontal size={26} />
        </motion.button>

        {/* Print */}
        <motion.button
          onClick={handlePrint}
          className="w-16 h-16 rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 transition-all bg-amber-400"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Print"
        >
          <Printer size={26} />
        </motion.button>

        {/* Save */}
        <motion.button
          onClick={handleExport}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all bg-lime-600"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Save"
        >
          <Save size={26} />
        </motion.button>
      </div>

      {/* Stage with neon frame */}
      <div className="relative border-[10px] border-amber-400 rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.75)] overflow-hidden">
        <Stage width={layout.width} height={layout.height} ref={stageRef}>
          <Layer>
            {templateMode === "single" ? (
              <>
                {background ? (
                  <KonvaImage
                    image={background}
                    width={layout.width}
                    height={layout.height}
                  />
                ) : (
                  <Rect
                    width={layout.width}
                    height={layout.height}
                    fill="#1f2937"
                  />
                )}
                {subject && (
                  <KonvaImage
                    ref={subjectRef}
                    image={subject}
                    draggable
                    {...singleSubjectRect}
                  />
                )}
              </>
            ) : (
              // Photo Strip template
              <Group>
                {/* strip background */}
                <Rect
                  x={0}
                  y={0}
                  width={layout.width}
                  height={layout.height}
                  fill="#ffffff"
                  cornerRadius={stripBgRadius}
                  shadowColor="black"
                  shadowBlur={20}
                />
                {/* frames + subject copies */}
                {stripFrames.map((f, idx) => (
                  <Group key={idx}>
                    <Rect
                      x={f.x}
                      y={f.y}
                      width={f.width}
                      height={f.height}
                      fill="#111827"
                      cornerRadius={f.radius}
                      stroke="#e5e7eb"
                      strokeWidth={2}
                    />
                    {subject && (
                      <KonvaImage
                        ref={(el) => {
                          stripRefs.current[idx] = el;
                        }}
                        image={subject}
                        x={f.x + f.width * 0.25 + frameTransforms[idx].x}
                        y={f.y + f.height * 0.25 + frameTransforms[idx].y}
                        width={f.width * 0.5 * frameTransforms[idx].scale}
                        height={f.height * 0.5 * frameTransforms[idx].scale}
                        draggable
                        onDragMove={(e) => onDragMoveFrame(idx, e)}
                        onWheel={(e) => onWheelScaleFrame(idx, e)}
                      />
                    )}
                  </Group>
                ))}
              </Group>
            )}
          </Layer>
        </Stage>
      </div>

      {/* Floating panels */}
      <AnimatePresence>
        {activePanel === "templates" && (
          <motion.div
            initial={{ x: -18, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -18, opacity: 0 }}
            className="absolute left-28 top-8 bg-black/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl max-w-xs max-h-[70vh] overflow-y-auto"
          >
            <h3 className="text-pink-300 font-semibold mb-3">Templates</h3>
            <div className="flex gap-2 mb-3">
              <Button
                onClick={() => setTemplateMode("single")}
                className={`rounded-full px-4 ${
                  templateMode === "single"
                    ? "bg-fuchsia-500 text-white"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                Single
              </Button>
              <Button
                onClick={() => {
                  setTemplateMode("strip");
                  // auto switch to strip layout if not selected
                  const strip = layouts.find(
                    (l) => l.name === "Photo Strip 2x6"
                  );
                  if (strip) setLayout(strip);
                }}
                className={`rounded-full px-4 ${
                  templateMode === "strip"
                    ? "bg-fuchsia-500 text-white"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                Photo Strip (4)
              </Button>
            </div>

            {templateMode === "single" && (
              <>
                <p className="text-xs text-gray-300 mb-2">Backgrounds</p>
                <div className="grid grid-cols-2 gap-2">
                  {backgrounds.map((bg) => (
                    <img
                      key={bg.name}
                      src={bg.src}
                      alt={bg.name}
                      crossOrigin="anonymous"
                      onClick={() => setSelectedBg(bg.src)}
                      className={`w-32 h-20 object-cover rounded-lg cursor-pointer border-2 ${
                        selectedBg === bg.src
                          ? "border-fuchsia-400 shadow-lg"
                          : "border-transparent hover:border-gray-500"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            {templateMode === "strip" && (
              <div className="text-xs text-gray-300">
                Tip: drag each subject copy inside its frame; scroll to zoom.
              </div>
            )}
          </motion.div>
        )}

        {activePanel === "layouts" && (
          <motion.div
            initial={{ x: -18, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -18, opacity: 0 }}
            className="absolute left-28 top-8 bg-black/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl max-w-xs"
          >
            <h3 className="text-sky-300 font-semibold mb-3">Layouts</h3>
            <div className="flex flex-col gap-2">
              {layouts.map((l) => (
                <Button
                  key={l.name}
                  onClick={() => setLayout(l)}
                  className={`rounded-full justify-between ${
                    layout.name === l.name
                      ? "bg-sky-500 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  <span>{l.name}</span>
                  <span className="text-xs opacity-80">
                    {l.width}×{l.height}
                  </span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {activePanel === "filters" && (
          <motion.div
            initial={{ x: -18, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -18, opacity: 0 }}
            className="absolute left-28 top-8 bg-black/80 backdrop-blur-sm p-4 rounded-2xl shadow-xl max-w-xs"
          >
            <h3 className="text-emerald-300 font-semibold mb-3">Filters</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {filterOptions.map((f) => (
                <Button
                  key={f.name}
                  onClick={() => setSelectedFilter(f)}
                  className={`rounded-full ${
                    selectedFilter.name === f.name
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {f.name}
                </Button>
              ))}
            </div>

            {/* Sliders */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-200">
                  Brightness ({brightness.toFixed(2)})
                </label>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.02}
                  value={brightness}
                  onChange={(e) => setBrightness(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-200">
                  Contrast ({contrast.toFixed(0)})
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
