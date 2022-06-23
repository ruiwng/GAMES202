class PRTMaterial extends Material {

    constructor(vertexShader, fragmentShader) {
        let uniform = {};
        let precomputeLRGB = getMat3ValueFromRGB(precomputeL[guiParams.envmapId]);
        uniform['uPrecomputeLR'] = {type: 'matrix3fv', value: precomputeLRGB[0]};
        uniform['uPrecomputeLG'] = {type: 'matrix3fv', value: precomputeLRGB[1]};
        uniform['uPrecomputeLB'] = {type: 'matrix3fv', value: precomputeLRGB[2]};

        super(uniform, 
            [
            'aPrecomputeLT'
        ], vertexShader, fragmentShader, null);
    }

    update() {
        let precomputeLRGB = getMat3ValueFromRGB(rotationPrecomputeL);
        this.uniforms['uPrecomputeLR'] = {type: 'matrix3fv', value: precomputeLRGB[0]};
        this.uniforms['uPrecomputeLG'] = {type: 'matrix3fv', value: precomputeLRGB[1]};
        this.uniforms['uPrecomputeLB'] = {type: 'matrix3fv', value: precomputeLRGB[2]};
    }
}

async function buildPRTMaterial(vertexPath, fragmentPath) {

    let vertexShader = await getShaderString(vertexPath);
    let fragmentShader = await getShaderString(fragmentPath);

    return new PRTMaterial(vertexShader, fragmentShader);
}
