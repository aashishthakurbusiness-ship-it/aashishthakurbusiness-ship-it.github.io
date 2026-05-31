import sys
from PIL import Image

def convert_to_webp(input_path, output_path):
    try:
        with Image.open(input_path) as img:
            img.save(output_path, 'webp', quality=85)
            print(f"Successfully converted {input_path} to {output_path}")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    convert_to_webp("e:/My Portfolio/public/images/gayak-thumbnail.png", "e:/My Portfolio/public/images/gayak-thumbnail.webp")
