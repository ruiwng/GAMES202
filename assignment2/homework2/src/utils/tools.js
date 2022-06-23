function getRotationPrecomputeL(precompute_L, rotationMatrix){
	let mat = math.matrix(
		[
			[rotationMatrix[0], rotationMatrix[1], rotationMatrix[2], rotationMatrix[3]], 
			[rotationMatrix[4], rotationMatrix[5], rotationMatrix[6], rotationMatrix[7]],  
			[rotationMatrix[8], rotationMatrix[9], rotationMatrix[10], rotationMatrix[11]], 
			[rotationMatrix[12], rotationMatrix[13], rotationMatrix[14], rotationMatrix[15]]
		]
		);
	let m3x3 = computeSquareMatrix_3by3(mat);
	let m5x5 = computeSquareMatrix_5by5(mat);
	let result = [precompute_L[0]];
	for(let i = 0; i < 8; ++i) {
		result.push([]);
	}
	for(let i = 0; i < 3; ++i) {
		let l3 = math.multiply([precompute_L[1][i], precompute_L[2][i], precompute_L[3][i]], m3x3).toArray();
		let k = 0;
		for(let j = 1; j <= 3; ++j) {
			result[j].push(l3[k++]);
		}
		k = 0;
		let l5 = math.multiply([precompute_L[4][i], precompute_L[5][i], precompute_L[6][i], precompute_L[7][i], precompute_L[8][i]], m5x5).toArray();
		for(let j = 4; j <= 8; ++j) {
			result[j].push(l5[k++]);
		}
	}
	return result;
}

function computeSquareMatrix_3by3(rotationMatrix){ // 计算方阵SA(-1) 3*3 
	
	// 1、pick ni - {ni}
	let n1 = [1, 0, 0, 0]; let n2 = [0, 0, 1, 0]; let n3 = [0, 1, 0, 0];

	// 2、{P(ni)} - A  A_inverse
	let shn1 = SHEval(n1[0], n1[1], n1[2], 3);
	let shn2 = SHEval(n2[0], n2[1], n2[2], 3);
	let shn3 = SHEval(n3[0], n3[1], n3[2], 3);
	let A = math.matrix([
		[shn1[1], shn1[2], shn1[3]],
		[shn2[1], shn2[2], shn2[3]],
		[shn3[1], shn3[2], shn3[3]]
	]);
	let A_inverse = math.inv(A);
	// 3、用 R 旋转 ni - {R(ni)}
	let rn1 = math.multiply(n1, rotationMatrix).toArray();
	let rn2 = math.multiply(n2, rotationMatrix).toArray();
	let rn3 = math.multiply(n3, rotationMatrix).toArray();

	// 4、R(ni) SH投影 - S
	let shrn1 = SHEval(rn1[0], rn1[1], rn1[2], 3);
	let shrn2 = SHEval(rn2[0], rn2[1], rn2[2], 3);
	let shrn3 = SHEval(rn3[0], rn3[1], rn3[2], 3);
	// 5、S*A_inverse
	let S = math.matrix([
		[shrn1[1], shrn1[2], shrn1[3]], 
		[shrn2[1], shrn2[2], shrn2[3]], 
		[shrn3[1], shrn3[2], shrn3[3]],
	]);
	result = math.multiply(A_inverse, S);
	return result;
}

function computeSquareMatrix_5by5(rotationMatrix){ // 计算方阵SA(-1) 5*5
	
	// 1、pick ni - {ni}
	let k = 1 / math.sqrt(2);
	let n1 = [1, 0, 0, 0]; let n2 = [0, 0, 1, 0]; let n3 = [k, k, 0, 0]; 
	let n4 = [k, 0, k, 0]; let n5 = [0, k, k, 0];

	// 2、{P(ni)} - A  A_inverse
	let shn1 = SHEval(n1[0], n1[1], n1[2], 3);
	let shn2 = SHEval(n2[0], n2[1], n2[2], 3);
	let shn3 = SHEval(n3[0], n3[1], n3[2], 3);
	let shn4 = SHEval(n4[0], n4[1], n4[2], 3);
	let shn5 = SHEval(n5[0], n5[1], n5[2], 3);
	let A = math.matrix([
		[shn1[4], shn1[5], shn1[6], shn1[7], shn1[8]],
		[shn2[4], shn2[5], shn2[6], shn2[7], shn2[8]],
		[shn3[4], shn3[5], shn3[6], shn3[7], shn3[8]],
		[shn4[4], shn4[5], shn4[6], shn4[7], shn4[8]],
		[shn5[4], shn5[5], shn5[6], shn5[7], shn5[8]]
	])
	let A_inverse = math.inv(A);
	// 3、用 R 旋转 ni - {R(ni)}
	let rn1 = math.multiply(n1, rotationMatrix).toArray();
	let rn2 = math.multiply(n2, rotationMatrix).toArray();
	let rn3 = math.multiply(n3, rotationMatrix).toArray();
	let rn4 = math.multiply(n4, rotationMatrix).toArray();
	let rn5 = math.multiply(n5, rotationMatrix).toArray();

	// 4、R(ni) SH投影 - S
	let shrn1 = SHEval(rn1[0], rn1[1], rn1[2], 3);
	let shrn2 = SHEval(rn2[0], rn2[1], rn2[2], 3);
	let shrn3 = SHEval(rn3[0], rn3[1], rn3[2], 3);
	let shrn4 = SHEval(rn4[0], rn4[1], rn4[2], 3);
	let shrn5 = SHEval(rn5[0], rn5[1], rn5[2], 3);

	// 5、S*A_inverse
	let S = math.matrix([
		[shrn1[4], shrn1[5], shrn1[6], shrn1[7], shrn1[8]], 
		[shrn2[4], shrn2[5], shrn2[6], shrn2[7], shrn2[8]], 
		[shrn3[4], shrn3[5], shrn3[6], shrn3[7], shrn3[8]], 
		[shrn4[4], shrn4[5], shrn4[6], shrn4[7], shrn4[8]], 
		[shrn5[4], shrn5[5], shrn5[6], shrn5[7], shrn5[8]]
	]);
	let result = math.multiply(A_inverse, S);
	return result;
}

function mat4Matrix2mathMatrix(rotationMatrix){

	let mathMatrix = [];
	for(let i = 0; i < 4; i++){
		let r = [];
		for(let j = 0; j < 4; j++){
			r.push(rotationMatrix[i*4+j]);
		}
		mathMatrix.push(r);
	}
	return math.matrix(mathMatrix)

}

function getMat3ValueFromRGB(precomputeL){

    let colorMat3 = [];
    for(var i = 0; i<3; i++){
        colorMat3[i] = mat3.fromValues( precomputeL[0][i], precomputeL[1][i], precomputeL[2][i],
										precomputeL[3][i], precomputeL[4][i], precomputeL[5][i],
										precomputeL[6][i], precomputeL[7][i], precomputeL[8][i] ); 
	}
    return colorMat3;
}