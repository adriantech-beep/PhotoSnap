import { useEffect, useState, useRef } from "react";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { removeBgLocal } from "@/utils/removeBgLocal";
// import KonvaBackgroundEditor from "./KonvaBackgroundEditor";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import OverlayComposer from "./OverlayComposer";
// import RasterEditor from "./RasterEditor";

interface PhotoFlowProps {
  photoBlobs: Blob[];
  onComplete?: (finalUrls: string[]) => void;
  autoStartUpload?: boolean;
}

export default function PhotoFlow({
  photoBlobs,
  onComplete,
  autoStartUpload = false,
}: PhotoFlowProps) {
  const [stage, setStage] = useState<"upload" | "cleanup" | "edit" | "done">(
    "upload"
  );
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [uploaded, setUploaded] = useState<any[]>([]);
  const [cleanedBlobs, setCleanedBlobs] = useState<Blob[]>([]);
  const [finalUrls, setFinalUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasStartedUpload = useRef(false);

  const totalProgress =
    uploadProgress.length > 0
      ? uploadProgress.reduce((a, b) => a + b, 0) / uploadProgress.length
      : 0;

  /** ─────────── Auto Upload Originals (Backup) ─────────── **/
  useEffect(() => {
    if (!autoStartUpload || hasStartedUpload.current || !photoBlobs.length)
      return;

    hasStartedUpload.current = true;

    (async () => {
      try {
        setStage("upload");
        const results = [];
        setUploadProgress(new Array(photoBlobs.length).fill(0));

        for (let i = 0; i < photoBlobs.length; i++) {
          const blob = photoBlobs[i];
          const res = await uploadToCloudinary(blob);
          results.push(res);
          setUploadProgress((prev) => {
            const updated = [...prev];
            updated[i] = 100;
            return updated;
          });
        }

        setUploaded(results);
        console.log("Originals backed up:", results);
        setStage("cleanup");
      } catch (err) {
        console.error("Cloudinary backup failed:", err);
        setStage("cleanup");
      }
    })();
  }, [autoStartUpload, photoBlobs]);

  /** ─────────── Local Background Removal ─────────── **/
  useEffect(() => {
    if (stage !== "cleanup") return;

    (async () => {
      const cleaned: Blob[] = [];
      for (let i = 0; i < photoBlobs.length; i++) {
        try {
          const result = await removeBgLocal(photoBlobs[i]);
          cleaned.push(result);
        } catch (err) {
          console.warn(`⚠️ Failed to remove bg for image ${i}`, err);
          cleaned.push(photoBlobs[i]);
        }
      }
      setCleanedBlobs(cleaned);
      setStage("edit");
    })();
  }, [stage, photoBlobs]);

  /** ─────────── Final Upload (After Editing) ─────────── **/
  // const handleFinalUpload = async (dataUrl: string) => {
  //   try {
  //     const blob = await (await fetch(dataUrl)).blob();
  //     const result = await uploadToCloudinary(blob);

  //     setFinalUrls((prev) => {
  //       const updated = [...prev];
  //       updated[currentIndex] = result.secure_url;
  //       return updated;
  //     });

  //     if (currentIndex < photoBlobs.length - 1) {
  //       setCurrentIndex((i) => i + 1);
  //     } else {
  //       setStage("done");
  //       onComplete?.(finalUrls);
  //     }
  //   } catch (error) {
  //     console.error("Final upload failed:", error);
  //   }
  // };

  /** ─────────── Stage Descriptions ─────────── **/
  const stageText = {
    upload: "Uploading Original Photos...",
    cleanup: "Removing Backgrounds...",
    edit: "Preparing Photo Editor...",
    done: "All Photos Ready!",
  }[stage];

  const isLoading = stage === "upload" || stage === "cleanup";

  return (
    <section className="flex flex-col items-center justify-center h-screen text-center bg-black">
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key={stage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-8 text-yellow-400"
          >
            {/* Circular Progress Ring */}
            <div className="relative w-48 h-48">
              {/* Static outer ring */}
              <div className="absolute inset-0 border-[10px] border-yellow-800 rounded-full" />

              {/* Animated progress ring */}
              <motion.svg
                width="192"
                height="192"
                viewBox="0 0 120 120"
                className="absolute inset-0 rotate-[-90deg]"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#3f3f46"
                  strokeWidth="8"
                  fill="none"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#facc15"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * totalProgress) / 100}
                  strokeLinecap="round"
                  initial={false}
                  animate={{
                    strokeDashoffset: 314 - (314 * totalProgress) / 100,
                  }}
                  transition={{ ease: "easeInOut", duration: 0.4 }}
                />
              </motion.svg>

              {/* Center label */}
              <motion.div
                key={stage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-3xl font-bold"
              >
                {stage === "upload" ? `${Math.round(totalProgress)}%` : "..."}
              </motion.div>
            </div>

            {/* Stage text */}
            <motion.h2
              key={`${stage}-text`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl md:text-3xl font-bold"
            >
              {stageText}
            </motion.h2>

            {stage === "upload" && (
              <p className="text-yellow-300 text-sm">
                {uploadProgress.filter((p) => p === 100).length} /{" "}
                {photoBlobs.length} uploaded
              </p>
            )}
          </motion.div>
        )}

        {stage === "edit" && cleanedBlobs.length > 0 && (
          <motion.div
            key="edit-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <OverlayComposer imageBlobs={cleanedBlobs} />
          </motion.div>
        )}

        {stage === "done" && (
          <motion.div
            key="done-stage"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-green-400 to-yellow-400 p-8 rounded-2xl shadow-xl w-full max-w-lg"
          >
            <h2 className="text-3xl font-bold text-white">
              All Photos Ready 🎉
            </h2>
            <p className="text-white/80 text-sm">
              You can now view or download your edited photos.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {finalUrls.map((url, i) => (
                <motion.img
                  key={i}
                  src={url}
                  alt={`final-${i}`}
                  className="w-32 h-32 object-cover rounded-lg shadow-lg border-4 border-white"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                />
              ))}
            </div>

            <Button
              onClick={() => window.location.reload()}
              className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Start Over
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
