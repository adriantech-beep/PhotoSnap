import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, RotateCcw } from "lucide-react";
import PhotoFlow from "./PhotoFlow";

const OpenCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsVideoOn(true);
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsVideoOn(false);
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = photoRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    canvas.toBlob((blob) => {
      if (blob) {
        setPhotoBlob(blob);
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
      }
    }, "image/png");
  };

  const handleRetake = async () => {
    setPhotoBlob(null);
    setPhotoPreview(null);
    setIsEditing(false);
    await startCamera();
  };

  if (isEditing && photoBlob) {
    return <PhotoFlow photoBlob={photoBlob} />;
  }

  return (
    <section className="flex flex-col items-center gap-6 p-6">
      <div className="relative border border-zinc-700 rounded-lg overflow-hidden bg-black w-[640px] h-[480px] flex justify-center items-center">
        {!photoPreview ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={photoPreview}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <canvas ref={photoRef} className="hidden" />

      <div className="flex gap-4">
        {!photoPreview ? (
          <>
            <Button
              onClick={isVideoOn ? stopCamera : startCamera}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black flex items-center gap-2"
            >
              <Video size={18} /> {isVideoOn ? "Stop Camera" : "Start Camera"}
            </Button>

            {isVideoOn && (
              <Button
                onClick={handleCapture}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold flex items-center gap-2"
              >
                <Camera size={18} /> Take Photo
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-400 text-black hover:bg-yellow-500 font-semibold"
            >
              Edit Photo
            </Button>
            <Button
              onClick={handleRetake}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw size={18} /> Retake
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default OpenCamera;
