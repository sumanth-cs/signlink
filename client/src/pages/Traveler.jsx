import React, { useState } from 'react';
import { Globe, Volume2, Search, ArrowLeft, Navigation, Coffee, HeartPulse, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Traveler = () => {
  const [targetLang, setTargetLang] = useState('Spanish');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'basics', name: 'Basics & Greetings', icon: <Globe size={20} />, color: 'bg-blue-500/20 text-blue-400' },
    { id: 'directions', name: 'Navigation', icon: <Navigation size={20} />, color: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'food', name: 'Food & Dining', icon: <Coffee size={20} />, color: 'bg-amber-500/20 text-amber-400' },
    { id: 'emergency', name: 'Emergency', icon: <ShieldAlert size={20} />, color: 'bg-red-500/20 text-red-400' },
  ];

  const phrases = [
    { sign: 'Hello', translation: 'Hola', category: 'basics' },
    { sign: 'Thank You', translation: 'Gracias', category: 'basics' },
    { sign: 'Please', translation: 'Por favor', category: 'basics' },
    { sign: 'Yes', translation: 'Sí', category: 'basics' },
    { sign: 'No', translation: 'No', category: 'basics' },
    { sign: 'Where is the bathroom?', translation: '¿Dónde está el baño?', category: 'directions' },
    { sign: 'How much is this?', translation: '¿Cuánto cuesta?', category: 'basics' },
    { sign: 'I need help', translation: 'Necesito ayuda', category: 'emergency' },
    { sign: 'Water', translation: 'Agua', category: 'food' },
    { sign: 'I am hungry', translation: 'Tengo hambre', category: 'food' }
  ];

  const filteredPhrases = phrases.filter(p => 
    p.sign.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <Link to="/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold mb-4 transition-colors w-fit">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
              <Globe size={28} />
            </div>
            Traveler Mode
          </h1>
          <p className="text-slate-400 text-lg">Essential survival phrases for your journey.</p>
        </div>

        <div className="glass-card p-2 flex items-center gap-2 border-white/10 rounded-2xl">
          <span className="text-slate-400 text-sm font-bold pl-3 uppercase tracking-wider">Translating ASL to:</span>
          <select 
            className="bg-white/10 border-none rounded-xl text-white font-bold py-2 px-4 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            <option value="Spanish">🇪🇸 Spanish</option>
            <option value="French">🇫🇷 French</option>
            <option value="Japanese">🇯🇵 Japanese</option>
            <option value="German">🇩🇪 German</option>
            <option value="Hindi">🇮🇳 Hindi</option>
          </select>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {categories.map(cat => (
          <button key={cat.id} className="glass-card p-4 border-white/5 hover:border-white/20 transition-all text-left group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${cat.color}`}>
              {cat.icon}
            </div>
            <h3 className="text-white font-bold text-sm">{cat.name}</h3>
          </button>
        ))}
      </div>

      {/* Search and List */}
      <div className="glass-card border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search for a phrase..." 
            className="bg-transparent border-none text-white w-full focus:outline-none placeholder:text-slate-500 font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="divide-y divide-white/5">
          {filteredPhrases.map((phrase, idx) => (
            <div key={idx} className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between group">
              <div className="flex-1">
                <p className="text-xs font-black tracking-widest uppercase text-indigo-400 mb-1">ASL Sign</p>
                <h3 className="text-xl font-bold text-white">{phrase.sign}</h3>
              </div>
              
              <div className="hidden md:flex items-center justify-center px-8">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="mx-2 text-slate-500 text-xs font-bold uppercase tracking-widest">{targetLang}</div>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              <div className="flex-1 text-right flex items-center justify-end gap-4">
                <div>
                  <h3 className="text-xl font-black text-emerald-400">{phrase.translation}</h3>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-all group-hover:scale-110">
                  <Volume2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {filteredPhrases.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Globe size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-bold">No phrases found</p>
              <p className="text-sm">Try searching for basic greetings or directions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Traveler;
