from fastapi import APIRouter, Depends, status, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from ..utils import database, models, oauth2, schemas
from datetime import date
import tempfile
import os

# Import barcode scanning function (create utils/barcode_scanner.py)
from ..utils.barcode_scanner import extract_barcode_from_image

router = APIRouter(prefix="/verify", tags=["Verification"])

@router.post("/scan", response_model=schemas.VerificationResponse)
async def verify_pass_by_barcode_scan(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.Users = Depends(oauth2.get_current_guard)
):
    """
    Scan barcode from ID card image and verify if user has valid approved pass
    """
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name
    
    try:
        # Extract barcode from image
        result = extract_barcode_from_image(tmp_path)
        
        if not result.get("ok"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to scan barcode: {result.get('reason', 'unknown error')}"
            )
        
        decoded = result.get("decoded", [])
        if not decoded:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No barcode found in image"
            )
        
        # Get the college ID from barcode
        college_id = decoded[0].get("data", "").strip()
        
        if not college_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Barcode data is empty"
            )
        
        # Verify the pass
        return verify_pass_logic(college_id, db)
        
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.get("/manual/{college_id}", response_model=schemas.VerificationResponse)
def verify_pass_by_manual_entry(
    college_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.Users = Depends(oauth2.get_current_guard)
):
    """
    Manually verify pass by entering college ID
    """
    return verify_pass_logic(college_id, db)

def verify_pass_logic(college_id: str, db: Session) -> schemas.VerificationResponse:
    """
    Common verification logic:
    1. Check if user exists
    2. Check if user has an approved pass
    3. Check if current date is within pass validity period
    """
    # Check if user exists
    user = db.query(models.Users).filter(models.Users.id == college_id).first()
    
    if not user:
        return schemas.VerificationResponse(
            valid=False,
            message=f"User with ID {college_id} not found in system",
            pass_details=None,
            user_details=None
        )
    
    # Get current date
    today = date.today()
    
    # Find valid approved pass for today
    valid_pass = db.query(models.LeavePass).filter(
        models.LeavePass.college_id == college_id,
        models.LeavePass.pass_status == "approved",
        models.LeavePass.leave_start <= today,
        models.LeavePass.leave_end >= today
    ).first()
    
    if not valid_pass:
        return schemas.VerificationResponse(
            valid=False,
            message=f"No valid approved pass found for {user.first_name} {user.last_name}",
            pass_details=None,
            user_details=schemas.User(
                id=user.id,
                first_name=user.first_name,
                last_name=user.last_name,
                role=user.role,
                contact_details=user.contact_details
            )
        )
    
    # Valid pass found
    return schemas.VerificationResponse(
        valid=True,
        message=f"Valid {valid_pass.pass_type} pass found for {user.first_name} {user.last_name}",
        pass_details=schemas.PassDisplay(
            pass_id=valid_pass.pass_id,
            college_id=valid_pass.college_id,
            pass_type=valid_pass.pass_type,
            leave_start=valid_pass.leave_start,
            leave_end=valid_pass.leave_end,
            pass_status=valid_pass.pass_status,
            request_time=valid_pass.request_time,
            updated_at=valid_pass.updated_at
        ),
        user_details=schemas.User(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            contact_details=user.contact_details
        )
    )