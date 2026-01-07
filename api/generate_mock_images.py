"""
Generate placeholder images for greenhouse monitoring demo
Run this script to create mock plant images
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

def create_placeholder_image(filename, color, text, blur=False):
    """Create a colored placeholder image with text"""
    # Create 800x600 image
    img = Image.new('RGB', (800, 600), color=color)
    draw = ImageDraw.Draw(img)
    
    # Add text
    try:
        # Try to use a larger font
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
    except:
        # Fallback to default font
        font = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Draw main text (centered)
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    position = ((800 - text_width) // 2, (600 - text_height) // 2 - 50)
    
    # Add shadow for better readability
    draw.text((position[0] + 2, position[1] + 2), text, fill=(0, 0, 0), font=font)
    draw.text(position, text, fill=(255, 255, 255), font=font)
    
    # Add subtitle
    subtitle = f"Mock Image for Testing\n{filename}"
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=font_small)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_pos = ((800 - subtitle_width) // 2, position[1] + 100)
    draw.text((subtitle_pos[0] + 1, subtitle_pos[1] + 1), subtitle, fill=(0, 0, 0), font=font_small)
    draw.text(subtitle_pos, subtitle, fill=(200, 200, 200), font=font_small)
    
    # Apply blur if requested
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(radius=15))
    
    # Save image
    output_path = os.path.join(os.path.dirname(__file__), 'images', filename)
    img.save(output_path, 'JPEG', quality=85)
    print(f"✓ Created: {output_path}")

def main():
    """Generate all mock images"""
    print("Generating mock plant images...")
    print("-" * 50)
    
    # 1. Healthy plant - vibrant green
    create_placeholder_image(
        'healthy.jpg',
        color=(34, 139, 34),  # Forest green
        text='HEALTHY PLANT'
    )
    
    # 2. Heat stressed - yellow/orange
    create_placeholder_image(
        'stressed.jpg',
        color=(218, 165, 32),  # Golden rod (yellowish)
        text='HEAT STRESSED'
    )
    
    # 3. Nutrient deficient - pale green/yellow
    create_placeholder_image(
        'nutrient_deficient.jpg',
        color=(154, 205, 50),  # Yellow green
        text='NUTRIENT DEFICIENT'
    )
    
    # 4. Blurry image - green but blurred
    create_placeholder_image(
        'blurry.jpg',
        color=(46, 125, 50),  # Dark green
        text='BLURRY IMAGE',
        blur=True
    )
    
    # 5. Normal condition - medium green
    create_placeholder_image(
        'normal.jpg',
        color=(76, 175, 80),  # Medium green
        text='NORMAL CONDITION'
    )
    
    print("-" * 50)
    print("✓ All mock images generated successfully!")
    print("\nImages saved to: api/mock_data/images/")
    print("\nYou can replace these with real photos later.")

if __name__ == '__main__':
    main()
