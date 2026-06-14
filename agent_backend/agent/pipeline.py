import os
import json
import time
import base64
import random
import requests
from typing import Dict

def load_non_empty_env(env_path: str):
    if not os.path.exists(env_path):
        return
    try:
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, val = line.split('=', 1)
                key = key.strip()
                val = val.strip()
                if val.startswith(('"', "'")) and val.endswith(('"', "'")):
                    val = val[1:-1]
                if val:
                    os.environ[key] = val
    except Exception as e:
        print(f"Warning: Failed to load env from {env_path}: {e}")

load_non_empty_env(".env")
load_non_empty_env("/app/.env")

SYSTEM_PROMPT = (
    "You are an expert educational visual designer for Peer Academy, a premium online learning platform. "
    "Your task is to analyze the provided course content and design a structured visual plan for learning visual materials. "
    "You must follow a strict 3-stage pipeline:\n"
    "1) ANALYZE: Extract the core topic, learning objective, target learner level, and key concepts being taught.\n"
    "2) PLAN: Decide what visual concept/metaphor would best support the learning objective, plus placement, style, and aspect ratio.\n"
    "3) GENERATE: Create a high-quality image generation prompt (50-80 words), a negative prompt, screen-reader alt text, a safety check (SAFE or UNSAFE with reason), and a course relevance score (0-100).\n\n"
    "You MUST respond with a single valid JSON object. Do not include markdown headers, backticks, or any conversational text. Use exactly this JSON structure:\n"
    "{\n"
    '  "image_concept": "Explain the visual concept, metaphor, and why it supports learning this specific topic.",\n'
    '  "image_prompt": "A detailed, descriptive text-to-image prompt (50-80 words) focusing on the visual elements, composition, style, and lighting. Do not reference UI text or buttons.",\n'
    '  "negative_prompt": "A comma-separated list of visual elements to avoid (e.g. blurry, low quality, text, logos, ui, cluttered, creepy).",\n'
    '  "image_purpose": "Explain how this image helps clarify the lesson.",\n'
    '  "aspect_ratio": "The recommended aspect ratio: 16:9, 1:1, 4:3, 3:2, or 9:16.",\n'
    '  "suggested_placement": "Recommended placement, e.g. Inline within lesson content, Course homepage banner, Section header.",\n'
    '  "alt_text": "One sentence alt text for accessibility describing the image clearly.",\n'
    '  "safety_check": "SAFE - reason why it is suitable for learners (or UNSAFE - reason why).",\n'
    '  "course_relevance_score": 95\n'
    "}"
)

def build_user_message(fields: Dict) -> str:
    return (
        f"Generate an image visual plan for this Peer Academy lesson:\n\n"
        f"Course Title: {fields.get('course', 'N/A')}\n"
        f"Module Title: {fields.get('module', 'N/A')}\n"
        f"Lesson Title: {fields.get('lesson', 'N/A')}\n"
        f"Target Learner Level: {fields.get('level', 'All levels')}\n"
        f"Learning Objective: {fields.get('objective', 'N/A')}\n"
        f"Image Purpose (desired): {fields.get('purpose', 'Lesson visual')}\n"
        f"Preferred Visual Style: {fields.get('style', 'Flat illustration')}\n"
        f"Platform Placement: {fields.get('placement', 'Inline')}\n\n"
        f"Lesson Content:\n{fields.get('content', '')}\n\n"
        "Follow the 3-stage pipeline and return the structured JSON output."
    )

def extract_json(text: str) -> Dict:
    text = text.strip()
    if text.startswith("```"):
        first_line_end = text.find("\n")
        if first_line_end != -1:
            text = text[first_line_end:].strip()
        if text.endswith("```"):
            text = text[:-3].strip()
            
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        json_str = text[start:end+1]
        try:
            return json.loads(json_str)
        except Exception as e:
            raise ValueError(f"JSON parsing error: {str(e)} | Raw block: {json_str[:200]}...")
            
    try:
        return json.loads(text)
    except Exception as e:
        raise ValueError(f"Could not locate JSON object. Raw output was: {text[:300]}...")

def get_svg_placeholder(concept: str, style: str, aspect_ratio: str = "16:9") -> str:
    clean_concept = concept.replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
    
    width, height = 1024, 576
    ratio = aspect_ratio.strip().replace(" ", "")
    if ratio == "1:1":
        width, height = 800, 800
    elif ratio == "4:3":
        width, height = 960, 720
    elif ratio == "3:2":
        width, height = 960, 640
    elif ratio == "9:16":
        width, height = 576, 1024

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%">
        <defs>
            <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0f0c20" />
                <stop offset="50%" stop-color="#15102a" />
                <stop offset="100%" stop-color="#06040a" />
            </linearGradient>
            <linearGradient id="text-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#818cf8" />
                <stop offset="100%" stop-color="#c084fc" />
            </linearGradient>
            <linearGradient id="border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#312e81" stop-opacity="0.6"/>
                <stop offset="100%" stop-color="#581c87" stop-opacity="0.2"/>
            </linearGradient>
        </defs>
        
        <rect width="{width}" height="{height}" fill="url(#bg-grad)" rx="16" />
        <rect width="{width-4}" height="{height-4}" x="2" y="2" fill="none" stroke="url(#border-grad)" stroke-width="2" rx="16" />
        
        <path d="M 0 {height/10} L {width} {height/10} M 0 {height/10*2} L {width} {height/10*2} M 0 {height/10*3} L {width} {height/10*3} M 0 {height/10*4} L {width} {height/10*4} M 0 {height/10*5} L {width} {height/10*5} M 0 {height/10*6} L {width} {height/10*6} M 0 {height/10*7} L {width} {height/10*7} M 0 {height/10*8} L {width} {height/10*8} M 0 {height/10*9} L {width} {height/10*9}" stroke="#ffffff" stroke-opacity="0.02" stroke-width="1" />
        <path d="M {width/10} 0 L {width/10} {height} M {width/10*2} 0 L {width/10*2} {height} M {width/10*3} 0 L {width/10*3} {height} M {width/10*4} 0 L {width/10*4} {height} M {width/10*5} 0 L {width/10*5} {height} M {width/10*6} 0 L {width/10*6} {height} M {width/10*7} 0 L {width/10*7} {height} M {width/10*8} 0 L {width/10*8} {height} M {width/10*9} 0 L {width/10*9} {height}" stroke="#ffffff" stroke-opacity="0.02" stroke-width="1" />
        
        <g transform="translate({width/2}, {height*0.25}) scale(1.5)">
            <path d="M-20,0 Q0,0 0,-20 Q0,0 20,0 Q0,0 0,20 Q0,0 -20,0" fill="#a855f7" opacity="0.8" />
            <path d="M-10,-20 Q0,-20 0,-30 Q0,-20 10,-20 Q0,-20 0,-10 Q0,-20 -10,-20" fill="#6366f1" opacity="0.6" />
            <circle cx="25" cy="-15" r="3" fill="#38bdf8" />
            <circle cx="-25" cy="20" r="4" fill="#ec4899" />
        </g>
        
        <text x="{width/2}" y="{height*0.42}" font-family="'Outfit', sans-serif" font-size="{height*0.05}px" font-weight="700" text-anchor="middle" fill="url(#text-grad)">VISUAL CONCEPT PLAN READY</text>
        <text x="{width/2}" y="{height*0.50}" font-family="'Outfit', sans-serif" font-size="{height*0.03}px" font-weight="600" text-anchor="middle" fill="#71717a" letter-spacing="2">STYLE: {style.upper()}</text>
        
        <rect x="{width*0.15}" y="{height*0.57}" width="{width*0.7}" height="{height*0.28}" rx="10" fill="#18181b" fill-opacity="0.6" stroke="#27272a" stroke-width="1" />
        
        <foreignObject x="{width*0.17}" y="{height*0.59}" width="{width*0.66}" height="{height*0.24}">
            <div xmlns="http://www.w3.org/1999/xhtml" style="color: #e4e4e7; font-family: 'Outfit', sans-serif; font-size: {height*0.03}px; line-height: 1.6; text-align: center; display: flex; align-items: center; justify-content: center; height: 100%; overflow: hidden;">
                {clean_concept}
            </div>
        </foreignObject>
        
        <text x="{width/2}" y="{height*0.93}" font-family="'Outfit', sans-serif" font-size="{height*0.025}px" text-anchor="middle" fill="#52525b">Status: Visual Plan Generated Successfully</text>
    </svg>"""
    
    encoded_svg = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
    return f"data:image/svg+xml;base64,{encoded_svg}"

def generate_image_hf(prompt: str, token: str, aspect_ratio: str = "16:9") -> str:
    # 1. Try using Hugging Face InferenceClient
    try:
        from huggingface_hub import InferenceClient
        import io
        
        model = os.getenv("HF_IMAGE_MODEL", "black-forest-labs/FLUX.1-schnell")
        print(f"Generating image via Hugging Face InferenceClient with model {model}...")
        client = InferenceClient(api_key=token)
        
        image = client.text_to_image(
            prompt=prompt,
            model=model
        )
        
        # Save PIL Image to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"
        
    except Exception as hf_err:
        print(f"HF InferenceClient image generation failed: {hf_err}. Trying Gradio client fallback...")
        
        # 2. Try Gradio client as a fallback
        try:
            from gradio_client import Client
            
            width, height = 1024, 1024
            ratio = aspect_ratio.strip().replace(" ", "")
            if ratio == "16:9":
                width, height = 1024, 576
            elif ratio == "9:16":
                width, height = 576, 1024
            elif ratio == "4:3":
                width, height = 1024, 768
            elif ratio == "3:2":
                width, height = 1024, 680
                
            print(f"Connecting to Gradio black-forest-labs/FLUX.1-schnell space...")
            client = Client("black-forest-labs/FLUX.1-schnell", token=token)
            
            print(f"Predicting image with prompt: {prompt[:100]}...")
            temp_file_path = client.predict(
                prompt=prompt,
                seed=0,
                width=width,
                height=height,
                api_name="/infer"
            )
            
            # Read the generated temporary file and encode as base64
            with open(temp_file_path, "rb") as image_file:
                encoded = base64.b64encode(image_file.read()).decode("utf-8")
                
            # Clean up temporary file
            try:
                os.remove(temp_file_path)
            except Exception as cleanup_err:
                print(f"Failed to clean up temp file: {cleanup_err}")
                
            return f"data:image/webp;base64,{encoded}"
            
        except Exception as gradio_err:
            print(f"Gradio space call failed: {gradio_err}. Falling back to direct Serverless Inference API...")
            
            # 3. Direct Serverless API request fallback
            try:
                env_model = os.getenv("HF_IMAGE_MODEL", "black-forest-labs/FLUX.1-schnell")
                url = f"https://api-inference.huggingface.co/models/{env_model}"
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
                payload = {"inputs": prompt}
                r = requests.post(url, headers=headers, json=payload, timeout=40)
                r.raise_for_status()
                encoded = base64.b64encode(r.content).decode("utf-8")
                return f"data:image/png;base64,{encoded}"
            except Exception as direct_err:
                raise Exception(f"All Hugging Face image generation pathways failed. InferenceClient error: {hf_err} | Gradio error: {gradio_err} | Direct API error: {direct_err}")



def generate_image_nvidia(prompt: str, api_key: str) -> str:
    env_model = os.getenv("NVIDIA_IMAGE_MODEL", "stabilityai/stable-diffusion-3.5-large")
    url = "https://integrate.api.nvidia.com/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": env_model,
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024"
    }
    r = requests.post(url, headers=headers, json=payload, timeout=45)
    r.raise_for_status()
    data = r.json()
    img_data = data['data'][0]
    if 'b64_json' in img_data:
        return f"data:image/png;base64,{img_data['b64_json']}"
    elif 'url' in img_data:
        return img_data['url']
    raise ValueError("No image payload returned from Nvidia NIM")

def generate_image_openrouter(prompt: str, api_key: str) -> str:
    env_model = os.getenv("OPENROUTER_IMAGE_MODEL", "stabilityai/sdxl")
    url = "https://openrouter.ai/api/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": env_model,
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024"
    }
    r = requests.post(url, headers=headers, json=payload, timeout=45)
    r.raise_for_status()
    data = r.json()
    img_data = data['data'][0]
    if 'b64_json' in img_data:
        return f"data:image/png;base64,{img_data['b64_json']}"
    elif 'url' in img_data:
        return img_data['url']
    raise ValueError("No image returned from OpenRouter")

def generate_image_openai(prompt: str, api_key: str, aspect_ratio: str = "16:9", model_name: str = None) -> str:
    model = model_name or os.getenv("OPENAI_IMAGE_MODEL", "dall-e-3")
    url = "https://api.openai.com/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    ratio = aspect_ratio.strip().replace(" ", "")
    if model == "dall-e-3" and ratio == "16:9":
        size = "1792x1024"
    elif model == "dall-e-3" and ratio == "9:16":
        size = "1024x1792"
    else:
        size = "1024x1024"
        
    payload = {
        "model": model,
        "prompt": prompt,
        "n": 1,
        "size": size
    }
    r = requests.post(url, headers=headers, json=payload, timeout=45)
    if r.status_code != 200:
        raise ValueError(f"OpenAI API error ({r.status_code}): {r.text}")
    data = r.json()
    img_data = data['data'][0]
    if 'b64_json' in img_data:
        return f"data:image/png;base64,{img_data['b64_json']}"
    elif 'url' in img_data:
        img_url = img_data['url']
        try:
            img_res = requests.get(img_url, timeout=30)
            img_res.raise_for_status()
            encoded = base64.b64encode(img_res.content).decode("utf-8")
            return f"data:image/png;base64,{encoded}"
        except Exception as e:
            raise ValueError(f"Failed to download and persist OpenAI image from URL: {str(e)}")
    raise ValueError("No image returned from OpenAI")

def generate_image_gemini(prompt: str, api_key: str, aspect_ratio: str = "16:9", model_name: str = None) -> str:
    env_model = model_name or os.getenv("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
    
    is_imagen = "imagen" in env_model.lower()
    is_gemini_multimodal_image = env_model.lower().startswith("gemini-") and "image" in env_model.lower()
    
    ratio = aspect_ratio.strip().replace(" ", "")
    if ratio not in ["1:1", "3:4", "4:3", "9:16", "16:9"]:
        ratio = "16:9"
        
    headers = {"Content-Type": "application/json"}
    
    if is_gemini_multimodal_image:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{env_model}:generateContent?key={api_key}"
        prompt_text = f"{prompt}. Aspect ratio: {ratio}."
        payload = {
            "contents": [{
                "parts": [{"text": prompt_text}]
            }],
            "generationConfig": {
                "responseModalities": ["TEXT", "IMAGE"]
            }
        }
    elif is_imagen:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{env_model}:predict?key={api_key}"
        payload = {
            "instances": [{"prompt": prompt}],
            "parameters": {
                "sampleCount": 1,
                "aspectRatio": ratio,
                "outputMimeType": "image/jpeg"
            }
        }
    else:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{env_model}:generateImages?key={api_key}"
        payload = {
            "prompt": prompt,
            "numberOfImages": 1,
            "aspectRatio": ratio,
            "outputMimeType": "image/jpeg"
        }
    
    retries = 3
    delay = 2
    last_err = None
    for attempt in range(retries):
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=45)
            if r.status_code in [503, 429]:
                if attempt < retries - 1:
                    print(f"Gemini Image API returned {r.status_code}. Retrying in {delay}s... (Attempt {attempt + 1}/{retries})")
                    time.sleep(delay)
                    delay *= 2
                    continue
            r.raise_for_status()
            data = r.json()
            
            # 1. Check candidates for inlineData (generateContent endpoint for gemini-2.5-flash-image)
            if 'candidates' in data and len(data['candidates']) > 0:
                candidate = data['candidates'][0]
                content = candidate.get('content', {})
                parts = content.get('parts', [])
                for part in parts:
                    if 'inlineData' in part:
                        inline = part['inlineData']
                        img_bytes = inline.get('data')
                        mime_type = inline.get('mimeType', 'image/jpeg')
                        if img_bytes:
                            return f"data:{mime_type};base64,{img_bytes}"
            
            # 2. Check predictions (predict endpoint for imagen)
            if 'predictions' in data and len(data['predictions']) > 0:
                pred = data['predictions'][0]
                if isinstance(pred, dict):
                    img_bytes = pred.get('bytesBase64Encoded') or pred.get('imageBytes')
                    if img_bytes:
                        return f"data:image/jpeg;base64,{img_bytes}"
            
            # 3. Check generatedImages (generateImages endpoint for legacy models)
            if 'generatedImages' in data and len(data['generatedImages']) > 0:
                img_bytes = data['generatedImages'][0]['image']['imageBytes']
                return f"data:image/jpeg;base64,{img_bytes}"
                
            raise ValueError(f"Unrecognized response format: {json.dumps(data)}")
            
        except Exception as e:
            last_err = e
            if attempt < retries - 1:
                print(f"Gemini Image API request failed with exception: {str(e)}. Retrying in {delay}s... (Attempt {attempt + 1}/{retries})")
                time.sleep(delay)
                delay *= 2
                continue
            break
    raise ValueError(f"Gemini image generation failed: {str(last_err)}")


def normalize_output(parsed: Dict, fields: Dict, seed: int = None) -> Dict:
    out = {
        "image_concept": parsed.get("image_concept") or parsed.get("concept") or "An educational graphic helping explain the lesson concept.",
        "image_prompt": parsed.get("image_prompt") or f"A clean diagram showing {fields.get('lesson', 'the lesson topic')}.",
        "negative_prompt": parsed.get("negative_prompt") or "blurry, dark, low contrast, text, letters, UI, watermark",
        "image_purpose": parsed.get("image_purpose") or fields.get("purpose") or "Explanation image",
        "aspect_ratio": parsed.get("aspect_ratio") or "16:9",
        "suggested_placement": parsed.get("suggested_placement") or fields.get("placement") or "Inline",
        "alt_text": parsed.get("alt_text") or f"Visual explanation of {fields.get('lesson')}",
        "safety_check": parsed.get("safety_check") or "SAFE - Suitable for student learning materials",
        "course_relevance_score": int(parsed.get("course_relevance_score") or 90)
    }
    
    provider = fields.get("provider", "mock").lower()
    
    # Route image generation strictly to the active provider
    if provider == 'gemini':
        key = fields.get("gemini_key") or os.getenv("GEMINI_API_KEY")
        if key:
            out["image_url"] = generate_image_gemini(out["image_prompt"], key, out["aspect_ratio"], fields.get("gemini_image_model"))
        else:
            out["image_url"] = get_svg_placeholder("Gemini key required", fields.get("style", "Flat illustration"), out["aspect_ratio"])
            
    elif provider == 'openai':
        key = fields.get("openai_key") or os.getenv("OPENAI_API_KEY")
        if key:
            out["image_url"] = generate_image_openai(out["image_prompt"], key, out["aspect_ratio"], fields.get("openai_image_model"))
        else:
            out["image_url"] = get_svg_placeholder("OpenAI key required", fields.get("style", "Flat illustration"), out["aspect_ratio"])
            
    elif provider == 'nvidia':
        key = fields.get("nvidia_key") or os.getenv("NVIDIA_API_KEY")
        if key:
            out["image_url"] = generate_image_nvidia(out["image_prompt"], key)
        else:
            out["image_url"] = get_svg_placeholder("Nvidia NIM key required", fields.get("style", "Flat illustration"), out["aspect_ratio"])
            
    elif provider == 'openrouter':
        key = fields.get("openrouter_key") or os.getenv("OPENROUTER_API_KEY")
        if key:
            out["image_url"] = generate_image_openrouter(out["image_prompt"], key)
        else:
            out["image_url"] = get_svg_placeholder("OpenRouter key required", fields.get("style", "Flat illustration"), out["aspect_ratio"])
            
    elif provider == 'hf':
        token = fields.get("hf_token") or os.getenv("HF_TOKEN")
        if token:
            out["image_url"] = generate_image_hf(out["image_prompt"], token, out["aspect_ratio"])
        else:
            out["image_url"] = get_svg_placeholder("HF Token required", fields.get("style", "Flat illustration"), out["aspect_ratio"])
            
    elif provider == 'groq':
        out["image_url"] = get_svg_placeholder("Groq is a text-only provider.", fields.get("style", "Flat illustration"), out["aspect_ratio"])
        
    elif provider == 'anthropic':
        out["image_url"] = get_svg_placeholder("Anthropic is a text-only provider.", fields.get("style", "Flat illustration"), out["aspect_ratio"])
        
    else: # mock or fallback
        out["image_url"] = get_svg_placeholder(out["image_concept"], fields.get("style", "Flat illustration"), out["aspect_ratio"])
        
    return out

def mock_output(fields: Dict, seed: int = None) -> Dict:
    lesson = fields.get('lesson', 'Python Variables').strip()
    style = fields.get('style', 'Flat illustration')
    
    concept = (
        f"A clear visual metaphor for '{lesson}'. "
        f"We represent variables using labeled containers (like boxes) in memory "
        f"to show that they hold changeable values."
    )
    
    prompt = (
        f"A beautiful educational {style.lower()} representing the concept of '{lesson}'. "
        f"Features a clean, minimalist design with vibrant colors, simple iconic metaphors, "
        f"soft shadows, and a light background. Organized, friendly, and highly educational."
    )
    
    negative = "lowres, blurry, dark themes, scary, watermark, ugly, text, spelling, bad composition"
    
    mock_data = {
        "image_concept": concept,
        "image_prompt": prompt,
        "negative_prompt": negative,
        "image_purpose": fields.get("purpose") or "To provide an intuitive metaphor to help students grasp the core lesson concept.",
        "aspect_ratio": "16:9",
        "suggested_placement": fields.get("placement") or "Inline within lesson content",
        "alt_text": f"An educational visual showing the concept of {lesson}.",
        "safety_check": "SAFE - clean, educational visual appropriate for all student ages.",
        "course_relevance_score": 95
    }
    
    return normalize_output(mock_data, fields, seed)

def call_gemini(api_key: str, system_prompt: str, user_message: str, model_name: str = None) -> str:
    model = model_name or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{
                "text": f"{system_prompt}\n\nUser Lesson details:\n{user_message}"
            }]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2
        }
    }
    retries = 3
    delay = 2
    for attempt in range(retries):
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=20)
            if r.status_code in [503, 429]:
                if attempt < retries - 1:
                    print(f"Gemini API ({model}) returned {r.status_code}. Retrying in {delay}s... (Attempt {attempt + 1}/{retries})")
                    time.sleep(delay)
                    delay *= 2
                    continue
            r.raise_for_status()
            data = r.json()
            return data['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            if attempt < retries - 1:
                print(f"Gemini API ({model}) request failed with exception: {str(e)}. Retrying in {delay}s... (Attempt {attempt + 1}/{retries})")
                time.sleep(delay)
                delay *= 2
                continue
            raise ValueError(f"Gemini API request failed: {str(e)}")

def call_groq(api_key: str, system_prompt: str, user_message: str) -> str:
    env_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    models = [env_model, "llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    models = list(dict.fromkeys(models))
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    last_err = None
    for model in models:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }
        try:
            r = requests.post(url, headers=headers, json=payload, timeout=20)
            r.raise_for_status()
            data = r.json()
            return data['choices'][0]['message']['content']
        except Exception as e:
            last_err = e
            continue
    raise ValueError(f"Groq API request failed: {str(last_err)}")

def call_anthropic(api_key: str, system_prompt: str, user_message: str) -> str:
    model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "max_tokens": 1000,
        "system": system_prompt,
        "messages": [{"role": "user", "content": user_message}],
        "temperature": 0.2
    }
    r = requests.post(url, headers=headers, json=payload, timeout=30)
    r.raise_for_status()
    data = r.json()
    return data['content'][0]['text']

def call_openrouter(api_key: str, system_prompt: str, user_message: str) -> str:
    env_model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3-8b-instruct:free")
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": env_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }
    r = requests.post(url, headers=headers, json=payload, timeout=25)
    r.raise_for_status()
    data = r.json()
    return data['choices'][0]['message']['content']

def call_nvidia(api_key: str, system_prompt: str, user_message: str) -> str:
    env_model = os.getenv("NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
    url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": env_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }
    r = requests.post(url, headers=headers, json=payload, timeout=25)
    r.raise_for_status()
    data = r.json()
    return data['choices'][0]['message']['content']

def call_openai(api_key: str, system_prompt: str, user_message: str, model_name: str = None) -> str:
    model = model_name or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }
    r = requests.post(url, headers=headers, json=payload, timeout=30)
    r.raise_for_status()
    data = r.json()
    return data['choices'][0]['message']['content']

def generate_visual_plan_sync(fields: Dict) -> Dict:
    provider = fields.get('provider', 'mock').lower()
    seed = fields.get('seed')
    if seed is None:
         seed = random.randint(1, 999999)
         
    user_message = build_user_message(fields)
    
    if provider == 'mock':
        return mock_output(fields, seed)
        
    elif provider == 'openai':
        key = fields.get('openai_key') or os.getenv('OPENAI_API_KEY')
        if not key:
            raise ValueError("OpenAI API key is required. Please set it in your .env file.")
        raw_text = call_openai(key, SYSTEM_PROMPT, user_message, fields.get("openai_model"))
        parsed = extract_json(raw_text)
        return normalize_output(parsed, fields, seed)
        
    elif provider == 'gemini':
        key = fields.get('gemini_key') or os.getenv('GEMINI_API_KEY')
        if not key:
            raise ValueError("Gemini API key is required. Please set it in your .env file.")
        raw_text = call_gemini(key, SYSTEM_PROMPT, user_message, fields.get("gemini_model"))
        parsed = extract_json(raw_text)
        return normalize_output(parsed, fields, seed)
        
    elif provider == 'groq':
        key = fields.get('groq_key') or os.getenv('GROQ_API_KEY')
        if not key:
            raise ValueError("Groq API key is required. Please set it in your .env file.")
        raw_text = call_groq(key, SYSTEM_PROMPT, user_message)
        parsed = extract_json(raw_text)
        return normalize_output(parsed, fields, seed)
        
    elif provider == 'openrouter':
        key = fields.get('openrouter_key') or os.getenv('OPENROUTER_API_KEY')
        if not key:
            raise ValueError("OpenRouter API key is required. Please set it in your .env file.")
        raw_text = call_openrouter(key, SYSTEM_PROMPT, user_message)
        parsed = extract_json(raw_text)
        return normalize_output(parsed, fields, seed)
        
    elif provider == 'nvidia':
        key = fields.get('nvidia_key') or os.getenv('NVIDIA_API_KEY')
        if not key:
            raise ValueError("Nvidia API key is required. Please set it in your .env file.")
        raw_text = call_nvidia(key, SYSTEM_PROMPT, user_message)
        parsed = extract_json(raw_text)
        return normalize_output(parsed, fields, seed)
        
    elif provider == 'anthropic':
        key = fields.get('anthropic_key') or os.getenv('ANTHROPIC_API_KEY')
        if not key:
            raise ValueError("Anthropic API key is required. Please set it in your .env file.")
        raw_text = call_anthropic(key, SYSTEM_PROMPT, user_message)
        parsed = extract_json(raw_text)
        return normalize_output(parsed, fields, seed)
        
    elif provider == 'hf':
        token = fields.get('hf_token') or os.getenv('HF_TOKEN')
        if not token:
            raise ValueError("Hugging Face API token is required. Please set it in your .env file.")
            
        model = os.getenv('HF_MODEL', 'Qwen/Qwen2.5-Coder-32B-Instruct')
        
        try:
            from huggingface_hub import InferenceClient
            print(f"Calling Hugging Face InferenceClient with model {model}...")
            client = InferenceClient(api_key=token)
            response = client.chat_completion(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=2000,
                temperature=0.2
            )
            raw_text = response.choices[0].message.content
        except Exception as e:
            print(f"Hugging Face InferenceClient failed: {e}. Trying direct serverless request...")
            url = f"https://api-inference.huggingface.co/models/{model}"
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            payload = {
                "inputs": SYSTEM_PROMPT + "\n\nUser content details:\n" + user_message, 
                "parameters": {"max_new_tokens": 1000}
            }
            r = requests.post(url, headers=headers, json=payload, timeout=30)
            r.raise_for_status()
            data = r.json()
            
            if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
                raw_text = data[0].get('generated_text') or json.dumps(data)
            elif isinstance(data, dict) and 'generated_text' in data:
                raw_text = data.get('generated_text')
            else:
                raw_text = json.dumps(data)
                
        parsed = extract_json(raw_text)
        return normalize_output(parsed, fields, seed)
        
    else:
        return mock_output(fields, seed)
