"""
Quick test script for AIMS Product Detection
Usage: python test_detection.py <image_path>
"""

import sys
import os
from product_detector import ProductDetector
import json

def main():
    if len(sys.argv) < 2:
        print("❌ Usage: python test_detection.py <image_path>")
        print("\nExample:")
        print("  python test_detection.py test_shelf.jpg")
        print("  python test_detection.py D:/images/products.png")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(f"❌ Error: Image file not found: {image_path}")
        sys.exit(1)
    
    print("🚀 AIMS Product Detection Test")
    print("=" * 50)
    print(f"📁 Image: {image_path}")
    print()
    
    # Initialize detector
    print("🔧 Initializing detector...")
    detector = ProductDetector(confidence_threshold=0.25)
    print()
    
    # Run detection
    print("🔍 Running detection...")
    detections = detector.detect_products(image_path)
    print()
    
    # Display results
    print("✅ DETECTION RESULTS")
    print("=" * 50)
    print(f"Total products detected: {len(detections)}")
    print()
    
    if len(detections) == 0:
        print("⚠️  No products detected in image")
        print("\nTips:")
        print("  - Ensure image has clear product visibility")
        print("  - Try lowering confidence threshold")
        print("  - Use better lighting in photos")
        return
    
    for i, det in enumerate(detections, 1):
        print(f"\n📦 Product {i}:")
        print(f"  Class: {det['class']}")
        print(f"  Confidence: {det['confidence']:.2%}")
        print(f"  Bounding Box: {det['bbox']}")
        print(f"  Detected Text: \"{det['detected_text'][:100]}\"")
        
        if det['ocr_details']:
            print(f"  OCR Texts Found:")
            for ocr in det['ocr_details'][:3]:  # Show first 3
                print(f"    - \"{ocr['text']}\" (conf: {ocr['confidence']:.2f})")
    
    # Save annotated image
    output_path = os.path.splitext(image_path)[0] + "_annotated.jpg"
    print(f"\n🎨 Saving annotated image...")
    detector.visualize_detections(image_path, detections, output_path)
    print(f"✅ Saved: {output_path}")
    
    # Save JSON results
    json_path = os.path.splitext(image_path)[0] + "_results.json"
    with open(json_path, 'w') as f:
        json.dump({
            'image': image_path,
            'total_detections': len(detections),
            'detections': detections
        }, f, indent=2)
    print(f"✅ Saved JSON: {json_path}")
    
    print("\n" + "=" * 50)
    print("✨ Detection complete!")
    print("\nNext steps:")
    print("  1. Review annotated image")
    print("  2. Start Flask API: python detection_api.py")
    print("  3. Upload images via dashboard")

if __name__ == "__main__":
    main()
