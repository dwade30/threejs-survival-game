import * as THREE from 'three';

export class Tree {
    constructor(position) {
        this.mesh = this.createTreeMesh();
        this.mesh.position.copy(position);
        this.mesh.userData.isTree = true;
    }

    createTreeMesh() {
        // Create tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

        // Create tree top (leaves)
        const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
        const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 2;

        // Group trunk and leaves
        const treeGroup = new THREE.Group();
        treeGroup.add(trunk);
        treeGroup.add(leaves);

        return treeGroup;
    }

    remove(scene) {
        scene.remove(this.mesh);
    }
}