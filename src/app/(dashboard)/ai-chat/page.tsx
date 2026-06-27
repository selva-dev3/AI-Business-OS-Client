"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Send, Sparkles, Bot, User, Trash2, Cpu, Maximize2,
  FolderOpen, Bookmark, MessageSquare, Terminal, RefreshCw, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

type Message = {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isCode?: boolean;
};

const mockSuggestions = [
  { label: "Summarize pending support tickets", prompt: "Summarize all open support tickets and sort them by priority." },
  { label: "Check project tasks status", prompt: "Which milestone has the highest risk of being overdue?" },
  { label: "Generate Q3 cashflow projection", prompt: "Simulate a standard cashflow projection based on current invoice counts." },
];

export default function AIChatPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    { id: "1", sender: "ai", text: "Hello! I am your AI Business OS Assistant. I can analyze procurement invoices, check project status, query support tickets, or generate financial reports. How can I help you today?", timestamp: "12:50 PM" }
  ]);
  const [inputVal, setInputVal] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [activeModel, setActiveModel] = React.useState("gemini-3.5-flash");

  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((p) => [...p, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // Simulate AI response after delay
    setTimeout(() => {
      let replyText = "";
      let isCode = false;
      const lower = text.toLowerCase();

      if (lower.includes("ticket") || lower.includes("support")) {
        replyText = `Based on the latest records, you have **4 open support tickets**:\n\n1. **TIC-8472**: *PostgreSQL Database connection timeouts* (CRITICAL) - Assigned to Antigravity AI\n2. **TIC-8473**: *Failed invoice transaction charging twice* (HIGH) - Unassigned\n3. **TIC-8470**: *SSO login redirection error* (RESOLVED)\n4. **TIC-8468**: *Export report format option CSV request* (CLOSED)\n\nLet me know if you would like to route the high priority ticket to a specific agent.`;
      } else if (lower.includes("task") || lower.includes("milestone") || lower.includes("project")) {
        replyText = `Here is the current **Project Module** status:\n\n* **MVP Release**: In Progress (Due: 2026-07-15)\n* **Beta Testing**: Pending (Due: 2026-08-01)\n* **Supplier API**: **OVERDUE** (Due: 2026-06-15)\n\nThere are **8 active timesheet entries** totaling **50.5 hours** logged for the week.`;
      } else if (lower.includes("cashflow") || lower.includes("projection") || lower.includes("finance")) {
        replyText = `Here is a simulated Q3 cashflow projection based on pending procurement and customer invoices:\n\n\`\`\`json\n{\n  "Q3_Projected_Inflow": "$145,200.00",\n  "Q3_Projected_Outflow": "$84,500.00",\n  "Net_Profit_Margin": "41.8%",\n  "Risk_Level": "LOW"\n}\n\`\`\``;
        isCode = true;
      } else {
        replyText = `I have received your prompt: "${text}". I am currently scanning the databases, cached files, and system schemas to formulate a response. Let me know if you need to fetch specific CRM records or inventory levels.`;
      }

      setMessages((p) => [...p, {
        id: `msg-reply-${Date.now()}`,
        sender: "ai",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCode
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const clearChat = () => {
    setMessages([
      { id: "1", sender: "ai", text: "Chat history cleared. How can I assist you now?", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    toast.success("Conversation cleared.");
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4 animate-in fade-in duration-500 overflow-hidden">
      {/* Left panel - Config / Presets */}
      <div className="w-80 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-4 space-y-5">
          <div>
            <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" /> AI Settings
            </h2>
            <p className="text-[12px] text-slate-500 mt-1">Configure models and prompts.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-[12px] font-bold text-slate-600 block">LLM Engine</Label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", desc: "Fast & lightweight response", active: activeModel === "gemini-3.5-flash" },
                { id: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet", desc: "Complex coding & reasoning", active: activeModel === "claude-3.5-sonnet" },
                { id: "gpt-4o", name: "GPT-4o Enterprise", desc: "General analytics", active: activeModel === "gpt-4o" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setActiveModel(m.id); toast.success(`Switched LLM to ${m.name}`); }}
                  className={`w-full text-left p-2.5 rounded-xl border text-[13px] transition-all flex items-start gap-2.5 ${
                    m.active ? "border-indigo-600 bg-indigo-50/50 shadow-sm" : "border-slate-100 bg-slate-50/30 hover:bg-slate-50"
                  }`}
                >
                  <Cpu className={`h-4 w-4 shrink-0 mt-0.5 ${m.active ? "text-indigo-600" : "text-slate-400"}`} />
                  <div>
                    <div className="font-bold text-slate-800">{m.name}</div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">{m.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2">
            <span className="text-[12px] font-bold text-slate-600 block">Suggested Quick Commands</span>
            <div className="space-y-1.5">
              {mockSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.prompt)}
                  className="w-full text-left text-[12px] font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-lg p-2 transition-colors truncate block"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-amber-500" /> Latency ~240ms</span>
          <Button variant="ghost" size="icon" onClick={clearChat} className="h-7 w-7 text-slate-400 hover:text-rose-600">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-slate-800">Business OS Assistant</h2>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online & Indexed
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Maximize2 className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
          {messages.map((m) => {
            const isAI = m.sender === "ai";
            return (
              <div key={m.id} className={`flex gap-3 max-w-[85%] ${isAI ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[11px] ${
                  isAI ? "bg-indigo-600" : "bg-gradient-to-br from-slate-700 to-slate-900"
                }`}>
                  {isAI ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                </div>
                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl border text-[13.5px] leading-relaxed shadow-sm ${
                    isAI ? "bg-white text-slate-800 border-slate-200 rounded-tl-none" : "bg-indigo-600 text-white border-indigo-700 rounded-tr-none"
                  }`}>
                    {m.isCode ? (
                      <pre className="font-mono text-[11.5px] bg-slate-900 text-slate-100 p-2.5 rounded-lg overflow-x-auto">
                        <code>{m.text.replace(/```[a-z]*\n/g, "").replace(/```/g, "")}</code>
                      </pre>
                    ) : (
                      <p className="whitespace-pre-line">{m.text}</p>
                    )}
                  </div>
                  <span className={`text-[10px] text-slate-400 block ${isAI ? "text-left" : "text-right"}`}>{m.timestamp}</span>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] shrink-0">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-slate-150 bg-white">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
            className="flex items-center gap-2"
          >
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about project tasks, cashflow projection, billing support..."
              className="flex-1 bg-slate-50 border-slate-200 focus:bg-white text-[13px]"
            />
            <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
