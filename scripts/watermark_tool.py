import os
import argparse
from PIL import Image

def watermark_image(image_path, logo_path, output_path, position='bottom-right', padding=20, logo_width_percent=15):
    """
    Adds a logo watermark to an image.
    """
    try:
        # Open the main image
        base_image = Image.open(image_path).convert("RGBA")
        width, height = base_image.size

        # Open the logo
        logo = Image.open(logo_path).convert("RGBA")
        
        # Calculate new logo size (proportional)
        logo_w, logo_h = logo.size
        target_w = int(width * (logo_width_percent / 100))
        target_h = int(logo_h * (target_w / logo_w))
        logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Determine position
        if position == 'bottom-right':
            pos_x = width - target_w - padding
            pos_y = height - target_h - padding
        elif position == 'bottom-left':
            pos_x = padding
            pos_y = height - target_h - padding
        elif position == 'top-right':
            pos_x = width - target_w - padding
            pos_y = padding
        elif position == 'top-left':
            pos_x = padding
            pos_y = padding
        elif position == 'center':
            pos_x = (width - target_w) // 2
            pos_y = (height - target_h) // 2
        else:
            pos_x, pos_y = padding, padding

        # Create a transparent layer for the watermark
        watermark_layer = Image.new("RGBA", base_image.size, (0, 0, 0, 0))
        watermark_layer.paste(logo, (pos_x, pos_y))

        # Combine
        combined = Image.alpha_composite(base_image, watermark_layer)
        
        # Save (convert back to RGB if saving as JPEG)
        if output_path.lower().endswith('.jpg') or output_path.lower().endswith('.jpeg'):
            combined = combined.convert("RGB")
            
        combined.save(output_path, quality=95)
        print(f"✅ Success: {output_path}")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sonaraura Watermarker")
    parser.add_argument("input", help="Path to the generated social media image")
    parser.add_argument("--logo", default="/Users/trgysvc/Developer/AuraStreamBE/public/images/Logo.png", help="Path to logo")
    parser.add_argument("--pos", default="bottom-right", choices=['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'], help="Logo position")
    parser.add_argument("--size", type=int, default=15, help="Logo size as % of image width")
    
    args = parser.parse_args()
    
    output = f"watermarked_{os.path.basename(args.input)}"
    watermark_image(args.input, args.logo, output, position=args.pos, logo_width_percent=args.size)
