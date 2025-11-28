# DigiPass Website

## Cloning Repository
```
mkdir Digipass

cd DigiPass

git clone https://github.com/Shogun585/DigiPass.git
```

## How to start frontend
```
cd frontend

npm install

npm start
```

## How to start backend

```
cd backend

cd app

pip install fastapi uvicorn sqlalchemy pymysql cryptography python-jose passlib python-multipart pwdlib opencv-python-headless numpy pyzbar pillow pyzxing

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
