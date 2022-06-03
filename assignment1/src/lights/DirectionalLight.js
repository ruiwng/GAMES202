class DirectionalLight {

    constructor(lightIntensity, lightColor, lightPos, focalPoint, lightUp, hasShadowMap, gl) {
        this.mesh = Mesh.cube(setTransform(0, 0, 0, 0.2, 0.2, 0.2, 0));
        this.mat = new EmissiveMaterial(lightIntensity, lightColor);
        this.lightPos = lightPos;
        this.focalPoint = focalPoint;
        this.lightUp = lightUp

        this.hasShadowMap = hasShadowMap;
        this.fbo = new FBO(gl);
        if (!this.fbo) {
            console.log("无法设置帧缓冲区对象");
            return;
        }
    }

    CalcLightMVP(translate, scale) {
        let lightMVP = mat4.create();
        let modelMatrix = mat4.create();
        let viewMatrix = mat4.create();
        let projectionMatrix = mat4.create();
        // Model transform
        modelMatrix = mat4.fromValues(
            scale[0], 0.0, 0.0, 0.0,
            0.0, scale[1], 0.0, 0.0,
            0.0, 0.0, scale[2], 0.0,
            translate[0], translate[1], translate[2], 1.0
        );
        // View transform
        let zDir = vec3.fromValues(this.lightPos[0] - this.focalPoint[0], this.lightPos[1] - this.focalPoint[1], this.lightPos[2] - this.focalPoint[2]);
        vec3.normalize(zDir, zDir);
        let xDir = vec3.create();
        vec3.cross(xDir, this.lightUp, zDir);
        vec3.normalize(xDir, xDir);
        let yDir = vec3.create();
        vec3.cross(yDir, zDir, xDir);
        viewMatrix = mat4.fromValues(
            xDir[0], yDir[0], zDir[0], 0.0,
            xDir[1], yDir[1], zDir[1], 0.0,
            xDir[2], yDir[2], zDir[2], 0.0,
            -vec3.dot(xDir, this.lightPos), -vec3.dot(yDir, this.lightPos), -vec3.dot(zDir, this.lightPos), 1.0
        );
        // Projection transform
        let left = -20;
        let right = 50;
        let bottom = -10;
        let top = 60;
        let near = -50;
        let far = -180;
        let projectionTranslate = mat4.fromValues(
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            -(left + right) * 0.5, -(bottom + top) * 0.5, -near, 1.0
        );
        let projectionScale = mat4.fromValues(
            2.0 / (right - left), 0.0, 0.0, 0.0,
            0.0, 2.0 / (top - bottom), 0.0, 0.0,
            0.0, 0.0, 1.0 / (far - near), 0.0,
            0.0, 0.0, 0.0, 1.0
        );
        mat4.multiply(projectionMatrix, projectionScale, projectionTranslate);
        let x = mat4.create();
        mat4.ortho(x, left, right, bottom, top, near, 600);
        mat4.multiply(lightMVP, projectionMatrix, viewMatrix);
        mat4.multiply(lightMVP, lightMVP, modelMatrix);

        return lightMVP;
    }
}
