from datetime import datetime
from pydantic import BaseModel
from sqlalchemy import Column, String, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ImageInfo(Base):
    __tablename__ = "images"
    code = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    filename = Column(String)
    size = Column(String)
    width = Column(Integer)
    height = Column(Integer)
class Code(BaseModel):
    code: str
