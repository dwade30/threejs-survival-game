import * as THREE from 'three';

export class Campfire {
    constructor(position) {
        this.mesh = this.createCampfireMesh();
        this.mesh.position.copy(position);
        this.mesh.userData.isCampfire = true;
        
        // Add point light for fire effect
        this.light = new THREE.PointLight(0xff6600, 1, 10);
        this.light.position.copy(position);
        this.light.position.y += 0.5;
        
        // Animation properties
        this.initialIntensity = 1;
        this.time = 0;
    }

    createCampfireMesh() {
        const group = new THREE.Group();

        // Create logs (cylinders arranged in a triangle)
        const logGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
        const logMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });

        for (let i = 0; i < 3; i++) {
            const log = new THREE.Mesh(logGeometry, logMaterial);
            log.rotation.z = Math.PI / 2;
            log.rotation.y = (i * Math.PI * 2) / 3;
            log.position.x = Math.cos(i * Math.PI * 2 / 3) * 0.2;
            log.position.z = Math.sin(i * Math.PI * 2 / 3) * 0.2;
            group.add(log);
        }

        // Create fire (cone)
        const fireGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
        const fireMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff6600,
            emissive: 0xff4400,
            transparent: true,
            opacity: 0.8
        });
        const fire = new THREE.Mesh(fireGeometry, fireMaterial);
        fire.position.y = 0.25;
        group.add(fire);

        return group;
    }

    update(deltaTime) {
        this.time += deltaTime;
        
        // Flicker the light intensity
        const flickerSpeed = 10;
        const flickerIntensity = 0.2;
        this.light.intensity = this.initialIntensity + 
            Math.sin(this.time * flickerSpeed) * flickerIntensity;
    }

    remove(scene) {
        scene.remove(this.mesh);
        scene.remove(this.light);
    }
}