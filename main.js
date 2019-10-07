let camera, scene, renderer, controls;
let gravity = -9.82;
var particleCount = 100;
var particleRadius, sphereRadius;
var td = 0.01;
var particles = [];
var sphere;
let then = 0;
let epsilon = 0.01;
let a1, corner1, corner2, corner3;






function init() {
	// Init scene
	scene = new THREE.Scene();

	// Init camera (PerspectiveCamera)
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	// Lights
  var light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set( 0, 60, 5 );
  light.rotation.x = -60 * Math.PI / 180;
  light.rotation.y = -20 * Math.PI / 180;
	var ambLight = new THREE.AmbientLight( 0x404040 ); // soft white light

	// Init renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });

	controls = new THREE.OrbitControls( camera, renderer.domElement );

	camera.position.set( 0, 30, 15 );
	camera.rotation.x = -45 * Math.PI / 180;
	controls.update();
  spawnParticles();
	// Set size (whole window)
	renderer.setSize(window.innerWidth, window.innerHeight);

	// Render to canvas element
	document.body.appendChild(renderer.domElement);

	//Sphere
	sphereRadius = 5;
	var sphereGeometry = new THREE.SphereGeometry( sphereRadius, 32, 32 );
	var sphereMaterial = new THREE.MeshPhongMaterial( {color: 0xffff00} );
	sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	sphere.position.set(0,0,-20);

	//Planes
  var planeGeometry = new THREE.PlaneGeometry( 20, 20, 32, 32 );
  var planeMaterial = new THREE.MeshPhongMaterial( {
		color: 0xFFFFFF,
		side: THREE.DoubleSide,
		opacity: 0.5,
		transparent: true} );
  var floor = new THREE.Mesh( planeGeometry, planeMaterial );
  var left = new THREE.Mesh( planeGeometry, planeMaterial );
  var right = new THREE.Mesh( planeGeometry, planeMaterial );
  var front = new THREE.Mesh( planeGeometry, planeMaterial );
  var back = new THREE.Mesh( planeGeometry, planeMaterial );

	floor.rotation.x = 90 * Math.PI / 180;
  floor.position.z = -10;

	front.rotation.z = 90 * Math.PI / 180;
	front.position.z = 0;
	front.position.y = 10;

	back.rotation.z = 90 * Math.PI / 180;
  back.position.z = -20;
	back.position.y = 10;

	left.rotation.y = 90 * Math.PI / 180;
	left.position.z = -10;
	left.position.x = -10;
	left.position.y = 10;

	right.rotation.y = 90 * Math.PI / 180;
	right.position.z = -10;
	right.position.x = 10;
	right.position.y = 10;

	//Triangle
	var triangleGeometry = new THREE.Geometry();
	corner1 = new THREE.Vector3(5,0,5);
	corner2 = new THREE.Vector3(-5,0,-5);
	corner3 = new THREE.Vector3(-5,10,5);
	triangleGeometry.vertices= [corner1, corner2, corner3];
	triangleGeometry.faces = [new THREE.Face3(0,1,2)];
	var triangleMesh= new THREE.Mesh( triangleGeometry, new THREE.MeshBasicMaterial({ color: 0xffff, side: THREE.DoubleSide }));
	triangleMesh.position.set(-5,0,-5);


	a1 = areaOfTriangle(corner1, corner2, corner3);


  scene.add(light, ambLight, floor, front, back, left, right, sphere, triangleMesh);
}

function spawnParticles() {

	particleRadius = 0.2;
  const particleGeometry = new THREE.SphereGeometry(particleRadius, 01, 10);
  const particleMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });

  for(var i = 0; i < particleCount; i++) {
    particles[i] = new THREE.Mesh(particleGeometry, particleMaterial);
		//particles[i] = new THREE.Points();

    particles[i].position.x = 0.0;
    particles[i].position.y = 10000.0;
    particles[i].position.z = -100.0;


    particles[i].velocity = new THREE.Vector3(Math.random()*3-1, 5.0, Math.random()*3-1);

    particles[i].mass = 0.5;

    particles[i].lifeLength = Math.random()*10;

    scene.add(particles[i]);
  }
}

// Draw the scene every time the screen is refreshed
function animate(now) {
	now *= 0.001;
	const delta = now - then;
	then = now;

	controls.update();

  for (var i = 0; i < particleCount; i++) {

						var prevPos = new THREE.Vector3(particles[i].position.x, particles[i].position.y, particles[i].position.z);
						var prevVel = new THREE.Vector3(particles[i].velocity.x, particles[i].velocity.y, particles[i].velocity.z);


            particles[i].velocity.x = prevVel.x;
            particles[i].velocity.y = prevVel.y + delta * (gravity/particles[i].mass);
            particles[i].velocity.z = prevVel.z;

            particles[i].position.x = prevPos.x + delta * particles[i].velocity.x;
            particles[i].position.y = prevPos.y + delta * particles[i].velocity.y;
            particles[i].position.z = prevPos.z + delta * particles[i].velocity.z;


						// y = 0
						planeCollision(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), particles[i].position, particles[i].velocity, prevPos, prevVel);
						// z = 0
						planeCollision(new THREE.Vector3(0,0,-1), new THREE.Vector3(0,0,0), particles[i].position, particles[i].velocity, prevPos, prevVel);
						// z = -20
						planeCollision(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-20), particles[i].position, particles[i].velocity, prevPos, prevVel);
						// x = 10
						planeCollision(new THREE.Vector3(-1,0,0), new THREE.Vector3(10,0,0), particles[i].position, particles[i].velocity, prevPos, prevVel);
						// x = -10
						planeCollision(new THREE.Vector3(1,0,0), new THREE.Vector3(-10,0,0), particles[i].position, particles[i].velocity, prevPos, prevVel);

						//Collision with triangle
						var a2 = areaOfTriangle(particles[i].position, corner2, corner3);
						var a3 = areaOfTriangle(corner1, particles[i].position, corner3);
						var a4 = areaOfTriangle(corner1, corner2, particles[i].position);

						if(a2 + a3 + a4 - a1 >= 0 ) {
							planeCollision(normalOfPlane(corner1,corner2,corner3), corner1, particles[i].position, particles[i].velocity, prevPos, prevVel);
						}

						var tempVec = new THREE.Vector3(0,0,0);
						tempVec.x = prevPos.x - sphere.position.x;
						tempVec.y = prevPos.y - sphere.position.y;
						tempVec.z = prevPos.z - sphere.position.z;


						if(tempVec.dot(tempVec) <= sphereRadius*sphereRadius) {
							var alpha = particles[i].velocity.dot(particles[i].velocity);
							var beta = 2 * particles[i].velocity.dot(tempVec);
							var gamma = sphere.position.dot(sphere.position) + prevPos.dot(prevPos) - 2*prevPos.dot(sphere.position) - sphereRadius*sphereRadius;

							var lambda1 = (-beta + Math.sqrt(beta*beta-4*alpha*gamma))/(2*alpha);
							var lambda2 = (-beta - Math.sqrt(beta*beta-4*alpha*gamma))/(2*alpha);

							if(lambda1 > 0 && lambda1 < 1){
								if(lambda2 > 0 && lambda2 < 1 && lambda2 < lambda1){
									var lambda = lambda2;
								}
								else {
									var lambda = lambda1;
								}
							}
							else {
								var lambda = lambda2;
							}

							var collisionPoint = new THREE.Vector3(0,0,0);
							collisionPoint.x = prevPos.x + lambda*(particles[i].position.x - prevPos.x);
							collisionPoint.y = prevPos.y + lambda*(particles[i].position.y - prevPos.y);
							collisionPoint.z = prevPos.z + lambda*(particles[i].position.z - prevPos.z);

							var normal = new THREE.Vector3(collisionPoint.x - sphere.position.x,collisionPoint.y - sphere.position.y,collisionPoint.z - sphere.position.z);
							normal.normalize();
							var d = -(normal.dot(collisionPoint));

							planeCollision(normal, collisionPoint, particles[i].position, particles[i].velocity, prevPos, prevVel);
						}

            particles[i].lifeLength -= 0.01;
            if(particles[i].lifeLength < 0.0) {
              particles[i].position.x = 0.0;
              particles[i].position.y = 10.0;
              particles[i].position.z = -10.0;

							var waterfall = false;
							particles[i].velocity.y = (waterfall) ?  0 :  15;
              particles[i].velocity.x = Math.random()*3-1;
              particles[i].velocity.z = -5;
              particles[i].lifeLength = 10;
              }
           }
					 requestAnimationFrame(animate);
					 console.log(a1);

	renderer.render(scene, camera);
}

//function to calculate bounce with plane
function planeCollision(n, point, p, v, pp, pv){
	n.normalize();
	var d = -point.dot(n);
	if(p.dot(n) + d <= 0){
		var velocityDot = v.x * n.x + v.y * n.y + v.z * n.z;
		v.x = pv.x - (1 + epsilon) * 2 * velocityDot * n.x;
		v.y = pv.y - (1 + epsilon) * 2 * velocityDot * n.y;
		v.z = pv.z - (1 + epsilon) * 2 * velocityDot * n.z;

		var positionDot = p.x * n.x + p.y * n.y + p.z * n.z;
		p.x = pp.x - (1 + epsilon) * 2 * (positionDot + d) * n.x;
		p.y = pp.y - (1 + epsilon) * 2 * (positionDot + d) * n.y;
		p.z = pp.z - (1 + epsilon) * 2 * (positionDot + d) * n.z;
	}
}

function areaOfTriangle(p1, p2, p3) {
	var ab = new THREE.Vector3(0,0,0);
	var ac = new THREE.Vector3(0,0,0);

	ab.x = p2.x - p1.x;
	ab.y = p2.y - p1.y;
	ab.z = p2.z - p1.z;

	ac.x = p3.x - p1.x;
	ac.y = p3.y - p1.y;
  ac.z = p3.z - p1.z;

	var area = 0.5 * Math.sqrt(Math.pow((ab.y * ac.z - ab.z * ac.y), 2) + Math.pow((ab.z * ac.x - ab.x * ac.z), 2) + Math.pow((ab.x * ac.y - ab.y * ac.x),2));

	return area;
}

function normalOfPlane(p1, p2, p3) {
	var ab = new THREE.Vector3(0,0,0);
	var ac = new THREE.Vector3(0,0,0);

	ab.x = p2.x - p1.x;
	ab.y = p2.y - p1.y;
	ab.z = p2.z - p1.z;

	ac.x = p3.x - p1.x;
	ac.y = p3.y - p1.y;
  ac.z = p3.z - p1.z;

	var normal = new THREE.Vector3(0,0,0);
	normal.crossVectors(ab,ac);

	return normal;
}


function onWindowResize() {
	// Camera frustum aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;
	// After making changes to aspect
	camera.updateProjectionMatrix();
	// Reset size
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

init();
requestAnimationFrame(animate);
