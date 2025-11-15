"""
AIMS Product Classification Service
Uses trained YOLOv8 classification model for grocery product recognition
"""

from ultralytics import YOLO
from PIL import Image
from typing import List, Dict
import os

class ProductClassifier:
    def __init__(self, model_path='weights/grocery_classifier_best.pt', top_k=5):
        """
        Initialize the product classifier
        
        Args:
            model_path: Path to trained classification model
            top_k: Number of top predictions to return
        """
        print(f"🔧 Loading trained grocery classifier: {model_path}...")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found: {model_path}")
        
        self.model = YOLO(model_path)
        self.top_k = top_k
        print("✅ Classifier loaded successfully")
        
        # Get class names from model
        self.class_names = self.model.names
        print(f"✅ Model trained on {len(self.class_names)} product classes")
    
    def classify_product(self, image_path: str) -> Dict:
        """
        Classify a single product image
        
        Args:
            image_path: Path to product image
            
        Returns:
            Dict with top predictions and confidence scores
        """
        # Run prediction
        results = self.model(image_path, verbose=False)
        
        # Get top-k predictions
        probs = results[0].probs
        
        # Get top predictions
        top_indices = probs.top5[:self.top_k]  # Top K indices
        top_confidences = probs.top5conf[:self.top_k].tolist()  # Confidence scores
        
        predictions = []
        for idx, conf in zip(top_indices, top_confidences):
            predictions.append({
                'class_id': int(idx),
                'class_name': self.class_names[int(idx)],
                'confidence': float(conf),
                'confidence_pct': f"{float(conf)*100:.2f}%"
            })
        
        # Best prediction
        best_pred = predictions[0]
        
        return {
            'image_path': image_path,
            'predicted_class': best_pred['class_name'],
            'confidence': best_pred['confidence'],
            'top_predictions': predictions,
            'all_classes': self.class_names
        }
    
    def match_to_inventory(self, prediction: Dict, inventory_items: List[Dict]) -> Dict:
        """
        Match classified product to inventory database
        
        Args:
            prediction: Classification result
            inventory_items: List of inventory items with SKU, name, etc.
            
        Returns:
            Dict with matched inventory item or None
        """
        predicted_name = prediction['predicted_class'].lower().replace('-', ' ')
        
        matched_items = []
        
        for item in inventory_items:
            item_name = item.get('name', '').lower()
            
            # Direct name match
            if predicted_name in item_name or item_name in predicted_name:
                matched_items.append({
                    **item,
                    'match_type': 'name_exact',
                    'match_score': 100,
                    'predicted_class': prediction['predicted_class'],
                    'confidence': prediction['confidence']
                })
                continue
            
            # Partial word match
            pred_words = set(predicted_name.split())
            item_words = set(item_name.split())
            
            common_words = pred_words & item_words
            if common_words:
                match_score = (len(common_words) / max(len(pred_words), len(item_words))) * 100
                if match_score > 30:  # Threshold
                    matched_items.append({
                        **item,
                        'match_type': 'name_partial',
                        'match_score': match_score,
                        'predicted_class': prediction['predicted_class'],
                        'confidence': prediction['confidence']
                    })
        
        # Sort by match score
        matched_items.sort(key=lambda x: x['match_score'], reverse=True)
        
        return {
            'prediction': prediction,
            'matched_items': matched_items,
            'best_match': matched_items[0] if matched_items else None,
            'total_matches': len(matched_items)
        }
    
    def batch_classify(self, image_paths: List[str]) -> List[Dict]:
        """
        Classify multiple images
        
        Args:
            image_paths: List of image paths
            
        Returns:
            List of classification results
        """
        results = []
        for img_path in image_paths:
            try:
                result = self.classify_product(img_path)
                results.append(result)
            except Exception as e:
                results.append({
                    'image_path': img_path,
                    'error': str(e)
                })
        
        return results

# For testing
if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python product_classifier.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Initialize classifier
    classifier = ProductClassifier()
    
    # Classify
    result = classifier.classify_product(image_path)
    
    print("\n" + "="*60)
    print("🎯 CLASSIFICATION RESULT")
    print("="*60)
    print(f"\n📸 Image: {result['image_path']}")
    print(f"\n🏆 Predicted Product: {result['predicted_class']}")
    print(f"   Confidence: {result['confidence']*100:.2f}%")
    
    print(f"\n📊 Top {len(result['top_predictions'])} Predictions:")
    for i, pred in enumerate(result['top_predictions'], 1):
        print(f"   {i}. {pred['class_name']:<30} - {pred['confidence_pct']}")
    
    print("\n" + "="*60)
