# PWA Icons

## 📱 Required Icons

Place the following icon files in this directory:

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

## 🎨 Icon Design Guidelines

### **Design Specs:**
- **Logo:** BarberBook logo/brand mark
- **Background:** Dark (#1a1a1a) or Gold (#d4af37)
- **Format:** PNG with transparency
- **Safe Area:** Keep important content in center 80%
- **Padding:** 10% padding around edges

### **Maskable Icons:**
All icons should be "maskable" meaning they work well when:
- Cropped to a circle (Android)
- Cropped to a rounded square (iOS)
- Displayed with any mask shape

## 🛠️ How to Generate Icons

### **Option 1: Online Tools (Easiest)**

1. **PWA Builder Image Generator**
   - Go to: https://www.pwabuilder.com/imageGenerator
   - Upload your 512x512 master icon
   - Download all sizes

2. **Real Favicon Generator**
   - Go to: https://realfavicongenerator.net/
   - Upload your icon
   - Select "Generate icons for Web, Android, Microsoft, and iOS"
   - Download and extract

3. **Favicon.io**
   - Go to: https://favicon.io/
   - Use "PNG to ICO" converter
   - Generate multiple sizes

### **Option 2: Manual Creation**

Using Photoshop/Figma/Canva:
1. Create 512x512 canvas
2. Add BarberBook logo in center
3. Export as PNG
4. Resize to each required size
5. Save with correct filenames

### **Option 3: Command Line (ImageMagick)**

```bash
# Install ImageMagick first
# Then run:

convert icon-512x512.png -resize 72x72 icon-72x72.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 384x384 icon-384x384.png
```

## ✅ Verification

After adding icons, verify:
1. All 8 files exist in this directory
2. Files are named exactly as listed above
3. Files are PNG format
4. Icons display correctly in manifest.json
5. PWA installs successfully with icons

## 🎯 Quick Start

**Temporary Placeholder:**
Until you create custom icons, you can use a simple colored square:

1. Create a 512x512 image with gold background (#d4af37)
2. Add "BB" text in center (black, bold)
3. Resize to all required sizes
4. This will work for testing PWA functionality

**For Production:**
Replace with professional BarberBook branded icons before launch.

## 📚 Resources

- [PWA Icon Guidelines](https://web.dev/add-manifest/#icons)
- [Maskable Icons](https://web.dev/maskable-icon/)
- [Icon Generator Tools](https://www.pwabuilder.com/imageGenerator)
