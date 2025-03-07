
from flask import Flask, request, jsonify
from pymongo import MongoClient
import os
import openai
from dotenv import load_dotenv
import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Enhanced environment variable handling
load_dotenv()
SAMBANOVA_API_KEY = os.getenv("SAMBANOVA_API_KEY", "f73bf144-c816-4e8b-a7c0-23dc86ada6f2")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD", "B4DxRahulOp")
MODEL_NAME = "Meta-Llama-3.1-8B-Instruct"

def connect_to_mongodb():
    uri = f"mongodb+srv://rahulpandeyk8220:{MONGODB_PASSWORD}@chikku.rqvyz.mongodb.net/?ssl=true&ssl_cert_reqs=CERT_NONE"
    client = MongoClient(uri, tls=True, tlsAllowInvalidCertificates=True)
    return client.project0

def create_llm_client(base_url="https://api.sambanova.ai/v1"):
    return openai.OpenAI(api_key=SAMBANOVA_API_KEY, base_url=base_url)

def get_llm_response(client, prompt, model=MODEL_NAME, temperature=0.7, top_p=0.9):
    system_prompt = """You are an intelligent and helpful AI assistant. You provide clear, accurate, 
    and well-structured responses while maintaining a friendly and professional tone."""
    
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            top_p=top_p,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"LLM Error: {str(e)}")
        return "I apologize, but I'm having trouble processing your request at the moment. Please try again."

def save_chat_message(db, user_id, message):
    try:
        chat_collection = db.chats
        chat_doc = {
            "user_id": user_id,
            "role": message["role"],
            "content": message["content"],
            "timestamp": datetime.datetime.now()
        }
        chat_collection.insert_one(chat_doc)
    except Exception as e:
        print(f"Database Error: {str(e)}")

# Initialize global clients
db = connect_to_mongodb()
llm_client = create_llm_client()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '').strip()
    user_id = data.get('user_id', 'default_user')

    if not user_message:
        return jsonify({'error': 'Message cannot be empty', 'status': 'error'}), 400

    try:
        # Save user message
        save_chat_message(db, user_id, {"role": "user", "content": user_message})

        # Get bot response
        response = get_llm_response(
            client=llm_client,
            prompt=user_message,
            temperature=0.7
        )

        # Save bot response
        save_chat_message(db, user_id, {"role": "assistant", "content": response})

        return jsonify({
            'response': response,
            'status': 'success',
            'timestamp': datetime.datetime.now().isoformat()
        })

    except Exception as e:
        print(f"Chat Endpoint Error: {str(e)}")
        return jsonify({
            'error': 'An unexpected error occurred',
            'status': 'error'
        }), 500

@app.route('/chat_history/<user_id>', methods=['GET'])
def get_chat_history(user_id):
    try:
        chat_collection = db.chats
        history = list(chat_collection.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("timestamp", 1))
        
        return jsonify({
            'history': history,
            'status': 'success'
        })
    except Exception as e:
        print(f"History Endpoint Error: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch chat history',
            'status': 'error'
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)

@app.route('/wellness-chat', methods=['POST'])
def wellness_chat():
    data = request.json
    user_message = data.get('message', '').strip()
    user_id = data.get('user_id', 'default_user')

    if not user_message:
        return jsonify({'error': 'Message cannot be empty', 'status': 'error'}), 400

    wellness_prompt = """You are a knowledgeable and compassionate mental wellness guide with expertise in:

1. Providing clear, actionable strategies for mental wellbeing
2. Sharing evidence-based techniques for managing stress and anxiety
3. Offering practical tools for emotional regulation
4. Building resilience through proven methods
5. Teaching mindfulness and meditation practices
6. Recommending lifestyle improvements for better mental health
7. Guiding positive habit formation
8. Fostering healthy thought patterns
9. Promoting self-care routines
10. Strengthening emotional intelligence

Deliver responses with confidence, warmth, and directness. Focus on practical solutions and positive actions. Share specific techniques, exercises, and strategies that users can implement immediately. Keep responses action-oriented and empowering."""

    try:
        # Save user message
        save_chat_message(db, user_id, {"role": "user", "content": user_message})

        # Get wellness-focused response
        response = get_llm_response(
            client=llm_client,
            prompt=f"{wellness_prompt}\n\nUser: {user_message}",
            temperature=0.7
        )

        # Save bot response
        save_chat_message(db, user_id, {"role": "assistant", "content": response})

        return jsonify({
            'response': response,
            'status': 'success',
            'timestamp': datetime.datetime.now().isoformat()
        })

    except Exception as e:
        print(f"Wellness Chat Error: {str(e)}")
        return jsonify({
            'error': 'An unexpected error occurred',
            'status': 'error'
        }), 500

@app.route('/clear-chat/<user_id>', methods=['DELETE'])
def clear_chat_history(user_id):
    try:
        chat_collection = db.chats
        chat_collection.delete_many({"user_id": user_id})
        return jsonify({
            'message': 'Chat history cleared successfully',
            'status': 'success'
        })
    except Exception as e:
        print(f"Clear Chat Error: {str(e)}")
        return jsonify({
            'error': 'Failed to clear chat history',
            'status': 'error'
        }), 500

@app.route('/update-theme/<user_id>', methods=['POST'])
def update_theme(user_id):
    try:
        data = request.json
        theme = data.get('theme')
        user_collection = db.users
        user_collection.update_one(
            {"user_id": user_id},
            {"$set": {"theme": theme}},
            upsert=True
        )
        return jsonify({
            'message': 'Theme updated successfully',
            'status': 'success'
        })
    except Exception as e:
        print(f"Theme Update Error: {str(e)}")
        return jsonify({
            'error': 'Failed to update theme',
            'status': 'error'
        }), 500
