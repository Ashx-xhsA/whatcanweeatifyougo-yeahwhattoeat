import os
import re
import json
import uuid
import requests
import sys
from openai import OpenAI

def main():
    title = os.environ.get("ISSUE_TITLE", "Unknown Recipe")
    body = os.environ.get("ISSUE_BODY", "")
    api_key = os.environ.get("DEEPSEEK_API_KEY", "")

    if not api_key:
        print("Error: DEEPSEEK_API_KEY is not set in secrets.")
        sys.exit(1)

    # Extract images from markdown body
    # Markdown image format: ![alt text](url) or <img src="url">
    img_urls = re.findall(r'!\[.*?\]\((.*?)\)', body)
    
    # Download images
    images_dir = "public/images/recipes"
    os.makedirs(images_dir, exist_ok=True)
    local_image_paths = []
    
    recipe_id = str(uuid.uuid4())
    
    for idx, url in enumerate(img_urls):
        try:
            resp = requests.get(url, stream=True)
            if resp.status_code == 200:
                ext = ".jpg" # Default to jpg
                if ".png" in url.lower(): ext = ".png"
                elif ".webp" in url.lower(): ext = ".webp"

                filename = f"{recipe_id}_{idx}{ext}"
                filepath = os.path.join(images_dir, filename)
                with open(filepath, 'wb') as f:
                    for chunk in resp.iter_content(1024):
                        f.write(chunk)
                local_image_paths.append(f"/images/recipes/{filename}")
        except Exception as e:
            print(f"Failed to download image {url}: {e}")

    # Remove image markdown from body to save tokens and prevent confusion
    clean_body = re.sub(r'!\[.*?\]\(.*?\)', '', body)

    # Use DeepSeek (OpenAI compatible API structure)
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.deepseek.com"
    )

    prompt = f"""
    You are an expert bilingual recipe parser. A user has pasted text from a Chinese social media website like Xiaohongshu to document a recipe.
    Parse the following text into this exact JSON structure. Ensure it is valid JSON. ONLY output the JSON object.

    Required JSON structure:
    {{
      "name": "(Translate the title to English)",
      "name_zh": "{title}",
      "categories": ["(English tags)"],
      "categories_zh": ["(Chinese tags)"],
      "difficulty": "Easy",
      "difficulty_zh": "简单",
      "servings": "",
      "author": "Xiaohongshu",
      "ingredients": ["(Translate ingredients to English)"],
      "ingredients_zh": ["(Chinese ingredients extracted)"],
      "instructions": "(Translate cooking steps to English string, use \\n for newlines)",
      "instructions_zh": "(Chinese cooking steps extracted, use \\n for newlines)",
      "notes": "",
      "notes_zh": "(Any extra tips mentioned)"
    }}

    Here is the messy text to parse:
    {clean_body}
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You output JSON format only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result_text = response.choices[0].message.content
        recipe_data = json.loads(result_text)
    except Exception as e:
        print(f"LLM API Error: {e}")
        sys.exit(1)

    # Attach generated ID and downloaded images
    recipe_data["id"] = recipe_id
    recipe_data["images"] = local_image_paths

    # Read existing
    json_path = "src/data/recipes.json"
    existing_data = []
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                existing_data = json.load(f)
            except:
                pass

    # Insert at beginning
    existing_data.insert(0, recipe_data)

    # Save
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=2)

    print(f"Successfully processed {title} and updated recipes.json!")

if __name__ == "__main__":
    main()
