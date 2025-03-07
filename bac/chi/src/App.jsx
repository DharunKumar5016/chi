import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './App.css';

const welcomeSlides = [
  {
    title: "Welcome to Chikku",
    subtitle: "Your Mental Health Companion",
    icon: "🌟",
    color: "#7C3AED"
  },
  {
    title: "Safe & Confidential",
    subtitle: "Your space to express freely",
    icon: "🤗",
    color: "#2563EB"
  },
  {
    title: "24/7 Support",
    subtitle: "Here whenever you need",
    icon: "💝",
    color: "#059669"
  }
];

function WelcomeCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % welcomeSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div className="welcome-carousel">
      {welcomeSlides.map((slide, index) => (
        <motion.div
          key={index}
          className="carousel-slide"
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: currentSlide === index ? 1 : 0,
            y: currentSlide === index ? 0 : 50,
            scale: currentSlide === index ? 1 : 0.8
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="slide-icon"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {slide.icon}
          </motion.div>
          <motion.h1 
            className="slide-title"
            style={{ color: slide.color }}
          >
            {slide.title}
          </motion.h1>
          <motion.p className="slide-subtitle">
            {slide.subtitle}
          </motion.p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [isLoading, setIsLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [chatHistory, showWelcome]);

  const startChat = () => {
    setChatStarted(true);
    setChatHistory([{
      role: 'assistant',
      content: "Hi! I'm Chikku, your mental health companion. How are you feeling today?",
      timestamp: new Date().toISOString(),
    }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage = message;
    setMessage('');

    setChatHistory(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }]);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          user_id: userId,
        }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-content">
            <h1>Welcome to Chikku</h1>
            <p>Your Mental Health Companion</p>
          </div>
        </div>
      )}
      
      {!chatStarted ? (
        <div className="welcome-screen">
          <motion.div 
            className="hero-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div 
              className="hero-content"
              initial={{ y: 50 }}
              animate={{ y: 0 }}
            >
              <motion.img 
                src="/chikku-avatar.png" 
                className="hero-avatar"
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.h1 
                className="hero-title"
                animate={{ 
                  scale: [1, 1.02, 1],
                  color: ["#4c1d95", "#7c3aed", "#4c1d95"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Meet Your Mental Health Companion
              </motion.h1>
              <div className="feature-cards">
                {[
                  { icon: "🌟", title: "24/7 Support", desc: "Always here to listen" },
                  { icon: "💝", title: "Safe Space", desc: "Your thoughts matter" },
                  { icon: "🤗", title: "Personalized Care", desc: "Tailored to you" }
                ].map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="feature-card"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="feature-icon">{feature.icon}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
              <motion.button 
                className="start-chat-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startChat}
              >
                Start Your Journey
                <motion.span 
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <div className="chat-interface">
          <div className="chat-sidebar">
            <div className="header-content">
              <div className="ai-avatar">
                <img src="/chikku-avatar.png" alt="Chikku" />
              </div>
              <div className="header-info">
                <h1>Chikku</h1>
                <div className="status-badge">
                  <span className="status-dot"></span>
                  <span className="status-text">AI Companion</span>
                </div>
              </div>
            </div>
            <div className="sidebar-content">
  <motion.div 
    className="chat-guidance"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3>Chat Guide</h3>
    <div className="guide-points">
      <div className="guide-item">💭 Express yourself freely and openly</div>
      <div className="guide-item">❓ Ask about mental health and well-being</div>
      <div className="guide-item">🤝 Get personalized support and strategies</div>
    </div>
  </motion.div>

  <motion.div 
    className="quick-tips"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
  >
    <h3>Wellness Tips</h3>
    <motion.div className="tip-carousel">
      {[
        "Take deep breaths",
        "Stay hydrated", 
        "Practice mindfulness",
        "Get enough sleep",
        "Take regular breaks",
        "Connect with loved ones",
        "Exercise regularly", 
        "Practice gratitude",
        "Limit screen time",
        "Listen to calming music",
        "Write in a journal",
        "Set healthy boundaries",
        "Spend time in nature",
        "Try meditation",
        "Maintain a routine"
      ].map((tip, index) => (
        <div key={index} className="tip-item">
          {tip}
        </div>
      ))}
    </motion.div>
  </motion.div>
</div>
          </div>                    <div className="chat-main">
            <div className="chat-history">
              {chatHistory.map((chat, index) => (
                <div 
                  key={index} 
                  className={`message-wrapper ${chat.role}`}
                >
                  <div className="message-bubble">
                    <div className="message-content">{chat.content}</div>
                    <div className="message-time">
                      {new Date(chat.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="typing-indicator">
                  <div className="typing-bubble"></div>
                  <div className="typing-bubble"></div>
                  <div className="typing-bubble"></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="input-area">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts..."
                className="message-input"
              />
              <button type="submit" className="send-button" disabled={!message.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
