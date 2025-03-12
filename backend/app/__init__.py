"""YoloPest Backend Application"""

# 确保临时目录存在
import os
import tempfile

uploads_dir = os.path.join(tempfile.gettempdir(), "yolopest_uploads")
os.makedirs(uploads_dir, exist_ok=True)

# 版本信息
__version__ = "0.1.0"