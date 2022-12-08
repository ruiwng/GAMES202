#include <fstream>
#include <string>

#include "denoiser.h"
#include "util/image.h"
#include "util/mathutil.h"

std::vector<Matrix4x4> ReadMatrix(const std::string &filename) {
    std::ifstream is;
    is.open(filename, std::ios::binary);
    CHECK(is.is_open());
    int shapeNum;
    is.read(reinterpret_cast<char *>(&shapeNum), sizeof(int));
    std::vector<Matrix4x4> matrix(shapeNum + 2);
    for (int i = 0; i < shapeNum + 2; i++) {
        is.read(reinterpret_cast<char *>(&matrix[i]), sizeof(Matrix4x4));
    }
    is.close();
    return matrix;
}

FrameInfo LoadFrameInfo(const filesystem::path &inputDir, const int &idx) {
    Buffer2D<Float3> beauty =
        ReadFloat3Image((inputDir / ("beauty_" + std::to_string(idx) + ".exr")).str());
    Buffer2D<Float3> normal =
        ReadFloat3Image((inputDir / ("normal_" + std::to_string(idx) + ".exr")).str());
    Buffer2D<Float3> position =
        ReadFloat3Image((inputDir / ("position_" + std::to_string(idx) + ".exr")).str());
    Buffer2D<float> depth =
        ReadFloatImage((inputDir / ("depth_" + std::to_string(idx) + ".exr")).str());
    Buffer2D<float> id =
        ReadFloatImage((inputDir / ("ID_" + std::to_string(idx) + ".exr")).str());
    std::vector<Matrix4x4> matrix =
        ReadMatrix((inputDir / ("matrix_" + std::to_string(idx) + ".mat")).str());

    FrameInfo frameInfo = {beauty, depth, normal, position, id, matrix};
    return frameInfo;
}

void Denoise(const filesystem::path &inputDir, const filesystem::path &outputDir,
             const int &frameNum, ProcessType type) {
    Denoiser denoiser;
    for (int i = 0; i < frameNum; i++) {
        std::cout << "Frame: " << i << std::endl;
        FrameInfo frameInfo = LoadFrameInfo(inputDir, i);
        Buffer2D<Float3> image = denoiser.ProcessFrame(frameInfo, type);
        char name[200];
        sprintf(name, "result_%02d.exr", i);
        std::string filename =
            (outputDir / name).str();
        WriteFloat3Image(image, filename);
    }
}

// argv[1]: inputDir
// argv[2]: outputDir
// argv[3]: frameNum
// argv[4]: denoise type 0(single frame denoise), 1(accumulation), 2(single frame denoise and accumulation)

int main(int argc, char *argv[]) {
    // Box
    filesystem::path inputDir(argv[1]);
    filesystem::path outputDir(argv[2]);
    int frameNum = atoi(argv[3]);
    ProcessType type = static_cast<ProcessType>(atoi(argv[4]));

    /*
    // Pink room
    filesystem::path inputDir("examples/pink-room/input");
    filesystem::path outputDir("examples/pink-room/output");
    int frameNum = 80;
    */

    Denoise(inputDir, outputDir, frameNum, type);
    return 0;
}
