#!/usr/bin/env bash
# Install requirements
pip install -r requirements.txt

# MediaPipe forces the installation of opencv-contrib-python which requires libGL (GUI libraries)
# Render's headless Linux servers don't have libGL, causing instant crashes when importing mediapipe.
# We must forcefully uninstall the GUI versions of OpenCV and ensure only the headless version is installed.
pip uninstall -y opencv-contrib-python opencv-python
pip install --no-deps --force-reinstall opencv-python-headless==4.9.0.80
