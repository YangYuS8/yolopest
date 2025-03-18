from setuptools import setup, find_packages

setup(
    name="ultralytics",
    version="8.3.83",
    packages=find_packages(),
    install_requires=[
        "numpy>=1.18.5",
        "opencv-python-headless>=4.1.1",
        "torch>=1.7.0",
        "torchvision>=0.8.1",
        "matplotlib>=3.2.2",
        "scipy>=1.4.1",
    ],
)