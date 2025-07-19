from pydantic import BaseModel

class WebhookRecipientCreate(BaseModel):
    name: str
    url: str
    type: str


class WebhookRecipientUpdate(BaseModel):
    name: str | None = None
    url: str | None = None
    type: str | None = None


class WebhookRecipientOut(BaseModel):
    id: int
    name: str
    url: str
    type: str

    class Config:
        orm_mode = True