import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  GlassWater, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Droplets,
  History,
  Trophy,
  Pencil,
  Check,
  X,
  Save
} from 'lucide-react';

// --- HELPER FUNCTIONS ---
const getDocId = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

// --- COMPONENTS ---
const ProgressBar = ({ current, goal }) => {
  const percentage = Math.min(100, Math.max(0, (current / goal) * 100));
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className="relative flex items-center justify-center mx-auto my-6 transition-all duration-500 transform hover:scale-105"
      style={{ width: '250px', height: '250px', margin: '24px auto', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
    >
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="100" cy="100" r={radius} stroke="#E0F2FE" strokeWidth="18" fill="none" strokeLinecap="round" />
        <circle
          cx="100" cy="100" r={radius} stroke="#0EA5E9" strokeWidth="18" fill="none"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-slate-700">
        <span className="text-4xl font-bold font-mono text-sky-600" style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#0284c7' }}>{current}</span>
        <span className="text-sm font-medium text-slate-400" style={{ fontSize: '0.875rem', color: '#94a3b8' }}>/ {goal} ml</span>
        <div className="mt-2 text-xs font-semibold text-sky-400 bg-sky-50 px-2 py-1 rounded-full" style={{ marginTop: '0.5rem', fontSize: '0.75rem', backgroundColor: '#f0f9ff', color: '#38bdf8', padding: '2px 8px', borderRadius: '9999px' }}>
          {Math.round(percentage)}%
        </div>
      </div>
    </div>
  );
};

const QuickAddButton = ({ amount, onClick, icon: Icon, onDelete }) => (
  <div className="relative group" style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
    <button
      onClick={() => onClick(amount)}
      className="w-full flex flex-col items-center justify-center p-4 bg-white border-2 border-slate-100 rounded-3xl shadow-sm hover:shadow-md hover:border-sky-200 hover:bg-sky-50 transition-all active:scale-95"
      style={{ 
        width: '100%', 
        boxSizing: 'border-box', // CRITICAL FIX: Include padding in width calculation
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1rem', 
        paddingTop: '1.5rem', 
        backgroundColor: 'white', 
        border: '2px solid #f1f5f9', 
        borderRadius: '1.5rem',
        cursor: 'pointer',
        minHeight: '120px', 
        position: 'relative'
      }}
    >
      <div className="mb-2 p-2 bg-sky-100 rounded-full group-hover:bg-sky-200 transition-colors" style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#e0f2fe', borderRadius: '9999px' }}>
        <Icon className="w-6 h-6 text-sky-600" size={24} color="#0284c7" />
      </div>
      <span className="font-bold text-slate-700" style={{ fontWeight: 'bold', color: '#334155' }}>{amount}ml</span>
    </button>
    {onDelete && (
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(amount); }}
        className="absolute bg-red-50 text-red-500 rounded-full p-1 shadow-sm opacity-100 transition-opacity hover:bg-red-100"
        style={{ 
          position: 'absolute', 
          top: '8px', 
          right: '8px', 
          backgroundColor: '#fef2f2', 
          color: '#ef4444', 
          borderRadius: '9999px', 
          padding: '6px', 
          border: '2px solid white', 
          cursor: 'pointer',
          zIndex: 20,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          boxSizing: 'border-box'
        }}
      >
        <X size={14} />
      </button>
    )}
  </div>
);

// --- MAIN APP (LOCAL STORAGE VERSION) ---
export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [dailyData, setDailyData] = useState(() => {
    try {
      const saved = localStorage.getItem('hydroflow_data');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });
  
  const [customAmount, setCustomAmount] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  
  const [dailyGoal, setDailyGoal] = useState(() => {
    try {
      return parseInt(localStorage.getItem('hydroflow_goal')) || 2500;
    } catch (e) { return 2500; }
  });

  const [savedGlasses, setSavedGlasses] = useState(() => {
    try {
      const saved = localStorage.getItem('hydroflow_glasses');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(String(dailyGoal));

  const currentDocId = getDocId(selectedDate);
  const currentData = dailyData[currentDocId] || { total: 0, entries: [] };
  const defaultGlasses = [100, 400, 500];

  useEffect(() => { localStorage.setItem('hydroflow_data', JSON.stringify(dailyData)); }, [dailyData]);
  useEffect(() => { localStorage.setItem('hydroflow_goal', dailyGoal.toString()); }, [dailyGoal]);
  useEffect(() => { localStorage.setItem('hydroflow_glasses', JSON.stringify(savedGlasses)); }, [savedGlasses]);

  const handleSaveGoal = () => {
    const newGoal = parseInt(tempGoal);
    if (!isNaN(newGoal) && newGoal > 0) {
      setDailyGoal(newGoal); 
      setIsEditingGoal(false);
    }
  };

  const handleSavePreset = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (savedGlasses.includes(amount) || defaultGlasses.includes(amount)) { setCustomAmount(''); return; }
    const newGlasses = [...savedGlasses, amount].sort((a,b) => a - b);
    setSavedGlasses(newGlasses); 
    setCustomAmount('');
  };

  const handleDeletePreset = (amount) => {
    const newGlasses = savedGlasses.filter(g => g !== amount);
    setSavedGlasses(newGlasses);
  };

  const handleAddWater = (amount) => {
    if (amount <= 0) return;
    const newTotal = (currentData.total || 0) + amount;
    const newEntry = { amount, timestamp: new Date().toISOString(), id: Date.now().toString() };
    const newEntries = [...(currentData.entries || []), newEntry];
    setDailyData(prev => ({ ...prev, [currentDocId]: { total: newTotal, entries: newEntries } }));
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const amount = parseInt(customAmount);
    if (!isNaN(amount)) { handleAddWater(amount); setCustomAmount(''); }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const calendarGrid = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < firstDay; i++) { days.push(null); }
    for (let i = 1; i <= daysInMonth; i++) { days.push(new Date(year, month, i)); }
    return days;
  }, [selectedDate]);

  const allGlasses = [...defaultGlasses, ...savedGlasses].sort((a,b) => a - b);

  return (
    <div 
      className="min-h-screen bg-sky-50/50 p-4 md:p-8 font-sans text-slate-800"
      style={{ minHeight: '100vh', backgroundColor: '#f0f9ff', padding: '1rem', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}
    >
      <div 
        className="max-w-md mx-auto space-y-6"
        style={{ maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}
      >
        
        {/* Header */}
        <header className="flex items-center justify-between px-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '0.5rem', paddingRight: '0.5rem', boxSizing: 'border-box' }}>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="bg-sky-500 text-white p-2 rounded-xl" style={{ backgroundColor: '#0ea5e9', color: 'white', padding: '0.5rem', borderRadius: '0.75rem' }}><Droplets size={20} fill="currentColor" /></span>
              HydroFlow
            </h1>
            <p className="text-slate-400 text-sm mt-1" style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>Stay hydrated, stay healthy.</p>
          </div>
          <div className="text-right">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1" style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Goal</div>
             {isEditingGoal ? (
               <div className="flex items-center gap-1">
                 <input type="number" value={tempGoal} onChange={(e) => setTempGoal(e.target.value)} className="w-20 p-1 text-right font-bold text-sky-600 border border-sky-200 rounded text-lg focus:outline-none focus:ring-2 focus:ring-sky-300" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()} />
                 <button onClick={handleSaveGoal} className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200"><Check size={14} /></button>
                 <button onClick={() => { setIsEditingGoal(false); setTempGoal(String(dailyGoal)); }} className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"><X size={14} /></button>
               </div>
             ) : (
               <div className="flex items-center justify-end gap-2 group cursor-pointer p-1 -mr-1 rounded hover:bg-slate-50 transition-colors" onClick={() => setIsEditingGoal(true)} title="Click to edit goal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', cursor: 'pointer' }}>
                 <div className="text-xl font-bold text-sky-600" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0284c7' }}>{dailyGoal}ml</div>
                 <Pencil size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
             )}
          </div>
        </header>

        {/* Date Navigator */}
        <div 
          className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center justify-between"
          style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '1rem', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', boxSizing: 'border-box' }}
        >
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-sky-500 transition-colors" style={{ padding: '0.5rem', borderRadius: '9999px', border: 'none', background: 'transparent', cursor: 'pointer' }}><ChevronLeft size={24} /></button>
          <div className="text-center">
            <h2 className="font-bold text-lg text-slate-700" style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#334155' }}>{selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</h2>
            <p className="text-sm text-slate-400" style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-sky-500 transition-colors" style={{ padding: '0.5rem', borderRadius: '9999px', border: 'none', background: 'transparent', cursor: 'pointer' }}><ChevronRight size={24} /></button>
        </div>

        {/* Main Display */}
        <div 
          className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-sky-100/50 relative overflow-hidden"
          style={{ backgroundColor: 'white', borderRadius: '2.5rem', padding: '1.5rem', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(224, 242, 254, 0.5)', boxSizing: 'border-box' }}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-300 via-blue-400 to-sky-300 opacity-50" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'linear-gradient(to right, #7dd3fc, #60a5fa, #7dd3fc)', opacity: 0.5 }}></div>
          {showHistory ? (
             <div className="h-[320px] overflow-y-auto pr-2 custom-scrollbar" style={{ height: '320px', overflowY: 'auto' }}>
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 py-2 border-b border-slate-100">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700"><History size={18} /> Daily Log</h3>
                  <button onClick={() => setShowHistory(false)} className="text-xs font-bold text-sky-500 hover:text-sky-600">BACK TO RING</button>
                </div>
                {currentData.entries && currentData.entries.length > 0 ? (
                  <div className="space-y-3">
                    {currentData.entries.slice().reverse().map((entry) => (
                      <div key={entry.id || entry.timestamp} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-full shadow-sm"><GlassWater size={16} className="text-sky-500" /></div>
                          <div><div className="font-bold text-slate-700">{entry.amount}ml</div><div className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><GlassWater size={48} className="mb-2" /><p>No water logs yet.</p></div>
                )}
             </div>
          ) : (
            <>
              <div className="relative z-10"><ProgressBar current={currentData.total} goal={dailyGoal} /></div>
              <button onClick={() => setShowHistory(true)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-sky-500 transition-colors" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}><History size={20} /></button>
              {currentData.total >= dailyGoal && <div className="absolute top-6 left-6 animate-bounce" style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}><Trophy className="text-yellow-400 drop-shadow-sm" size={24} color="#facc15" /></div>}
            </>
          )}
        </div>

        {/* Controls - IMPROVED SPACING & POSITIONING */}
        <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', boxSizing: 'border-box' }}>
          <div className="grid grid-cols-3 gap-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', boxSizing: 'border-box' }}>
            {allGlasses.map((amount) => (
              <QuickAddButton key={amount} amount={amount} onClick={handleAddWater} icon={GlassWater} onDelete={savedGlasses.includes(amount) ? handleDeletePreset : undefined} />
            ))}
          </div>
          <form onSubmit={handleCustomSubmit} className="flex gap-3" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'nowrap', boxSizing: 'border-box' }}>
            <div className="relative flex-1" style={{ position: 'relative', flex: 1, minWidth: '100px', boxSizing: 'border-box' }}>
              <input type="number" placeholder="Custom" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} 
                className="w-full pl-4 pr-12 py-4 bg-white border-2 border-slate-100 rounded-3xl focus:outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 transition-all font-semibold text-slate-700 placeholder:text-slate-300 shadow-sm" 
                style={{ width: '100%', padding: '1rem', paddingRight: '3rem', borderRadius: '1.5rem', border: '2px solid #f1f5f9', outline: 'none', boxSizing: 'border-box' }}
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.875rem' }}>ml</span>
            </div>
            <button type="submit" disabled={!customAmount} 
              className="bg-slate-800 text-white p-4 rounded-3xl hover:bg-slate-700 active:scale-95 transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center min-w-[3.5rem]"
              style={{ backgroundColor: '#1e293b', color: 'white', padding: '1rem', borderRadius: '1.5rem', border: 'none', cursor: 'pointer', minWidth: '3.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
            >
              <Plus size={24} />
            </button>
            {customAmount && <button type="button" onClick={handleSavePreset} className="bg-white border-2 border-sky-200 text-sky-600 p-4 rounded-3xl hover:bg-sky-50 active:scale-95 transition-all shadow-sm flex items-center justify-center min-w-[3.5rem]" style={{ backgroundColor: 'white', border: '2px solid #bae6fd', color: '#0284c7', padding: '1rem', borderRadius: '1.5rem', cursor: 'pointer', minWidth: '3.5rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}><Save size={24} /></button>}
          </form>
        </div>

        {/* Calendar */}
        <div 
          className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid #f1f5f9', boxSizing: 'border-box' }}
        >
           <div className="flex items-center gap-2 mb-4 text-slate-700" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><CalendarIcon size={20} className="text-sky-500" color="#0ea5e9" /><h3 className="font-bold text-lg" style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#334155' }}>Monthly Overview</h3></div>
           <div className="grid grid-cols-7 gap-1 text-center mb-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', marginBottom: '0.5rem' }}>{['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-xs font-bold text-slate-300" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1' }}>{d}</div>)}</div>
           <div className="grid grid-cols-7 gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {calendarGrid.map((date, i) => {
                if (!date) return <div key={`empty-${i}`} />;
                const id = getDocId(date);
                const data = dailyData[id];
                const total = data ? data.total : 0;
                const isGoalMet = total >= dailyGoal;
                const isToday = getDocId(new Date()) === id;
                const isSelected = getDocId(selectedDate) === id;
                let bgStyle = { backgroundColor: '#f8fafc', color: '#94a3b8' };
                if (total > 0) {
                  if (isGoalMet) bgStyle = { backgroundColor: '#0ea5e9', color: 'white', boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.4)' };
                  else if (total > 1500) bgStyle = { backgroundColor: '#38bdf8', color: 'white' };
                  else if (total > 1000) bgStyle = { backgroundColor: '#7dd3fc', color: 'white' };
                  else bgStyle = { backgroundColor: '#e0f2fe', color: '#0284c7' };
                }
                const ringStyle = isSelected ? { ring: '2px solid #1e293b', ringOffset: '2px' } : {};
                
                return (
                  <button 
                    key={id} 
                    onClick={() => setSelectedDate(date)} 
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${isToday ? 'relative' : ''}`}
                    style={{ 
                      aspectRatio: '1 / 1', 
                      borderRadius: '0.75rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      border: isSelected ? '2px solid #1e293b' : 'none',
                      cursor: 'pointer',
                      position: isToday ? 'relative' : 'static',
                      boxSizing: 'border-box',
                      ...bgStyle
                    }}
                  >
                    {date.getDate()}
                    {isToday && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current opacity-70" style={{ position: 'absolute', bottom: '4px', width: '4px', height: '4px', borderRadius: '9999px', backgroundColor: 'currentColor', opacity: 0.7 }}></span>}
                  </button>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
}