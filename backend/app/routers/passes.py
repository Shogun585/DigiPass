from fastapi import APIRouter,Depends, status, HTTPException
from sqlalchemy.orm import Session
from ..utils import database, models, oauth2, schemas
from typing import List
from datetime import date

router = APIRouter(prefix="/pass",tags=["Pass"])

# @router.post("/", response_model= schemas.PassDisplay)
# def create(request: schemas.PassCreate, db: Session= Depends(database.get_db), current_user: models.Users= Depends(oauth2.get_current_user)):
#     # check for market pass, the leave start and end date should be same 
#     if request.pass_type.lower() == schemas.PassType.market.lower() and request.leave_start != request.leave_end:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST, detail= "For market pass the leave start and end should be same"
#         )
#     new_pass= models.LeavePass( pass_type= request.pass_type.value,leave_start= request.leave_start, leave_end= request.leave_end, college_id= current_user.id)
#     db.add(new_pass)
#     db.commit()
#     db.refresh(new_pass)
#     return new_pass

# @router.get("/pending",response_model=List[schemas.PassDisplay])
# def ViewPending(db:Session = Depends(database.get_db), current_warden: models.Users = Depends(oauth2.get_current_warden)):
#     pass_query= db.query(models.LeavePass).filter(models.LeavePass.pass_status== "pending").all()
#     return pass_query

# @router.put("/{pass_id}", response_model= schemas.PassDisplay)
# def PassUpdate(pass_id:int, request:schemas.PassEvaluation, db:Session= Depends(database.get_db), current_warden: models.Users = Depends(oauth2.get_current_warden)):
#     pass_query= db.query(models.LeavePass).filter(models.LeavePass.pass_id== pass_id)
#     if not pass_query.first():
#         raise HTTPException (status_code=status.HTTP_404_NOT_FOUND, detail= f"No pass with pass id {pass_id}")
#     pass_query.update({"pass_status": request.pass_status.value})
#     db.commit()
#     db.refresh(pass_query.first())
#     return pass_query.first()   

# @router.get("/my_pass",response_model= List[schemas.PassDisplay])
# def ViewPass(db:Session =Depends(database.get_db),current_user: models.Users = Depends(oauth2.get_current_user)):
#     pass_query = db.query(models.LeavePass).filter(models.LeavePass.college_id == current_user.id).all()
#     if not pass_query:
#         raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail= f"no passes for the student with id {current_user.id}")
#     return pass_query

# @router.get("/{student_id}", response_model= List[schemas.PassDisplay])
# def ViewPasses(student_id: str, db: Session = Depends(database.get_db), current_user: models.Users = Depends(oauth2.get_current_staff)):
#     pass_query= db.query(models.LeavePass).filter(models.LeavePass.college_id== student_id).all()
#     if not pass_query:
#         raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail= f"no passes found for student with id {student_id}")
#     return pass_query

@router.post("/", response_model=schemas.PassDisplay)
def create(
    request: schemas.PassCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Users = Depends(oauth2.get_current_user)
):
    if not request.leave_start:
        request.leave_start = date.today()
    if not request.leave_end:
        request.leave_end = date.today()

    """Create a new pass request (Students only)"""
    # Check if user is a student
    if current_user.role.lower() != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create pass requests"
        )
    
    # Check for market pass, the leave start and end date should be same
    if request.pass_type.value.lower() == "market" and request.leave_start != request.leave_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="For market pass the leave start and end should be same"
        )
    
    new_pass = models.LeavePass(
        pass_type=request.pass_type.value,
        leave_start=request.leave_start,
        leave_end=request.leave_end,
        college_id=current_user.id,
        pass_status="pending"
    )
    
    db.add(new_pass)
    db.commit()
    db.refresh(new_pass)
    
    return new_pass

@router.get("/pending", response_model=List[schemas.PassDisplay])
def get_pending(
    db: Session = Depends(database.get_db),
    current_user: models.Users = Depends(oauth2.get_current_warden)
):
    """Get all pending passes (Warden only)"""
    passes = db.query(models.LeavePass).filter(
        models.LeavePass.pass_status == "pending"
    ).all()
    return passes

@router.get("/all", response_model=List[schemas.PassDisplay])
def get_all_passes(
    db: Session = Depends(database.get_db),
    current_user: models.Users = Depends(oauth2.get_current_warden)
):
    """Get all passes (Warden only)"""
    passes = db.query(models.LeavePass).all()
    return passes

@router.get("/my_pass", response_model=List[schemas.PassDisplay])
def get_my_passes(
    db: Session = Depends(database.get_db),
    current_user: models.Users = Depends(oauth2.get_current_user)
):
    """Get passes for current user (Students only)"""
    passes = db.query(models.LeavePass).filter(
        models.LeavePass.college_id == current_user.id
    ).all()
    return passes

@router.put("/status/{pass_id}", response_model=schemas.PassDisplay)
def update_status(
    pass_id: int,
    request: schemas.PassEvaluation,
    db: Session = Depends(database.get_db),
    current_user: models.Users = Depends(oauth2.get_current_warden)
):
    """Update pass status (Warden only)"""
    pass_obj = db.query(models.LeavePass).filter(
        models.LeavePass.pass_id == pass_id
    ).first()
    
    if not pass_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pass with id {pass_id} not found"
        )
    
    # Update status
    pass_obj.pass_status = request.pass_status.value
    db.commit()
    db.refresh(pass_obj)
    
    return pass_obj