from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, field_validator, EmailStr, model_validator

BoardRole = Literal['owner', 'editor', 'viewer']


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str | None = None

    @field_validator('email', mode='before')
    @classmethod
    def email_lower(cls, value: str) -> str:
        return value.strip().lower()


class UserOut(BaseModel):
    id: int
    email: str
    first_name: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator('email', mode='before')
    @classmethod
    def email_lower(cls, value: str) -> str:
        return value.strip().lower()


class Token(BaseModel):
    access_token: str
    token_type: str

class BoardCreate(BaseModel):
    title: str
    description: str | None = None

    @field_validator('title', mode='before')
    @classmethod
    def trim_title(cls, value: str) -> str:
        return value.strip()

    @field_validator('title', mode='after')
    @classmethod
    def validate_title_length(cls, value: str) -> str:
        if not value or len(value) > 100:
            raise ValueError('Название должно быть от 1 до 100 символов')
        return value

    @field_validator('description', mode='after')
    @classmethod
    def validate_description_length(cls, value: str | None) -> str | None:
        if value is not None and len(value) > 500:
            raise ValueError('Описание не более 500 символов')
        return value


class BoardUpdate(BaseModel):
    title: str | None = None
    description: str | None = None

    @field_validator('title', mode='before')
    @classmethod
    def trim_title(cls, value: str | None) -> str | None:
        if value is not None:
            return value.strip()
        return value

    @field_validator('title', mode='after')
    @classmethod
    def validate_title_length(cls, value: str | None) -> str | None:
        if value is not None and (not value or len(value) > 100):
            raise ValueError('Название должно быть от 1 до 100 символов')
        return value

    @field_validator('description', mode='after')
    @classmethod
    def validate_description_length(cls, value: str | None) -> str | None:
        if value is not None and len(value) > 500:
            raise ValueError('Описание не более 500 символов')
        return value

    @model_validator(mode='after')
    def check_not_empty(self) -> 'BoardUpdate':
        if self.title is None and self.description is None:
            raise ValueError('Должно быть указано хотя бы одно поле')
        return self


class BoardListItem(BaseModel):
    id: int
    title: str
    description: str | None
    my_role: BoardRole
    members_count: int
    created_at: datetime

class BoardOut(BaseModel):
    id: int
    title: str
    description: str | None
    my_role: BoardRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MemberOut(BaseModel):
    user_id: int
    email: str
    first_name: str | None = None
    role: BoardRole

    model_config = ConfigDict(from_attributes=True)

class MemberAdd(BaseModel):
    email: EmailStr
    role: BoardRole = 'viewer'

    @field_validator('email', mode='before')
    @classmethod
    def email_lower(cls, value: str) -> str:
        return value.strip().lower()

class MemberRoleUpdate(BaseModel):
    role: BoardRole