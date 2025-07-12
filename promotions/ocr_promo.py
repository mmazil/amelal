import os
import easyocr
import json
import re

def extract_price(text):
    match = re.search(r"(?:prix|price)?\s*[:\-]?\s*(\d{1,3}[\.,]\d{2})\s*(MAD|Dhs)?", text, re.I)
    if match:
        return f"{match.group(1).replace(',', '.')} MAD"
    return "Not found"

def extract_original_price(text):
    matches = re.findall(r"(\d{1,3}[\.,]\d{2})\s*(MAD|Dhs)?", text, re.I)
    if len(matches) > 1:
        return f"{matches[0][0].replace(',', '.')} MAD"
    return "Not found"

def extract_saved(text):
    prices = re.findall(r"(\d{1,3}[\.,]\d{2})\s*(MAD|Dhs)?", text, re.I)
    if len(prices) >= 2:
        try:
            original = float(prices[0][0].replace(',', '.'))
            current = float(prices[1][0].replace(',', '.'))
            return f"{original - current:.2f} MAD"
        except:
            return "Not found"
    return "Not found"

def extract_name(text_lines):
    keywords = ["beurre", "fromage", "lait", "pasteurisé", "butter"]
    clean_lines = []

    for line in text_lines:
        if len(line.strip()) < 3:
            continue
        alpha_chars = sum(c.isalpha() for c in line)
        if alpha_chars / max(len(line), 1) < 0.5:
            continue
        clean_lines.append(line.lower())

    for line in clean_lines:
        if any(kw in line for kw in keywords):
            return line.title()

    if clean_lines:
        return max(clean_lines, key=len).title()

    return "Unknown"

def process_image(image_path, reader):
    results = reader.readtext(image_path, detail=0)
    full_text = "\n".join(results)

    name = extract_name(results)
    description = full_text.replace(name.lower(), "").strip()
    description = re.sub(r"[\d.,]+\s*(MAD|Dhs)?", "", description, flags=re.I).strip()

    price = extract_price(full_text)
    original_price = extract_original_price(full_text)
    saved = extract_saved(full_text)

    promo = {
        "name": name,
        "description": description,
        "price": price,
        "original_price": original_price,
        "saved": saved,
        "promotion_date": "2025-07-10",
        "promotion_end": "2025-07-16",
        "supermarkets": ["Kazyon"],
        "image": os.path.basename(image_path),
    }
    return promo

def main(folder_path):
    reader = easyocr.Reader(['fr'], gpu=False)

    image_extensions = {'.png', '.jpg', '.jpeg', '.bmp', '.tiff'}

    promos = []
    for filename in os.listdir(folder_path):
        if os.path.splitext(filename)[1].lower() in image_extensions:
            path = os.path.join(folder_path, filename)
            print(f"Processing {filename}...")
            promo = process_image(path, reader)
            promos.append(promo)

    print("\nAll Promotions Extracted:\n")
    print(json.dumps(promos, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python ocr_promo.py path_to_folder")
        sys.exit(1)

    main(sys.argv[1])
