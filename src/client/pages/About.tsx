import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import "./App.css";
const About: React.FC = () => {
  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <Info className="mx-auto mb-4" size={48} />
        <h1 className="text-4xl font-bold mb-4">About Page</h1>
        <p className="text-lg text-gray-600 mb-8">
          This is the about page with SSR support
        </p>
        <Link
          to="/"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Home
        </Link>
      </div>
    </motion.div>
  );
};

export default About;
