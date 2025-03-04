from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import Optional
import time

app = FastAPI()

# 解决跨域问题（重要！）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，正式环境应限制为前端地址
    allow_methods=["*"],
    allow_headers=["*"],
)

# 模拟深度学习模型的预测函数
def mock_predict_pest(image_bytes: bytes) -> dict:
    # 此处后期可替换为实际模型调用
    time.sleep(1)  # 模拟计算耗时
    return {
        "pest": "褐飞虱",
        "confidence": 0.95,
        "description": "常见水稻害虫，吸食茎秆汁液导致植株枯萎"
    }

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # 读取上传的图片
        image_bytes = await file.read()
        print(f"收到图片：{file.filename}，大小：{len(image_bytes)/1024:.2f}KB")

        # 调用模型（暂时用模拟函数）
        result = mock_predict_pest(image_bytes)

        return {
            "status": "success",
            "result": result
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)