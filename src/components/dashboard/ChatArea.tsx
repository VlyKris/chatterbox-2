import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { Hash, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageList } from "./MessageList";
import { toast } from "sonner";

interface ChatAreaProps {
  workspaceId: Id<"workspaces"> | null;
  channelId: Id<"channels"> | null;
}

export function ChatArea({ workspaceId, channelId }: ChatAreaProps) {
  const channel = useQuery(
    api.channels.getChannelById,
    channelId ? { channelId } : "skip"
  );
  const sendMessage = useMutation(api.messages.send);
  
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !channelId || isLoading) return;

    setIsLoading(true);
    try {
      await sendMessage({
        content: message.trim(),
        channelId,
      });
      setMessage("");
      toast.success("Message sent!");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [channelId]);

  if (!workspaceId || !channelId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Welcome to SlackClone</h3>
          <p className="text-muted-foreground">
            Select a workspace and channel to start messaging
          </p>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Channel Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-border bg-card/50"
      >
        <div className="flex items-center">
          <Hash className="h-5 w-5 text-muted-foreground mr-2" />
          <h2 className="text-lg font-semibold">{channel.name}</h2>
          {channel.description && (
            <span className="text-sm text-muted-foreground ml-4">
              {channel.description}
            </span>
          )}
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList channelId={channelId} />
      </div>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-border bg-card/50"
      >
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message #${channel.name}`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
