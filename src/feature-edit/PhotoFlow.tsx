import { useEffect, useState, useRef, useCallback } from "react";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import CloudinaryEditor from "./CloudinaryEditor";
import KonvaBackgroundEditor from "./KonvaBackgroundEditor";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoFlowProps {
  photoBlobs: Blob[];
  onComplete?: (finalUrls: string[]) => void;
  autoStartUpload?: boolean;
}

const PhotoFlow = ({
  photoBlobs,
  onComplete,
  autoStartUpload = false,
}: PhotoFlowProps) => {
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [uploaded, setUploaded] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editedUrls, setEditedUrls] = useState<string[]>([]);
  const [finalUrls, setFinalUrls] = useState<string[]>([]);
  const [stage, setStage] = useState<"upload" | "cleanup" | "edit" | "done">(
    "upload"
  );

  const hasStartedUpload = useRef(false);

  /** ─────────── Upload Function (Memoized) ─────────── **/
  const handleBatchUpload = useCallback(async () => {
    if (!photoBlobs.length) return;

    setStage("upload");
    setIsUploading(true);
    setUploadProgress(new Array(photoBlobs.length).fill(0));

    try {
      const results = [];

      for (let i = 0; i < photoBlobs.length; i++) {
        const blob = photoBlobs[i];
        const res = await uploadToCloudinary(blob);
        results.push(res);
        setUploadProgress((prev) => {
          const updated = [...prev];
          updated[i] = 100;
          return updated;
        });
        await new Promise((r) => setTimeout(r, 400)); // small pacing delay
      }

      setUploaded(results);
      setStage("cleanup");
    } catch (error) {
      console.error("Batch upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  }, [photoBlobs]);

  /** ─────────── Auto Upload Effect ─────────── **/
  useEffect(() => {
    if (autoStartUpload && !hasStartedUpload.current && photoBlobs.length > 0) {
      hasStartedUpload.current = true; // run only once
      handleBatchUpload();
    }
  }, [autoStartUpload, handleBatchUpload, photoBlobs]);

  /** ─────────── Handle Final Upload ─────────── **/
  const handleFinalUpload = async (dataUrl: string) => {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const result = await uploadToCloudinary(blob);

      setFinalUrls((prev) => {
        const updated = [...prev];
        updated[currentIndex] = result.secure_url;
        return updated;
      });

      if (currentIndex < uploaded.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        const allFinals = [...finalUrls];
        allFinals[currentIndex] = result.secure_url;
        setFinalUrls(allFinals);
        setStage("done");
        onComplete?.(allFinals);
      }
    } catch (error) {
      console.error("Final upload failed:", error);
    }
  };

  const stageLabel = {
    upload: "📤 Uploading Photos",
    cleanup: "🧼 Removing Backgrounds",
    edit: "🎨 Background Editing",
    done: "✅ All Photos Ready!",
  }[stage];

  return (
    <section className="flex flex-col items-center justify-center p-6 w-full max-w-6xl mx-auto space-y-10 text-center">
      {/* Stage Header */}
      <motion.h2
        key={stage}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-2xl md:text-3xl font-bold text-yellow-400"
      >
        {stageLabel}
      </motion.h2>

      <AnimatePresence mode="wait">
        {/* ─── UPLOAD PHASE ─── */}
        {stage === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            {isUploading ? (
              <>
                <p className="text-yellow-300 font-medium">
                  Uploading {uploadProgress.filter((p) => p === 100).length} /{" "}
                  {photoBlobs.length} photos...
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {photoBlobs.map((_, i) => (
                    <div
                      key={i}
                      className="w-24 h-24 bg-black/60 border-2 border-yellow-400 rounded-lg flex items-center justify-center relative"
                    >
                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-yellow-500"
                        style={{
                          width: `${uploadProgress[i]}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                      <span className="text-yellow-400 font-semibold z-10 text-sm">
                        {uploadProgress[i]}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-yellow-400 mt-4"
              >
                Preparing upload...
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── CLEANUP PHASE ─── */}
        {stage === "cleanup" && uploaded.length > 0 && (
          <motion.div
            key="cleanup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            <CloudinaryEditor
              cloudName="dni2zk7ht"
              publicIds={uploaded.map((u) => u.public_id)}
              onEdited={(urls) => {
                console.log("🧼 Cleaned URLs received:", urls);
                if (urls.length === 0) {
                  console.warn(
                    "⚠️ No cleaned images returned — falling back to originals."
                  );
                  const fallbackUrls = uploaded.map(
                    (u) =>
                      `https://res.cloudinary.com/dni2zk7ht/image/upload/${u.public_id}`
                  );
                  setEditedUrls(fallbackUrls);
                } else {
                  setEditedUrls(urls);
                }
                setStage("edit");
              }}
            />
          </motion.div>
        )}

        {/* ─── EDIT PHASE ─── */}
        {stage === "edit" && editedUrls.length > 0 && (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            <KonvaBackgroundEditor
              imageUrls={editedUrls}
              onDone={handleFinalUpload}
            />
          </motion.div>
        )}

        {/* ─── DONE PHASE ─── */}
        {stage === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-green-400 to-yellow-400 p-8 rounded-2xl shadow-xl w-full max-w-lg"
          >
            <h2 className="text-2xl font-bold text-white">
              All Photos Ready 🎉
            </h2>

            <p className="text-white/80 text-sm">
              Backgrounds removed and uploaded successfully.
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
};

export default PhotoFlow;
