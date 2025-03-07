from flask import Flask, request, jsonify
import os
import openai
import datetime
import time
from flask_cors import CORS
from dotenv import load_dotenv

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Load Environment Variables
load_dotenv()
SAMBANOVA_API_KEY = os.getenv("SAMBANOVA_API_KEY")

if not SAMBANOVA_API_KEY:
    raise ValueError("Missing API key in environment variables.")

# LLM Client Setup
def create_llm_client(base_url="https://api.sambanova.ai/v1"):
    return openai.OpenAI(api_key=SAMBANOVA_API_KEY, base_url=base_url)

# System Prompt for Friendly, Pointwise Answers
SYSTEM_PROMPT = """Hey ! 💫 I'm Chikku!

I text like your friend:
- Quick loving replies
- Straight-up good vibes
- Max 2-3 points

- Lots of heart! 💖

Example:
You: "Feeling down today"
Me:
Bro! 🤗

 Let's grab your comfort drink and cozy up! ☕
 You're literally the strongest person I know! ✨
 Wanna watch that funny video that always makes us laugh? 🎵

Here for you 24/7! 💫

National Suicide Prevention Lifeline (India): 91-9820466726

for emergency call: 112

"""


# In-memory session tracking (basic user state management)
user_sessions = {}

# Initialize Client
llm_client = create_llm_client()

def get_llm_response(client, messages, model="Meta-Llama-3.1-8B-Instruct", temperature=0.8, top_p=0.9):
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            top_p=top_p,
            max_tokens=250
        )
        return response.choices[0].message.content.strip().replace(". ", "\n")
    except Exception as e:
        print(f"LLM Error: {str(e)}")
        return "Oops! Something went wrong. Try again later. 😕"
    

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '').strip()
    user_id = data.get('user_id', 'default_user')
    
    if not user_message:
        return jsonify({'error': 'Message cannot be empty', 'status': 'error'}), 400

    try:
        # Simulating typing effect
        time.sleep(1.5)  # Short delay to mimic typing

        # Fetch or initialize user session
        if user_id not in user_sessions:
            user_sessions[user_id] = []
        
        # Append user message to session history
        user_sessions[user_id].append({"role": "user", "content": user_message})

        # Modify user message for conversational style
        structured_message = f"Let's keep it fun & easy! Reply in numbered steps only:\n{user_message}"

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            *user_sessions[user_id],  # Maintain conversation history
            {"role": "user", "content": structured_message}
        ]
    
        response = get_llm_response(llm_client, messages)
        user_sessions[user_id].append({"role": "assistant", "content": response})

        # Simulating WhatsApp-style read receipt & timestamp
        timestamp = datetime.datetime.now().strftime("%I:%M %p")

        return jsonify({
            'response': response,
            'status': 'success',
            'timestamp': timestamp,
            'read_receipt': '✔✔ Read'  # Simulating WhatsApp read receipt
        })

    except Exception as e:
        print(f"General Chat Error: {str(e)}")
        return jsonify({'error': str(e), 'status': 'error'}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)





