ffmpeg -framerate 15 -i ./examples/box/input/beauty_%%d.exr -start_number 0 -c:v libx264 -r 30 -pix_fmt yuv420p ./results/box-original.mp4
.\build\Release\Denoise.exe examples/box/input examples/box/filter 20 0
ffmpeg -framerate 15 -i ./examples/box/filter/result_%%02d.exr -start_number 0 -c:v libx264 -r 30 -pix_fmt yuv420p ./results/box-filter.mp4
.\build\Release\Denoise.exe examples/box/input examples/box/project 20 1
ffmpeg -framerate 15 -i ./examples/box/project/result_%%02d.exr -start_number 0 -c:v libx264 -r 30 -pix_fmt yuv420p ./results/box-project.mp4
.\build\Release\Denoise.exe examples/box/input examples/box/result 20 2
ffmpeg -framerate 15 -i ./examples/box/result/result_%%02d.exr -start_number 0 -c:v libx264 -r 30 -pix_fmt yuv420p ./results/box-result.mp4

ffmpeg -framerate 15 -i ./examples/pink-room/input/beauty_%%d.exr -start_number 0 -c:v libx264 -r 30 -pix_fmt yuv420p ./results/pinkroom-original.mp4
.\build\Release\Denoise.exe examples/pink-room/input examples/pink-room/filter 80 0
ffmpeg -framerate 15 -i ./examples/pink-room/filter/result_%%02d.exr -start_number 0 -c:v libx264 -r 30 -pix_fmt yuv420p ./results/pinkroom-filter.mp4
.\build\Release\Denoise.exe examples/pink-room/input examples/pink-room/project 80 1
ffmpeg -framerate 15 -i ./examples/pink-room/project/result_%%02d.exr -start_number 0 -c:v libx264 -r 30 -pix_fmt yuv420p ./results/pinkroom-project.mp4
.\build\Release\Denoise.exe examples/pink-room/input examples/pink-room/result 80 2
ffmpeg -framerate 15 -i ./examples/pink-room/result/result_%%02d.exr -start_number 0 -c:v libx264 -r 30 -pix_fmt yuv420p ./results/pinkroom-result.mp4
