import React from 'react';

interface NotificationModalProps {
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
  const notifications = [
    {
      id: 1,
      title: 'Harga Jagung Giling Turun 5%',
      desc: 'Pasar Blitar mencatat harga jagung pipil turun ke Rp 5.200/kg. Perbarui harga untuk efisiensi formulasi.',
      time: '15 menit lalu',
      icon: 'trending_down',
      isNew: true
    },
    {
      id: 2,
      title: 'Sisa Stok Bekatul Tinggal 1.100 kg',
      desc: 'Perkiraan sisa mencukupi 3.5 hari operasional pencampuran. Pesan tambahan pasokan.',
      time: '2 jam lalu',
      icon: 'inventory_2',
      isNew: true
    },
    {
      id: 3,
      title: 'Batch #14 Berhasil Dicampur',
      desc: '500 kg ransum Broiler Finisher telah selesai dimixer dan siap didistribusikan ke feeder kandang A.',
      time: 'Hari ini, 09:45 WIB',
      icon: 'check_circle',
      isNew: false
    }
  ];

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-[28px] sm:rounded-[24px] w-full max-w-md p-5 flex flex-col gap-4 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006e2f] text-[24px]">notifications</span>
            <div>
              <h3 className="font-headline-sm text-[16px] text-[#121c2a] font-bold">Pemberitahuan Kandang</h3>
              <p className="text-[11px] text-[#6d7b6c]">Info pasar pakan &amp; mesin IoT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#6d7b6c]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-[18px] border transition-all flex items-start gap-3 ${
                n.isNew ? 'bg-[#eff4ff]/60 border-[#22c55e]' : 'bg-white border-[#e5e7eb]'
              }`}
            >
              <div className="w-10 h-10 rounded-[12px] bg-[#7cf994]/30 text-[#006e2f] flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[20px]">{n.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-[13px] font-bold text-[#121c2a] truncate">{n.title}</h4>
                  {n.isNew && (
                    <span className="w-2 h-2 rounded-full bg-[#ef9900] shrink-0"></span>
                  )}
                </div>
                <p className="text-[11px] text-[#3d4a3d] mt-0.5 leading-snug">{n.desc}</p>
                <span className="text-[10px] text-[#6d7b6c] mt-1 block">{n.time}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-[#006e2f] text-white font-bold text-[13px] hover:bg-[#004b1e] mt-1"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
