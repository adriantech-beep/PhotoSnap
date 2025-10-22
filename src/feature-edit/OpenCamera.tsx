import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Video,
  RotateCcw,
  Timer,
  RefreshCcw,
  FlipHorizontal,
} from "lucide-react";
// import PhotoFlow from "./PhotoFlow";
import { motion, AnimatePresence } from "framer-motion";
import PhotoFlow from "./PhotoFlow";

const OpenCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(3);
  const [showTimerOptions, setShowTimerOptions] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: 16 / 9,
        },
      });
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

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = photoRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(isFlipped ? -1 : 1, 1);
    ctx.drawImage(
      video,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        setPhotoBlob(blob);
        setPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
      }
    }, "image/png");
  };

  const startCountdown = () => {
    setCountdown(timer);
    setIsCountdown(true);
  };

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (!prev) return null;
        if (prev === 1) {
          clearInterval(interval);
          setIsCountdown(false);
          handleCapture();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown]);

  const handleRetake = async () => {
    setPhotoBlob(null);
    setPhotoPreview(null);
    setIsEditing(false);
    await startCamera();
  };

  if (isEditing && photoBlob) {
    return <PhotoFlow photoBlob={photoBlob} />;
    // return <KonvaBackgroundEditor photoBlob={photoBlob} />;
  }

  return (
    <section className="flex flex-col items-center gap-6 p-6">
      <div className="relative border border-yellow-500 rounded-2xl overflow-hidden bg-black/90 shadow-lg shadow-yellow-500/30 w-[840px] h-[680px] flex justify-center items-center">
        {!photoPreview ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isFlipped ? "scale-x-[-1]" : ""
            }`}
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        ) : (
          <img
            src={photoPreview}
            alt="Captured"
            className="w-full h-full object-cover rounded-lg"
          />
        )}

        {!photoPreview && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`border ${(i + 1) % 3 === 0 ? "border-r-0" : ""} ${
                  i + 1 <= 6 ? "" : "border-b-0"
                } border-yellow-500/20`}
              ></div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {isCountdown && (
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center text-yellow-400 text-8xl font-bold bg-black/50"
            >
              {countdown}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <canvas ref={photoRef} className="hidden" />

      <div className="flex gap-4 items-center flex-wrap justify-center">
        {!photoPreview ? (
          <>
            <Button
              onClick={isVideoOn ? stopCamera : startCamera}
              variant="outline"
              className={`rounded-full border-4 flex flex-col items-center justify-center gap-2  text-lg font-semibold transition-all duration-300
    ${
      isVideoOn
        ? "border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 w-22 h-22"
        : "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black w-32 h-32"
    }`}
            >
              <Video size={36} />
              {isVideoOn ? "Stop" : "Start"}
            </Button>

            {isVideoOn && (
              <>
                <Button
                  onClick={startCountdown}
                  variant="outline"
                  className="rounded-full border-4 flex flex-col items-center justify-center gap-2 font-semibold transition-all duration-300 text-md w-22 h-22 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  <Camera size={20} /> Timer ({timer}s)
                </Button>

                <div className="relative">
                  <Button
                    onClick={() => setShowTimerOptions((p) => !p)}
                    variant="outline"
                    className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black flex items-center gap-2 px-6 py-3 text-lg"
                  >
                    <Timer size={20} /> Timer
                  </Button>
                  {showTimerOptions && (
                    <div className="absolute left-0 mt-2 bg-black border border-yellow-400 rounded-xl p-2 shadow-lg flex gap-2 z-20">
                      {[3, 5, 10].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            setTimer(t);
                            setShowTimerOptions(false);
                          }}
                          className={`px-3 py-1 rounded-md text-sm font-semibold ${
                            timer === t
                              ? "bg-yellow-400 text-black"
                              : "text-yellow-400 hover:bg-yellow-400/20"
                          }`}
                        >
                          {t}s
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  variant="outline"
                  className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black flex items-center gap-2 px-6 py-3 text-lg"
                >
                  <RefreshCcw size={20} /> Rotate
                </Button>

                <Button
                  onClick={() => setIsFlipped((f) => !f)}
                  variant="outline"
                  className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black flex items-center gap-2 px-6 py-3 text-lg"
                >
                  <FlipHorizontal size={20} /> Flip
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <Button
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-yellow-400 text-black hover:bg-yellow-500 font-semibold px-6 py-3 text-lg"
            >
              Edit Photo
            </Button>
            <Button
              onClick={handleRetake}
              variant="outline"
              className="rounded-full flex items-center gap-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-6 py-3 text-lg"
            >
              <RotateCcw size={20} /> Retake
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

export default OpenCamera;
