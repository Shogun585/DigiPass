# requirements:
# pip install opencv-python-headless numpy pyzbar pillow pyzxing

import cv2
import numpy as np
from pyzxing import BarCodeReader
from PIL import Image
import tempfile
import os

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
        img = Image.fromarray(cv2.cvtColor(pil_or_cv_img, cv2.COLOR_BGR2RGB))
    
    # Save to a temporary file
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        temp_path = tmp.name
        img.save(temp_path, "JPEG")
    
    reader = BarCodeReader()
    results = reader.decode(temp_path)
    os.remove(temp_path)  # clean up
    
    out = []
    if results:
        for r in results:
            out.append({
                "data": r.get('parsed', ''),
                "type": r.get('format', ''),
                "bounds": r.get('bounds', None)
            })
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
    img = cv2.imread(path_to_image)
    if img is None:
        return {"ok": False, "reason": "cannot read image"}
    
    blurry, score = is_blurry(img)
    if blurry:
        return {"ok": False, "reason": "image too blurry", "blur_score": score}
    
    card_pts = find_card_contour(img)
    if card_pts is not None:
        warped = four_point_transform(img, card_pts)
    else:
        # fallback: use whole image
        warped = img.copy()
    
    decoded, used_img = try_decode_with_rotations(warped)
    if decoded:
        return {"ok": True, "decoded": decoded}
    else:
        # final fallback: run decode on original high-contrast image
        enhanced = enhance_for_barcode(warped)
        final = decode_barcodes(enhanced)
        return {"ok": bool(final), "decoded": final}