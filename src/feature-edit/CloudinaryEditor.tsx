import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChristmasTree from "@/assets/Christmas-Themed-Images/Christmas-Tree-Bg.jpg";
import ChristmasAlley from "@/assets/Christmas-Themed-Images/Christmas-Alley-Bg.jpg";
import ChristmasNipaHut from "@/assets/Christmas-Themed-Images/Christmas-NipaHut.jpg";
import ChristmasPineTree from "@/assets/Christmas-Themed-Images/Christmas-PineTrees.jpg";
import ChristmasLightBlurred from "@/assets/Christmas-Themed-Images/Christmas-Light-Blurred-Bg.jpg";

const backgrounds = [
  {
    name: ChristmasTree,
    publicId: "Christmas-Tree-Bg_b772km",
  },
  {
    name: ChristmasAlley,
    publicId: "Christmas-Alley-Bg_xwmdkt",
  },
  {
    name: ChristmasNipaHut,
    publicId: "Christmas-NipaHut_fcam5s",
  },
  {
    name: ChristmasPineTree,
    publicId: "Christmas-PineTrees_cbouc5",
  },
  {
    name: ChristmasLightBlurred,
    publicId: "Christmas-Light-Blurred-Bg_yqmuce",
  },
];

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
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPublicId, setCurrentPublicId] = useState(publicId);
  const [prompt, setPrompt] = useState("a beach at sunset");

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
      console.log("Exported:", data);
      onEdited(data.secure_url || data.url);
      editor.hide();
      setIsEditing(false);
    });
  };

  
  const handleRemoveBackground = async () => {
    await runTransformation("e_background_removal,f_png");
  };

  const runTransformation = async (effect: string) => {
    try {
      setLoading(true);

      const transformedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${effect}/${currentPublicId}.png`;

      console.log("🔗 Transformed URL:", transformedUrl);

      const response = await fetch(transformedUrl, { mode: "cors" });
      if (!response.ok)
        throw new Error(`Transformation failed: ${response.statusText}`);

      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", "PhotoSnap-Upload"); // ⚠️ must match your preset name

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const uploadData = await uploadResponse.json();
      if (!uploadData.secure_url) throw new Error("Upload failed");

      console.log("✅ Upload success:", uploadData.secure_url);

      setCurrentPublicId(uploadData.public_id);
      onEdited(uploadData.secure_url);
    } catch (err) {
      console.error("❌ Error applying effect:", err);
      alert(
        "Background removal failed. Ensure your Cloudinary account has the AI Background Removal add-on enabled."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApplyBackground = async (bgPublicId: string) => {
    try {
      setLoading(true);

      const transformedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/l_${currentPublicId},g_center/${bgPublicId}.png`;

      console.log("🔗 Combined URL:", transformedUrl);

      const response = await fetch(transformedUrl);
      if (!response.ok) throw new Error("Failed to merge background");
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", "PhotoSnap-Upload");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await uploadRes.json();
      if (!data.secure_url) throw new Error("Upload failed");

      setCurrentPublicId(data.public_id);
      onEdited(data.secure_url);
    } catch (err) {
      console.error(err);
      alert("Error merging background");
    } finally {
      setLoading(false);
    }
  };

  if (!editorReady) return <p className="text-center">Loading editor...</p>;

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={`https://res.cloudinary.com/${cloudName}/image/upload/${currentPublicId}.png`}
        alt="preview"
        className="w-80 h-auto rounded-md shadow-md"
      />

      <div className="flex flex-col gap-2 items-center">
        <select
          onChange={(e) => handleApplyBackground(e.target.value)}
          className="border rounded-md p-2"
          defaultValue=""
        >
          <option value="">Select background...</option>
          {backgrounds.map((bg) => (
            <option key={bg.publicId} value={bg.publicId}>
              {bg.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your desired background..."
          className="w-64"
        />
        <Button
          onClick={handleRemoveBackground}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          {loading ? "Replacing..." : "Replace Background"}
        </Button>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleRemoveBackground}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? "Removing..." : "Remove Background"}
        </Button>

        <Button
          onClick={() => {
            setIsEditing(true);
            openEditor();
          }}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
        >
          Open Editor
        </Button>
      </div>
    </div>
  );
};

export default CloudinaryEditor;
