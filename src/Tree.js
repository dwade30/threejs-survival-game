import * as THREE from 'three';

export class Tree {
    constructor(position) {
        this.mesh = this.createTreeMesh();
        this.mesh.position.copy(position);
        this.mesh.userData.isTree = true;
        
        // Enable shadows for all parts of the tree
        this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    createTreeMesh() {
        // Create tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

        // Create multiple layers of leaves
        const leavesGroup = new THREE.Group();
        const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x228B22,
            roughness: 0.8,
            metalness: 0.1
        });

        // Create three layers of leaves
        for (let i = 0; i < 3; i++) {
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 2 + i * 0.7;
            leaves.scale.setScalar(1 - i * 0.2); // Each layer gets slightly smaller
            leavesGroup.add(leaves);
        }

        // Group trunk and leaves
        const treeGroup = new THREE.Group();
        treeGroup.add(trunk);
        treeGroup.add(leavesGroup);

        // Add some random rotation to make trees look different
        treeGroup.rotation.y = Math.random() * Math.PI * 2;
        
        return treeGroup;
    }

    remove(scene) {
        scene.remove(this.mesh);
    }
}