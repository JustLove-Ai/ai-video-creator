"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TopToolbar } from "./TopToolbar";
import { LeftSidebar } from "./LeftSidebar";
import { VideoCanvas } from "./VideoCanvas";
import { TimelinePanel } from "./TimelinePanel";

export function VideoEditor() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [scenes, setScenes] = useState([
    {
      id: "1",
      content: "Welcome to our presentation! Today we'll explore the amazing world of AI-generated content.",
      duration: 5,
      elements: []
    }
  ]);
  const [activeSceneId, setActiveSceneId] = useState("1");

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <TopToolbar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Scene Management */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-80 bg-card border-r border-border flex flex-col"
        >
          <LeftSidebar
            scenes={scenes}
            setScenes={setScenes}
            activeSceneId={activeSceneId}
            setActiveSceneId={setActiveSceneId}
          />
        </motion.div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-muted/20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="flex-1 p-8 flex items-center justify-center"
          >
            <VideoCanvas
              activeScene={scenes.find(s => s.id === activeSceneId)}
              selectedTool={selectedTool}
              onSceneUpdate={(updatedScene) => {
                setScenes(prev => prev.map(s => s.id === activeSceneId ? updatedScene : s));
              }}
            />
          </motion.div>

          {/* Timeline at Bottom */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
            className="border-t border-border bg-card"
          >
            <TimelinePanel
              scenes={scenes}
              activeSceneId={activeSceneId}
              setActiveSceneId={setActiveSceneId}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}