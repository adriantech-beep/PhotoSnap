import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import axiosInstance from "../services/axiosInstance";

const QRPage = () => {
  const [qrUrl, setQrUrl] = useState(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log(qrUrl);

  useEffect(() => {
    axiosInstance
      .post("/create-session")
      .then((res) => {
        setQrUrl(res.data.qrUrl);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to create session:", err);
        setLoading(false);
      });

    socket.on("paymentSuccess", () => {
      setPaid(true);
      setTimeout(() => (window.location.href = "/#/edit"));
    });

    return () => {
      socket.off("paymentSuccess");
    };
  }, []);

  if (paid)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-screen bg-black text-yellow-400"
      >
        <h1 className="text-4xl font-bold mb-4 animate-bounce">
          ✅ Payment Received!
        </h1>
        <p className="text-lg text-yellow-200">Starting photo session...</p>
      </motion.div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-yellow-400 mb-3">
          Scan to Start Your Session
        </h1>
        <p className="text-yellow-200/80 mb-6">
          ₱50 per session • Secure Payment
        </p>

        <Card className="bg-zinc-900 border border-yellow-400/20 shadow-xl p-8 rounded-2xl">
          <CardContent className="flex flex-col items-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[220px] w-[220px]">
                <Loader2 className="animate-spin text-yellow-400 w-10 h-10 mb-4" />
                <p className="text-yellow-300 text-sm">Generating QR...</p>
              </div>
            ) : (
              <>
                <QRCodeSVG
                  value={qrUrl ?? ""}
                  size={220}
                  bgColor="#000000"
                  fgColor="#FACC15"
                />
                <p className="text-yellow-100/70 text-sm mt-3">
                  Scan using your phone’s camera
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-yellow-300/50 mt-6 tracking-wide">
          Powered by Lorem ipsum dolor sit amet consectetur adipisicing.
        </p>
      </motion.div>
    </div>
  );
};

export default QRPage;
