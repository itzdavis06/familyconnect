export default function Chat() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Conversation list */}
      <div className="w-64 shrink-0 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-bold text-slate-900">Chat</h2>
        </div>
        <div className="flex flex-col">
          <button className="border-b border-gray-100 p-4 text-left hover:bg-gray-50">
            <p className="text-sm font-semibold text-slate-800">
              Family Group
            </p>
            <p className="text-xs text-slate-500">
              Laura: Don&apos;t forget dinner at 7!
            </p>
          </button>
          <button className="border-b border-gray-100 p-4 text-left hover:bg-gray-50">
            <p className="text-sm font-semibold text-slate-800">Michael</p>
            <p className="text-xs text-slate-500">
              Hey! Are we still on for...
            </p>
          </button>
          <button className="border-b border-gray-100 p-4 text-left hover:bg-gray-50">
            <p className="text-sm font-semibold text-slate-800">Sarah</p>
            <p className="text-xs text-slate-500">Thanks for the help!</p>
          </button>
        </div>
      </div>

      {/* Message thread */}
      <div className="flex flex-1 flex-col rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h2 className="font-bold text-slate-900">Family Group</h2>
          <p className="text-xs text-slate-500">5 members</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="max-w-xs rounded-2xl bg-gray-100 px-4 py-2 text-sm text-slate-800">
            Laura: Don&apos;t forget dinner at 7!
          </div>
          <div className="ml-auto max-w-xs rounded-2xl bg-slate-800 px-4 py-2 text-sm text-white">
            Thanks for the reminder!
          </div>
        </div>

        <form className="flex gap-2 border-t border-gray-200 p-4">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}