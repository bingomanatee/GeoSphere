ffmpeg -r 8 -i "images/normal_test_%04d.png" -c:v libx264 -crf 23 -pix_fmt yuv420p video/normal_test.mp4
