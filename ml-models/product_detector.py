"""
AIMS Product Detection Service
Uses YOLOv8 for object detection + EasyOCR for text recognition
"""

import cv2
import easyocr
from ultralytics import YOLO
import numpy as np
from PIL import Image
import re
from typing import List, Dict, Tuple
import os

class ProductDetector:
    def __init__(self, confidence_threshold=0.3):
        """
        Initialize the product detector with YOLOv8 and EasyOCR
        
        Args:
            confidence_threshold: Minimum confidence for detections (0-1)
        """
        print("🔧 Initializing Product Detector...")
        
        # Initialize YOLOv8 with pre-trained weights
        # Using YOLOv8n (nano) for speed - you can use yolov8s/m/l/x for better accuracy
        self.yolo_model = YOLO('yolov8n.pt')
        print("✅ YOLOv8 model loaded")
        
        # Initialize EasyOCR reader (English language)
        # You can add more languages: ['en', 'ch_sim', 'hi', etc.]
        self.ocr_reader = easyocr.Reader(['en'], gpu=False)
        print("✅ EasyOCR reader initialized")
        
        self.confidence_threshold = confidence_threshold
        
    def detect_products(self, image_path: str) -> List[Dict]:
        """
        Detect products in an image and extract text from each detection
        
        Args:
            image_path: Path to the image file
            
        Returns:
            List of detected products with their info
        """
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not read image from {image_path}")
        
        # Run YOLOv8 detection
        results = self.yolo_model(image, conf=self.confidence_threshold)
        
        detected_products = []
        
        # Process each detection
        for idx, result in enumerate(results[0].boxes.data):
            x1, y1, x2, y2, confidence, class_id = result
            
            # Convert to integers
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
            
            # Crop the detected region
            cropped = image[y1:y2, x1:x2]
            
            # Extract text using OCR
            ocr_results = self.ocr_reader.readtext(cropped)
            
            # Combine all detected text
            detected_text = " ".join([text[1] for text in ocr_results])
            
            # Get class name
            class_name = self.yolo_model.names[int(class_id)]
            
            product_info = {
                'id': idx,
                'bbox': [x1, y1, x2, y2],
                'confidence': float(confidence),
                'class': class_name,
                'detected_text': detected_text,
                'ocr_details': [
                    {
                        'text': text[1],
                        'confidence': float(text[2]),
                        'bbox': text[0]
                    }
                    for text in ocr_results
                ]
            }
            
            detected_products.append(product_info)
        
        return detected_products
    
    def match_to_inventory(self, detected_products: List[Dict], inventory_items: List[Dict]) -> List[Dict]:
        """
        Match detected products to inventory database
        
        Args:
            detected_products: List of detected products from detect_products()
            inventory_items: List of inventory items from database
            
        Returns:
            List of matched products with inventory info
        """
        matched_products = []
        
        for detection in detected_products:
            detected_text = detection['detected_text'].lower()
            best_match = None
            best_score = 0
            
            # Try to match with inventory
            for item in inventory_items:
                score = 0
                
                # Check if SKU appears in text
                if item.get('sku', '').lower() in detected_text:
                    score += 50
                
                # Check if barcode appears in text
                if item.get('barcode', '').lower() in detected_text:
                    score += 50
                
                # Check if product name words appear in text
                name_words = item.get('name', '').lower().split()
                for word in name_words:
                    if len(word) > 3 and word in detected_text:
                        score += 10
                
                if score > best_score:
                    best_score = score
                    best_match = item
            
            matched_products.append({
                **detection,
                'matched_inventory': best_match,
                'match_confidence': best_score,
                'is_matched': best_score > 30  # Threshold for matching
            })
        
        return matched_products
    
    def visualize_detections(self, image_path: str, detections: List[Dict], output_path: str = None):
        """
        Draw bounding boxes and labels on the image
        
        Args:
            image_path: Path to original image
            detections: List of detected products
            output_path: Path to save annotated image (optional)
            
        Returns:
            Annotated image as numpy array
        """
        image = cv2.imread(image_path)
        
        for detection in detections:
            x1, y1, x2, y2 = detection['bbox']
            confidence = detection['confidence']
            text = detection.get('detected_text', '')[:30]  # First 30 chars
            
            # Draw rectangle
            color = (0, 255, 0) if detection.get('is_matched', False) else (0, 165, 255)
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
            
            # Draw label
            label = f"{confidence:.2f}"
            if detection.get('matched_inventory'):
                label = f"{detection['matched_inventory']['name'][:20]} ({confidence:.2f})"
            
            cv2.putText(image, label, (x1, y1 - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            # Draw detected text
            if text:
                cv2.putText(image, text, (x1, y2 + 20), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        if output_path:
            cv2.imwrite(output_path, image)
        
        return image

def extract_sku_barcode(text: str) -> Tuple[str, str]:
    """
    Extract SKU and barcode from detected text
    
    Args:
        text: Detected text string
        
    Returns:
        Tuple of (sku, barcode)
    """
    sku = None
    barcode = None
    
    # Common SKU patterns
    sku_patterns = [
        r'SKU[:\s]*([A-Z0-9-]+)',
        r'ITEM[:\s]*([A-Z0-9-]+)',
        r'#([A-Z0-9-]+)',
    ]
    
    for pattern in sku_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            sku = match.group(1)
            break
    
    # Barcode patterns (common formats)
    barcode_patterns = [
        r'\b(\d{8})\b',   # EAN-8
        r'\b(\d{12})\b',  # UPC-A
        r'\b(\d{13})\b',  # EAN-13
    ]
    
    for pattern in barcode_patterns:
        match = re.search(pattern, text)
        if match:
            barcode = match.group(1)
            break
    
    return sku, barcode


if __name__ == "__main__":
    # Test the detector
    print("🧪 Testing Product Detector...")
    
    detector = ProductDetector(confidence_threshold=0.3)
    
    # Example usage
    test_image = "test_shelf.jpg"
    if os.path.exists(test_image):
        detections = detector.detect_products(test_image)
        print(f"\n✅ Detected {len(detections)} products")
        
        for i, det in enumerate(detections):
            print(f"\nProduct {i+1}:")
            print(f"  Class: {det['class']}")
            print(f"  Confidence: {det['confidence']:.2f}")
            print(f"  Text: {det['detected_text']}")
    else:
        print(f"⚠️  Test image '{test_image}' not found")
        print("Place an image in ml-models/ folder to test")
