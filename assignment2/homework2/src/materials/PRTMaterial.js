class PRTMaterial extends Material {

    constructor(vertexShader, fragmentShader) {
        let uniform = {};
        for(let i = 0; i < 9; ++i) {
            uniform['uPrecomputeL[' + i + ']'] = {type: '3fv', value: precomputeL[guiParams.envmapId][i]};
        }
        super(uniform, 
            [
            'aPrecomputeLT'
        ], vertexShader, fragmentShader, null);
    }

    update() {
        for(let i = 0; i < 9; ++i) {
            this.uniforms['uPrecomputeL[' + i + ']'] = {type: '3fv', value: precomputeL[guiParams.envmapId][i]};
        }
    }
}

async function buildPRTMaterial(vertexPath, fragmentPath) {

    let vertexShader = await getShaderString(vertexPath);
    let fragmentShader = await getShaderString(fragmentPath);

    return new PRTMaterial(vertexShader, fragmentShader);
}
