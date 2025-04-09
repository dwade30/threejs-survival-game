import * as THREE from 'three';
import { Player } from './Player.js';
import { Tree } from './Tree.js';
import { Campfire } from './Campfire.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
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
        document.body.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.y = 1.6; // Average human height
        
        // Create player
        this.player = new Player(this.camera, this.scene);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x3a5a40 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add trees
        this.createTrees();

        // Setup event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('click', (event) => this.onMouseClick(event));
        window.addEventListener('keydown', (event) => this.onKeyDown(event));

        // Start animation loop
        this.animate();
    }

    createTrees() {
        for (let i = 0; i < 10; i++) {
            const x = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            const tree = new Tree(new THREE.Vector3(x, 0, z));
            this.trees.push(tree);
            this.scene.add(tree.mesh);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseClick(event) {
        if (!this.player.controls.isLocked) return;

        const raycaster = new THREE.Raycaster();
        const center = new THREE.Vector2(0, 0);
        
        raycaster.setFromCamera(center, this.camera);
        
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
            // Create campfire at player's position
            const position = this.player.getPosition().clone();
            position.y = 0;
            
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