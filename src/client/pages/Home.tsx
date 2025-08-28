import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home as HomeIcon } from "lucide-react";

const Home: React.FC = () => {
  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <HomeIcon className="mx-auto mb-4" size={48} />
        <h1 className="text-4xl font-bold mb-4">Welcome to AiGate App</h1>
        <p className="text-lg text-gray-600 mb-8">
          React + Vite + Express with SSR
        </p>
        <Link
          to="/about"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to About
        </Link>
      </div>
    </motion.div>
  );
};

export default Home;
