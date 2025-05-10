import requests
from config import API_KEY

URL = "https://api.aimlapi.com/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "model": "chatgpt-4o-latest",
    "messages": [
        {
            "role": "user",
            "content": "Motor overheated for 20 mins last week after restart"
        }
    ]
}

response = requests.post(URL, headers=headers, json=data)

if response.status_code in [200, 201]:

    print("✅ Response:")
    print(response.json()["choices"][0]["message"]["content"])
else:
    print(response.json()["choices"][0]["message"]["content"])

