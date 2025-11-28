from fastapi import status, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from . import database
from . import models
from .token_1 import verify_token

oauth2_scheme= OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(access_token:str =Depends(oauth2_scheme), db: Session= Depends(database.get_db)):
    credentials_exception= HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail= "Recheck your credentials",headers={"WWW-Authenticate": "Bearer"})
    token_data = verify_token(access_token, credentials_exception)
    user = db.query(models.Users).filter(models.Users.id == token_data.id).first()
    if user is None:
        raise credentials_exception
    return  user

def get_current_warden(current_user: models.Users= Depends(get_current_user)):
    if current_user.role.lower() != "warden":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You need warden privileges")
    return current_user

def get_current_guard(current_user: models.Users= Depends(get_current_user)):
    if current_user.role.lower() != "guard":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You need Guard privileges")
    return current_user

def get_current_staff(current_user: models.Users = Depends(get_current_user)):
    if current_user.role.lower() != "warden" and current_user.role.lower() !="other":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail= "You are not authorized ")
    return current_user