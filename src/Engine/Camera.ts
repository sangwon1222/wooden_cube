import * as THREE from "three";

export class Camera extends THREE.PerspectiveCamera {
  constructor() {
    super();

    if (this.fov > 160) {
      this.fov = 160;
    }
    if (this.fov < 10) {
      this.fov = 10;
    }
  }
  changeFov(changeValue: number) {
    this.fov += changeValue;
    console.log(this.fov);
  }
}
