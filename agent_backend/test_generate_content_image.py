import requests
import json

api_key = "AIzaSyBLIl5D3KWIEm6jTxAnNKvmfQVpR-pp4L8"
model = "gemini-2.5-flash-image"
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
headers = {"Content-Type": "application/json"}
payload = {
    "contents": [{
        "parts": [{
            "text": "Generate an image of a red apple on a wooden table."
        }]
    }]
}

try:
    r = requests.post(url, headers=headers, json=payload, timeout=20)
    print("STATUS:", r.status_code)
    if r.status_code == 200:
        res = r.json()
        print("SUCCESS! Keys in response:", res.keys())
        if "candidates" in res:
            candidate = res["candidates"][0]
            print("Candidate keys:", candidate.keys())
            content = candidate.get("content", {})
            print("Content keys:", content.keys())
            parts = content.get("parts", [])
            print(f"Number of parts: {len(parts)}")
            for i, part in enumerate(parts):
                print(f"Part {i} keys:", part.keys())
                if "inlineData" in part:
                    inline = part["inlineData"]
                    print(f"Part {i} inlineData mimeType:", inline.get("mimeType"))
                    print(f"Part {i} inlineData data prefix:", inline.get("data")[:100])
                elif "text" in part:
                    print(f"Part {i} text (first 300 chars):", part["text"][:300])
        else:
            print("Full response JSON:", json.dumps(res)[:1000])
    else:
        print("FAILED! Response:", r.text[:1000])
except Exception as e:
    print("ERROR:", e)
