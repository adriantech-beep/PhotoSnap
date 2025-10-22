import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  transports: ["websocket"],
});

export default function ChooseControlPage() {
  const { id: sessionId } = useParams();
  const [selected, setSelected] = useState<"booth" | "mobile" | null>(null);
  const [message, setMessage] = useState("Waiting for someone to choose...");

  useEffect(() => {
    socket.emit("joinSession", sessionId);

    const query = new URLSearchParams(window.location.hash.split("?")[1]);
    const device = query.get("device") || "booth";
    console.log("Detected device:", device);

    socket.emit("getControlMode", { sessionId });

    socket.on("controlModeSelected", ({ controlMode }) => {
      console.log("controlModeSelected received:", controlMode);

      if (controlMode === device) {
        setMessage("You are now controlling the editing!");
        setTimeout(() => {
          window.location.href = `/#/live/${sessionId}?device=${device}`;
        }, 1000);
      } else {
        setMessage(
          `Editing is controlled on the ${
            controlMode === "booth" ? "booth" : "mobile"
          } device.`
        );
      }
    });

    return () => {
      socket.off("controlModeSelected");
    };
  }, [sessionId]);

  const handleSelect = (mode: "booth" | "mobile") => {
    if (selected) return;
    setSelected(mode);
    setMessage(`You selected ${mode} control...`);
    socket.emit("setControlMode", { sessionId, controlMode: mode });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-50 text-center">
      <h1 className="text-2xl font-bold mb-6 text-yellow-400">
        Who will control the editing?
      </h1>

      <div className="flex gap-4">
        <button
          disabled={!!selected}
          className="px-6 py-3 bg-yellow-500 text-black rounded-lg font-semibold disabled:opacity-50"
          onClick={() => handleSelect("booth")}
        >
          Control on Booth
        </button>

        <button
          disabled={!!selected}
          className="px-6 py-3 bg-yellow-500 text-black rounded-lg font-semibold disabled:opacity-50"
          onClick={() => handleSelect("mobile")}
        >
          Control on Mobile
        </button>
      </div>

      <p className="mt-4 text-yellow-200/70">{message}</p>
    </div>
  );
}
