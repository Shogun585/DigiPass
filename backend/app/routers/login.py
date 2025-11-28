from fastapi import Depends, status, HTTPException, APIRouter
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from ..utils import database, hash, models,token_1,schemas

router =APIRouter(prefix="/login", tags=["Login"])

@router.post("/")
def login(request: OAuth2PasswordRequestForm= Depends(), db: Session= Depends(database.get_db)):
    user= db.query(models.Users).filter(models.Users.id==request.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Couldn't find the user")
    if not hash.Hashing.verify(request.password, user.password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incorrect credentials")
    access_token= token_1.create_access_token(data={"sub":user.id})
    # return schemas.Token(access_token=access_token, token_type="bearer")
    return schemas.LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=schemas.User(
            id=user.id,
            first_name=user.first_name,
            last_name=user.last_name,
            role=user.role,
            contact_details=user.contact_details
        )
    )

