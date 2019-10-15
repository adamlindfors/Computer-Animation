let camera, scene, renderer, controls;
let gravity = -9.82;
var particleCount = 1000;
var particleRadius, sphereRadius;
var mass = 0.5;
var particles = [];
var sphere;
var waterfall;
let then = 0;
let epsilon = 0.9;
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
  var planeGeometry = new THREE.PlaneGeometry( 20, 20, 1, 1 );
  var planeMaterial = new THREE.MeshPhongMaterial( {
		color: 0xFFFFFF,
		side: THREE.DoubleSide,
		opacity: 0.2,
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
  const particleGeometry = new THREE.SphereGeometry(particleRadius, 6, 6);
  const particleMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });

  for(var i = 0; i < particleCount; i++) {
    particles[i] = new THREE.Mesh(particleGeometry, particleMaterial);
		//particles[i] = new THREE.Points();

    particles[i].position.x = 0.0;
    particles[i].position.y = 10.0;
    particles[i].position.z = -10.0;

		particles[i].prevPos = new THREE.Vector3(0,0,0);

		particles[i].initVelocity = new THREE.Vector3(Math.random()*2-1, 0, Math.random()*2-1);

		particles[i].prevPos.x = particles[i].position.x - 0.01 * particles[i].initVelocity.x;
		particles[i].prevPos.y = particles[i].position.y - 0.01 * particles[i].initVelocity.y;
		particles[i].prevPos.z = particles[i].position.z - 0.01 * particles[i].initVelocity.z;

    particles[i].velocity = new THREE.Vector3(0,0,0);

		var waterfall = false;
		particles[i].velocity.y = 0;
		particles[i].velocity.x = 0;
		particles[i].velocity.z = 0;

    particles[i].lifeLength = Math.random();

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

//console.log(particles[i].velocity);
		//euler(particles[i].position, particles[i].velocity, particles[i].prevPos, delta);
		verlet(particles[i].position, particles[i].prevPos, particles[i].velocity, delta);

		//console.log(particles[i].velocity);
		// y = 0
		planeCollision(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), particles[i].position, particles[i].velocity, particles[i].prevPos, delta);
		// z = 0
		planeCollision(new THREE.Vector3(0,0,-1), new THREE.Vector3(0,0,0), particles[i].position, particles[i].velocity, particles[i].prevPos, delta);
		// z = -20
		planeCollision(new THREE.Vector3(0,0,1), new THREE.Vector3(0,0,-20), particles[i].position, particles[i].velocity, particles[i].prevPos, delta);
		// x = 10
		planeCollision(new THREE.Vector3(-1,0,0), new THREE.Vector3(10,0,0), particles[i].position, particles[i].velocity, particles[i].prevPos, delta);
		// x = -10
		planeCollision(new THREE.Vector3(1,0,0), new THREE.Vector3(-10,0,0), particles[i].position, particles[i].velocity, particles[i].prevPos, delta);

		//Collision with triangle
		var a2 = areaOfTriangle(particles[i].position, corner2, corner3);
		var a3 = areaOfTriangle(corner1, particles[i].position, corner3);
		var a4 = areaOfTriangle(corner1, corner2, particles[i].position);

		if(a2 + a3 + a4 - a1 >= 0 ) {
			planeCollision(normalOfPlane(corner1,corner2,corner3), corner1, particles[i].position, particles[i].velocity, particles[i].prevPos, delta);
		}

		var tempVec = new THREE.Vector3(0,0,0);
		tempVec.x = particles[i].position.x - sphere.position.x;
		tempVec.y = particles[i].position.y - sphere.position.y;
		tempVec.z = particles[i].position.z - sphere.position.z;

		if(tempVec.dot(tempVec) <= sphereRadius*sphereRadius + 0.0001) {
			var v = new THREE.Vector3(0,0,0);
			v.x = particles[i].position.x - particles[i].prevPos.x;
			v.x = particles[i].position.y - particles[i].prevPos.y;
			v.x = particles[i].position.z - particles[i].prevPos.z;

			var tempVec2 = new THREE.Vector3(0,0,0);
			tempVec.x = particles[i].prevPos.x - sphere.position.x;
			tempVec.y = particles[i].prevPos.y - sphere.position.y;
			tempVec.z = particles[i].prevPos.z - sphere.position.z;

			var alpha = particles[i].velocity.dot(particles[i].velocity);
			var beta = 2 * particles[i].velocity.dot(tempVec);
			var gamma = sphere.position.dot(sphere.position) + particles[i].prevPos.dot(particles[i].prevPos) - 2 * particles[i].prevPos.dot(sphere.position) - sphereRadius*sphereRadius;

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
			collisionPoint.x = particles[i].position.x + lambda*(particles[i].prevPos.x - particles[i].position.x);
			collisionPoint.y = particles[i].position.y + lambda*(particles[i].prevPos.y - particles[i].position.y);
			collisionPoint.z = particles[i].position.z + lambda*(particles[i].prevPos.z - particles[i].position.z);

			var normal = new THREE.Vector3(collisionPoint.x - sphere.position.x,collisionPoint.y - sphere.position.y,collisionPoint.z - sphere.position.z);
			//normal.normalize();
			//console.log(lambda);
			planeCollision(normal, collisionPoint, particles[i].position, particles[i].velocity, particles[i].prevPos, delta);

		}


    particles[i].lifeLength -= 0.01;
    if(particles[i].lifeLength < 0.0) {
      particles[i].position.x = 0.0;
      particles[i].position.y = 10.0;
      particles[i].position.z = -10;

			// if true -> waterfall, if false -> fountain
			particles[i].velocity.y = 0;
      particles[i].velocity.x = (Math.random()*2-1) * 2;
      particles[i].velocity.z = (Math.random()*2-1) * 2;

			particles[i].prevPos.x = particles[i].position.x - delta * particles[i].initVelocity.x;
			particles[i].prevPos.y = particles[i].position.y - delta * particles[i].initVelocity.y;
			particles[i].prevPos.z = particles[i].position.z - delta * particles[i].initVelocity.z;
      particles[i].lifeLength = Math.random()*10;
      }
   }
	requestAnimationFrame(animate);

	renderer.render(scene, camera);
}

//function to calculate bounce with plane
function planeCollision(n, point, p, v, pp, delta){
	n.normalize();
	var d = -point.dot(n);
	if(p.dot(n) + d <= 0){
		var velocityDot = v.x * n.x + v.y * n.y + v.z * n.z;
		v.x = v.x - (1 + epsilon) * velocityDot * n.x;
		v.y = v.y - (1 + epsilon) * velocityDot * n.y;
		v.z = v.z - (1 + epsilon) * velocityDot * n.z;

		var positionDot = p.x * n.x + p.y * n.y + p.z * n.z;
		p.x = p.x - (1 + epsilon) * (positionDot + d) * n.x;
		p.y = p.y - (1 + epsilon) * (positionDot + d) * n.y;
		p.z = p.z - (1 + epsilon) * (positionDot + d) * n.z;
		//
		var positionpDot = pp.x * n.x + pp.y * n.y + pp.z * n.z;
		pp.x = pp.x - (1 + epsilon) * (positionpDot + d) * n.x;
		pp.y = pp.y - (1 + epsilon) * (positionpDot + d) * n.y;
		pp.z = pp.z - (1 + epsilon) * (positionpDot + d) * n.z;

		// pp.x = p.x - delta * v.x;
		// pp.y = p.y - delta * v.y;
		// pp.z = p.z - delta * v.z;
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

function  euler(p, v, pp, dt) {
	v.x = v.x;
	v.y = v.y + dt * (gravity/mass);
	v.z = v.z;

	pp.x = p.x;
	pp.y = p.y;
	pp.z = p.z;

	p.x = p.x + dt * v.x;
	p.y = p.y + dt * v.y;
	p.z = p.z + dt * v.z;
}

function verlet(p, pp, v, dt){

		var temp = new THREE.Vector3(0,0,0);
		temp.x = p.x;
		temp.y = p.y;
		temp.z = p.z;

		p.x = p.x * 2 - pp.x;
		p.y = p.y * 2 - pp.y + (gravity/mass)*dt*dt;
		p.z = p.z * 2 - pp.z;

		pp.x = temp.x;
		pp.y = temp.y;
		pp.z = temp.z;

		v.x = (p.x - pp.x)/dt;
		v.y = (p.y - pp.y)/dt;
		v.z = (p.z - pp.z)/dt;
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
