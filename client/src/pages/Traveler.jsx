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
    // Basics & Greetings
    { sign: 'Hello', category: 'basics', translations: { Spanish: 'Hola', French: 'Bonjour', Japanese: 'こんにちは', German: 'Hallo', Hindi: 'नमस्ते', Chinese: '你好' } },
    { sign: 'Good morning', category: 'basics', translations: { Spanish: 'Buenos días', French: 'Bonjour', Japanese: 'おはようございます', German: 'Guten Morgen', Hindi: 'सुप्रभात', Chinese: '早上好' } },
    { sign: 'Good night', category: 'basics', translations: { Spanish: 'Buenas noches', French: 'Bonne nuit', Japanese: 'おやすみなさい', German: 'Gute Nacht', Hindi: 'शुभ रात्रि', Chinese: '晚安' } },
    { sign: 'Thank You', category: 'basics', translations: { Spanish: 'Gracias', French: 'Merci', Japanese: 'ありがとう', German: 'Danke', Hindi: 'धन्यवाद', Chinese: '谢谢' } },
    { sign: 'Please', category: 'basics', translations: { Spanish: 'Por favor', French: 'S\'il vous plaît', Japanese: 'お願いします', German: 'Bitte', Hindi: 'कृपया', Chinese: '请' } },
    { sign: 'I am sorry', category: 'basics', translations: { Spanish: 'Lo siento', French: 'Désolé', Japanese: 'ごめんなさい', German: 'Es tut mir leid', Hindi: 'मुझे खेद है', Chinese: '对不起' } },
    { sign: 'How are you?', category: 'basics', translations: { Spanish: '¿Cómo estás?', French: 'Comment allez-vous?', Japanese: 'お元気ですか？', German: 'Wie geht es dir?', Hindi: 'आप कैसे हैं?', Chinese: '你好吗？' } },
    { sign: 'My name is...', category: 'basics', translations: { Spanish: 'Mi nombre es...', French: 'Je m\'appelle...', Japanese: '私の名前は...', German: 'Ich heiße...', Hindi: 'मेरा नाम ... है', Chinese: '我的名字是...' } },
    
    // Navigation
    { sign: 'Where is the bathroom?', category: 'directions', translations: { Spanish: '¿Dónde está el baño?', French: 'Où sont les toilettes?', Japanese: 'トイレはどこですか？', German: 'Wo ist die Toilette?', Hindi: 'बाथरूम कहाँ है?', Chinese: '洗手间在哪里？' } },
    { sign: 'Where is the train station?', category: 'directions', translations: { Spanish: '¿Dónde está la estación de tren?', French: 'Où est la gare?', Japanese: '駅はどこですか？', German: 'Wo ist der Bahnhof?', Hindi: 'रेलवे स्टेशन कहाँ है?', Chinese: '火车站怎么走？' } },
    { sign: 'Where is the bus stop?', category: 'directions', translations: { Spanish: '¿Dónde está la parada de autobús?', French: 'Où est l\'arrêt de bus?', Japanese: 'バス停はどこですか？', German: 'Wo ist die Bushaltestelle?', Hindi: 'बस स्टॉप कहाँ है?', Chinese: '公交车站在哪里？' } },
    { sign: 'Turn left', category: 'directions', translations: { Spanish: 'Gire a la izquierda', French: 'Tournez à gauche', Japanese: '左に曲がってください', German: 'Biegen Sie links ab', Hindi: 'बाएं मुड़ें', Chinese: '左转' } },
    { sign: 'Turn right', category: 'directions', translations: { Spanish: 'Gire a la derecha', French: 'Tournez à droite', Japanese: '右に曲がってください', German: 'Biegen Sie rechts ab', Hindi: 'दाएं मुड़ें', Chinese: '右转' } },
    { sign: 'Go straight', category: 'directions', translations: { Spanish: 'Siga recto', French: 'Allez tout droit', Japanese: '直進してください', German: 'Gehen Sie geradeaus', Hindi: 'सीधे जाओ', Chinese: '直走' } },
    { sign: 'Is it far?', category: 'directions', translations: { Spanish: '¿Está lejos?', French: 'C\'est loin?', Japanese: '遠いですか？', German: 'Ist es weit?', Hindi: 'क्या यह दूर है?', Chinese: '远吗？' } },
    
    // Food & Dining
    { sign: 'I would like water', category: 'food', translations: { Spanish: 'Quisiera agua', French: 'Je voudrais de l\'eau', Japanese: '水をお願いします', German: 'Ich möchte Wasser', Hindi: 'मुझे पानी चाहिए', Chinese: '我想喝水' } },
    { sign: 'I am hungry', category: 'food', translations: { Spanish: 'Tengo hambre', French: 'J\'ai faim', Japanese: 'お腹が空きました', German: 'Ich habe Hunger', Hindi: 'मुझे भूख लगी है', Chinese: '我饿了' } },
    { sign: 'I am vegetarian', category: 'food', translations: { Spanish: 'Soy vegetariano', French: 'Je suis végétarien', Japanese: '私は菜食主義者です', German: 'Ich bin Vegetarier', Hindi: 'मैं शाकाहारी हूँ', Chinese: '我是素食主义者' } },
    { sign: 'The food is delicious', category: 'food', translations: { Spanish: 'La comida está deliciosa', French: 'La nourriture est délicieuse', Japanese: '料理は美味しいです', German: 'Das Essen ist lecker', Hindi: 'खाना स्वादिष्ट है', Chinese: '食物很美味' } },
    { sign: 'How much is this?', category: 'food', translations: { Spanish: '¿Cuánto cuesta?', French: 'Combien ça coûte?', Japanese: 'これはいくらですか？', German: 'Wie viel kostet das?', Hindi: 'यह कितने का है?', Chinese: '这个多少钱？' } },
    { sign: 'I have an allergy', category: 'food', translations: { Spanish: 'Tengo una alergia', French: 'J\'ai une allergie', Japanese: 'アレルギーがあります', German: 'Ich habe eine Allergie', Hindi: 'मुझे एलर्जी है', Chinese: '我过敏' } },
    
    // Emergency & Health
    { sign: 'I need help', category: 'emergency', translations: { Spanish: 'Necesito ayuda', French: 'J\'ai besoin d\'aide', Japanese: '助けてください', German: 'Ich brauche Hilfe', Hindi: 'मुझे मदद चाहिए', Chinese: '我需要帮助' } },
    { sign: 'I am lost', category: 'emergency', translations: { Spanish: 'Estoy perdido', French: 'Je suis perdu', Japanese: '迷子になりました', German: 'Ich habe mich verlaufen', Hindi: 'मैं खो गया हूँ', Chinese: '我迷路了' } },
    { sign: 'Call an ambulance', category: 'emergency', translations: { Spanish: 'Llame a una ambulancia', French: 'Appelez une ambulance', Japanese: '救急車を呼んでください', German: 'Rufen Sie einen Krankenwagen', Hindi: 'एम्बुलेंस बुलाओ', Chinese: '叫救护车' } },
    { sign: 'Where is the hospital?', category: 'emergency', translations: { Spanish: '¿Dónde está el hospital?', French: 'Où est l\'hôpital?', Japanese: '病院はどこですか？', German: 'Wo ist das Krankenhaus?', Hindi: 'अस्पताल कहाँ है?', Chinese: '医院在哪里？' } },
    { sign: 'I feel sick', category: 'emergency', translations: { Spanish: 'Me siento mal', French: 'Je me sens mal', Japanese: '気分が悪いです', German: 'Ich fühle mich krank', Hindi: 'मेरी तबीयत ठीक नहीं है', Chinese: '我感觉不舒服' } },
    { sign: 'It hurts here', category: 'emergency', translations: { Spanish: 'Me duele aquí', French: 'Ça fait mal ici', Japanese: 'ここが痛いです', German: 'Es tut hier weh', Hindi: 'यहाँ दर्द हो रहा है', Chinese: '这里疼' } },
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
