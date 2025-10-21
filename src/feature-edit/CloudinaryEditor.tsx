import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { removeBgFromServer } from "@/utils/removeBgFromServer";

interface CloudinaryEditorProps {
  publicId: string;
  cloudName: string;
  onEdited: (url: string) => void;
}

const CloudinaryEditor = ({
  publicId,
  cloudName,
  onEdited,
}: CloudinaryEditorProps) => {
  const [editorReady, setEditorReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPublicId, setCurrentPublicId] = useState(publicId);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://media-editor.cloudinary.com/all.js";
    script.async = true;
    script.onload = () => setEditorReady(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openEditor = () => {
    // @ts-ignore
    const editor = window.cloudinary.mediaEditor();
    editor.update({
      cloudName,
      publicIds: [currentPublicId],
      steps: ["resize", "crop", "rotate", "overlay", "export"],
    });
    editor.show();

    editor.on("export", (data: any) => {
      onEdited(data.secure_url || data.url);
      editor.hide();
    });
  };

  const handleRemoveBackground = async () => {
    try {
      setLoading(true);

      const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${currentPublicId}.png`;

      const cleanedImage = await removeBgFromServer(imageUrl);

      const blob = await (await fetch(cleanedImage)).blob();

      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", "PhotoSnap-Upload");

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const uploadData = await uploadResponse.json();
      if (!uploadData.secure_url) throw new Error("Cloudinary upload failed");

      setCurrentPublicId(uploadData.public_id);
      onEdited(uploadData.secure_url);
    } catch (error) {
      console.error("❌ Background removal error:", error);
      alert(
        "Background removal failed. Please try again or check your backend logs."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!editorReady) return <p className="text-center">Loading editor...</p>;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-3xl">
        <img
          src={`https://res.cloudinary.com/${cloudName}/image/upload/${currentPublicId}.png`}
          alt="preview"
          className="w-full h-auto rounded-md shadow-md"
        />
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          onClick={handleRemoveBackground}
          disabled={loading}
          className={`rounded-full px-6 py-3 text-base font-semibold shadow-md transition-all duration-300 ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-lg hover:scale-105"
          }`}
        >
          {loading ? "Processing..." : "✨ Remove Background"}
        </Button>

        <Button
          onClick={openEditor}
          className="rounded-full px-6 py-3 text-base font-semibold shadow-md bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          🎨 Edit Quality
        </Button>
      </div>
    </div>
  );
};

export default CloudinaryEditor;
