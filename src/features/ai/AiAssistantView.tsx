import React, { useState } from 'react';

export const AiAssistantView = () => {
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'ai',
      content: 'Hello! I am Shield AI Copilot. I can help you analyze compliance gaps, review evidence, or answer questions about your organization\'s security posture.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgentic: false,
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgentic: false,
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()+1}`,
        sender: 'ai',
        content: 'This feature is currently in development. Our RAG pipeline will be connected soon to provide intelligent answers based on your actual compliance and risk data.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAgentic: false,
      }]);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-surface-secondary animate-fade-in">
      {/* Copilot Header */}
      <div className="px-6 py-4 border-b border-border bg-surface flex justify-between items-center shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-white text-[20px]">smart_toy</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-text-primary tracking-tight">Shield AI Copilot</h3>
            <span className="font-label-sm text-text-tertiary flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-success inline-block relative">
                <span className="absolute w-full h-full bg-success rounded-full animate-ping opacity-75"></span>
              </span> 
              Connected & Ready
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-secondary hover:text-text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">history</span>
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg text-text-tertiary hover:bg-surface-secondary hover:text-text-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col max-w-5xl mx-auto w-full pb-32 relative">
        {/* Date Divider */}
        <div className="flex justify-center my-4">
          <span className="font-label-sm text-[11px] bg-surface border border-border text-text-tertiary px-3 py-1 rounded-full uppercase tracking-wider">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'flex-col items-end gap-1' : 'gap-3 items-start'}`}>
            
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                <span className="material-symbols-outlined text-primary text-[16px]">smart_toy</span>
              </div>
            )}
            
            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'flex-1'}`}>
              <div className={`
                px-5 py-3.5 font-body-sm leading-relaxed max-w-[85%]
                ${msg.sender === 'user' 
                  ? 'bg-primary text-white rounded-2xl rounded-tr-sm shadow-sm' 
                  : 'bg-surface text-text-primary border border-border rounded-2xl rounded-tl-sm shadow-sm'
                }
              `}>
                {msg.content}
              </div>
              <span className="font-label-sm text-[11px] text-text-tertiary mt-1.5 px-1">
                {msg.time} {msg.sender === 'user' && '• You'}
              </span>
            </div>
            
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-border bg-surface shrink-0 absolute bottom-0 left-0 right-0 w-full z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto relative group">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="w-full bg-surface-secondary border border-border rounded-xl pl-5 pr-14 py-4 font-body-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-sm" 
            placeholder="Ask Copilot about policies, compliance gaps, or evidence... (Press Enter to send)" 
            rows={2}
          ></textarea>
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-3 bottom-3 w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
        <p className="text-center font-label-sm text-[11px] text-text-tertiary mt-3">
          AI Copilot can make mistakes. Verify important compliance information.
        </p>
      </div>
    </div>
  );
};
