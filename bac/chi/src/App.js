const handleSubmit = (e) => {
  e.preventDefault();
  const chatInterface = document.querySelector('.chat-interface');
  const inputArea = document.querySelector('.input-area');
  const chatHistory = document.querySelector('.chat-history');
  
  chatInterface.classList.remove('initial-state');
  chatInterface.classList.add('active-state');
  inputArea.classList.add('active');
  chatHistory.classList.add('active');
  
  // Your existing message handling code
};

const WelcomeScreen = () => {
  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div className="logo-animation">
          <img src="/avatar.png" alt="AI Assistant" className="floating-avatar" />
        </div>
        <h1 className="welcome-title">Welcome to Chi AI</h1>
        
        <div className="tagline-container">
          <p className="main-tagline">Your Intelligent Conversation Partner</p>
          <p className="sub-tagline">Powered by Advanced AI Technology</p>
        </div>

        <div className="features-grid">
          <div className="feature-item">
            <span className="feature-icon">💡</span>
            <p>Smart Responses</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <p>Real-time Chat</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <p>Precise Answers</p>
          </div>
        </div>

        <button className="start-chat-btn" onClick={handleSubmit}>
          Start Chatting <span>→</span>
        </button>
        
        <p className="welcome-footer">Ready to experience the future of AI conversation?</p>
      </div>
    </div>
  );
};
