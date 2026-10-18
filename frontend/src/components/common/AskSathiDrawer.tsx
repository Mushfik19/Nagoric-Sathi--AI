import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, ShieldCheck, HelpCircle } from 'lucide-react';
import { VerifiedServiceKnowledge } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const DEFAULT_SUGGESTIONS = [
  'ই-ট্রেড লাইসেন্স ফি ও প্রয়োজনীয় কাগজ কী?',
  'অনলাইন জন্ম নিবন্ধনে কী কী লাগে?',
  'হোল্ডিং ট্যাক্স কিভাবে জমা দেব?',
  'ড্রেন বা জলাবদ্ধতার জরুরি এসএলএ কত?',
  'এআই গেটের ৮০% কনফিডেন্স নিয়ম কী?'
];

const EXTENDED_KB: Record<string, string> = {
  trade: `🏛️ **ই-ট্রেড লাইসেন্স (TRD-01) নির্দেশিকা:**
• **প্রয়োজনীয় কাগজপত্র:** জাতীয় পরিচয়পত্র (NID), দোকান/অফিস ভাড়ার চুক্তিপত্র বা মালিকানার দলিল, ২ কপি পাসপোর্ট ছবি, লিমিটেড কোম্পানির জন্য TIN ও মেমোরেন্ডাম।
• **সরকারি ফি:** ৫০০ থেকে ৫,০০০ টাকা (ব্যবসার ধরন ও পরিধির ওপর নির্ভরশীল)।
• **আবেদন পোর্টাল:** etradelicense.gov.bd
• **আনুমানিক সময়সীমা:** ৩-৫ কর্মদিবস।`,

  birth: `👶 **অনলাইন জন্ম নিবন্ধন (BRG-02) নির্দেশিকা:**
• **প্রয়োজনীয় কাগজপত্র:** ইপিআই কার্ড বা হাসপাতালের বার্থ স্লিপ, বাবা-মায়ের ১৭ ডিজিটের ডিজিটাল জন্ম নিবন্ধন ও এনআইডি, বাসার হোল্ডিং ট্যাক্স বা বিদ্যুৎ বিল।
• **সরকারি ফি:** ৪৫ দিনের মধ্যে বিনামূল্যে; ৫ বছর পর্যন্ত ২৫ টাকা; পরবর্তী সময়ে ৫০-১০০ টাকা।
• **আবেদন পোর্টাল:** bdris.gov.bd
• **পদ্ধতি:** অনলাইনে আবেদন করে প্রিন্ট কপি ওয়ার্ড কাউন্সিলর অফিসে জমা দিন।`,

  tax: `🏢 **হোল্ডিং ট্যাক্স ও ই-পেমেন্ট (HLD-03) নির্দেশিকা:**
• **প্রয়োজনীয় কাগজপত্র:** জমির মূল দলিল ও নামজারি খতিয়ান, রাজউক/সিডিএ অনুমোদিত বিল্ডিং প্ল্যান, পূর্ববর্তী বছরের পরিশোধিত রসিদ।
• **অফিসিয়াল হার:** বাৎসরিক মূল্যায়নের ১২% (পৌরকর, ড্রেনেজ ও সড়ক আলোকায়ন কর সমন্বিত)।
• **অনলাইন পেমেন্ট:** holdingtax.gov.bd পোর্টাল বা সিটি কর্পোরেশন অ্যাপে বিকাশ/নগদ/কার্ডের মাধ্যমে জমা দেওয়া যায়।`,

  waste: `🚛 **বিশেষ ও নির্মাণ বর্জ্য অপসারণ (WST-04) নির্দেশিকা:**
• **প্রয়োজনীয় কাগজপত্র:** আবেদনকারীর এনআইডি, বর্জ্যের অবস্থান ও আনুমানিক আয়তনের ছবি।
• **অফিসিয়াল ফি:** ১,২০০ টাকা প্রতি মিনি-ট্রাক ট্রিপ।
• **বুকিং পদ্ধতি:** সিটি কর্পোরেশনের হটলাইন ১৬১০৬ বা নাগরিক পোর্টালের মাধ্যমে বুকিং দেওয়ার ২৪ ঘণ্টার মধ্যে কন্টেইনার/ট্রাক পাঠানো হয়।`,

  road: `🛠️ **রাস্তা খনন ও ইউটিলিটি এনওসি (ENG-05) নির্দেশিকা:**
• **প্রয়োজনীয় কাগজপত্র:** ওয়াসা/তিতাস/ডেসকোর চাহিদাপত্র ও সংযোগ নকশা, খননের দৈর্ঘ্য-প্রস্থের রুট ম্যাপ।
• **ফি:** প্রতি বর্গমিটার বিটুমিনাস রাস্তা ৩,৫০০ টাকা (পুনঃনির্মাণ জামানত)।
• **অনুমোদন:** সহকারী প্রকৌশলীর সাইট ইন্সপেকশনের পর ২-৩ দিনে এনওসি প্রদান করা হয়।`,

  drain: `🌊 **ড্রেনেজ ও জলাবদ্ধতা সংক্রান্ত সহায়তা:**
• **অভিযোগ দাখিল:** নাগরিক সাথী পোর্টালে ড্রেনের ছবি ও অবস্থান দিয়ে তাৎক্ষণিক রিপোর্ট করুন।
• **এসএলএ সময়সীমা:** জরুরি ব্লকেজে ২ ঘণ্টার মধ্যে ফিল্ড রেসপন্স টিম উপস্থিত হয়।
• **সরকারি ফি:** সরকারি ড্রেন পরিষ্কার বা মেরামতে কোনো নাগরিক ফি নেই (সম্পূর্ণ ফ্রি)।`,

  light: `💡 **সড়ক বাতি স্থাপন ও মেরামত:**
• নষ্ট বাতি বা সংযোগহীন পোলের নম্বর দিয়ে রিপোর্ট করুন।
• ওয়ার্ড ইলেকট্রিশিয়ান টিম সর্বোচ্চ ২৪ থেকে ৪৮ ঘণ্টার মধ্যে বাতি প্রতিস্থাপন সম্পন্ন করে।`,

  hotline: `📞 **জরুরি সিটি কর্পোরেশন যোগাযোগ:**
• পৌর নাগরিক সেবা হটলাইন: **১৬১০৬** (টোল-ফ্রি)
• জরুরি দুর্যোগ ও কন্ট্রোল রুম: **০২-২২২২XXXX**
• সেবা সময়: ২৪ ঘণ্টা ৭ দিন।`,

  sla: `⏱️ **নাগরিক সাথী এআই এসএলএ (SLA) নির্দেশিকা:**
• **জরুরি নিরাপত্তা ঝুঁকি (Hazard):** ২ ঘণ্টার মধ্যে ওয়ার্ড রেসপন্স এবং ৬ ঘণ্টার মধ্যে সমাধান লক্ষ্যমাত্রা।
• **সাধারণ বর্জ্য ও ড্রেন পরিষ্কার:** ২৪ থেকে ৪৮ ঘণ্টা।
• **অবকাঠামো ও রাস্তা মেরামত:** ৩ থেকে ৭ কর্মদিবস।
• বৈধ অপেক্ষার কারণ (Waiting Reason) নথিভুক্ত হলে এসএলএ টাইমার সাময়িকভাবে বিরতি থাকে।`,

  ai_gate: `🛡️ **এআই কনফিডেন্স গেট ও সুরক্ষা নীতি:**
• এআই মডেলের নিশ্চয়তা ৮০% বা তদূর্ধ্ব হলে স্বয়ংক্রিয় দায়িত্ব বণ্টন প্রস্তাব চূড়ান্ত করা হয়।
• ৮০% এর নিচে নামলে অথবা জননিরাপত্তা ফ্ল্যাগ থাকলে সরাসরি ওয়ার্ড ডেস্কের ম্যানুয়াল পর্যালোচনায় পাঠানো হয়।
• মূল দর্শন: “AI proposes, People decide.”`,

  objection: `⚖️ **নাগরিক আপত্তি ও পুনঃপর্যালোচনা:**
• মাঠ কর্মকর্তা সমাধান প্রমাণ হিসেবে কাজের আগের ও পরের ছবি (GPS ট্যাগসহ) আপলোড করেন।
• নাগরিক সন্তুষ্ট না হলে ৭২ ঘণ্টার মধ্যে "আপত্তি দাখিল" করতে পারেন।
• আপত্তি জমা দিলে মামলাটি স্বয়ংক্রিয়ভাবে Reopened হয়ে বিভাগীয় প্রধানের কিউতে যায়।`
};

export const AskSathiDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'আসসালামু আলাইকুম! আমি নাগরিক সাথী এআই সহকারী। নাগরিক সেবা, ট্রেড লাইসেন্স, জন্ম নিবন্ধন, ড্রেনেজ কিংবা যে কোনো নাগরিক বিষয়ে জিজ্ঞাসা করতে পারেন।',
      timestamp: 'এখন'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Listen to open-ask-sathi events from service cards or checklist
  useEffect(() => {
    const handleContextTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{
        service?: VerifiedServiceKnowledge;
        type?: 'service' | 'checklist';
        query?: string;
      }>;
      const detail = customEvent.detail;
      setIsOpen(true);

      if (detail?.service) {
        const s = detail.service;
        const mandatoryDocs = s.requiredDocuments?.filter(d => d.mandatory).map(d => d.name).join(', ') || 'এনআইডি ও ছবি';
        const contextText = `🏛️ **${s.title} (${s.code})** সেবার জন্য সহায়তা:\n\n` +
          `• **দায়িত্বপ্রাপ্ত বিভাগ:** ${s.department}\n` +
          `• **অফিসিয়াল ফি:** ${s.officialFee}\n` +
          `• **বাধ্যতামূলক ডকুমেন্টস:** ${mandatoryDocs}\n` +
          `• **অফিসিয়াল পোর্টাল:** ${s.officialPortalUrl || 'সরকারি সিটি পোর্টাল'}\n\n` +
          `এই সেবার আবেদন ফরম পূরণ, প্রয়োজনীয় কাগজপত্র সংগ্রহ কিংবা জমা দেওয়ার নিয়ম নিয়ে আপনার কী জানার আছে?`;

        setMessages(prev => [
          ...prev,
          {
            id: `service_context_${Date.now()}`,
            sender: 'assistant',
            text: contextText,
            timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else if (detail?.type === 'checklist') {
        const checklistText = `📋 **নাগরিক সেবা আবেদন পূর্ববর্তী চেকলিস্ট ও সহায়তা:**\n\n` +
          `সরকারি যে কোনো সেবায় সফল আবেদনের জন্য ৩টি প্রাথমিক নথি সবসময় ডিজিটাল প্রস্তুত রাখুন:\n` +
          `১. **পরিচয়পত্র:** মূল জাতীয় পরিচয়পত্র (NID) অথবা ১৭ ডিজিটের অনলাইন জন্ম নিবন্ধন।\n` +
          `২. **ঠিকানা প্রমাণপত্র:** হালনাগাদ হোল্ডিং ট্যাক্স রসিদ বা ভাড়ার চুক্তিপত্রের কপি।\n` +
          `৩. **ছবি:** সদ্য তোলা পাসপোর্ট সাইজ রঙিন ছবি (স্ক্যান করা জেপিজি)।\n\n` +
          `আপনি ঠিক কোন সেবাটি গ্রহণ করতে চান? নাম লিখলে আমি নির্দিষ্ট তালিকা ও গাইডলাইন দেব।`;

        setMessages(prev => [
          ...prev,
          {
            id: `checklist_context_${Date.now()}`,
            sender: 'assistant',
            text: checklistText,
            timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    };

    window.addEventListener('open-ask-sathi', handleContextTrigger);
    return () => {
      window.removeEventListener('open-ask-sathi', handleContextTrigger);
    };
  }, []);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Pre-grounded contextual reasoning response
    setTimeout(() => {
      let reply = 'আপনার প্রশ্নটির জন্য ধন্যবাদ। সিটি কর্পোরেশনের নাগরিক সেবা পোর্টাল ও নির্দেশিকা অনুযায়ী আপনার বিষয়টি যাচাই করা হচ্ছে। অনুগ্রহ করে সেবার নাম (যেমন ট্রেড লাইসেন্স, জন্ম নিবন্ধন, ট্যাক্স বা ড্রেন) উল্লেখ করুন।';
      const q = userText.toLowerCase();

      if (q.includes('ট্রেড') || q.includes('লাইসেন্স') || q.includes('trade') || q.includes('trd')) {
        reply = EXTENDED_KB.trade;
      } else if (q.includes('জন্ম') || q.includes('নিবন্ধন') || q.includes('birth') || q.includes('brg') || q.includes('সনদ')) {
        reply = EXTENDED_KB.birth;
      } else if (q.includes('হোল্ডিং') || q.includes('ট্যাক্স') || q.includes('কর') || q.includes('tax') || q.includes('hld') || q.includes('বাড়ি')) {
        reply = EXTENDED_KB.tax;
      } else if (q.includes('বর্জ্য') || q.includes('ময়লা') || q.includes('আবর্জনা') || q.includes('waste') || q.includes('wst') || q.includes('ডাম্প')) {
        reply = EXTENDED_KB.waste;
      } else if (q.includes('রাস্তা') || q.includes('খনন') || q.includes('সড়ক') || q.includes('road') || q.includes('eng')) {
        reply = EXTENDED_KB.road;
      } else if (q.includes('ড্রেন') || q.includes('পানি') || q.includes('জলাবদ্ধতা') || q.includes('drain') || q.includes('drn')) {
        reply = EXTENDED_KB.drain;
      } else if (q.includes('বাতি') || q.includes('লাইট') || q.includes('সড়ক বাতি') || q.includes('light')) {
        reply = EXTENDED_KB.light;
      } else if (q.includes('হটলাইন') || q.includes('নম্বর') || q.includes('১৬১০৬') || q.includes('ফোন') || q.includes('কল')) {
        reply = EXTENDED_KB.hotline;
      } else if (q.includes('এসএলএ') || q.includes('সময়') || q.includes('sla') || q.includes('ঘণ্টা')) {
        reply = EXTENDED_KB.sla;
      } else if (q.includes('এআই') || q.includes('গেট') || q.includes('confidence') || q.includes('৮০%')) {
        reply = EXTENDED_KB.ai_gate;
      } else if (q.includes('আপত্তি') || q.includes('সমাধান') || q.includes('objection') || q.includes('reopen') || q.includes('কাজ হয়নি')) {
        reply = EXTENDED_KB.objection;
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 300);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-full bg-[#166534] hover:bg-[#14532d] text-white border border-[#22c55e]/40 shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
        aria-label="সাথী এআই অ্যাসিস্ট্যান্ট ওপেন করুন"
      >
        <Sparkles className="w-4 h-4 text-[#d4c19a]" />
        <span className="text-xs font-bold tracking-wide">Ask Sathi · সাথী এআই</span>
        <span className="text-[#d4c19a] text-xs font-bold">✦</span>
      </button>

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="সাথী এআই চ্যাট প্যানেল"
          className="fixed bottom-20 right-6 z-50 w-[92vw] sm:w-[410px] h-[560px] max-h-[82vh] flex flex-col bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-[var(--bg)] border-b border-[var(--line)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#eaf5ed] border border-[#bbf7d0] text-[#166534] flex items-center justify-center font-bold">
                <Bot className="w-4 h-4 text-[#166534]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-[var(--ink)]">নাগরিক সাথী এআই</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#eaf5ed] text-[#166534] border border-[#bbf7d0] font-mono font-bold">
                    VERIFIED
                  </span>
                </div>
                <p className="text-[10px] text-[var(--muted)]">স্মার্ট সিটি সিটিজেন অ্যাসিস্ট্যান্ট</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--bg)] transition cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--paper)]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#eaf5ed] text-[#166534] border border-[#bbf7d0] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✦
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#166534] text-white rounded-br-none'
                      : 'bg-[var(--bg)] text-[var(--ink)] border border-[var(--line)] rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className={`block text-[9px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-green-100' : 'text-[var(--muted)]'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Suggestions */}
          <div className="px-3 py-2 bg-[var(--bg)] border-t border-[var(--line)] overflow-x-auto">
            <div className="flex gap-1.5 whitespace-nowrap">
              {DEFAULT_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(sug)}
                  className="px-2.5 py-1 rounded-lg text-[10px] bg-[var(--paper)] hover:bg-[#eaf5ed] text-[var(--ink)] hover:text-[#166534] border border-[var(--line)] hover:border-[#166534] transition cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-[var(--paper)] border-t border-[var(--line)] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="আপনার প্রশ্ন বা সেবার নাম লিখুন..."
              className="flex-1 bg-[var(--bg)] text-xs text-[var(--ink)] placeholder-[var(--muted)] px-3.5 py-2.5 rounded-xl border border-[var(--line)] focus:outline-none focus:border-[#166534] transition"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] disabled:opacity-40 text-white transition cursor-pointer shadow-xs"
              aria-label="বার্তা পাঠান"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </aside>
      )}
    </>
  );
};
