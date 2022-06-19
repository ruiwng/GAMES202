attribute vec3 aVertexPosition;
attribute vec3 aNormalPosition;
attribute vec2 aTextureCoord;
attribute mat3 aPrecomputeLT;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uPrecomputeL[9];

varying vec3 vColor;

void main(void) {
    vColor = vec3(0.0, 0.0, 0.0);

    vColor.r += uPrecomputeL[0].x * aPrecomputeLT[0][0] + uPrecomputeL[1].x * aPrecomputeLT[0][1] + uPrecomputeL[2].x * aPrecomputeLT[0][2]
              + uPrecomputeL[3].x * aPrecomputeLT[1][0] + uPrecomputeL[4].x * aPrecomputeLT[1][1] + uPrecomputeL[5].x * aPrecomputeLT[1][2]
              + uPrecomputeL[6].x * aPrecomputeLT[2][0] + uPrecomputeL[7].x * aPrecomputeLT[2][1] + uPrecomputeL[8].x * aPrecomputeLT[2][2];
    
    vColor.g += uPrecomputeL[0].y * aPrecomputeLT[0][0] + uPrecomputeL[1].y * aPrecomputeLT[0][1] + uPrecomputeL[2].y * aPrecomputeLT[0][2]
              + uPrecomputeL[3].y * aPrecomputeLT[1][0] + uPrecomputeL[4].y * aPrecomputeLT[1][1] + uPrecomputeL[5].y * aPrecomputeLT[1][2]
              + uPrecomputeL[6].y * aPrecomputeLT[2][0] + uPrecomputeL[7].y * aPrecomputeLT[2][1] + uPrecomputeL[8].y * aPrecomputeLT[2][2];
    
    vColor.b += uPrecomputeL[0].z * aPrecomputeLT[0][0] + uPrecomputeL[1].z * aPrecomputeLT[0][1] + uPrecomputeL[2].z * aPrecomputeLT[0][2]
              + uPrecomputeL[3].z * aPrecomputeLT[1][0] + uPrecomputeL[4].z * aPrecomputeLT[1][1] + uPrecomputeL[5].z * aPrecomputeLT[1][2]
              + uPrecomputeL[6].z * aPrecomputeLT[2][0] + uPrecomputeL[7].z * aPrecomputeLT[2][1] + uPrecomputeL[8].z * aPrecomputeLT[2][2];
    
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
}