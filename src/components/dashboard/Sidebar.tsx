import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Hash, Plus, Settings, Users, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/auth/UserButton";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { CreateChannelModal } from "./CreateChannelModal";
import { JoinWorkspaceModal } from "./JoinWorkspaceModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  selectedWorkspaceId: Id<"workspaces"> | null;
  selectedChannelId: Id<"channels"> | null;
  onWorkspaceSelect: (workspaceId: Id<"workspaces">) => void;
  onChannelSelect: (channelId: Id<"channels">) => void;
}

export function Sidebar({ 
  selectedWorkspaceId, 
  selectedChannelId, 
  onWorkspaceSelect, 
  onChannelSelect 
}: SidebarProps) {
  const workspaces = useQuery(api.workspaces.getUserWorkspaces);
  const channels = useQuery(
    api.channels.getWorkspaceChannels,
    selectedWorkspaceId ? { workspaceId: selectedWorkspaceId } : "skip"
  );
  const workspace = useQuery(
    api.workspaces.getWorkspaceById,
    selectedWorkspaceId ? { workspaceId: selectedWorkspaceId } : "skip"
  );

  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showJoinWorkspace, setShowJoinWorkspace] = useState(false);
  const [channelsExpanded, setChannelsExpanded] = useState(true);

  useEffect(() => {
    // Auto-select first workspace if none selected
    if (workspaces && workspaces.length > 0 && !selectedWorkspaceId) {
      const firstValidWorkspace = workspaces.find((ws) => ws && ws._id);
      if (firstValidWorkspace && firstValidWorkspace._id) {
        onWorkspaceSelect(firstValidWorkspace._id);
      }
    }
  }, [workspaces, selectedWorkspaceId, onWorkspaceSelect]);

  useEffect(() => {
    // Auto-select first channel if none selected
    if (channels && channels.length > 0 && !selectedChannelId) {
      const firstValidChannel = channels.find((ch) => ch?._id);
      if (firstValidChannel) {
        onChannelSelect(firstValidChannel._id);
      }
    }
  }, [channels, selectedChannelId, onChannelSelect]);

  return (
    <>
      <div className="w-80 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        {/* Workspace Header */}
        <div className="p-4 border-b border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-left p-2 h-auto">
                <div>
                  <div className="font-semibold text-lg">
                    {workspace?.name || "Select Workspace"}
                  </div>
                  <div className="text-sm text-sidebar-foreground/70">
                    {workspace ? `${channels?.length || 0} channels` : "No workspace"}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {workspaces?.map((ws) => {
                if (!ws || !ws._id) return null;
                const workspaceId = ws._id;
                return (
                  <DropdownMenuItem
                    key={ws._id}
                    onClick={() => onWorkspaceSelect(workspaceId)}
                    className="cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{ws.name}</div>
                      <div className="text-sm text-muted-foreground">{ws.description}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuItem onClick={() => setShowCreateWorkspace(true)} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowJoinWorkspace(true)} className="cursor-pointer">
                <Users className="h-4 w-4 mr-2" />
                Join Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Channels Section */}
        {selectedWorkspaceId && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <Button
                variant="ghost"
                onClick={() => setChannelsExpanded(!channelsExpanded)}
                className="w-full justify-start p-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                {channelsExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Channels
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateChannel(true);
                  }}
                  className="ml-auto p-1 h-6 w-6"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </Button>

              {channelsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 mt-2"
                >
                  {channels?.map((channel) => {
                    if (!channel?._id) return null;
                    return (
                      <motion.div
                        key={channel._id}
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <Button
                          variant={selectedChannelId === channel._id ? "secondary" : "ghost"}
                          onClick={() => onChannelSelect(channel._id)}
                          className="w-full justify-start p-2 text-sm"
                        >
                          <Hash className="h-4 w-4 mr-2" />
                          {channel.name}
                        </Button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <UserButton size={10} />
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CreateWorkspaceModal 
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
        onSuccess={(workspaceId) => {
          onWorkspaceSelect(workspaceId);
          setShowCreateWorkspace(false);
        }}
      />

      <CreateChannelModal
        open={showCreateChannel}
        onOpenChange={setShowCreateChannel}
        workspaceId={selectedWorkspaceId}
        onSuccess={(channelId) => {
          onChannelSelect(channelId);
          setShowCreateChannel(false);
        }}
      />

      <JoinWorkspaceModal
        open={showJoinWorkspace}
        onOpenChange={setShowJoinWorkspace}
        onSuccess={(workspaceId) => {
          onWorkspaceSelect(workspaceId);
          setShowJoinWorkspace(false);
        }}
      />
    </>
  );
}