"""
Flask API for AIMS Product Detection
Provides endpoints for image upload and product detection
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from datetime import datetime
from product_detector import ProductDetector
from product_classifier import ProductClassifier
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Choose mode: 'classification' (your trained model) or 'detection' (YOLOv8+OCR)
MODE = 'classification'  # Using your trained 81-class grocery classifier!

# Global instances (lazy loading)
detector = None
classifier = None

def get_detector():
    """Lazy load the detector (for detection mode)"""
    global detector
    if detector is None:
        print("🔧 Initializing Product Detector (YOLOv8 + OCR)...")
        detector = ProductDetector(confidence_threshold=0.25)
    return detector

def get_classifier():
    """Lazy load the classifier (for classification mode)"""
    global classifier
    if classifier is None:
        print("🔧 Loading Trained Grocery Classifier...")
        classifier = ProductClassifier(model_path='weights/grocery_classifier_best.pt', top_k=5)
    return classifier

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AIMS Product Detection API',
        'version': '1.0.0',
        'mode': MODE,
        'model_loaded': True,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/detect', methods=['POST'])
def detect_products():
    """
    Detect/Classify products in uploaded image
    
    Mode 'classification': Single product per image (your trained model)
    Mode 'detection': Multiple products with OCR (YOLOv8 + EasyOCR)
    
    Request:
        - file: Image file (multipart/form-data)
        - inventory: JSON string of inventory items (optional)
        
    Response:
        - detections/prediction: Detection or classification results
        - matched: List of products matched to inventory
        - mode: Which mode was used
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': f'Invalid file type. Allowed: {ALLOWED_EXTENSIONS}'}), 400
        
        # Generate unique filename
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save uploaded file
        file.save(file_path)
        print(f"📁 Saved image: {file_path}")
        
        # Get inventory data if provided
        inventory_data = []
        if 'inventory' in request.form:
            try:
                inventory_data = json.loads(request.form['inventory'])
            except json.JSONDecodeError:
                print("⚠️  Invalid inventory JSON, skipping matching")
        
        # Use classification or detection mode
        if MODE == 'classification':
            # Use your trained classifier
            clf = get_classifier()
            
            print("🎯 Classifying product...")
            prediction = clf.classify_product(file_path)
            print(f"✅ Predicted: {prediction['predicted_class']} ({prediction['confidence']*100:.1f}%)")
            
            # Match to inventory
            matched_result = clf.match_to_inventory(prediction, inventory_data) if inventory_data else None
            
            return jsonify({
                'success': True,
                'mode': 'classification',
                'prediction': prediction,
                'matched': matched_result,
                'image_path': unique_filename,
                'timestamp': datetime.now().isoformat()
            }), 200
        
        else:
            # Use detection mode (YOLOv8 + OCR)
            det = get_detector()
            
            print("🔍 Detecting products...")
            detections = det.detect_products(file_path)
            print(f"✅ Found {len(detections)} products")
            
            # Match to inventory
            matched_products = []
            if inventory_data:
                print(f"🔗 Matching against {len(inventory_data)} inventory items...")
                matched_products = det.match_to_inventory(detections, inventory_data)
            else:
                matched_products = detections
        
            # Generate annotated image
            annotated_filename = f"annotated_{unique_filename}"
            annotated_path = os.path.join(UPLOAD_FOLDER, annotated_filename)
            det.visualize_detections(file_path, matched_products, annotated_path)
            print(f"🎨 Saved annotated image: {annotated_path}")
        
            # Prepare response
            response = {
                'success': True,
                'total_detections': len(detections),
                'matched_count': sum(1 for p in matched_products if p.get('is_matched', False)),
                'detections': detections,
                'matched_products': matched_products,
                'original_image': f'/uploads/{unique_filename}',
                'annotated_image': f'/uploads/{annotated_filename}',
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify(response), 200
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/detect-batch', methods=['POST'])
def detect_products_batch():
    """
    Detect products in multiple images
    
    Request:
        - files: Multiple image files
        - inventory: JSON string of inventory items (optional)
        
    Response:
        - results: List of detection results for each image
    """
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('files')
        
        if len(files) == 0:
            return jsonify({'error': 'No files selected'}), 400
        
        # Get inventory data
        inventory_data = []
        if 'inventory' in request.form:
            try:
                inventory_data = json.loads(request.form['inventory'])
            except json.JSONDecodeError:
                pass
        
        # Get detector
        det = get_detector()
        
        results = []
        
        for file in files:
            if not allowed_file(file.filename):
                results.append({
                    'filename': file.filename,
                    'success': False,
                    'error': 'Invalid file type'
                })
                continue
            
            # Save file
            file_ext = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4()}.{file_ext}"
            file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
            file.save(file_path)
            
            # Detect
            try:
                detections = det.detect_products(file_path)
                
                if inventory_data:
                    matched = det.match_to_inventory(detections, inventory_data)
                else:
                    matched = detections
                
                results.append({
                    'filename': file.filename,
                    'success': True,
                    'total_detections': len(detections),
                    'matched_count': sum(1 for p in matched if p.get('is_matched', False)),
                    'detections': matched
                })
            except Exception as e:
                results.append({
                    'filename': file.filename,
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'processed': len(results),
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/uploads/<filename>', methods=['GET'])
def serve_upload(filename):
    """Serve uploaded/annotated images"""
    from flask import send_from_directory
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/train-info', methods=['GET'])
def train_info():
    """
    Get information about training data and model status
    """
    training_data_dir = 'training-data/images'
    num_training_images = 0
    
    if os.path.exists(training_data_dir):
        num_training_images = len([f for f in os.listdir(training_data_dir) 
                                   if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    
    return jsonify({
        'training_images_count': num_training_images,
        'training_data_path': os.path.abspath(training_data_dir),
        'model_type': 'YOLOv8n (pre-trained)',
        'can_train_custom': num_training_images >= 100,
        'message': 'Add images to training-data/images folder to train custom model'
    })

if __name__ == '__main__':
    print("🚀 Starting AIMS Product Detection API...")
    print(f"📁 Upload folder: {os.path.abspath(UPLOAD_FOLDER)}")
    print(f"🔧 Allowed file types: {ALLOWED_EXTENSIONS}")
    print(f"📊 Max file size: {MAX_FILE_SIZE / (1024*1024)}MB")
    print("\n✅ API ready at http://localhost:5001")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
