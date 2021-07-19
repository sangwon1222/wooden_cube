import * as THREE from "three";

const skillList = ["speedUp", "speedDown"];

export class Item extends THREE.Mesh {
  private mSkill: string;
  get skill(): string {
    return this.mSkill;
  }
  set setScale(v: number) {
    this.mSkill == "speedUp"
      ? this.geometry.scale(1 - v / 10, 1 - v / 10, 1 - v / 10)
      : this.geometry.scale(v, v, v);
    console.log(v);
  }
  constructor(geoScale: number) {
    super();
    let color = 0xffffff;
    const random = Math.floor(Math.random() * skillList.length);
    console.log(random);
    this.mSkill = skillList[random];
    if (this.mSkill == "speedUp") {
      color = 0xe9ef8a;
      this.geometry = new THREE.CylinderGeometry(0.1, 0.5, 0.1, 24, 1);
    } else if (this.mSkill == "speedDown") {
      this.geometry = new THREE.IcosahedronGeometry(0.5, 0);
      // this.geometry.scale(2, 2, 2);
      color = 0xff0000;
    }

    // this.geometry = new THREE.BoxGeometry(geoScale, geoScale, geoScale);
    this.material = new THREE.MeshPhongMaterial({ color: color });
    this.castShadow = true;
    this.receiveShadow = true;
    // this.receiveShadow = false; //default
  }

  move() {
    this.rotation.x += 0.01;
    this.rotation.y += 0.01;
    this.rotation.z -= 0.01;
    // this.rotateX(-Math.PI / 180);
  }
  update() {
    //
  }
}
