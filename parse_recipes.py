import os
import glob
import json
import shutil
import uuid
from bs4 import BeautifulSoup

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
                    "categories": [],
                    "difficulty": "",
                    "servings": "",
                    "author": "",
                    "ingredients": [],
                    "instructions": "",
                    "notes": "",
                    "images": []
                }
                
                name_tag = recipe.find(attrs={"itemprop": "name"})
                if name_tag: data["name"] = name_tag.get_text(strip=True)
                
                cat_tag = recipe.find(attrs={"itemprop": "recipeCategory"})
                if cat_tag: 
                    cats = cat_tag.get_text(strip=True).split(",")
                    data["categories"] = [c.strip() for c in cats if c.strip()]
                    
                diff_tag = recipe.find(attrs={"itemprop": "difficulty"})
                if diff_tag: data["difficulty"] = diff_tag.get_text(strip=True)
                
                serv_tag = recipe.find(attrs={"itemprop": "recipeYield"})
                if serv_tag: data["servings"] = serv_tag.get_text(strip=True)
                
                author_tag = recipe.find(attrs={"itemprop": "author"})
                if author_tag: data["author"] = author_tag.get_text(strip=True)
                
                for ing_tag in recipe.find_all(attrs={"itemprop": "recipeIngredient"}):
                    data["ingredients"].append(ing_tag.get_text(strip=True))
                    
                instr_tag = recipe.find(attrs={"itemprop": "recipeInstructions"})
                if instr_tag: data["instructions"] = instr_tag.get_text(separator="\n", strip=True)
                
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
                        # Relative to public folder in modern dev frameworks
                        data["images"].append(f"/images/recipes/{new_img_name}")
                        
                recipes_data.append(data)
                print(f"Parsed: {data['name']}")
                
            except Exception as e:
                print(f"Error parsing {file_path}: {e}")
                
    with open("/Users/mineral/Deve/吃啥啊/recipes.json", "w", encoding="utf-8") as f:
        json.dump(recipes_data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully exported {len(recipes_data)} recipes to recipes.json.")

if __name__ == "__main__":
    main()
