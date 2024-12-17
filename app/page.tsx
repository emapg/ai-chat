"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiSend, FiTrash2 } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      const aiMessage: Message = { role: "assistant", content: data.response };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat?")) {
      setMessages([]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
      {/* Chat Container */}
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg flex flex-col h-[80vh]">
        {/* Header */}
        <div className="bg-blue-600 text-white py-4 px-6 rounded-t-lg flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Chatbot</h1>
          <button
            onClick={clearChat}
            className="text-white hover:text-red-400 transition"
            aria-label="Clear chat"
          >
            <FiTrash2 size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 max-w-xs rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="text-gray-500 flex justify-start items-center space-x-2"
            >
              <BiLoaderAlt className="animate-spin" size={20} />
              <p>Assistant is typing...</p>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <form onSubmit={sendMessage} className="p-4 flex space-x-2 border-t">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all"
            aria-label="Send"
          >
            <FiSend size={24} />
          </button>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-4 text-gray-500 text-sm">
        Built with ❤️ using Next.js, Tailwind CSS, React Icons, and Framer Motion
      </footer>
    </div>
  );
}
