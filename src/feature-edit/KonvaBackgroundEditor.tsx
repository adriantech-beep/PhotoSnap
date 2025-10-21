import { useState, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";
import useImage from "use-image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Stage as KonvaStage } from "konva/lib/Stage";

const cloudName = "dni2zk7ht";

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
  {
    name: "Halloween 1",
    src: `https://res.cloudinary.com/${cloudName}/image/upload/v1761028026/Halloween-5_obtr43.jpg`,
  },
  {
    name: "Halloween 2",
    src: `https://res.cloudinary.com/${cloudName}/image/upload/v1761028023/Halloween-4_gtfu3z.jpg`,
  },
  {
    name: "Halloween 3",
    src: `https://res.cloudinary.com/${cloudName}/image/upload/v1761028008/Halloween-3_pbfadc.jpg`,
  },
  {
    name: "Halloween 4",
    src: `https://res.cloudinary.com/${cloudName}/image/upload/v1761028005/Halloween-2_wf1nlb.jpg`,
  },
  {
    name: "Halloween 5",
    src: `https://res.cloudinary.com/${cloudName}/image/upload/v1761028004/Halloween-1_lm1dxl.jpg`,
  },
];

interface KonvaBackgroundEditorProps {
  imageUrl: string;
  onDone: (dataUrl: string) => void;
}

export default function KonvaBackgroundEditor({
  imageUrl,
  onDone,
}: KonvaBackgroundEditorProps) {
  const [selectedBg, setSelectedBg] = useState<string>(backgrounds[0].src);
  const [subject] = useImage(imageUrl, "anonymous");
  const [background] = useImage(selectedBg, "anonymous");

  const stageRef = useRef<KonvaStage | null>(null);

  const handleExport = () => {
    const stage = stageRef.current;
    if (stage) {
      const dataUrl = stage.toDataURL({ pixelRatio: 2 });
      onDone(dataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold text-center text-white">
        Choose a Background
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full justify-items-center">
        {backgrounds.map((bg) => (
          <motion.div
            key={bg.name}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedBg(bg.src)}
            className={`cursor-pointer rounded-xl overflow-hidden border-4 transition-all duration-200 ${
              selectedBg === bg.src
                ? "border-blue-500 shadow-lg scale-105"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            <img
              src={bg.src}
              alt={bg.name}
              crossOrigin="anonymous"
              className="w-32 h-20 object-cover rounded-md"
            />
            <p className="text-sm text-center mt-1 text-gray-200">{bg.name}</p>
          </motion.div>
        ))}
      </div>

      <div className="relative border-4 border-gray-700 rounded-lg shadow-lg overflow-hidden">
        <Stage
          width={640}
          height={480}
          ref={stageRef}
          className="bg-black/20 rounded-lg"
        >
          <Layer>
            {background ? (
              <KonvaImage image={background} width={640} height={480} />
            ) : (
              <Rect width={640} height={480} fill="lightgray" />
            )}
            {subject && <KonvaImage image={subject} draggable />}
          </Layer>
        </Stage>
      </div>

      <Button
        onClick={handleExport}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
      >
        Save Final Image
      </Button>
    </div>
  );
}
