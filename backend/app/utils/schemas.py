from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
import enum

# Now i will define some enums for strict validation, these enums
# will make sure that the data only belong to these predifned categories
class Roles(str, enum.Enum):
    student= "student"
    guard= "guard"
    warden= "warden"
    other= "other"

class PassType(str, enum.Enum):
    market= "market"
    leave= "leave"
    other= "other"    

class PassStatus(str, enum.Enum):
    pending= "pending"
    approved= "approved"
    rejected= "rejected"


# Base Schema for Creating a User
class UserCreate(BaseModel):
    id: str =Field(description="College ID")
    password: str
    first_name : str
    last_name : str
    role: Roles
    contact_details: Optional[str]= None

# Base Schmea fro returing the user
class User(BaseModel):
    id: str
    first_name : str
    last_name : str
    role: Roles
    contact_details: Optional[str] = None

    class Config:
        # orm_mode = True
        from_attributes = True

# Base Schema for Creating a Pass
class PassCreate(BaseModel):
    pass_type: PassType
    leave_start: date
    leave_end: date

# Base Schema for Warden to approve/ Reject the pass
class PassEvaluation(BaseModel):
    pass_status: PassStatus
    
class PassUpdate(BaseModel):
    status: PassStatus

# Base Schema for returing the pass status to the Student and Guard
class PassDisplay(BaseModel):
    # pass_id: int
    # college_id: str 
    # pass_type: PassType 
    # leave_start: date
    # leave_end: date
    # pass_status: PassStatus
    # request_time: datetime
    # updated_at: datetime

    # class Config:
    #     orm_mode= True
    pass_id: int
    pass_type: PassType
    leave_start: date
    leave_end: date
    pass_status: PassStatus
    college_id: str

    class Config:
        from_attributes = True

# Schema for token
class Token(BaseModel):
    access_token:  str
    token_type:str

class TokenData(BaseModel):
    id: Optional[str]= None

# Login Response with User Details
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# Verification Response
class VerificationResponse(BaseModel):
    valid: bool
    message: str
    pass_details: Optional[PassDisplay] = None
    user_details: Optional[User] = None