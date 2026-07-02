"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName: string;
}

interface Family {
  id: string;
  name: string;
  role: string;
}

export default function Chat() {
  const [family, setFamily] = useState<Family | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/me", { credentials: "include" })
      .then((res) => res.json())
      .then((user) => setCurrentUserId(user.id));

    fetch("http://localhost:4000/api/families", { credentials: "include" })
      .then((res) => res.json())
      .then((families) => {
        if (families.length > 0) setFamily(families[0]);
      });
  }, []);

  useEffect(() => {
    if (!family) return;

    async function loadMessages() {
      const res = await fetch(
        `http://localhost:4000/api/families/${family!.id}/messages`,
        { credentials: "include" }
      );
      if (res.ok) setMessages(await res.json());
    }

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [family]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !family) return;

    const res = await fetch(
      `http://localhost:4000/api/families/${family.id}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      }
    );

    if (res.ok) {
      const newMessage = await res.json();
      setMessages((prev) => [...prev, newMessage]);
      setText("");
    }
  }

  if (!family) {
    return (
      <p className="text-sm text-slate-600">
        You&apos;re not part of a family yet.
      </p>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      <div className="w-64 shrink-0 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-bold text-slate-900">Chat</h2>
        </div>
        <button className="w-full border-b border-gray-100 bg-gray-50 p-4 text-left">
          <p className="text-sm font-semibold text-slate-800">{family.name}</p>
          <p className="text-xs text-slate-500">Group chat</p>
        </button>
      </div>

      <div className="flex flex-1 flex-col rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-bold text-slate-900">{family.name}</h2>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => {
            const isMine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={isMine ? "ml-auto max-w-xs" : "max-w-xs"}>
                {!isMine && (
                  <p className="mb-1 text-xs font-medium text-slate-500">
                    {m.senderName}
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    isMine
                      ? "bg-navy-700 text-white"
                      : "bg-gray-100 text-slate-800"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-200 p-4">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-full bg-navy-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}