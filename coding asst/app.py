
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai  # Google Gemini API
import subprocess
model = genai.GenerativeModel("gemini-pro")
app = Flask(__name__)
feedback = ""  # Initialize feedback variable
# Configure Google Gemini API
API_KEY = "AIzaSyA-0rkCfbueku01YoBpVlktuxKZmqd7Z2U"
genai.configure(api_key=API_KEY)

def generate_question(difficulty):
    """Generate a coding question and its solutions using Gemini based on difficulty."""
    prompt = f"Generate a {difficulty} level coding question and three different solutions for it in Python."
    response = model.generate_content(prompt)
    question = response.text.split("Solution")[0].strip()  # Extract only the question part
    solutions = response.text.split("Solution")[1:]  # The rest are the solutions
    
    return question, solutions  # Extract text response

def compare_code(user_code, solutions):
    """Compare user code with Gemini-generated solutions and provide feedback."""
    prompt = f"""
    Here is the coding problem solution from a student:
    {user_code}
    
    Compare it with the correct solutions below and give feedback on each line. Mention correct parts, incorrect parts, and suggest improvements in a brief way:
    Solution 1:
    {solutions[0]}
    
    Solution 2:
    {solutions[1]}
    
    Solution 3:
    {solutions[2]}
    """
    response1 = model.generate_content(prompt)
    print("jhhhh")
    print(response1.text)
    return response1.text  # Return the feedback



@app.route('/update', methods=['POST'])
def update_value():
    global feedback
    stored_value = request.json.get('storedValue')  # Get user code from frontend
    print(f"Received stored value: {stored_value}")
    
    # Generate question and solutions
    difficulty = "beginner"  # Example: Modify as per requirement
    question_data, solutions = generate_question(difficulty)
    feedback = compare_code(stored_value, solutions)
    
    return jsonify({"status": "success", "message": feedback})

@app.route('/')
def index():
    difficulty = "beginner"  # Example: Modify as per requirement
    question_data, solutions = generate_question(difficulty)
    
    return render_template('index.html', q_d=question_data, f_b=feedback)  # Ensure the file name is correct
if __name__ == "__main__":
    app.run(debug=True)