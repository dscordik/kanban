from fastapi import FastAPI
from app.routes.users import router as users_router
from app.routes.auth import router as auth_router
from app.routes.boards import router as boards_router
from app.routes.members import router as members_router

app = FastAPI()

app.include_router(users_router, prefix='/api')
app.include_router(auth_router, prefix='/api')
app.include_router(boards_router, prefix='/api')
app.include_router(members_router, prefix='/api')

@app.get('/api/health')
def health():
    return {'status':'ok'}