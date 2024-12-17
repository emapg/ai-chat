"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setResponse(data.response || "No response from the AI.");
    } catch (error) {
      console.error(error);
      setResponse("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">AI Chatbot</h1>
        <p className="text-center text-gray-600 mb-6">Powered by OpenAI GPT</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 transition-all"
          >
            {loading ? "Loading..." : "Send Message"}
          </button>
        </form>

        {response && (
          <div className="mt-6 bg-gray-50 border rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-2">AI Response:</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>

      <footer className="mt-8 text-gray-500 text-sm">
        Created with ❤️ using Next.js, TypeScript, and Tailwind CSS
      </footer>
    </div>
  );
}
