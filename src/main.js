import * as THREE from 'three';
import { Player } from './Player.js';
import { Tree } from './Tree.js';
import { Campfire } from './Campfire.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.clock = new THREE.Clock();
        
        this.trees = [];
        this.campfires = [];
        this.woodCount = 0;
        
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // Add sky
        this.addSky();
        
        // Add terrain
        this.addTerrain();

        // Create player
        this.player = new Player(this.camera, this.scene);

        // Add lights
        this.setupLights();

        // Add trees
        this.createTrees();

        // Setup event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('click', (event) => this.onMouseClick(event));
        window.addEventListener('keydown', (event) => this.onKeyDown(event));

        // Start animation loop
        this.animate();
    }

    addSky() {
        // Create sky using a large sphere
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB, // Light blue
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);

        // Add sun
        const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(100, 100, -100);
        this.scene.add(sun);
    }

    addTerrain() {
        const size = 100;
        const resolution = 128;
        const geometry = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
        
        // Generate terrain height using Simplex noise
        const noise = new SimplexNoise();
        const vertices = geometry.attributes.position.array;
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const z = vertices[i + 2];
            
            // Generate multiple layers of noise for more interesting terrain
            let height = 0;
            height += noise.noise(x * 0.02, z * 0.02) * 2;
            height += noise.noise(x * 0.1, z * 0.1) * 0.5;
            
            vertices[i + 1] = height;
        }

        geometry.computeVertexNormals();
        
        // Create terrain material with grass texture
        const material = new THREE.MeshStandardMaterial({
            color: 0x3a5a40,
            roughness: 0.8,
            metalness: 0.2,
        });

        const terrain = new THREE.Mesh(geometry, material);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        this.scene.add(terrain);
        
        // Store terrain reference for collision detection
        this.terrain = terrain;
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 100, -100);
        directionalLight.castShadow = true;
        
        // Adjust shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        
        this.scene.add(directionalLight);
    }

    createTrees() {
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;
            
            // Get height at this position
            const raycaster = new THREE.Raycaster();
            raycaster.set(
                new THREE.Vector3(x, 100, z),
                new THREE.Vector3(0, -1, 0)
            );
            const intersects = raycaster.intersectObject(this.terrain);
            
            if (intersects.length > 0) {
                const y = intersects[0].point.y;
                const tree = new Tree(new THREE.Vector3(x, y, z));
                this.trees.push(tree);
                this.scene.add(tree.mesh);
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseClick(event) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        for (const intersect of intersects) {
            const object = intersect.object;
            if (object.parent && object.parent.userData.isTree) {
                const treeIndex = this.trees.findIndex(tree => tree.mesh === object.parent);
                if (treeIndex !== -1) {
                    // Remove tree and add wood
                    const tree = this.trees[treeIndex];
                    tree.remove(this.scene);
                    this.trees.splice(treeIndex, 1);
                    this.woodCount++;
                    
                    // Update UI
                    document.getElementById('inventory').textContent = `Wood: ${this.woodCount}`;
                    
                    // Show crafting hint if enough wood
                    if (this.woodCount >= 5) {
                        document.getElementById('craftingHint').style.display = 'block';
                    }
                    
                    break;
                }
            }
        }
    }

    onKeyDown(event) {
        if (event.code === 'KeyC' && this.woodCount >= 5) {
            const position = this.player.getPosition().clone();
            
            // Get height at this position
            const raycaster = new THREE.Raycaster();
            raycaster.set(
                new THREE.Vector3(position.x, 100, position.z),
                new THREE.Vector3(0, -1, 0)
            );
            const intersects = raycaster.intersectObject(this.terrain);
            
            if (intersects.length > 0) {
                position.y = intersects[0].point.y;
                
                const campfire = new Campfire(position);
                this.campfires.push(campfire);
                this.scene.add(campfire.mesh);
                this.scene.add(campfire.light);
                
                // Reduce wood count
                this.woodCount -= 5;
                document.getElementById('inventory').textContent = `Wood: ${this.woodCount}`;
                
                // Hide crafting hint if not enough wood
                if (this.woodCount < 5) {
                    document.getElementById('craftingHint').style.display = 'none';
                }
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        
        // Update player
        this.player.update();
        
        // Update campfires
        for (const campfire of this.campfires) {
            campfire.update(deltaTime);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
new Game();