"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FiSend, FiTrash2, FiCopy, FiMoon, FiSun } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to call Gemini API and stream response
  const callGeminiAPI = async (updatedMessages: Message[], onChunk: (chunk: string) => void) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const userContent = updatedMessages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    }));

    const payload = { contents: userContent };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader?.read()!;
      done = readerDone;
      const chunk = decoder.decode(value, { stream: true });
      const json = JSON.parse(chunk);

      const textPart = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (textPart) {
        onChunk(textPart);
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMessage: Message = { role: "user", content: input, timestamp };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    let currentContent = "";
    const aiMessage: Message = { role: "assistant", content: "", timestamp };

    setMessages((prev) => [...prev, { ...aiMessage, content: currentContent }]);

    try {
      await callGeminiAPI(updatedMessages, (chunk) => {
        currentContent += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = currentContent;
          return newMessages;
        });
      });
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

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("Copied to clipboard!");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      } transition-all`}
    >
      {/* Theme Switch */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:scale-110 transition"
      >
        {darkMode ? <FiSun size={24} /> : <FiMoon size={24} />}
      </button>

      {/* Chat Container */}
      <div
        className={`w-full max-w-3xl shadow-lg rounded-xl flex flex-col h-[85vh] ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div className={`text-white py-4 px-6 rounded-t-xl flex justify-between items-center ${
          darkMode ? "bg-gray-700" : "bg-blue-600"
        }`}>
          <h1 className="text-2xl font-bold">AI Chatbot</h1>
          <button onClick={clearChat} className="hover:text-red-400 transition" aria-label="Clear chat">
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
              <div className={`relative px-4 py-2 max-w-xs rounded-lg shadow ${
                msg.role === "user" ? "bg-blue-500 text-white" : darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-200 text-gray-800"
              }`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={darkMode ? dracula : oneLight}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                  className="prose dark:prose-invert prose-sm"
                >
                  {msg.content}
                </ReactMarkdown>
                <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => copyToClipboard(msg.content)}
                    className="absolute bottom-1 right-1 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Copy to clipboard"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <form onSubmit={sendMessage} className="p-4 flex space-x-2 border-t bg-gray-100 dark:bg-gray-700">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 p-2 rounded-lg border focus:outline-none focus:ring-2"
          />
          <button type="submit" disabled={loading || !input.trim()} className="p-2 bg-blue-600 text-white rounded-lg">
            <FiSend size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}
