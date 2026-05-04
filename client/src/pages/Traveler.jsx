import React, { useState } from 'react';
import { Globe, Volume2, Search, ArrowLeft, Navigation, Coffee, HeartPulse, ShieldAlert, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const Traveler = () => {
  const [targetLang, setTargetLang] = useState('Spanish');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Phrases', icon: <BookOpen size={20} />, color: 'bg-white/10 text-white' },
    { id: 'basics', name: 'Basics & Greetings', icon: <Globe size={20} />, color: 'bg-blue-500/20 text-blue-400' },
    { id: 'directions', name: 'Navigation', icon: <Navigation size={20} />, color: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'food', name: 'Food & Dining', icon: <Coffee size={20} />, color: 'bg-amber-500/20 text-amber-400' },
    { id: 'emergency', name: 'Emergency & Health', icon: <ShieldAlert size={20} />, color: 'bg-red-500/20 text-red-400' },
  ];

  const phraseDictionary = [
    // Basics
    { sign: 'Hello', category: 'basics', translations: { Spanish: 'Hola', French: 'Bonjour', Japanese: 'こんにちは', German: 'Hallo', Hindi: 'नमस्ते', Chinese: '你好' } },
    { sign: 'Thank You', category: 'basics', translations: { Spanish: 'Gracias', French: 'Merci', Japanese: 'ありがとう', German: 'Danke', Hindi: 'धन्यवाद', Chinese: '谢谢' } },
    { sign: 'Please', category: 'basics', translations: { Spanish: 'Por favor', French: 'S\'il vous plaît', Japanese: 'お願いします', German: 'Bitte', Hindi: 'कृपया', Chinese: '请' } },
    { sign: 'Yes', category: 'basics', translations: { Spanish: 'Sí', French: 'Oui', Japanese: 'はい', German: 'Ja', Hindi: 'हाँ', Chinese: '是' } },
    { sign: 'No', category: 'basics', translations: { Spanish: 'No', French: 'Non', Japanese: 'いいえ', German: 'Nein', Hindi: 'नहीं', Chinese: '不是' } },
    { sign: 'Excuse me', category: 'basics', translations: { Spanish: 'Disculpe', French: 'Excusez-moi', Japanese: 'すみません', German: 'Entschuldigung', Hindi: 'क्षमा करें', Chinese: '打扰一下' } },
    
    // Navigation
    { sign: 'Where is the bathroom?', category: 'directions', translations: { Spanish: '¿Dónde está el baño?', French: 'Où sont les toilettes?', Japanese: 'トイレはどこですか？', German: 'Wo ist die Toilette?', Hindi: 'बाथरूम कहाँ है?', Chinese: '洗手间在哪里？' } },
    { sign: 'Where is the train station?', category: 'directions', translations: { Spanish: '¿Dónde está la estación de tren?', French: 'Où est la gare?', Japanese: '駅はどこですか？', German: 'Wo ist der Bahnhof?', Hindi: 'रेलवे स्टेशन कहाँ है?', Chinese: '火车站怎么走？' } },
    { sign: 'Where is my hotel?', category: 'directions', translations: { Spanish: '¿Dónde está mi hotel?', French: 'Où est mon hôtel?', Japanese: '私のホテルはどこですか？', German: 'Wo ist mein Hotel?', Hindi: 'मेरा होटल कहाँ है?', Chinese: '我的酒店在哪里？' } },
    { sign: 'How do I get to the airport?', category: 'directions', translations: { Spanish: '¿Cómo llego al aeropuerto?', French: 'Comment aller à l\'aéroport?', Japanese: '空港にはどうやって行きますか？', German: 'Wie komme ich zum Flughafen?', Hindi: 'हवाई अड्डे कैसे पहुँचें?', Chinese: '我怎么去机场？' } },
    
    // Food
    { sign: 'Water', category: 'food', translations: { Spanish: 'Agua', French: 'Eau', Japanese: '水', German: 'Wasser', Hindi: 'पानी', Chinese: '水' } },
    { sign: 'I am hungry', category: 'food', translations: { Spanish: 'Tengo hambre', French: 'J\'ai faim', Japanese: 'お腹が空きました', German: 'Ich habe Hunger', Hindi: 'मुझे भूख लगी है', Chinese: '我饿了' } },
    { sign: 'Food', category: 'food', translations: { Spanish: 'Comida', French: 'Nourriture', Japanese: '食べ物', German: 'Essen', Hindi: 'खाना', Chinese: '食物' } },
    { sign: 'How much is this?', category: 'food', translations: { Spanish: '¿Cuánto cuesta?', French: 'Combien ça coûte?', Japanese: 'これはいくらですか？', German: 'Wie viel kostet das?', Hindi: 'यह कितने का है?', Chinese: '这个多少钱？' } },
    { sign: 'Check please', category: 'food', translations: { Spanish: 'La cuenta por favor', French: 'L\'addition, s\'il vous plaît', Japanese: 'お会計をお願いします', German: 'Die Rechnung bitte', Hindi: 'बिल ले आइए', Chinese: '买单' } },
    
    // Emergency
    { sign: 'I need help', category: 'emergency', translations: { Spanish: 'Necesito ayuda', French: 'J\'ai besoin d\'aide', Japanese: '助けてください', German: 'Ich brauche Hilfe', Hindi: 'मुझे मदद चाहिए', Chinese: '我需要帮助' } },
    { sign: 'Call the police', category: 'emergency', translations: { Spanish: 'Llama a la policía', French: 'Appelez la police', Japanese: '警察を呼んでください', German: 'Rufen Sie die Polizei', Hindi: 'पुलिस को बुलाओ', Chinese: '报警' } },
    { sign: 'I need a doctor', category: 'emergency', translations: { Spanish: 'Necesito un médico', French: 'J\'ai besoin d\'un médecin', Japanese: '医者が必要です', German: 'Ich brauche einen Arzt', Hindi: 'मुझे डॉक्टर की जरूरत है', Chinese: '我需要医生' } },
    { sign: 'Hospital', category: 'emergency', translations: { Spanish: 'Hospital', French: 'Hôpital', Japanese: '病院', German: 'Krankenhaus', Hindi: 'अस्पताल', Chinese: '医院' } },
  ];

  const handleSpeak = (text, lang) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set appropriate language code
    const langMap = {
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'Japanese': 'ja-JP',
      'German': 'de-DE',
      'Hindi': 'hi-IN',
      'Chinese': 'zh-CN'
    };
    
    utterance.lang = langMap[lang] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const filteredPhrases = phraseDictionary.filter(p => {
    const matchesSearch = p.sign.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.translations[targetLang].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
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
            <option value="Chinese">🇨🇳 Chinese</option>
          </select>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {categories.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => setActiveCategory(cat.id)}
            className={`glass-card p-4 border-white/5 transition-all text-left group ${activeCategory === cat.id ? 'ring-2 ring-indigo-500 bg-white/10' : 'hover:border-white/20'}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${cat.color}`}>
              {cat.icon}
            </div>
            <h3 className="text-white font-bold text-sm">{cat.name}</h3>
          </button>
        ))}
      </div>

      {/* Search and List */}
      <div className="glass-card border-white/10 overflow-hidden shadow-2xl shadow-indigo-500/5">
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

        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
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
                  <h3 className="text-xl font-black text-emerald-400">{phrase.translations[targetLang]}</h3>
                </div>
                <button 
                  onClick={() => handleSpeak(phrase.translations[targetLang], targetLang)}
                  className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all group-hover:scale-110 shadow-lg"
                  title={`Listen in ${targetLang}`}
                >
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
