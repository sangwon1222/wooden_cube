import * as THREE from "three";

export class Cube extends THREE.Mesh {
  constructor(geoScale: number, color: number) {
    super();
    this.geometry = new THREE.BoxGeometry(geoScale, geoScale, geoScale);
    this.material = new THREE.MeshPhongMaterial({ color: color });
    this.castShadow = true;
    this.receiveShadow = true;
    // this.receiveShadow = false; //default
  }
  update() {
    //
  }
}
