from datetime import datetime,timedelta,timezone
import jwt
from .import schemas
from jwt.exceptions import InvalidTokenError

SECRET_KEY= "NAH_GET_LOST"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_TIME= 20

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_TIME)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(access_token: str,credentials_exception):
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        userid = payload.get("sub")
        if userid is None:
            raise credentials_exception
        token_data = schemas.TokenData(id=userid)
    except InvalidTokenError:
        raise credentials_exception
    
    return token_data

