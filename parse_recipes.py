import os
import glob
import json
import shutil
import uuid
import time
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator

def translate_str(text):
    if not text: return ""
    try:
        return GoogleTranslator(source='auto', target='zh-CN').translate(text)
    except:
        return text

def main():
    dirs_to_scan = [
        "/Users/mineral/Downloads/Recipes",
        "/Users/mineral/Downloads/Recipes 2",
        "/Users/mineral/Deve/吃啥啊"
    ]
    
    output_images_dir = "/Users/mineral/Deve/吃啥啊/public/images/recipes"
    os.makedirs(output_images_dir, exist_ok=True)
    
    recipes_data = []
    
    for d in dirs_to_scan:
        if not os.path.exists(d):
            print(f"Directory {d} does not exist, skipping.")
            continue
            
        html_files = glob.glob(os.path.join(d, "*.html"))
        for file_path in html_files:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    soup = BeautifulSoup(f, "html.parser")
                    
                recipe = soup.find(attrs={"itemtype": "http://schema.org/Recipe"})
                if not recipe:
                    continue
                    
                data = {
                    "id": str(uuid.uuid4()),
                    "name": "",
                    "name_zh": "",
                    "categories": [],
                    "categories_zh": [],
                    "difficulty": "",
                    "difficulty_zh": "",
                    "servings": "",
                    "author": "",
                    "ingredients": [],
                    "ingredients_zh": [],
                    "instructions": "",
                    "instructions_zh": "",
                    "notes": "",
                    "images": []
                }
                
                name_tag = recipe.find(attrs={"itemprop": "name"})
                if name_tag: 
                    data["name"] = name_tag.get_text(strip=True)
                    data["name_zh"] = translate_str(data["name"])
                
                cat_tag = recipe.find(attrs={"itemprop": "recipeCategory"})
                if cat_tag: 
                    cats = cat_tag.get_text(strip=True).split(",")
                    data["categories"] = [c.strip() for c in cats if c.strip()]
                    data["categories_zh"] = [translate_str(c.strip()) for c in data["categories"]]
                    
                diff_tag = recipe.find(attrs={"itemprop": "difficulty"})
                if diff_tag: 
                    data["difficulty"] = diff_tag.get_text(strip=True)
                    data["difficulty_zh"] = translate_str(data["difficulty"])
                
                serv_tag = recipe.find(attrs={"itemprop": "recipeYield"})
                if serv_tag: data["servings"] = serv_tag.get_text(strip=True)
                
                author_tag = recipe.find(attrs={"itemprop": "author"})
                if author_tag: data["author"] = author_tag.get_text(strip=True)
                
                for ing_tag in recipe.find_all(attrs={"itemprop": "recipeIngredient"}):
                    text = ing_tag.get_text(strip=True)
                    data["ingredients"].append(text)
                    data["ingredients_zh"].append(translate_str(text))
                    
                instr_tag = recipe.find(attrs={"itemprop": "recipeInstructions"})
                if instr_tag: 
                    data["instructions"] = instr_tag.get_text(separator="\n", strip=True)
                    data["instructions_zh"] = translate_str(data["instructions"])
                
                note_tag = recipe.find(attrs={"itemprop": "comment"})
                if note_tag: data["notes"] = note_tag.get_text(separator="\n", strip=True)
                
                # Copy images
                img_tags = recipe.find_all("img", itemprop="image")
                for img in img_tags:
                    src = img.get("src")
                    if not src: continue
                    img_abs_path = os.path.join(os.path.dirname(file_path), src)
                    if os.path.exists(img_abs_path):
                        ext = os.path.splitext(img_abs_path)[1]
                        new_img_name = f"{data['id']}_{len(data['images'])}{ext}"
                        new_img_path = os.path.join(output_images_dir, new_img_name)
                        shutil.copy2(img_abs_path, new_img_path)
                        data["images"].append(f"/images/recipes/{new_img_name}")
                        
                recipes_data.append(data)
                print(f"Parsed & Translated: {data['name']}")
                
                # Add slight delay to respect translation API rate limit
                time.sleep(0.5)
                
            except Exception as e:
                print(f"Error parsing {file_path}: {e}")
                
    output_json = "/Users/mineral/Deve/吃啥啊/src/data/recipes.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(recipes_data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully exported {len(recipes_data)} translated recipes to {output_json}.")

if __name__ == "__main__":
    main()
