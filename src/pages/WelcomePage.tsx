import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-black text-yellow-50 flex flex-col items-center justify-center px-6">
      <div className="absolute top-4 left-6 flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-yellow-500 flex items-center justify-center text-black font-bold">
          P
        </div>
        <span className="font-semibold tracking-wide text-yellow-100">
          PhotoSnap
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="w-[340px] bg-zinc-900 border-yellow-500/20 text-center shadow-xl">
          <CardContent className="flex flex-col items-center justify-center space-y-6 mt-6">
            <div className="bg-yellow-600/20 rounded-xl p-6">
              <img
                src="/placeholder-hand.png"
                alt="PhotoSnap"
                className="w-24 h-24 object-contain mx-auto"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2 text-yellow-400">
                Welcome!
              </h1>
              <p className="text-sm text-yellow-100/80 leading-relaxed px-4">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Repellat, ad asperiores. Est eveniet exercitationem fugit
                aperiam assumenda vitae nisi consectetur.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center pb-6">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition-transform hover:scale-[1.02]"
            >
              <Link to="/booth">Start Your Editing Journey</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <footer className="absolute bottom-4 text-xs text-yellow-200/60 text-center">
        <p>
          PhotoSnap Demo • Created by
          <span className="font-medium text-yellow-400 ml-2">LikhaLabs</span>
        </p>
        <p className="text-[10px] mt-1">
          Made with ❤️ by
          <span className="text-yellow-500 font-semibold ml-2">PhotoSnap</span>
        </p>
      </footer>
    </div>
  );
};

export default WelcomePage;
