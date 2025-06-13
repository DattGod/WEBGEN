from flask import Flask, request, jsonify, render_template
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

app = Flask(__name__)

# Load model and tokenizer once at startup
model_name = "Salesforce/codegen-350M-mono"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json()
        prompt = data.get('prompt', '').strip()

        # ✅ Intelligent task prompt — tells model to infer language
        input_text = (
            f"User Query: {prompt}\n"
        )

        # Tokenize input
        inputs = tokenizer.encode(input_text, return_tensors="pt", truncation=True)

        # ✅ Generate code with safe settings
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_length=512,
                do_sample=True,
                top_k=50,
                top_p=0.95,
                temperature=0.7,
                pad_token_id=tokenizer.eos_token_id
            )

        # Decode generated text
        generated_code = tokenizer.decode(outputs[0], skip_special_tokens=True)

        # ✅ Remove repeated lines
        lines = generated_code.splitlines()
        seen = set()
        filtered_lines = []

        for line in lines:
            stripped = line.strip()
            if stripped in seen:
                break
            seen.add(stripped)
            filtered_lines.append(line)

        clean_code = "\n".join(filtered_lines)

        # ✅ Clean up memory if on GPU
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        return jsonify({'code': clean_code})

    except Exception as e:
        return jsonify({'error': f'Exception: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
