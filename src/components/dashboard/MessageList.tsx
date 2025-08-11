import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MessageListProps {
  channelId: Id<"channels">;
}

export function MessageList({ channelId }: MessageListProps) {
  const [paginationOpts, setPaginationOpts] = useState({
    numItems: 50,
    cursor: null as string | null,
  });

  const result = useQuery(api.messages.getChannelMessages, {
    channelId,
    paginationOpts,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [result?.page]);

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const { page: messages, isDone, continueCursor } = result;

  const loadMore = () => {
    if (!isDone && continueCursor) {
      setPaginationOpts({
        numItems: 50,
        cursor: continueCursor,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {!isDone && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={loadMore}
            >
              Load More Messages
            </Button>
          </div>
        )}

        {messages?.map((message, index) => {
          const showAvatar = index === 0 || messages[index - 1]?.authorId !== message.authorId;
          const messageTime = new Date(message._creationTime);
          
          return (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${showAvatar ? "mt-4" : "mt-1"}`}
            >
              {showAvatar ? (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {message.author?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              ) : (
                <div className="w-10 flex-shrink-0" />
              )}
              
              <div className="flex-1 min-w-0">
                {showAvatar && (
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {message.author?.name || "Unknown User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(messageTime, { addSuffix: true })}
                    </span>
                  </div>
                )}
                
                <div className={`text-sm ${!showAvatar ? "ml-0" : ""}`}>
                  {message.content}
                  {message.isEdited && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (edited)
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}