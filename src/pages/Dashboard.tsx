import { Protected } from "@/lib/protected-page";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ChatArea } from "@/components/dashboard/ChatArea";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function Dashboard() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<Id<"workspaces"> | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<Id<"channels"> | null>(null);

  return (
    <Protected>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-screen flex bg-background"
      >
        <Sidebar 
          selectedWorkspaceId={selectedWorkspaceId}
          selectedChannelId={selectedChannelId}
          onWorkspaceSelect={setSelectedWorkspaceId}
          onChannelSelect={setSelectedChannelId}
        />
        <ChatArea 
          workspaceId={selectedWorkspaceId}
          channelId={selectedChannelId}
        />
      </motion.div>
    </Protected>
  );
}