from pathlib import Path
import os
from fastapi import Depends, FastAPI, HTTPException, UploadFile, Request, File
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from PIL import Image
from database import get_db, engine
from models import ImageInfo, Base


Base.metadata.create_all(bind=engine)

app = FastAPI()
upload_folder = Path("uploads")
upload_folder.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
templates = Jinja2Templates(directory="templates")


@app.get("/")
def homepage(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/upload")
async def create_upload_file(code: str, img: UploadFile = File(...), db: Session = Depends(get_db)):
    existing_record = db.query(ImageInfo).filter(
        ImageInfo.code == code).first()
    if existing_record:
        return {"success": False, "data": "Code is Taken"}
    valid_extensions = (".jpg", ".jpeg", ".png", ".gif", ".bmp")
    contents = await img.read()
    filename = f"uploads/{code}_{img.filename}"
    if not filename.lower().endswith(valid_extensions):
        return {"success": False, "data": "Not a valid file extensions"}
    with open(filename, "wb") as f:
        f.write(contents)
    img = Image.open(filename) # type: ignore
    filesize = str(round(os.path.getsize(filename)/1000 ,1)) + " kb"
    width, height = img.size # type: ignore
    print()
    db_img = ImageInfo(code=code, filename=filename,
                       width=width, height=height,size = filesize)
    db.add(db_img)
    db.commit()
    return {
        "success": True,
        "data": {
            "code": code,
            "filename": filename,
            "created_at": db_img.created_at,
        },
    }


@app.get("/{code}")
def view_image(request: Request, code: str, db: Session = Depends(get_db)):
    image_info = db.query(ImageInfo).filter(ImageInfo.code == code).first()
    if image_info is None:
        raise HTTPException(status_code=404, detail="Image not found")
    image_url = f"{request.url.scheme}://{request.headers['host']}/{image_info.filename}"
    return templates.TemplateResponse("view_image.html", {"request": request, "image_info": image_info, 'image_url': image_url})


@app.get("/image/{code}")
async def read_image(code: str, db: Session = Depends(get_db)):
    image_info = db.query(ImageInfo).filter(ImageInfo.code == code).first()
    if image_info is None:
        return {"success":False, "data":"Image not found"}
    return {
        "success":True,
        "data": {
        "code": image_info.code,
        "filename": image_info.filename,
        "Resolution": {"width": image_info.width, "height": image_info.height},
        "size": image_info.size,
        "created_at": image_info.created_at,
    },
    }
