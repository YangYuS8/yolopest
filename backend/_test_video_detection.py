"""
视频检测诊断脚本
用法：
    python _test_video_detection.py <视频路径> [--conf 0.25]

该脚本不依赖 Redis / FastAPI，直接调用 YOLO 检测器对视频进行逐帧诊断，
输出每帧检测到的害虫数量、置信度、耗时，并保存一张带标注的关键帧供查看。
"""
import argparse
import sys
import os
import time
from pathlib import Path

os.chdir(r"D:\Users\xyn\Desktop\yolopest-main\yolopest-main\backend")

import cv2
import numpy as np

from app.services.detector import detector


def diagnose_video(video_path: str, conf_threshold: float = 0.25, max_frames: int = 0):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[错误] 无法打开视频: {video_path}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    length = frame_count / fps if fps > 0 else 0

    print("=" * 60)
    print(f"视频文件: {video_path}")
    print(f"分辨率: {width}x{height}")
    print(f"帧率: {fps:.2f} fps")
    print(f"总帧数: {frame_count}")
    print(f"时长: {length:.2f} 秒")
    print(f"检测置信度阈值: {conf_threshold}")
    print("=" * 60)

    # 缩放策略与 video.py 一致
    MAX_WIDTH = 1280
    scale = 1.0
    if width > MAX_WIDTH:
        scale = MAX_WIDTH / width
        print(f"分辨率过大，将等比缩放至宽度 {MAX_WIDTH}")

    TARGET_FPS = 4
    frame_interval = max(1, int(round(fps / TARGET_FPS)))

    frame_idx = 0
    processed = 0
    total_detections = 0
    best_frame = None
    best_frame_idx = -1
    best_count = -1

    start = time.time()

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if max_frames > 0 and frame_idx >= max_frames:
            break

        if frame_idx % frame_interval == 0:
            if scale < 1.0:
                process_frame = cv2.resize(frame, (int(width * scale), int(height * scale)), interpolation=cv2.INTER_AREA)
            else:
                process_frame = frame

            frame_rgb = cv2.cvtColor(process_frame, cv2.COLOR_BGR2RGB)
            ok, buf = cv2.imencode('.jpg', frame_rgb)
            if not ok:
                print(f"[帧 {frame_idx}] 编码失败")
                frame_idx += 1
                continue

            t0 = time.time()
            preds = detector.predict(buf.tobytes(), conf_threshold=conf_threshold)
            dt = time.time() - t0

            total_detections += len(preds)
            processed += 1

            if len(preds) > 0:
                print(f"[帧 {frame_idx:5d} | {frame_idx / fps:6.2f}s] 检测到 {len(preds):2d} 个目标, 耗时 {dt:.3f}s")
                for p in preds:
                    print(f"    - {p.get('class_zh') or p.get('class')} ({p.get('class_en')}) 置信度 {p.get('confidence', 0) * 100:.1f}%")

            if len(preds) > best_count:
                best_count = len(preds)
                best_frame = process_frame.copy()
                best_frame_idx = frame_idx

        frame_idx += 1

    elapsed = time.time() - start
    cap.release()

    print("=" * 60)
    print(f"诊断完成: 处理 {processed} 帧, 总目标数 {total_detections}, 耗时 {elapsed:.2f}s")
    print(f"最佳帧: 第 {best_frame_idx} 帧, 检测到 {best_count} 个目标")

    if best_frame is not None and best_count > 0:
        out_path = Path(video_path).with_suffix('.diagnosis_best_frame.jpg')
        cv2.imwrite(str(out_path), best_frame)
        print(f"已保存最佳关键帧: {out_path}")
    else:
        print("[结论] 未在视频中检测到任何害虫目标。")
        print("可能原因:")
        print("  1. 画面中的害虫不属于模型训练的 46 个类别")
        print("  2. 害虫在画面中过小、过暗或被遮挡")
        print("  3. 视频压缩严重，细节丢失")
        print("  4. 置信度阈值过高，可尝试降低 --conf 参数（如 0.15）")
        print("  5. 目标害虫与训练数据分布差异较大")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="视频害虫检测诊断")
    parser.add_argument("video", help="待检测的视频文件路径")
    parser.add_argument("--conf", type=float, default=0.25, help="置信度阈值，默认 0.25")
    parser.add_argument("--max-frames", type=int, default=0, help="最多检测前 N 帧（0 表示全部）")
    args = parser.parse_args()

    diagnose_video(args.video, args.conf, args.max_frames)
