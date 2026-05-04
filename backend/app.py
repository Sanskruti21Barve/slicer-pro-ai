import re
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Common regex for both single and file processing
EMAIL_REGEX = r'^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'

def determine_type(domain):
    if any(ext in domain for ext in ['.edu', '.ac.in', '.edu.in', 'univ']):
        return "Educational / Student"
    elif any(ext in domain for ext in ['.gov', '.nic.in']):
        return "Government Official"
    elif any(ext in domain for ext in ['.org', '.net']):
        return "Organization / NGO"
    elif any(ext in domain for ext in ['.co', '.biz']):
        return "Corporate / Business"
    return "Personal Account"

@app.route('/slice', methods=['POST'])
def slice_single():
    data = request.json
    email = data.get('email', '')
    
    if not re.search(EMAIL_REGEX, email):
        return jsonify({"status": "error", "message": "Missing '@' or username!"}), 400
        
    username, domain = email.split('@')
    return jsonify({
        "status": "success",
        "username": username,
        "domain": domain,
        "type": determine_type(domain)
    })

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file"}), 400
    
    file = request.files['file']
    content = file.read().decode('utf-8')
    emails = content.splitlines()
    
    processed = []
    for email in emails:
        clean_email = email.strip()
        if '@' in clean_email:
            username, domain = clean_email.split('@')
            processed.append({
                "username": username, 
                "domain": domain,
                "type": determine_type(domain)
            })
        
    return jsonify({"status": "success", "processed_emails": processed})

if __name__ == '__main__':
    app.run(debug=True, port=5000)