import { useState } from "react";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import CloudinaryEditor from "./CloudinaryEditor";
import KonvaBackgroundEditor from "./KonvaBackgroundEditor";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const PhotoFlow = ({ photoBlob }: { photoBlob: Blob }) => {
  const [publicId, setPublicId] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const res = await uploadToCloudinary(photoBlob);
      setPublicId(res.public_id);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinalUpload = async (dataUrl: string) => {
    try {
      setIsUploading(true);

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const result = await uploadToCloudinary(blob);
      setFinalUrl(result.secure_url);

      console.log("✅ Final image uploaded:", result.secure_url);
    } catch (error) {
      console.error("Failed to upload final image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-6">
      {!publicId && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-full shadow-inner">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="rounded-full px-6 py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              {isUploading ? "Uploading..." : "Upload Image 😊"}
            </Button>
          </div>
          <p className="text-gray-500 text-sm">
            Tap to start editing your photo
          </p>
        </div>
      )}

      {publicId && !editedUrl && (
        <CloudinaryEditor
          cloudName="dni2zk7ht"
          publicId={publicId}
          onEdited={(dataUrl) => {
            // Instead of uploading now, just store the data URL
            setEditedUrl(dataUrl);
          }}
        />
      )}

      {editedUrl && !finalUrl && (
        <KonvaBackgroundEditor
          imageUrl={editedUrl}
          onDone={handleFinalUpload}
        />
      )}

      {finalUrl && (
        <motion.div
          className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-yellow-400 to-yellow-600 p-8 rounded-2xl shadow-2xl space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-yellow-300 to-pink-400 blur-2xl opacity-70 animate-pulse"
              style={{ scale: 1.2 }}
            />
            <motion.img
              src={finalUrl}
              alt="Final"
              className="relative w-64 h-64 object-cover rounded-2xl shadow-2xl border-4 border-white"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
          </div>

          <motion.p
            className="text-white text-xl font-semibold flex items-center gap-2 bg-green-600 px-4 py-2 rounded-full shadow-md"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Upload Complete!
          </motion.p>

          <motion.a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-100 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium shadow-lg transition-transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            View on Cloudinary
          </motion.a>

          <motion.button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 bg-white/90 text-gray-700 font-semibold rounded-lg hover:bg-white transition-all duration-300 shadow-md hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Over
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default PhotoFlow;
