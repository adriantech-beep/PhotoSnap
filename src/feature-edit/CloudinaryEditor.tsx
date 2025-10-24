import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
import { removeBgFromServer } from "@/utils/removeBgFromServer";
import { motion, AnimatePresence } from "framer-motion";

interface CloudinaryEditorProps {
  publicIds: string[] | string;
  cloudName: string;
  onEdited: (urls: string[]) => void;
}

const CloudinaryEditor = ({
  publicIds,
  cloudName,
  onEdited,
}: CloudinaryEditorProps) => {
  const idsArray = Array.isArray(publicIds) ? publicIds : [publicIds];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [processedUrls, setProcessedUrls] = useState<string[]>(
    Array(idsArray.length).fill("")
  );
  const [statusText, setStatusText] = useState(
    "Starting background removal..."
  );
  const [isProcessing, setIsProcessing] = useState(true);

  const processNext = async (index: number) => {
    if (index >= idsArray.length) {
      setIsProcessing(false);
      setStatusText("✅ All photos processed!");
      onEdited(
        processedUrls.filter(Boolean).length
          ? processedUrls
          : idsArray.map(
              (id) =>
                `https://res.cloudinary.com/${cloudName}/image/upload/${id}`
            )
      );
      return;
    }

    const publicId = idsArray[index];
    const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.png`;

    try {
      setCurrentIndex(index);
      setStatusText(`Processing photo ${index + 1} of ${idsArray.length}...`);

      // Step 1: Remove background
      const cleanedImageUrl = await removeBgFromServer(imageUrl);

      // Step 2: Convert to blob and upload to Cloudinary
      const blob = await (await fetch(cleanedImageUrl)).blob();
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", "PhotoSnap-Upload");

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const uploadData = await uploadResponse.json();
      if (!uploadData.secure_url) throw new Error("Cloudinary upload failed");

      // Step 3: Store URL
      setProcessedUrls((prev) => {
        const updated = [...prev];
        updated[index] = uploadData.secure_url;
        return updated;
      });

      // Proceed to next after short delay
      setTimeout(() => processNext(index + 1), 800);
    } catch (error) {
      console.error(`❌ Error processing photo ${index + 1}:`, error);
      setStatusText(`Error processing photo ${index + 1}. Skipping...`);
      setTimeout(() => processNext(index + 1), 1000);
    }
  };

  useEffect(() => {
    // Automatically start processing when component mounts
    processNext(0);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full">
      <div className="text-lg font-semibold text-yellow-400">{statusText}</div>

      {/* Image Preview */}
      <div className="relative w-[480px] rounded-xl overflow-hidden shadow-lg">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={`https://res.cloudinary.com/${cloudName}/image/upload/${idsArray[currentIndex]}.png`}
            alt={`Photo ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="w-full h-auto rounded-lg object-cover border-4 border-yellow-300"
          />
        </AnimatePresence>
        <div className="absolute bottom-2 right-2 bg-black/70 text-yellow-300 text-xs px-2 py-1 rounded-md">
          {currentIndex + 1} / {idsArray.length}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 mt-4">
        {idsArray.map((id, idx) => {
          const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${id}.png`;
          const done = !!processedUrls[idx];
          return (
            <div
              key={id}
              className={`relative w-24 h-20 rounded-md overflow-hidden border-2 transition-all duration-300 ${
                idx === currentIndex
                  ? "border-yellow-400"
                  : "border-transparent opacity-70"
              }`}
            >
              <img
                src={thumbUrl}
                alt={`thumb-${idx}`}
                className="w-full h-full object-cover"
              />
              {done && (
                <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center text-white font-bold text-sm">
                  ✅
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Done Message */}
      {!isProcessing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-green-400 font-semibold mt-6"
        >
          🎉 All photos are ready for editing!
        </motion.div>
      )}
    </div>
  );
};

export default CloudinaryEditor;
