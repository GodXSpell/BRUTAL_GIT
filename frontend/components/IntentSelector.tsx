"use client";

import { motion } from "framer-motion";
import { Intent } from "../lib/api";

interface IntentSelectorProps {
  onSelectIntent: (intent: Intent) => void;
}

const intents = [
  {
    key: "CONTRIBUTOR" as Intent,
    emoji: "🔨",
    title: "Contributor",
    desc: "Find open issues matching your stack.",
    colorClass: "hover:bg-primary hover:text-black",
  },
  {
    key: "LEARNER" as Intent,
    emoji: "📖",
    title: "Learner",
    desc: "Well-documented starter projects.",
    colorClass: "hover:bg-secondary hover:text-black",
  },
  {
    key: "BUILDER" as Intent,
    emoji: "🏗️",
    title: "Builder",
    desc: "Heavy architecture and tools.",
    colorClass: "hover:bg-tertiary-container hover:text-white",
  },
];

export function IntentSelector({ onSelectIntent }: IntentSelectorProps) {
  return (
    <div className="w-full mt-4">
      <h3 className="font-headline-lg text-xl uppercase mb-4 text-white">Select Operation Mode</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {intents.map((intent, idx) => (
          <motion.button
            key={intent.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelectIntent(intent.key)}
            className={`border-4 border-white bg-surface p-6 brutal-shadow-level-2 hover:brutal-shadow-level-1 hover:translate-x-[4px] hover:translate-y-[4px] text-left flex flex-col transition-all duration-200 group active:shadow-none active:translate-x-[8px] active:translate-y-[8px] ${intent.colorClass}`}
          >
            <span className="text-4xl mb-4 bg-black border-2 border-white p-2 self-start brutal-shadow-level-1 group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
              {intent.emoji}
            </span>
            <h4 className="font-headline-lg text-xl text-white font-bold uppercase mb-2 group-hover:text-inherit">
              {intent.title}
            </h4>
            <p className="font-body-md text-sm text-zinc-400 group-hover:text-inherit opacity-90">
              {intent.desc}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
