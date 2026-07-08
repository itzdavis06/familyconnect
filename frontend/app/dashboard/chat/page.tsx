"use client";

import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/api";

interface GroupMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderName: string;
}

interface DirectMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  recipientId: string;
}

interface Family {
  id: string;
  name: string;
  role: string;
}

interface Member {
  id: string | null;
  memberId: string;
  username: string | null;
  fullName: string | null;
  role: string;
  isChild: boolean;
}

export default function Chat() {
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [activeChat, setActiveChat] = useState<"group" | string>("group");

  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/me`, { credentials: "include" })
      .then((res) => res.json())
      .then((user) => setCurrentUserId(user.id));

    fetch(`${API_URL}/api/families`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((families) => {
        if (families.length > 0) setFamily(families[0]);
      });
  }, []);

  useEffect(() => {
    if (!family) return;
    fetch(`${API_URL}/api/families/${family.id}/members`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setMembers);
  }, [family]);

  // Poll whichever chat is active
  useEffect(() => {
    if (!family) return;

    async function loadGroup() {
      const res = await fetch(
        `${API_URL}/api/families/${family!.id}/messages`,
        { credentials: "include" }
      );
      if (res.ok) setGroupMessages(await res.json());
    }

    async function loadDirect(otherUserId: string) {
      const res = await fetch(
        `${API_URL}/api/direct-messages/${otherUserId}`,
        { credentials: "include" }
      );
      if (res.ok) setDirectMessages(await res.json());
    }

    function load() {
      if (activeChat === "group") {
        loadGroup();
      } else {
        loadDirect(activeChat);
      }
    }

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [family, activeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages, directMessages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !family) return;

    if (activeChat === "group") {
      const res = await fetch(
        `${API_URL}/api/families/${family.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: text }),
        }
      );
      if (res.ok) {
        const newMessage = await res.json();
        setGroupMessages((prev) => [...prev, newMessage]);
        setText("");
      }
    } else {
      const res = await fetch(
        `${API_URL}/api/direct-messages/${activeChat}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: text }),
        }
      );
      if (res.ok) {
        const newMessage = await res.json();
        setDirectMessages((prev) => [...prev, newMessage]);
        setText("");
      }
    }
  }

  if (!family) {
    return (
      <p className="text-sm text-slate-600">
        You&apos;re not part of a family yet.
      </p>
    );
  }

  const otherMembers = members.filter(
    (m) => !m.isChild && m.id && m.id !== currentUserId
  );

  const activeMember = otherMembers.find((m) => m.id === activeChat);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      <div className="w-64 shrink-0 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-bold text-slate-900">Chat</h2>
        </div>
        <div className="flex flex-col">
          <button
            onClick={() => setActiveChat("group")}
            className={`border-b border-gray-100 p-4 text-left ${
              activeChat === "group" ? "bg-green-100" : "hover:bg-gray-50"
            }`}
          >
            <p className="text-sm font-semibold text-slate-800">
              {family.name}
            </p>
            <p className="text-xs text-slate-500">Group chat</p>
          </button>

          {otherMembers.map((m) => (
            <button
              key={m.memberId}
              onClick={() => setActiveChat(m.id!)}
              className={`border-b border-gray-100 p-4 text-left ${
                activeChat === m.id ? "bg-green-100" : "hover:bg-gray-50"
              }`}
            >
              <p className="text-sm font-semibold text-slate-800">
                {m.fullName || m.username}
              </p>
              <p className="text-xs text-slate-500">Direct message</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-bold text-slate-900">
            {activeChat === "group"
              ? family.name
              : activeMember?.fullName || activeMember?.username}
          </h2>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {activeChat === "group"
            ? groupMessages.map((m) => {
                const isMine = m.senderId === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={isMine ? "ml-auto max-w-xs" : "max-w-xs"}
                  >
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
              })
            : directMessages.map((m) => {
                const isMine = m.senderId === currentUserId;
                return (
                  <div
                    key={m.id}
                    className={isMine ? "ml-auto max-w-xs" : "max-w-xs"}
                  >
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

        <form
          onSubmit={handleSend}
          className="flex gap-2 border-t border-gray-200 p-4"
        >
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