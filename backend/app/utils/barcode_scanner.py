# requirements:
# pip install opencv-python-headless numpy pyzbar pillow pyzxing


import cv2
import numpy as np
from pyzxing import BarCodeReader
from PIL import Image
import tempfile
import os
import pytesseract

try:
    import pytesseract
    # Try common installation paths
    tesseract_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        r'C:\Users\abhi1\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'
    ]
    
    for path in tesseract_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            print(f"[DEBUG] Tesseract found at: {path}")
            break
except ImportError:
    print("[DEBUG] pytesseract not installed")

def extract_college_id_ocr(img_cv):
    """Extract College ID using OCR from ID card"""
    try:
        import pytesseract
        
        print(f"[DEBUG OCR] Input image shape: {img_cv.shape}")
        
        height, width = img_cv.shape[:2]
        
        # Scale up image for better OCR
        scale_factor = 2
        enlarged = cv2.resize(img_cv, None, fx=scale_factor, fy=scale_factor, 
                             interpolation=cv2.INTER_CUBIC)
        
        print(f"[DEBUG OCR] Enlarged to: {enlarged.shape}")
        
        # Convert to grayscale
        gray = cv2.cvtColor(enlarged, cv2.COLOR_BGR2GRAY)
        
        # Multiple preprocessing techniques
        preprocessed_images = []
        
        # 1. Original grayscale
        preprocessed_images.append(("gray", gray))
        
        # 2. Binary threshold
        _, thresh_binary = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
        preprocessed_images.append(("binary", thresh_binary))
        
        # 3. OTSU threshold
        _, thresh_otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        preprocessed_images.append(("otsu", thresh_otsu))
        
        # 4. Adaptive threshold
        thresh_adaptive = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                               cv2.THRESH_BINARY, 11, 2)
        preprocessed_images.append(("adaptive", thresh_adaptive))
        
        # 5. Inverted (for dark text on light background)
        _, thresh_inv = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
        preprocessed_images.append(("inverted", thresh_inv))
        
        import re
        patterns = [
            r'A\d{4}CS\d{4}',
            r'A\s*\d{4}\s*CS\s*\d{4}',
        ]
        
        # Try each preprocessing method
        for method_name, processed_img in preprocessed_images:
            # Try different PSM modes
            for psm in [3, 6, 11, 12]:
                try:
                    config = f'--psm {psm}'
                    text = pytesseract.image_to_string(processed_img, config=config)
                    
                    if text.strip():
                        print(f"[DEBUG OCR] Method: {method_name}, PSM: {psm}")
                        print(f"[DEBUG OCR] Text found: {text[:150]}")
                    
                    # Clean and search
                    cleaned = text.replace(' ', '').replace('\n', ' ').upper()
                    
                    for pattern in patterns:
                        match = re.search(pattern, cleaned)
                        if match:
                            college_id = match.group(0).replace(' ', '')
                            print(f"[DEBUG OCR] ✓✓✓ FOUND: {college_id} (method: {method_name}, psm: {psm})")
                            return college_id
                
                except Exception as e:
                    pass
        
        print(f"[DEBUG OCR] No College ID pattern found in any variant")
        return None
        
    except ImportError:
        print("[DEBUG OCR] pytesseract not installed")
        return None
    except Exception as e:
        print(f"[DEBUG OCR] Error: {e}")
        import traceback
        traceback.print_exc()
        return None




def is_blurry(img, thresh=100.0):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    fm = cv2.Laplacian(gray, cv2.CV_64F).var()
    return fm < thresh, fm

def find_card_contour(img):
    # returns 4-point contour in order or None
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5,5), 0)
    edged = cv2.Canny(blur, 50, 150)
    contours, _ = cv2.findContours(edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
    
    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4:
            return approx.reshape(4, 2)
    return None

def order_points(pts):
    # returns consistent order: tl, tr, br, bl
    rect = np.zeros((4,2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

def four_point_transform(image, pts, width=800):
    rect = order_points(pts)
    (tl, tr, br, bl) = rect
    
    # compute new width/height
    maxW = max(int(np.linalg.norm(br-tr)), int(np.linalg.norm(bl-tl)), width)
    maxH = max(int(np.linalg.norm(tr-tl)), int(np.linalg.norm(br-bl)), int(maxW*0.6))
    dst = np.array([[0,0],[maxW-1,0],[maxW-1,maxH-1],[0,maxH-1]], dtype="float32")
    M = cv2.getPerspectiveTransform(rect, dst)
    warp = cv2.warpPerspective(image, M, (maxW, maxH))
    return warp

def enhance_for_barcode(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    gray = clahe.apply(gray)
    # denoise
    gray = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
    return gray

def decode_barcodes(pil_or_cv_img):
    # accepts PIL Image or OpenCV image (BGR or grayscale)
    if isinstance(pil_or_cv_img, Image.Image):
        img = pil_or_cv_img.convert("RGB")
    else:
        # Handle both color and grayscale
        if len(pil_or_cv_img.shape) == 2:
            img = Image.fromarray(pil_or_cv_img)
        else:
            img = Image.fromarray(cv2.cvtColor(pil_or_cv_img, cv2.COLOR_BGR2RGB))
    
    # Save to a temporary file
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        temp_path = tmp.name
        img.save(temp_path, "JPEG")
    
    out = []
    
    try:
        reader = BarCodeReader()
        
        # Method 1: Try file decode
        results = reader.decode(temp_path)
        
        if results:
            print(f"[DEBUG] File decode returned {len(results)} result(s)")
            for idx, r in enumerate(results):
                print(f"[DEBUG] Result {idx}: {r}")
                
                if not isinstance(r, dict):
                    continue
                
                # Skip if only has filename
                if list(r.keys()) == ['filename']:
                    continue
                
                # Extract barcode data
                barcode_data = ''
                for field in ['parsed', 'raw', 'text', 'data', 'content']:
                    if field in r and r[field]:
                        val = r[field]
                        if isinstance(val, bytes):
                            barcode_data = val.decode('utf-8', errors='ignore')
                        else:
                            barcode_data = str(val)
                        break
                
                if barcode_data:
                    out.append({
                        "data": barcode_data.strip(),
                        "type": r.get('format', 'CODE_128'),
                        "bounds": r.get('bounds', None)
                    })
        
        # Method 2: If file decode fails, try array decode
        if not out:
            print(f"[DEBUG] File decode found nothing, trying array decode...")
            img_array = np.array(img)
            results = reader.decode_array(img_array)
            
            if results:
                print(f"[DEBUG] Array decode returned {len(results)} result(s)")
                for idx, r in enumerate(results):
                    print(f"[DEBUG] Array result {idx}: {r}")
                    
                    if not isinstance(r, dict) or list(r.keys()) == ['filename']:
                        continue
                    
                    barcode_data = ''
                    for field in ['parsed', 'raw', 'text', 'data', 'content']:
                        if field in r and r[field]:
                            val = r[field]
                            if isinstance(val, bytes):
                                barcode_data = val.decode('utf-8', errors='ignore')
                            else:
                                barcode_data = str(val)
                            break
                    
                    if barcode_data:
                        out.append({
                            "data": barcode_data.strip(),
                            "type": r.get('format', 'CODE_128'),
                            "bounds": r.get('bounds', None)
                        })
    
    except Exception as e:
        print(f"[DEBUG] Decode error: {e}")
    
    finally:
        os.remove(temp_path)
    
    return out





def try_decode_with_rotations(img_cv):
    # Try original and rotated versions
    for angle in [0, 90, 180, 270]:
        if angle != 0:
            M = cv2.getRotationMatrix2D((img_cv.shape[1]/2, img_cv.shape[0]/2), angle, 1.0)
            rotated = cv2.warpAffine(img_cv, M, (img_cv.shape[1], img_cv.shape[0]))
        else:
            rotated = img_cv
        
        gray = enhance_for_barcode(rotated)
        res = decode_barcodes(gray)
        if res:
            return res, rotated
    return [], None

def extract_barcode_from_image(path_to_image):
    """
    Main function to extract barcode from ID card image
    Returns: dict with 'ok' status and 'decoded' data or 'reason' for failure
    """
    print(f"[DEBUG] Starting barcode extraction from: {path_to_image}")
    
    img = cv2.imread(path_to_image)
    if img is None:
        return {"ok": False, "decoded": [], "reason": "cannot read image"}
    
    print(f"[DEBUG] Image loaded: {img.shape}")
    
    # ✅ TRY OCR ON ORIGINAL IMAGE FIRST (before any transformation)
    print("[DEBUG] Trying OCR on original image first...")
    college_id = extract_college_id_ocr(img)
    
    if college_id:
        print(f"[DEBUG] OCR Success on original! Extracted: {college_id}")
        return {
            "ok": True, 
            "decoded": [{"data": college_id, "type": "OCR"}], 
            "reason": "success via OCR"
        }
    
    blurry, score = is_blurry(img)
    print(f"[DEBUG] Blur check: blurry={blurry}, score={score:.2f}")
    
    # Don't reject slightly blurry images
    if blurry and score < 50:
        return {"ok": False, "decoded": [], "reason": f"image too blurry (score: {score:.1f})"}
    
    card_pts = find_card_contour(img)
    if card_pts is not None:
        print("[DEBUG] Card contour found, applying perspective transform")
        warped = four_point_transform(img, card_pts)
    else:
        print("[DEBUG] No card contour found, using whole image")
        warped = img.copy()
    
    print(f"[DEBUG] Warped image shape: {warped.shape}")
    
    print("[DEBUG] Trying barcode decode with rotations...")
    decoded, used_img = try_decode_with_rotations(warped)
    
    if decoded and any(d.get('data') for d in decoded):
        print(f"[DEBUG] Barcode success! Found {len(decoded)} barcode(s)")
        return {"ok": True, "decoded": decoded, "reason": "success"}
    
    print("[DEBUG] Barcode not found, trying final enhancement")
    enhanced = enhance_for_barcode(warped)
    final = decode_barcodes(enhanced)
    
    if final and any(d.get('data') for d in final):
        print(f"[DEBUG] Success with enhancement! Found {len(final)} barcode(s)")
        return {"ok": True, "decoded": final, "reason": "success"}
    
    # Try OCR on warped image as final fallback
    print("[DEBUG] Trying OCR on warped image...")
    college_id = extract_college_id_ocr(warped)
    
    if college_id:
        print(f"[DEBUG] OCR Success on warped! Extracted: {college_id}")
        return {
            "ok": True, 
            "decoded": [{"data": college_id, "type": "OCR"}], 
            "reason": "success via OCR"
        }
    
    print("[DEBUG] All methods failed")
    return {"ok": False, "decoded": [], "reason": "no barcode or text detected"}


