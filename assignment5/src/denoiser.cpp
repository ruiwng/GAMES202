#include "denoiser.h"

Denoiser::Denoiser() : m_useTemportal(false) {}

void Denoiser::Reprojection(const FrameInfo &frameInfo) {
    int height = m_accColor.m_height;
    int width = m_accColor.m_width;
    Matrix4x4 preWorldToScreen =
        m_preFrameInfo.m_matrix[m_preFrameInfo.m_matrix.size() - 1];
    Matrix4x4 preWorldToCamera =
        m_preFrameInfo.m_matrix[m_preFrameInfo.m_matrix.size() - 2];
#pragma omp parallel for
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            // TODO: Reproject
            int id = int(frameInfo.m_id(x, y));
            if(id + 2 >= m_preFrameInfo.m_matrix.size()) {
                m_valid(x, y) = false;
                continue;
            }
            bool isSuccess;
            auto inverseMatrix = Inverse(frameInfo.m_matrix[id], isSuccess);
            if(!isSuccess) {
                m_valid(x, y) = false;
                continue;;
            }
            auto transformMatrix = preWorldToScreen * m_preFrameInfo.m_matrix[id] * inverseMatrix;
            auto preScreenPosition = transformMatrix(frameInfo.m_position(x, y), Float3::Point);
            int preScreenX = int(preScreenPosition.x);
            int preScreenY = int(preScreenPosition.y);
            // printf("before position %d, %d, after position: %d, %d\n", x, y, preScreenX, preScreenY);
            if(preScreenX < 0 || preScreenX >= width || preScreenY < 0 || preScreenY >= height || int(m_preFrameInfo.m_id(preScreenX, preScreenY)) != id) {
                m_valid(x, y) = false;
                continue;
            }
            m_valid(x, y) = true;
            m_misc(x, y) = m_accColor(preScreenX, preScreenY);
            // m_valid(x, y) = false;
        }
    }
    std::swap(m_misc, m_accColor);
}

void Denoiser::TemporalAccumulation(const Buffer2D<Float3> &curFilteredColor) {
    int height = m_accColor.m_height;
    int width = m_accColor.m_width;
    int kernelRadius = 3;
// #pragma omp parallel for
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            // TODO: Temporal clamp
            Float3 color = m_accColor(x, y);
            Float3 currentColor = curFilteredColor(x, y);
            // TODO: Exponential moving average

            if(!m_valid(x, y) || m_processType == SINGLE_FRAME_DENOISE_ONLY) {
                m_misc(x, y) = currentColor;
            } else {
                Float3 mean(0.0);
                int num = 0;
                for(int m = -kernelRadius; m <= kernelRadius; ++m) {
                    for(int n = -kernelRadius; n <= kernelRadius; ++n) {
                        int xPos = x + n;
                        int yPos = y + m;
                        if(xPos < 0 || xPos >= width || yPos < 0 || yPos >= height) {
                            continue;
                        }
                        mean += currentColor;
                        num += 1;
                    }
                }
                mean /= num;
                Float3 variance(0.0);
                for(int m = -kernelRadius; m <= kernelRadius; ++m) {
                    for(int n = -kernelRadius; n <= kernelRadius; ++n) {
                        int xPos = x + n;
                        int yPos = y + m;
                        if(xPos < 0 || xPos >= width || yPos < 0 || yPos >= height) {
                            continue;
                        }
                        Float3 t = currentColor - mean;
                        variance += t * t;
                    }
                }
                variance /= num;
                Float3 standardDeviation = Sqr(variance);
                // printf("currentColor: (%f, %f, %f), accColor: (%f, %f, %f)\n", currentColor.x, currentColor.y, currentColor.z, color.x, color.y, color.z);
                // printf("mean: (%f, %f, %f), standardDeviation: (%f, %f, %f)\n", mean.x, mean.y, mean.z, standardDeviation.x, standardDeviation.y, standardDeviation.z);
                m_misc(x, y) = curFilteredColor(x, y) * m_alpha + Clamp(color, mean - standardDeviation * m_colorBoxK, mean + standardDeviation * m_colorBoxK) * (1.0f - m_alpha);
            }
        }
    }
    std::swap(m_misc, m_accColor);
}

Buffer2D<Float3> Denoiser::Filter(const FrameInfo &frameInfo) {
    int height = frameInfo.m_beauty.m_height;
    int width = frameInfo.m_beauty.m_width;
    Buffer2D<Float3> filteredImage = CreateBuffer2D<Float3>(width, height);
    int kernelRadius = 16;
    // static int num = 0;
    // m_sigmaColor += 0.2 * num;
    // printf("num %d, sigmaColor %f\n", num, m_sigmaColor);
    // num += 1;
#pragma omp parallel for
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            // TODO: Joint bilateral filter
            filteredImage(x, y) = frameInfo.m_beauty(x, y);
            if (m_processType == ACCUMULATION_ONLY) {
                continue;
            }
            float totalWeight = 1.0f;
            for(int m = -kernelRadius; m <= kernelRadius; ++m) {
                for(int n = -kernelRadius; n <= kernelRadius; ++n) {
                    if(m == 0 && n == 0) {
                        continue;
                    }
                    int xPos = x + n;
                    int yPos = y + m;
                    if(xPos < 0 || xPos >= width || yPos < 0 || yPos >= height) {
                        continue;
                    }
                    auto neighborColor = frameInfo.m_beauty(xPos, yPos);
                    
                    float coordSqrDistance = m * m + n * n;
                    float p = -coordSqrDistance / (2.0 * m_sigmaCoord * m_sigmaCoord);

                    float colorSqrDistance = SqrDistance(frameInfo.m_beauty(x, y), neighborColor);
                    p += -colorSqrDistance / (2.0 * m_sigmaColor * m_sigmaColor);
                    
                    auto n1 = frameInfo.m_normal(x, y);
                    auto n2 = frameInfo.m_normal(xPos, yPos);
                    auto d = Dot(n1, n2);
                    // clamp the dot product of two normals into range (-1.0, 1.0), to avoid nan acos value.
                    d = std::max(-1.0f, std::min(1.0f, d));
                    auto acosd = acosf(d);
                    float normalSqrDistance = acosd * acosd;
                    p += -normalSqrDistance / (2.0 * m_sigmaNormal * m_sigmaNormal);
                    
                    Float3 ItoJ = frameInfo.m_position(xPos, yPos) - frameInfo.m_position(x, y);
                    float length = Length(ItoJ);
                    if(length > 0.00001f) {
                        ItoJ /= length;
                        float planeSqrDistance = pow(Dot(frameInfo.m_normal(x, y), ItoJ), 2.0);
                        p += -planeSqrDistance / (2.0 * m_sigmaPlane * m_sigmaPlane);
                    }

                    float weight = exp(p);
                    filteredImage(x, y) += neighborColor * weight;
                    // printf("weight: %f, neighborColor: (%f, %f, %f)\n", weight, neighborColor.x, neighborColor.y, neighborColor.z);
                    totalWeight += weight;
                }
            }
            // printf("filteredImage(x, y): (%f, %f, %f), totalWeight %f\n", filteredImage(x, y).x, filteredImage(x, y).y, filteredImage(x, y).z, totalWeight);
            filteredImage(x, y) /= totalWeight;
        }
    }
    return filteredImage;
}

void Denoiser::Init(const FrameInfo &frameInfo, const Buffer2D<Float3> &filteredColor) {
    m_accColor.Copy(filteredColor);
    int height = m_accColor.m_height;
    int width = m_accColor.m_width;
    m_misc = CreateBuffer2D<Float3>(width, height);
    m_valid = CreateBuffer2D<bool>(width, height);
}

void Denoiser::Maintain(const FrameInfo &frameInfo) { m_preFrameInfo = frameInfo; }

Buffer2D<Float3> Denoiser::ProcessFrame(const FrameInfo &frameInfo, ProcessType type) {
    // Filter current frame
    m_processType = type;
    Buffer2D<Float3> filteredColor;
    filteredColor = Filter(frameInfo);

    // Reproject previous frame color to current
    if (m_useTemportal) {
        Reprojection(frameInfo);
        TemporalAccumulation(filteredColor);
    } else {
        Init(frameInfo, filteredColor);
    }

    // Maintain
    Maintain(frameInfo);
    if (!m_useTemportal) {
        m_useTemportal = true;
    }
    return m_accColor;
}
