// import { useEffect, useMemo, useRef, useState, useCallback } from "react";
// import { Stage, Layer, Image as KonvaImage, Rect, Group } from "react-konva";
// import useImage from "use-image";
// import Konva from "konva";
// import { Button } from "@/components/ui/button";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Images,
//   LayoutList,
//   SlidersHorizontal,
//   Printer,
//   Save,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import type { Stage as KonvaStage } from "konva/lib/Stage";
// import type { Image as KonvaImageType } from "konva/lib/shapes/Image";

// const cloudName = "dni2zk7ht";

// /* ----------------------------- DATA ----------------------------- */
// const overlays = [
//   {
//     name: "Flower-Themed-1",
//     src: `https://res.cloudinary.com/${cloudName}/image/upload/v1761195481/2x6_flower_overlay_qhp9u7.png`,
//   },
//   {
//     name: "Halloween-Themed-1",
//     src: `https://res.cloudinary.com/${cloudName}/image/upload/v1761195480/2x6_halloween_1_overlay_w8zjjh.png`,
//   },
// ];

// type LayoutSpec = { name: string; width: number; height: number };
// const layouts: LayoutSpec[] = [
//   { name: "4x6", width: 640, height: 960 },
//   { name: "Photo Strip 2x6", width: 600, height: 1800 },
//   { name: "2x2 Grid", width: 900, height: 900 },
// ];

// const filterOptions = [
//   { name: "Normal", fns: [] },
//   { name: "Grayscale", fns: [Konva.Filters.Grayscale] },
//   { name: "Sepia", fns: [Konva.Filters.Sepia] },
//   { name: "Bright", fns: [Konva.Filters.Brighten], brightness: 0.2 },
//   { name: "Contrast", fns: [Konva.Filters.Contrast], contrast: 30 },
// ];

// type TemplateMode = "single" | "strip";

// interface KonvaBackgroundEditorProps {
//   imageUrls: string[];
//   onDone: (dataUrl: string) => void;
// }

// /* --------------------------- COMPONENT --------------------------- */
// export default function KonvaBackgroundEditor({
//   imageUrls,
//   onDone,
// }: KonvaBackgroundEditorProps) {
//   const [templateMode, setTemplateMode] = useState<TemplateMode>("strip");
//   const [layout, setLayout] = useState<LayoutSpec>(layouts[1]);
//   const [selectedOverlay, setSelectedOverlay] = useState(overlays[0]);
//   const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
//   const [brightness, setBrightness] = useState(selectedFilter.brightness ?? 0);
//   const [contrast, setContrast] = useState(selectedFilter.contrast ?? 0);

//   // Load images
//   const subjects = imageUrls.map((url) => useImage(url, "anonymous")[0]);
//   const [overlay] = useImage(selectedOverlay?.src || "", "anonymous");

//   const stageRef = useRef<KonvaStage | null>(null);
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const subjectRefs = useRef<(KonvaImageType | null)[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [scale, setScale] = useState(1);
//   const [feedback, setFeedback] = useState<string | null>(null);

//   /* ---------------------- Auto Scale Stage ---------------------- */
//   useEffect(() => {
//     const handleResize = () => {
//       if (!containerRef.current || !stageRef.current) return;
//       const containerWidth = containerRef.current.offsetWidth;
//       const scaleFactor = containerWidth / layout.width;
//       setScale(scaleFactor < 1 ? scaleFactor : 1);
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [layout]);

//   /* ------------------------ Apply Filters ----------------------- */
//   useEffect(() => {
//     subjectRefs.current.forEach((ref) => {
//       if (!ref) return;
//       ref.cache();
//       ref.filters(selectedFilter.fns);
//       if (selectedFilter.fns.includes(Konva.Filters.Brighten))
//         ref.brightness(brightness);
//       else ref.brightness(0);
//       if (selectedFilter.fns.includes(Konva.Filters.Contrast))
//         ref.contrast(contrast);
//       else ref.contrast(0);
//       ref.getLayer()?.batchDraw();
//     });
//   }, [selectedFilter, brightness, contrast, subjects]);

//   /* -------------------------- Export ---------------------------- */
//   const showFeedback = useCallback((msg: string) => {
//     setFeedback(msg);
//     setTimeout(() => setFeedback(null), 1500);
//   }, []);

//   const handleExport = () => {
//     const stage = stageRef.current;
//     if (!stage) return;
//     const url = stage.toDataURL({ pixelRatio: 2 });
//     onDone(url);
//     showFeedback("✅ Exported successfully!");
//   };

//   const handlePrint = () => {
//     const stage = stageRef.current;
//     if (!stage) return;
//     const dataUrl = stage.toDataURL({ pixelRatio: 2 });
//     const w = window.open("", "_blank");
//     if (!w) return;
//     w.document.write(`<img src="${dataUrl}" style="width:100%">`);
//     w.print();
//     showFeedback("🖨️ Printing...");
//   };

//   /* --------------------------- Frames --------------------------- */
//   const stripFrames = useMemo(() => {
//     const frameCount = 4;
//     const gutter = 20;
//     const padding = 30;
//     const innerW = layout.width - padding * 2;
//     const innerH = layout.height - padding * 2;
//     const frameH = (innerH - gutter * (frameCount - 1)) / frameCount;
//     return new Array(frameCount).fill(0).map((_, i) => ({
//       x: padding,
//       y: padding + i * (frameH + gutter),
//       width: innerW,
//       height: frameH,
//       radius: 18,
//     }));
//   }, [layout]);

//   const gridFrames = useMemo(() => {
//     const rows = 2;
//     const cols = 2;
//     const gutter = 20;
//     const padding = 30;
//     const cellW = (layout.width - padding * 2 - gutter * (cols - 1)) / cols;
//     const cellH = (layout.height - padding * 2 - gutter * (rows - 1)) / rows;
//     const frames: any[] = [];
//     for (let y = 0; y < rows; y++) {
//       for (let x = 0; x < cols; x++) {
//         frames.push({
//           x: padding + x * (cellW + gutter),
//           y: padding + y * (cellH + gutter),
//           width: cellW,
//           height: cellH,
//           radius: 16,
//         });
//       }
//     }
//     return frames;
//   }, [layout]);

//   /* -------------------------- UI -------------------------- */
//   const [activePanel, setActivePanel] = useState<
//     null | "templates" | "layouts" | "filters"
//   >(null);

//   return (
//     <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 w-full min-h-[760px] bg-gradient-to-br from-[#0b0f19] via-black to-[#10151f] p-6 rounded-2xl shadow-2xl">
//       {/* Toolbar */}
//       <div className="flex md:flex-col items-center justify-center gap-4 md:gap-5">
//         {[
//           {
//             key: "templates",
//             icon: <Images size={26} />,
//             color: "bg-fuchsia-500",
//           },
//           {
//             key: "layouts",
//             icon: <LayoutList size={26} />,
//             color: "bg-sky-500",
//           },
//           {
//             key: "filters",
//             icon: <SlidersHorizontal size={26} />,
//             color: "bg-emerald-500",
//           },
//         ].map(({ key, icon, color }) => (
//           <motion.button
//             key={key}
//             onClick={() =>
//               setActivePanel(activePanel === key ? null : (key as any))
//             }
//             className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white ${color} shadow-lg hover:scale-110 transition-transform`}
//             animate={{
//               boxShadow:
//                 activePanel === key
//                   ? "0 0 15px rgba(255,255,255,0.7)"
//                   : "0 0 0 rgba(0,0,0,0)",
//             }}
//           >
//             {icon}
//           </motion.button>
//         ))}

//         <motion.button
//           onClick={handlePrint}
//           className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-black bg-amber-400 shadow-lg hover:scale-110"
//         >
//           <Printer size={26} />
//         </motion.button>

//         <motion.button
//           onClick={handleExport}
//           className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white bg-lime-600 shadow-lg hover:scale-110"
//         >
//           <Save size={26} />
//         </motion.button>
//       </div>

//       {/* Stage */}
//       <div
//         ref={containerRef}
//         className="relative border-[10px] border-amber-400 rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.75)] overflow-hidden flex justify-center items-center w-full max-w-[95vw] md:max-w-[70%]"
//       >
//         <Stage
//           width={layout.width}
//           height={layout.height}
//           ref={stageRef}
//           scaleX={scale}
//           scaleY={scale}
//         >
//           <Layer>
//             {overlay && (
//               <KonvaImage
//                 image={overlay}
//                 width={layout.width}
//                 height={layout.height}
//                 listening={false}
//               />
//             )}

//             {templateMode === "strip" &&
//               stripFrames.map((f, i) => {
//                 const subject = subjects[i % subjects.length];
//                 return (
//                   <Group key={i}>
//                     <Rect
//                       x={f.x}
//                       y={f.y}
//                       width={f.width}
//                       height={f.height}
//                       cornerRadius={f.radius}
//                       fill="#111827"
//                       stroke="#e5e7eb"
//                       strokeWidth={2}
//                     />
//                     {subject && (
//                       <KonvaImage
//                         ref={(el) => (subjectRefs.current[i] = el)}
//                         image={subject}
//                         x={f.x + f.width * 0.25}
//                         y={f.y + f.height * 0.25}
//                         width={f.width * 0.5}
//                         height={f.height * 0.5}
//                         draggable
//                       />
//                     )}
//                   </Group>
//                 );
//               })}

//             {layout.name === "2x2 Grid" &&
//               gridFrames.map((f, i) => {
//                 const subject = subjects[i % subjects.length];
//                 return (
//                   <Group key={i}>
//                     <Rect
//                       x={f.x}
//                       y={f.y}
//                       width={f.width}
//                       height={f.height}
//                       cornerRadius={f.radius}
//                       fill="#111827"
//                       stroke="#e5e7eb"
//                       strokeWidth={2}
//                     />
//                     {subject && (
//                       <KonvaImage
//                         ref={(el) => (subjectRefs.current[i] = el)}
//                         image={subject}
//                         x={f.x + f.width * 0.15}
//                         y={f.y + f.height * 0.1}
//                         width={f.width * 0.7}
//                         height={f.height * 0.8}
//                         draggable
//                       />
//                     )}
//                   </Group>
//                 );
//               })}
//           </Layer>
//         </Stage>
//       </div>

//       {/* Floating Panels */}
//       <AnimatePresence>
//         {activePanel === "layouts" && (
//           <motion.div
//             initial={{ x: -18, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: -18, opacity: 0 }}
//             className="absolute left-28 top-8 bg-black/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/10 max-w-xs"
//           >
//             <h3 className="text-sky-300 font-semibold mb-3">Layouts</h3>
//             <div className="flex flex-col gap-2">
//               {layouts.map((l) => (
//                 <Button
//                   key={l.name}
//                   onClick={() => setLayout(l)}
//                   className={`rounded-full justify-between ${
//                     layout.name === l.name
//                       ? "bg-sky-500 text-white"
//                       : "bg-gray-700 text-white hover:bg-gray-600"
//                   }`}
//                 >
//                   {l.name}
//                 </Button>
//               ))}
//             </div>
//           </motion.div>
//         )}

//         {activePanel === "filters" && (
//           <motion.div
//             initial={{ x: -18, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: -18, opacity: 0 }}
//             className="absolute left-28 top-8 bg-black/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/10 max-w-xs"
//           >
//             <h3 className="text-emerald-300 font-semibold mb-3">Filters</h3>
//             <div className="flex flex-wrap gap-2 mb-4 relative">
//               {filterOptions.map((f) => (
//                 <Button
//                   key={f.name}
//                   onClick={() => setSelectedFilter(f)}
//                   className={`relative rounded-full px-4 ${
//                     selectedFilter.name === f.name
//                       ? "bg-emerald-500 text-white"
//                       : "bg-gray-700 text-white hover:bg-gray-600"
//                   }`}
//                 >
//                   {f.name}
//                   {selectedFilter.name === f.name && (
//                     <motion.span
//                       layoutId="activeFilterDot"
//                       className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
//                     />
//                   )}
//                 </Button>
//               ))}
//             </div>

//             <div className="space-y-3">
//               <div>
//                 <label className="text-xs text-gray-200">
//                   Brightness ({brightness.toFixed(2)})
//                 </label>
//                 <input
//                   type="range"
//                   min={-1}
//                   max={1}
//                   step={0.02}
//                   value={brightness}
//                   onChange={(e) => setBrightness(parseFloat(e.target.value))}
//                   className="w-full"
//                 />
//               </div>
//               <div>
//                 <label className="text-xs text-gray-200">
//                   Contrast ({contrast.toFixed(0)})
//                 </label>
//                 <input
//                   type="range"
//                   min={-100}
//                   max={100}
//                   step={1}
//                   value={contrast}
//                   onChange={(e) => setContrast(parseInt(e.target.value))}
//                   className="w-full"
//                 />
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Navigation for single photo mode */}
//       {templateMode === "single" && imageUrls.length > 1 && (
//         <div className="absolute bottom-6 flex gap-3">
//           <Button
//             onClick={() =>
//               setCurrentIndex((i) => (i > 0 ? i - 1 : imageUrls.length - 1))
//             }
//             variant="outline"
//             className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
//           >
//             <ChevronLeft />
//           </Button>
//           <Button
//             onClick={() => setCurrentIndex((i) => (i + 1) % imageUrls.length)}
//             variant="outline"
//             className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
//           >
//             <ChevronRight />
//           </Button>
//         </div>
//       )}

//       {/* Feedback banner */}
//       <AnimatePresence>
//         {feedback && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 10 }}
//             className="absolute bottom-8 bg-green-500/80 text-white px-6 py-3 rounded-full shadow-lg font-semibold"
//           >
//             {feedback}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
