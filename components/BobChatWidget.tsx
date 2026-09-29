"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const FLOOD_FAQ: Record<string, string> = {
  flood: "🌊 Floods in Malaysia typically occur during the Northeast Monsoon season (November–March) and Southwest Monsoon (May–September). Key flood-prone areas include Kelantan, Terengganu, Pahang, Johor, and Selangor.",
  kelantan: "⚠️ Kelantan is Malaysia's most flood-prone state. Sungai Kelantan and its tributaries frequently overflow during heavy rainfall. Major floods occurred in 2014, 2021, and 2022. Residents should monitor DID Malaysia water level gauges.",
  "what to do": "🚨 During a flood: (1) Move to higher ground immediately, (2) Avoid walking/driving through floodwaters, (3) Turn off electricity at the mains, (4) Call emergency: 999 or 991, (5) Contact NADMA at 03-8870 0200.",
  emergency: "📞 Emergency contacts:\n• Police/Fire/Ambulance: 999\n• Civil Defence: 991\n• NADMA (National Disaster Management Agency): 03-8870 0200\n• JPS (Irrigation & Drainage Dept): 1800-88-8325",
  predict: "🔮 FloodWatch Malaysia uses real-time river water level data from JPS (Jabatan Pengairan dan Saliran) combined with rainfall forecasts from MetMalaysia to predict flood risk 2–24 hours in advance.",
  "flood season": "📅 Malaysia has two main flood seasons:\n• Northeast Monsoon: November–March (East Coast & Kelantan, Pahang, Terengganu)\n• Southwest Monsoon: May–September (West Coast, Selangor, Johor)\nFlash floods can occur year-round in urban areas.",
  "google earth": "🗺️ The map view integrates Google Maps with flood zone overlays. Red zones indicate danger levels, orange = warning, yellow = alert. Use the map to see real-time river levels and evacuation routes.",
  prepare: "🏠 Flood Preparedness Tips:\n• Prepare an emergency kit (water, food, medicine, documents)\n• Know your nearest evacuation centre (Pusat Pemindahan)\n• Waterproof important documents\n• Have a family emergency plan\n• Monitor MetMalaysia and JPS apps",
  level: "📏 Water levels are measured at gauging stations along rivers. Levels:\n• Normal: Below alert level\n• Alert (Amaran): Rising above normal, monitor closely\n• Warning (Awas): Flooding possible soon\n• Danger (Bahaya): Active flooding — evacuate immediately",
  johor: "🌧️ Johor faces flash floods in urban areas (JB, Kota Tinggi) and river floods along Sungai Johor. The 2006–2007 floods were catastrophic. SMART Tunnel in KL helps divert floodwaters.",
  selangor: "🌧️ Selangor faces urban flash floods, especially in Klang, Shah Alam, and Subang. Sungai Klang and Sungai Damansara are key monitored rivers. SMART Tunnel and retention ponds help manage floods.",
  sabah: "🌧️ Sabah faces floods in Keningau, Beaufort (Sungai Padas), and coastal areas. Flash floods are common in Kota Kinabalu during heavy rain.",
};

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(FLOOD_FAQ)) {
    if (lower.includes(key)) return response;
  }
  if (lower.includes("help") || lower.includes("hi") || lower.includes("hello")) {
    return "👋 Hello! I'm FloodWatch AI, powered by IBM Bob. I can help you with:\n• Current flood levels and alerts\n• Flood-prone areas in Malaysia\n• Emergency contacts and procedures\n• Flood preparedness tips\n• Understanding flood warnings\n\nWhat would you like to know?";
  }
  if (lower.includes("pahang") || lower.includes("kuantan")) {
    return "🌊 Pahang is highly flood-prone with Sungai Pahang being Malaysia's longest river. Pekan, Temerloh, and Kuantan districts face regular flooding during monsoon season.";
  }
  if (lower.includes("terengganu")) {
    return "🌧️ Terengganu faces floods during the Northeast Monsoon. Besut, Dungun, and Kuala Terengganu are most affected. Sungai Terengganu and Sungai Besut are key monitored rivers.";
  }
  return "🤖 I can help with flood information in Malaysia. Try asking about:\n• Flood levels in a specific state (e.g., 'Kelantan flood')\n• What to do during a flood\n• Emergency contacts\n• Flood season in Malaysia\n• How to prepare for floods";
}

export default function BobChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm FloodWatch AI powered by IBM Bob. Ask me anything about floods in Malaysia — current levels, emergency procedures, flood-prone areas, or how to stay safe.",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate IBM Bob response delay
    setTimeout(() => {
      const response = getBotResponse(userMsg.content);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          aria-label="Open FloodWatch AI Chat"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium text-sm">Ask FloodWatch AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-200 ${
            isMinimized ? "h-14" : "h-[520px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">FloodWatch AI</div>
                <div className="text-blue-200 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
                  Powered by IBM Bob
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === "user"
                          ? "bg-blue-600"
                          : "bg-gradient-to-br from-blue-500 to-purple-600"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 overflow-x-auto">
                <div className="flex gap-2 flex-nowrap">
                  {["What to do?", "Kelantan flood", "Emergency contacts", "Flood season"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        setTimeout(() => {
                          const fakeEvent = { key: "Enter", shiftKey: false, preventDefault: () => {} } as React.KeyboardEvent;
                          setMessages((prev) => [
                            ...prev,
                            { id: Date.now().toString(), role: "user", content: s, timestamp: new Date() },
                          ]);
                          setIsTyping(true);
                          setTimeout(() => {
                            setMessages((prev) => [
                              ...prev,
                              { id: (Date.now() + 1).toString(), role: "assistant", content: getBotResponse(s), timestamp: new Date() },
                            ]);
                            setIsTyping(false);
                          }, 800);
                          void fakeEvent;
                        }, 0);
                        setInput("");
                      }}
                      className="whitespace-nowrap text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full border border-blue-200 transition-colors flex-shrink-0"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about floods in Malaysia..."
                    rows={1}
                    className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-24"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
