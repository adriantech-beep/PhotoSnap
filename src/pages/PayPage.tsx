import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

import { motion } from "framer-motion";
import axiosInstance from "@/services/axiosInstance";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const timeoutRef = useRef(0);

  // Function to simulate payment
  const handlePay = async () => {
    await axiosInstance.post(`/pay/${id}`);
    window.location.href = `/#/choose-control/${id}?device=mobile`;
  };

  // Reset the timeout when there's activity
  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      alert("⚠️ Session timed out. Returning to home screen.");
      navigate("/"); // Redirect back to home (QR generation)
    }, 60000); // 60 seconds of idle time
  };

  // Listen for user activity
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keypress", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimeout));

    resetTimeout(); // Start timer initially

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimeout)
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-yellow-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-[340px] bg-zinc-900 border-yellow-500/20 text-center shadow-lg">
          <CardContent className="py-10 space-y-5">
            <h1 className="text-2xl font-bold text-yellow-400">
              Pay ₱50 to Start Your Photo Session
            </h1>

            <Button
              onClick={handlePay}
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-8 py-6 rounded-full transition-transform hover:scale-[1.03]"
            >
              Pay Now
            </Button>

            <p className="text-yellow-100/70 text-sm">
              This is a simulated payment step. (Session will auto-reset after
              60s of inactivity)
            </p>
          </CardContent>

          <CardFooter className="flex justify-center pb-4 text-xs text-yellow-200/60">
            <p>Secure booth payment • Simulated transaction</p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
