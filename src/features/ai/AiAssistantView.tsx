import React, { useState } from 'react';

export const AiAssistantView = () => {
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'ai',
      content: 'Hello, I am Shield AI Copilot. I can help you analyze compliance gaps, review evidence, or answer questions about your organization\'s security posture.',
      time: '10:40 AM',
      isAgentic: false,
    }
  ]);
  const [input, setInput] = useState('');

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#0F172A] -m-4 md:-m-6 lg:-m-8">
      {/* Copilot Header */}
      <div className="px-5 py-4 border-b border-[#334155] flex justify-between items-center bg-[#0F172A] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(53,37,205,0.2)]">
            <span className="material-symbols-outlined text-[#FFFFFF] text-sm">smart_toy</span>
          </div>
          <div>
            <h3 className="font-label-md text-label-md font-semibold text-[#F8FAFC]">Shield AI Copilot</h3>
            <span className="font-label-sm text-label-sm text-[#94A3B8] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success inline-block"></span> Active
            </span>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col max-w-4xl mx-auto w-full">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'flex-col items-end gap-1' : 'gap-3'}`}>
            
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 shadow-[0_0_15px_rgba(53,37,205,0.2)]">
                <span className="material-symbols-outlined text-[#FFFFFF] text-[14px]">smart_toy</span>
              </div>
            )}
            
            <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'flex-1'}`}>
              <div className={`
                px-4 py-3 font-body-sm text-body-sm leading-relaxed max-w-[85%]
                ${msg.sender === 'user' 
                  ? 'bg-[#334155] text-[#F8FAFC] rounded-lg rounded-tr-sm' 
                  : 'bg-[#1E293B] text-[#E2E8F0] border border-primary/30 rounded-lg rounded-tl-sm shadow-[0_0_10px_rgba(53,37,205,0.1)]'
                }
              `}>
                {msg.content}
              </div>
              <span className="font-label-sm text-[10px] text-[#64748B] mt-1 block">
                {msg.time}
              </span>
            </div>
            
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-[#334155] bg-[#0F172A] shrink-0">
        <div className="max-w-4xl mx-auto relative group">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-[#1E293B] border border-[#334155] rounded-lg pl-4 pr-12 py-3 text-[#F8FAFC] font-body-sm text-body-sm placeholder:text-[#64748B] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none shadow-sm" 
            placeholder="Ask Copilot about policies, compliance gaps, or evidence..." 
            rows={2}
          ></textarea>
          <button className="absolute right-3 bottom-3 w-8 h-8 bg-primary text-[#FFFFFF] rounded flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
