import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class Player {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.moveSpeed = 0.15;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        // Create player model
        this.createPlayerModel();
        
        // Setup third-person camera
        this.setupCamera();
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        
        this.setupEventListeners();
    }

    createPlayerModel() {
        // Create a simple character model
        const geometry = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x4444ff });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        geometry.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.3;
        geometry.add(head);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0x4444ff });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.4, 0.8, 0);
        leftArm.rotation.z = -Math.PI / 6;
        geometry.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.4, 0.8, 0);
        rightArm.rotation.z = Math.PI / 6;
        geometry.add(rightArm);

        this.model = geometry;
        this.model.position.y = 0;
        scene.add(this.model);
    }

    setupCamera() {
        // Position camera behind player
        this.camera.position.set(0, 3, 5);
        
        // Create orbit controls
        this.controls = new OrbitControls(this.camera, document.body);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Limit vertical rotation
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minPolarAngle = 0;
        
        // Set target to player position
        this.controls.target.copy(this.model.position);
        this.controls.target.y = 1;
        
        // Disable panning
        this.controls.enablePan = false;
        
        // Set min/max distance
        this.controls.minDistance = 3;
        this.controls.maxDistance = 10;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = true;
                break;
            case 'KeyS':
                this.moveBackward = true;
                break;
            case 'KeyA':
                this.moveLeft = true;
                break;
            case 'KeyD':
                this.moveRight = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
                this.moveForward = false;
                break;
            case 'KeyS':
                this.moveBackward = false;
                break;
            case 'KeyA':
                this.moveLeft = false;
                break;
            case 'KeyD':
                this.moveRight = false;
                break;
        }
    }

    update() {
        // Update controls
        this.controls.update();

        // Calculate movement direction relative to camera
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        const cameraAngle = Math.atan2(cameraDirection.x, cameraDirection.z);

        // Reset velocity
        this.velocity.x = 0;
        this.velocity.z = 0;

        // Calculate movement based on camera angle
        if (this.moveForward) {
            this.velocity.x += Math.sin(cameraAngle) * this.moveSpeed;
            this.velocity.z += Math.cos(cameraAngle) * this.moveSpeed;
        }
        if (this.moveBackward) {
            this.velocity.x -= Math.sin(cameraAngle) * this.moveSpeed;
            this.velocity.z -= Math.cos(cameraAngle) * this.moveSpeed;
        }
        if (this.moveRight) {
            this.velocity.x += Math.sin(cameraAngle + Math.PI/2) * this.moveSpeed;
            this.velocity.z += Math.cos(cameraAngle + Math.PI/2) * this.moveSpeed;
        }
        if (this.moveLeft) {
            this.velocity.x += Math.sin(cameraAngle - Math.PI/2) * this.moveSpeed;
            this.velocity.z += Math.cos(cameraAngle - Math.PI/2) * this.moveSpeed;
        }

        // Update player position
        this.model.position.x += this.velocity.x;
        this.model.position.z += this.velocity.z;

        // Rotate player model to face movement direction
        if (this.velocity.x !== 0 || this.velocity.z !== 0) {
            const angle = Math.atan2(this.velocity.x, this.velocity.z);
            this.model.rotation.y = angle;
        }

        // Update camera target
        this.controls.target.copy(this.model.position);
        this.controls.target.y = 1;
    }

    getPosition() {
        return this.model.position;
    }
}