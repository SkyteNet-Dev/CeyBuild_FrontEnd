"use client";

type Message = {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; fullName: string; profileImage?: string };
};

export default function ChatBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? "flex-row-reverse" : ""}`}>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary">
            {message.sender.fullName.charAt(0)}
          </span>
        </div>
        <div>
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm ${
              isOwn
                ? "bg-primary text-white rounded-br-md"
                : "bg-gray-100 text-gray-900 rounded-bl-md"
            }`}
          >
            {message.content}
          </div>
          <p className={`text-[10px] text-gray-400 mt-1 ${isOwn ? "text-right" : "text-left"}`}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  );
}
