import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Loader2
} from 'lucide-react';
import { StylistMode, WardrobeItem, TryOnResponse, StylistChatResponse } from '../types';
import { api } from '../api';

interface StylistViewProps {
  wardrobe: WardrobeItem[];
  outfits: TryOnResponse[];
  preloadedOutfit?: TryOnResponse | null;
  onSelectWardrobeItem?: (item: WardrobeItem) => void;
}

interface MessageEntry {
  sender: 'user' | 'mira';
  text: string;
  appreciation?: string;
  strengths?: string[];
  suggestions?: string[];
  suggestedItems?: WardrobeItem[];
  timestamp: string;
}

export const StylistView: React.FC<StylistViewProps> = ({
  wardrobe,
  outfits,
  preloadedOutfit,
  onSelectWardrobeItem,
}) => {
  const [modes, setModes] = useState<StylistMode[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>('casual');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [selectedOutfitId, setSelectedOutfitId] = useState<number | undefined>(
    preloadedOutfit?.outfit_id
  );

  const [messages, setMessages] = useState<MessageEntry[]>([
    {
      sender: 'mira',
      text: "First of all, welcome to your styling session! You have fantastic wardrobe pieces in your vault. I'm MIRA, and I'm here to give positive, empowering fashion advice tailored directly to what you own. How can I help you elevate your look today?",
      timestamp: 'Just now',
    },
  ]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchModes = async () => {
      try {
        const m = await api.getStylistModes();
        setModes(m);
      } catch (err) {
        console.error(err);
      }
    };
    fetchModes();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    const userEntry: MessageEntry = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userEntry]);

    try {
      const res: StylistChatResponse = await api.chatWithMira({
        message: userText,
        mode: selectedMode,
        current_outfit_id: selectedOutfitId,
      });

      const miraEntry: MessageEntry = {
        sender: 'mira',
        text: res.response,
        appreciation: res.appreciation,
        strengths: res.key_strengths,
        suggestions: res.practical_suggestions,
        suggestedItems: res.suggested_wardrobe_items,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, miraEntry]);
    } catch (err) {
      const fallbackEntry: MessageEntry = {
        sender: 'mira',
        text: "First of all, great question! Balancing tones with clean sneakers or a minimal silver watch will anchor the look nicely while maintaining maximum comfort.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackEntry]);
    } finally {
      setIsSending(false);
    }
  };

  const currentModeInfo = modes.find((m) => m.id === selectedMode);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-studio-accentSubtle border border-studio-accent/20 text-studio-accent text-xs font-semibold mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>MIRA • Always Appreciates First</span>
          </div>
          <h2 className="text-2xl font-bold text-studio-text font-display">AI Personal Fashion Stylist</h2>
          <p className="text-xs text-studio-muted">
            Professional fashion advice respecting your personal style, body shape, and actual wardrobe items.
          </p>
        </div>

        {/* Selected Outfit Selector */}
        {outfits.length > 0 && (
          <div className="flex items-center space-x-2 bg-studio-secondary px-3 py-1.5 rounded-xl border border-studio-border text-xs">
            <span className="text-studio-muted font-medium">Consulting on:</span>
            <select
              value={selectedOutfitId || ''}
              onChange={(e) => setSelectedOutfitId(Number(e.target.value) || undefined)}
              className="bg-transparent text-studio-text font-semibold focus:outline-none cursor-pointer"
            >
              <option value="">General Wardrobe</option>
              {outfits.map((o) => (
                <option key={o.outfit_id} value={o.outfit_id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* The 6 Stylist Modes Bar */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-studio-muted">
          Select Stylist Persona (6 Modes)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {modes.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-studio-accentSubtle border-studio-accent text-studio-accent shadow-studio-sm font-semibold'
                    : 'bg-studio-secondary border-studio-border text-studio-muted hover:text-studio-text hover:border-studio-accent/40'
                }`}
              >
                <p className="text-xs font-bold truncate">{mode.title}</p>
                <p className="text-[10px] text-studio-muted line-clamp-1 mt-0.5">{mode.vibe}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="glass-card rounded-3xl border border-studio-border overflow-hidden flex flex-col h-[580px] shadow-studio-card">
        {/* Chat Banner Info */}
        <div className="p-3.5 px-5 bg-studio-secondary border-b border-studio-border flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-studio-accentSubtle border border-studio-accent/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-studio-accent" />
            </div>
            <div>
              <span className="font-bold text-studio-text">{currentModeInfo?.title || 'Casual Stylist'}</span>
              <span className="text-[11px] text-studio-muted ml-2">Focus: {currentModeInfo?.focus || 'Wardrobe synergy'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>MIRA Ready</span>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-studio-bg">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'mira' && (
                <div className="w-8 h-8 rounded-full bg-studio-accentSubtle border border-studio-accent/30 p-0.5 shrink-0 mt-0.5 flex items-center justify-center shadow-studio-sm">
                  <Sparkles className="w-4 h-4 text-studio-accent" />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-studio-accent text-white rounded-tr-none shadow-studio-sm font-medium'
                    : 'bg-studio-secondary border border-studio-border text-studio-text rounded-tl-none shadow-studio-sm'
                }`}
              >
                <p className="whitespace-pre-line font-normal">{msg.text}</p>

                {/* Wardrobe Items Recommended Directly from Vault */}
                {msg.suggestedItems && msg.suggestedItems.length > 0 && (
                  <div className="pt-2 border-t border-studio-border space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-studio-accent block">
                      Recommended from your wardrobe:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {msg.suggestedItems.map((sItem) => (
                        <div
                          key={sItem.id}
                          className="p-2 rounded-xl bg-studio-card border border-studio-border flex items-center space-x-2"
                        >
                          <img
                            src={sItem.clean_image_url || sItem.image_url}
                            alt={sItem.name}
                            className="w-8 h-8 object-contain rounded"
                          />
                          <span className="text-[11px] font-semibold text-studio-text truncate">{sItem.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-studio-muted text-right">{msg.timestamp}</div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center space-x-2 text-xs text-studio-muted">
              <Loader2 className="w-4 h-4 text-studio-accent animate-spin" />
              <span>MIRA is analyzing your wardrobe and crafting guidance...</span>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-studio-secondary border-t border-studio-border flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask MIRA (e.g., 'What shoes go best with my black tee?', 'How to dress for a dinner date?')"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-studio-card border border-studio-border rounded-xl px-4 py-2.5 text-xs text-studio-text placeholder-studio-subtle focus:outline-none focus:border-studio-accent"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="px-4 py-2.5 rounded-xl bg-studio-accent hover:bg-studio-accentHover disabled:opacity-40 text-white font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-studio-sm"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
