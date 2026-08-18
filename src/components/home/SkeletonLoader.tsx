"use client";

import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  count?: number;
  type?: "worker" | "category";
}

export default function SkeletonLoader({ count = 3, type = "worker" }: SkeletonLoaderProps) {
  if (type === "category") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 mx-auto gap-4 max-w-6xl">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 animate-pulse mb-4" />
            <div className="h-4 sm:h-5 w-24 sm:w-28 bg-gray-100 rounded-lg animate-pulse mb-2" />
            <div className="h-3 w-16 sm:w-20 bg-gray-100 rounded-full animate-pulse" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100"
        >
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-14 h-14 bg-gray-100 rounded-xl animate-pulse shrink-0" />
            <div className="flex-1">
              <div className="h-5 w-28 bg-gray-100 rounded-lg animate-pulse mb-2" />
              <div className="h-4 w-20 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg px-3 py-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3.5 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm mb-4">
            <div className="h-4 w-14 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
