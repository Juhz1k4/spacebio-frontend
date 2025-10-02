import { useState, useEffect, useRef } from 'react';

// --- Ícones ---
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;

// --- Placeholder da Imagem ---
const DrArisAvatar = 'https://placehold.co/128x128/083344/E0F2FE?text=Aris';

// --- COMPONENTE DA PÁGINA ---
export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        text: "Olá! Eu sou a Dra. Aris, sua guia pelo fascinante universo da biologia espacial. Como posso te ajudar a explorar nossa vasta base de conhecimento hoje?",
        isUser: false,
      },
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentInput }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      const arisMessage = { text: data.answer, isUser: false };
      setMessages((prevMessages) => [...prevMessages, arisMessage]);
    } catch (error) {
      console.error("Falha ao comunicar com a Dra. Aris:", error);
      const errorMessage = { text: "Desculpe, estou com interferência na comunicação. Tente novamente.", isUser: false };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Assistente de IA</h1>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="chat-container space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.isUser ? 'justify-end' : ''}`}>
              {!msg.isUser && (
                <img src={DrArisAvatar} alt="Dra. Aris" className="w-10 h-10 rounded-full border-2 border-cyan-400" />
              )}
              <div className={`p-3 rounded-lg max-w-xl ${msg.isUser ? 'bg-purple-600' : 'bg-gray-700'}`}>
                <p style={{whiteSpace: 'pre-wrap'}}>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <img src={DrArisAvatar} alt="Dra. Aris" className="w-10 h-10 rounded-full border-2 border-cyan-400" />
              <div className="p-3 rounded-lg bg-gray-700">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t border-gray-700">
        <form onSubmit={sendMessage} className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre biologia espacial, pesquisas, análises..."
            className="flex-1 p-3 bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400"
            disabled={isLoading}
          />
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold p-3 rounded-full disabled:bg-gray-600" disabled={isLoading || !input.trim()}>
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
}

