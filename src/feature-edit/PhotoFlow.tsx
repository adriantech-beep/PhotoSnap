import { useState } from "react";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import CloudinaryEditor from "./CloudinaryEditor";
import KonvaBackgroundEditor from "./KonvaBackgroundEditor";

const PhotoFlow = ({ photoBlob }: { photoBlob: Blob }) => {
  const [publicId, setPublicId] = useState<string | null>(null);
  const [editedUrl, setEditedUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    const res = await uploadToCloudinary(photoBlob);
    setPublicId(res.public_id);
  };

  return (
    <div>
      {!publicId && (
        <button onClick={handleUpload}>Upload to Cloudinary</button>
      )}

      {publicId && !editedUrl && (
        <CloudinaryEditor
          cloudName="dni2zk7ht"
          publicId={publicId}
          onEdited={setEditedUrl}
        />
      )}

      {editedUrl && (
        <KonvaBackgroundEditor
          imageUrl={editedUrl}
          onDone={(dataUrl) => console.log("Final image:", dataUrl)}
        />
      )}
    </div>
  );
};

export default PhotoFlow;
