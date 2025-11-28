from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

class Hashing():
    def encrypt(password:str):
        return password_hash.hash(password)
    
    def verify(plain_password, hashed_password):
        return password_hash.verify(plain_password, hashed_password)