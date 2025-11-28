from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .utils.database import engine
from .utils import models
from .routers import login,user,passes,verification


app= FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://localhost:5173",  # Vite development server
        # Add your production frontend URL here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(login.router)
app.include_router(user.router)
app.include_router(passes.router)
app.include_router(verification.router)

@app.get("/")
def root():
    return {"message": "IMSEC Hostel Pass Manager API", "status": "running"}