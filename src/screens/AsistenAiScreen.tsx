import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface AsistenAiScreenProps {
  onApplySubstitution?: () => void;
}

export const AsistenAiScreen: React.FC<AsistenAiScreenProps> = ({ onApplySubstitution }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Halo Pak Budi! Formula Broiler Finisher (Kandang B) terpantau kekurangan Protein Kasar (tercatat 17.8% dari target 19.0%). Ada yang perlu kita optimalkan sekarang?',
      time: '09:41 AM'
    },
    {
      id: 'm2',
      sender: 'user',
      text: 'Bagaimana cara menaikkan protein tanpa membuat biaya pakan melonjak tinggi?',
      time: '09:42 AM'
    },
    {
      id: 'm3',
      sender: 'assistant',
      text: 'Berikut kalkulasi komparasi bahan pakan dengan rasio konversi harga paling efisien di Kabupaten Blitar:',
      time: '09:42 AM',
      richCard: {
        type: 'substitution',
        title: 'Rekomendasi Utama',
        matchRate: '98% Cocok',
        headline: 'Substitusi Parsial: Tepung Ikan Murni',
        desc: 'Tambahkan +2.5% Tepung Ikan & kurangi porsi dedak kasar secara seimbang.',
        pkCurrent: '19.4%',
        pkTarget: '/ 19.0%',
        costImpact: '+Rp 120',
        totalCost: 'Total: Rp 6.970/kg',
        note: 'Opsi cadangan: Bungkil Inti Sawit (PK 16%) lebih hemat Rp 40/kg, namun serat kasar bertambah +1.1%.'
      }
    }
  ]);

  const [applied, setApplied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPrompts = [
    { label: 'Cari bahan alternatif', icon: 'manage_search', prompt: 'Cari bahan alternatif pengganti bungkil kedelai lokal yang murah.' },
    { label: 'Lebih murah', icon: 'payments', prompt: 'Bagaimana racikan formula yang biayanya paling murah tapi tetap lulus SNI?' },
    { label: 'Kenapa tidak layak?', icon: 'help', prompt: 'Kenapa formula saat ini dianggap tidak layak standar SNI?' },
    { label: 'Ganti jagung', icon: 'grass', prompt: 'Apa bahan terbaik untuk mensubstitusi jagung pipil jika harganya naik?' }
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      time: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // AI Response generation
    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';
      let replyCard: any = undefined;

      const lower = text.toLowerCase();

      if (!isOnline) {
        replyText = '(Mode Offline) Saya menggunakan cache tabel gizi standar SNI lokal kandang Anda. Jagung giling rata-rata memiliki PK 8.6% dan EM 3370 kkal. Untuk data harga pasar komersil terbaru Blitar, sambungkan kembali perangkat ke internet.';
      } else if (lower.includes('alternatif') || lower.includes('kedelai') || lower.includes('sbm')) {
        replyText = 'Untuk mengurangi ketergantungan pada SBM (Bungkil Kedelai import), Anda dapat memakai kombinasi Tepung Daun Kelor (PK 25-28%) maksimal 5% atau Bungkil Kelapa (PK 18-20%) dengan penambahan enzim amilase & protease agar kecernaan unggas tetap optimal.';
        replyCard = {
          type: 'substitution',
          title: 'Substitusi SBM',
          matchRate: '95% Efisien',
          headline: 'Kombinasi Bungkil Kelapa + Asam Amino Sintetis',
          desc: 'Ganti 5% SBM dengan 4% Bungkil Kelapa + 0.1% L-Lisin & DL-Metionin murni.',
          pkCurrent: '19.1%',
          pkTarget: '/ 19.0%',
          costImpact: '-Rp 95',
          totalCost: 'Hemat Rp 47.500/sak',
          note: 'Catatan: Jangan gunakan dedak berjamur/tengik karena aflatoksin menurunkan FCR drastis.'
        };
      } else if (lower.includes('murah') || lower.includes('biaya')) {
        replyText = 'Strategi termurah saat ini adalah memanfaatkan bekatul kualitas super (PK 12%) maksimal 20% dan menambah minyak sawit mentah (CPO) 1.5% sebagai pendongkrak energi metabolisme termurah (8.600 kkal/kg).';
      } else if (lower.includes('kenapa') || lower.includes('layak')) {
        replyText = 'Formula sebelumnya belum layak karena pembatasan maksimal bungkil kedelai (SBM) disetel pada 20%. Tanpa sumber protein tambahan seperti tepung ikan atau MBM, kadar Protein Kasar hanya mentok di 17.8% (defisit 1.2% dari batas SNI 19%).';
      } else if (lower.includes('jagung')) {
        replyText = 'Pengganti jagung terbaik di Indonesia adalah Polar Gandum atau Onggok Singkong Terfermentasi. Jika memakai singkong, wajib tambahkan enzim fitase dan metionin karena singkong minim asam amino sulfur.';
      } else {
        replyText = `Pertanyaan bagus mengenai "${text}". Berdasarkan standar SNI Kementan RI, ransum unggas broiler grower membutuhkan rasio protein-energi sekitar 1:155. Komposisi jagung 52%, dedak 20%, dan SBM 20% sudah menjadi rasio dasar yang stabil dan aman untuk pencernaan ayam.`;
      }

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        richCard: replyCard
      };

      setMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  const handleApplyCard = () => {
    setApplied(true);
    if (onApplySubstitution) {
      onApplySubstitution();
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Assistant Identity Banner (Shrink-0) */}
      <div className="shrink-0 mx-4 mb-2 p-3 rounded-[20px] bg-white shadow-xs border border-[#e5e7eb] flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full bg-[#7cf994]/40 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px] text-[#006e2f]" style={{ fontVariationSettings: "'FILL' 1" }}>
              smart_toy
            </span>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${isOnline ? 'bg-[#22c55e]' : 'bg-red-500'}`}></span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-title-md text-[14px] font-bold text-[#121c2a] truncate">
                CluckAI Dokter Nutrisi
              </span>
              <span className="material-symbols-outlined text-[15px] text-[#006e2f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
            <span className="font-body-sm text-[11px] text-[#6d7b6c] truncate">
              Pakar formulasi mandiri &amp; substitusi lokal
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOnline(!isOnline)}
          title={isOnline ? 'Beralih ke mode offline' : 'Beralih ke mode online'}
          className="px-2.5 py-1.5 rounded-full bg-[#eff4ff] text-[#006e2f] hover:bg-[#e6eeff] transition-colors flex items-center gap-1 text-[11px] font-bold border border-[#e6eeff]"
        >
          <span className="material-symbols-outlined text-[15px]">
            {isOnline ? 'wifi' : 'wifi_off'}
          </span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </button>
      </div>

      {/* Offline Warning Banner */}
      {!isOnline && (
        <div className="shrink-0 mx-4 mb-2 px-3.5 py-2 rounded-[16px] bg-[#ffddb8] text-[#2a1700] flex items-center gap-2.5 shadow-xs border border-amber-300">
          <span className="material-symbols-outlined text-[18px] text-[#855300]">wifi_off</span>
          <span className="font-body-sm text-[11px] flex-1 leading-snug font-medium">
            Koneksi lemah. Asisten beralih ke cache data tabel gizi lokal kandang.
          </span>
        </div>
      )}

      {/* Chat Stream Container (Scrollable Middle) */}
      <div className="flex-1 overflow-y-auto phone-scrollbar px-4 pt-2 pb-8 flex flex-col gap-3.5 min-h-0">
        {messages.map((msg) => {
          const isBot = msg.sender === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex gap-2 ${isBot ? 'max-w-[95%] self-start items-end' : 'max-w-[85%] self-end items-end flex-row-reverse'}`}
            >
              {isBot && (
                <div className="w-7 h-7 rounded-full bg-[#7cf994]/50 flex items-center justify-center shrink-0 mb-1 text-[#006e2f]">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                </div>
              )}

              <div className="flex flex-col gap-1 w-full">
                <div
                  className={`p-3.5 shadow-xs ${
                    isBot
                      ? 'rounded-[20px] rounded-bl-xs bg-[#eff4ff] text-[#121c2a] border border-[#e6eeff]'
                      : 'rounded-[20px] rounded-br-xs bg-[#22c55e] text-white'
                  }`}
                >
                  <p className="font-body-md text-[13px] leading-relaxed">
                    {msg.text}
                  </p>

                  {/* Rich Recommendation Card */}
                  {msg.richCard && (
                    <div className="mt-3 bg-white p-3.5 shadow-xs rounded-[16px] border border-[#e5e7eb] flex flex-col gap-2.5 text-[#121c2a]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#7cf994]/40 text-[#007230] font-label-sm text-[11px] font-bold">
                          {msg.richCard.title}
                        </span>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#006e2f] border border-[#e6eeff]">
                          <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                          </span>
                          <span className="font-label-sm text-[10px] font-bold">{msg.richCard.matchRate}</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-title-md text-[13px] text-[#121c2a] font-bold">
                          {msg.richCard.headline}
                        </h4>
                        <p className="font-body-sm text-[11px] text-[#6d7b6c] leading-snug">
                          {msg.richCard.desc}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-[#eff4ff] flex flex-col items-center justify-center text-center rounded-[12px] border border-[#e6eeff]">
                          <span className="font-label-sm text-[10px] text-[#6d7b6c]">Protein Kasar (PK)</span>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="font-metric-display text-[16px] text-[#006e2f] font-bold">
                              {msg.richCard.pkCurrent}
                            </span>
                            <span className="font-label-sm text-[10px] text-[#6d7b6c]">{msg.richCard.pkTarget}</span>
                          </div>
                          <span className="text-[10px] text-[#006e2f] font-semibold mt-0.5">Memenuhi SNI</span>
                        </div>

                        <div className="p-2 bg-[#eff4ff] flex flex-col items-center justify-center text-center rounded-[12px] border border-[#e6eeff]">
                          <span className="font-label-sm text-[10px] text-[#6d7b6c]">Dampak Biaya</span>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="font-metric-display text-[16px] text-[#121c2a] font-bold">
                              {msg.richCard.costImpact}
                            </span>
                            <span className="font-label-sm text-[10px] text-[#6d7b6c]">/kg</span>
                          </div>
                          <span className="text-[10px] text-[#6d7b6c] mt-0.5">{msg.richCard.totalCost}</span>
                        </div>
                      </div>

                      <div className="p-2 bg-[#eff4ff] flex items-start gap-2 rounded-[10px] text-[#653e00]">
                        <span className="material-symbols-outlined text-[16px] text-[#855300] shrink-0 mt-0.5">lightbulb</span>
                        <p className="font-body-sm text-[10px] leading-snug">
                          {msg.richCard.note}
                        </p>
                      </div>

                      <button
                        onClick={handleApplyCard}
                        disabled={applied}
                        className={`w-full py-2.5 px-3 rounded-[12px] font-label-md text-[12px] font-bold shadow-xs transition-all flex items-center justify-center gap-2 border ${
                          applied
                            ? 'bg-[#7cf994]/40 text-[#007230] border-[#22c55e]'
                            : 'bg-[#22c55e] text-white hover:bg-[#006e2f] border-transparent active:scale-[0.98]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[17px]">
                          {applied ? 'check_circle' : 'auto_awesome'}
                        </span>
                        <span>{applied ? 'Tersimpan di Kalkulator Batch!' : 'Terapkan & Hitung Ulang Batch'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <span className={`font-label-sm text-[10px] text-[#6d7b6c] px-1 ${isBot ? 'text-left' : 'text-right'}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2 max-w-[80%] self-start items-end">
            <div className="w-7 h-7 rounded-full bg-[#7cf994]/50 flex items-center justify-center shrink-0 mb-1 text-[#006e2f]">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
            </div>
            <div className="p-3.5 rounded-[20px] rounded-bl-xs bg-[#eff4ff] text-[#121c2a] shadow-xs flex items-center gap-1.5 border border-[#e6eeff]">
              <span className="w-2 h-2 rounded-full bg-[#6d7b6c] animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-[#6d7b6c] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#6d7b6c] animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} className="h-4 shrink-0" />
      </div>

      {/* Pinned Bottom Input & Suggestion Dock (Always Fixed at Bottom) */}
      <div className="shrink-0 w-full bg-white/95 backdrop-blur-md pt-2 pb-3 px-4 border-t border-[#e6eeff] z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        {/* Quick Reply Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.prompt)}
              className="quick-chip shrink-0 px-3 py-1 rounded-full bg-[#eff4ff] text-[#121c2a] border border-[#e6eeff] hover:bg-[#d9e7ff] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px] text-[#006e2f]">
                {q.icon}
              </span>
              <span className="font-label-md text-[11px] font-semibold">{q.label}</span>
            </button>
          ))}
        </div>

        {/* Input Box Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="w-full flex items-center gap-2 bg-[#eff4ff] rounded-full p-1.5 border border-[#e6eeff]"
        >
          <button
            type="button"
            aria-label="Unggah foto label atau bahan"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#6d7b6c] hover:text-[#121c2a] hover:bg-white transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[19px]">add_photo_alternate</span>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tanya nutrisi atau ganti bahan..."
            className="flex-1 bg-transparent text-[#121c2a] placeholder:text-[#6d7b6c] text-[13px] font-body-md outline-none px-1"
          />

          <button
            type="button"
            aria-label="Input Suara"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#6d7b6c] hover:text-[#121c2a] hover:bg-white transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-[19px]">mic</span>
          </button>

          <button
            type="submit"
            aria-label="Kirim Pesan"
            className="w-9 h-9 rounded-full bg-[#22c55e] text-white flex items-center justify-center shadow-xs hover:bg-[#006e2f] active:scale-95 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[17px] ml-0.5">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
