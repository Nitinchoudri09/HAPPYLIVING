// 3D Background Scene for Happy Living

document.addEventListener("DOMContentLoaded", () => {
    // 1. Setup Scene, Camera, Renderer
    const canvas = document.querySelector('#bg-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.03);

    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.z = 8;
    camera.position.y = 2;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 2. Objects
    const group = new THREE.Group();
    scene.add(group);

    // Floating central object (Icosahedron)
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0x4f46e5, // Indigo 600
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    group.add(sphere);

    // Particles/Stars
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;

    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        // Spread particles out randomly in space
        posArray[i] = (Math.random() - 0.5) * 40;

        // Setup colors based on our theme
        if (i % 3 === 0) {
            colorArray[i] = 79 / 255;   // r (matches #4F46E5)
            colorArray[i + 1] = 70 / 255; // g
            colorArray[i + 2] = 229 / 255;// b
        } else if (i % 3 === 1) {
            colorArray[i] = 251 / 255;  // r (matches #FB7185)
            colorArray[i + 1] = 113 / 255;// g
            colorArray[i + 2] = 133 / 255;// b
        } else {
            colorArray[i] = 241 / 255;  // r (light tint)
            colorArray[i + 1] = 245 / 255;// g
            colorArray[i + 2] = 249 / 255;// b
        }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4f46e5, 2);
    pointLight.position.set(2, 3, 4);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xfb7185, 2);
    pointLight2.position.set(-2, -3, -4);
    scene.add(pointLight2);

    // 4. Interaction & Resizing
    window.addEventListener('resize', () => {
        sizes.width = window.innerWidth;
        sizes.height = window.innerHeight;

        camera.aspect = sizes.width / sizes.height;
        camera.updateProjectionMatrix();

        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // 5. Animation Loop
    const clock = new THREE.Clock();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // Animate Group
        group.rotation.y = elapsedTime * 0.1;
        group.rotation.z = elapsedTime * 0.05;

        // Floating effect
        group.position.y = Math.sin(elapsedTime * 0.5) * 0.5;

        // Animate Particles
        particlesMesh.rotation.y = -elapsedTime * 0.02;
        particlesMesh.position.y = elapsedTime * 0.2; // Slowly moving up

        // Wrap particles
        if (particlesMesh.position.y > 10) {
            particlesMesh.position.y = -10;
        }

        // Mouse interaction
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Smooth mouse follow
        group.rotation.x += 0.05 * (targetY - group.rotation.x);
        group.rotation.y += 0.05 * (targetX - group.rotation.y);

        particlesMesh.rotation.x += 0.02 * (targetY - particlesMesh.rotation.x);
        particlesMesh.rotation.y += 0.02 * (targetX - particlesMesh.rotation.y);

        // Scroll interaction - shift camera down slightly on scroll
        const scrollY = window.scrollY;
        camera.position.y = 2 - (scrollY / window.innerHeight) * 3;

        // Render
        renderer.render(scene, camera);

        window.requestAnimationFrame(tick);
    };

    tick();
});
