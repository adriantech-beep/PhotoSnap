import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Video,
  RotateCcw,
  Timer,
  RefreshCcw,
  FlipHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PhotoFlow from "../feature-edit/PhotoFlow";

const OpenCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const [isVideoOn, setIsVideoOn] = useState(false);
  const [photoBlobs, setPhotoBlobs] = useState<Blob[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [isCountdown, setIsCountdown] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(3);
  const [pausedCountdown, setPausedCountdown] = useState<number | null>(null);
  const [showTimerOptions, setShowTimerOptions] = useState(false);

  const [rotation, setRotation] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  const maxShots = 4;
  const delayBetweenShots = 1500;

  const startCamera = async () => {
    if (isVideoOn) return;
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
      setPhotoBlobs([]);
      setPhotoPreviews([]);
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    if (isCountdown && countdown !== null) {
      setPausedCountdown(countdown);
    }

    setIsVideoOn(false);
    setIsCountdown(false);
    setCountdown(null);
  };

  /** COUNTDOWN **/
  const startCountdown = (duration: number, onEnd: () => void) => {
    let count = duration;
    setCountdown(count);
    setIsCountdown(true);

    countdownRef.current = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        setIsCountdown(false);
        onEnd();
      }
    }, 1000);
  };

  const pauseCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (isCountdown) {
      setPausedCountdown(countdown);
      setIsCountdown(false);
    }
  };

  const resumeCountdown = (onEnd: () => void) => {
    if (pausedCountdown && pausedCountdown > 0) {
      startCountdown(pausedCountdown, onEnd);
      setPausedCountdown(null);
    }
  };

  /** CAPTURE **/
  const capturePhoto = async (): Promise<Blob | null> => {
    if (isCapturing) return null;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = photoRef.current;
    if (!video || !canvas) {
      setIsCapturing(false);
      return null;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsCapturing(false);
      return null;
    }

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

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const previewUrl = URL.createObjectURL(blob);
          setPhotoBlobs((prev) => [...prev, blob]);
          setPhotoPreviews((prev) => [...prev, previewUrl]);
          setIsCapturing(false);
          resolve(blob);
        } else {
          setIsCapturing(false);
          resolve(null);
        }
      }, "image/png");
    });
  };

  /** BOOTH SESSION **/
  const startBoothSession = async () => {
    if (isVideoOn || isCapturing) return;
    await startCamera();
    let shot = 0;

    const takeNextShot = async () => {
      if (shot >= maxShots) {
        stopCamera();
        setTimeout(() => setIsEditing(true), 800);
        return;
      }

      startCountdown(timer, async () => {
        await capturePhoto();
        shot++;

        if (shot < maxShots) {
          setTimeout(() => takeNextShot(), delayBetweenShots);
        } else {
          stopCamera();
        }
      });
    };

    takeNextShot();
  };

  const handleRetake = async () => {
    stopCamera();
    setPhotoBlobs([]);
    setPhotoPreviews([]);
    setIsEditing(false);
    await startBoothSession();
  };

  const handleEditPhotos = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsEditing(true);
    }, 1200);
  };
  /** EDIT MODE **/
  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-screen bg-black text-yellow-400 text-2xl font-semibold"
      >
        Processing your photos...
      </motion.div>
    );
  }

  if (isEditing && photoBlobs.length > 0) {
    return <PhotoFlow photoBlobs={photoBlobs} autoStartUpload />;
  }

  /** UI **/
  return (
    <section className="flex flex-col items-center gap-6 p-4 md:p-6 w-full max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full">
        {/* CAMERA VIEW */}
        <div className="relative w-full md:w-[70%] aspect-video border border-yellow-500 rounded-2xl overflow-hidden bg-black/90 shadow-lg shadow-yellow-500/30 flex justify-center items-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isFlipped ? "scale-x-[-1]" : ""
            }`}
            style={{ transform: `rotate(${rotation}deg)` }}
          />
          <AnimatePresence mode="wait">
            {isCountdown && countdown !== null && (
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.2,
                  transition: { duration: 0.15 },
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center text-yellow-400 text-6xl md:text-8xl font-bold bg-black/50"
              >
                {countdown}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PREVIEWS */}
        <div className="flex flex-row md:flex-col gap-3 items-center md:items-start justify-center">
          {photoPreviews.map((url, index) => (
            <motion.img
              key={index}
              src={url}
              alt={`shot-${index + 1}`}
              className="w-28 h-20 md:w-44 md:h-36 object-cover rounded-lg border-2 border-yellow-400 shadow-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            />
          ))}
          {Array.from({ length: maxShots - photoPreviews.length }).map(
            (_, i) => (
              <div
                key={i}
                className="w-28 h-20 md:w-44 md:h-36 rounded-lg border-2 border-dashed border-yellow-700 bg-black/50"
              />
            )
          )}
        </div>
      </div>

      <canvas ref={photoRef} className="hidden" />

      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-4">
        {!isVideoOn && photoBlobs.length === 0 && (
          <Button
            onClick={startBoothSession}
            disabled={isVideoOn}
            variant="outline"
            className="rounded-full border-4 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black w-24 h-24 md:w-32 md:h-32 flex flex-col items-center justify-center text-base md:text-lg font-semibold transition-all duration-300"
          >
            <Camera size={20} className="md:size-22" />
            Start
          </Button>
        )}

        {isVideoOn && (
          <>
            <Button
              onClick={stopCamera}
              className="rounded-full border-4 border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center gap-1 text-sm md:text-lg font-semibold"
            >
              <Video size={28} />
              Stop
            </Button>

            <Button
              onClick={() => pauseCountdown()}
              disabled={!isCountdown}
              variant="outline"
              className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm md:text-lg px-4 py-2"
            >
              Pause
            </Button>

            <Button
              onClick={() =>
                resumeCountdown(async () => {
                  await capturePhoto();
                })
              }
              disabled={!pausedCountdown}
              variant="outline"
              className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm md:text-lg px-4 py-2"
            >
              Resume
            </Button>

            <div className="relative">
              <Button
                onClick={() => setShowTimerOptions((p) => !p)}
                variant="outline"
                disabled={isCapturing}
                className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm md:text-lg px-4 py-2 flex items-center gap-2"
              >
                <Timer size={18} /> Timer
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
              disabled={isCapturing}
              className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm md:text-lg px-4 py-2 flex items-center gap-2"
            >
              <RefreshCcw size={18} /> Rotate
            </Button>

            <Button
              onClick={() => setIsFlipped((f) => !f)}
              variant="outline"
              disabled={isCapturing}
              className="rounded-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black text-sm md:text-lg px-4 py-2 flex items-center gap-2"
            >
              <FlipHorizontal size={18} /> Flip
            </Button>
          </>
        )}

        {!isVideoOn && photoBlobs.length > 0 && (
          <>
            <Button
              onClick={handleEditPhotos}
              className="rounded-full bg-yellow-400 text-black hover:bg-yellow-500 font-semibold px-5 py-2 text-sm md:text-lg"
            >
              Edit
            </Button>

            <Button
              onClick={handleRetake}
              variant="outline"
              className="rounded-full flex items-center gap-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-5 py-2 text-sm md:text-lg"
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
