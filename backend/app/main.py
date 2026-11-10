from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.routes.users import router as users_router
from app.routes.auth import router as auth_router
from app.routes.boards import router as boards_router
from app.routes.members import router as members_router
from app.routes.contents import router as contents_router
from app.routes.columns import router as columns_router
from app.routes.cards import router as cards_router
from app.routes.labels import router as labels_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(users_router, prefix='/api')
app.include_router(auth_router, prefix='/api/auth')
app.include_router(boards_router, prefix='/api')
app.include_router(members_router, prefix='/api')
app.include_router(contents_router, prefix='/api')
app.include_router(columns_router, prefix='/api')
app.include_router(cards_router, prefix='/api')
app.include_router(labels_router, prefix='/api')

@app.get('/api/health')
def health():
    return {'status':'ok'}