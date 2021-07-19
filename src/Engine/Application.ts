import * as THREE from "three";
import gsap, { random } from "gsap";
import { Cube } from "./Cube";
import { Car } from "./Car";
import { Map } from "./Map";
import { Light } from "./Light";
import { Camera } from "./Camera";
import { Power0 } from "gsap/all";
import { Item } from "./item";
import { shuffleArray } from "../assets/utill";

let gApp: Application = null;

function _mainLoop() {
  if (gApp) {
    gApp.mainloop();
  }
  requestAnimationFrame(_mainLoop);
}

export class Application {
  private mScene: THREE.Scene;
  private mCamera: Camera;
  private mRenderer: THREE.Renderer;

  private mDirectionalLight: THREE.Light;
  private mCube: Array<THREE.Mesh>;
  private mCar: THREE.Mesh;

  private mClearBoxCnt: number;
  private mItemAry: Array<Item>;

  private mKeyPressMap: any = [];
  private mJumpFlag = true;

  private mSpeed: number;

  private mLight: THREE.DirectionalLight;

  constructor() {
    //
    gApp = this;
    this.mClearBoxCnt = 0;
    this.mItemAry = [];
    this.mSpeed = 0.05;

    window.addEventListener("keydown", (evt) => {
      this.mKeyPressMap[evt.key] = true;
    });
    window.addEventListener("keyup", (evt) => {
      this.mKeyPressMap[evt.key] = false;
    });

    window.addEventListener("mousewheel", (delta: WheelEvent) => {
      if (delta.deltaY > 0) {
        /**마우스 휠 위에서 아래로 */
        // this.mCamera.changeFov(-1);
        // this.mCamera.position.z -= 1;
        this.mCamera.position.z < 9 ? null : (this.mCamera.position.z -= 1);
      } else {
        /**마우스 휠 아래서 위로 */
        // this.mCamera.changeFov(1);
        // this.mCamera.position.z += 1;
        this.mCamera.position.z > 19 ? null : (this.mCamera.position.z += 1);
      }
      this.mCamera.lookAt(new THREE.Vector3(0, 3, 0));
    });

    let rotationFlag = false;
    let pos = [0, 0];
    window.addEventListener("pointerdown", (delta: PointerEvent) => {
      pos = [delta.clientX, delta.clientY];
      rotationFlag = true;
    });

    window.addEventListener("pointermove", (delta: PointerEvent) => {
      if (!rotationFlag || !this.mCamera) {
        return;
      }
      const moveValue =
        this.mCamera.position.x - (delta.clientX - pos[0]) * 0.01;

      if (moveValue < -3) {
        pos = [delta.clientX, delta.clientY];
        return;
      } else if (moveValue > 1.6) {
        pos = [delta.clientX, delta.clientY];
        return;
      } else {
        this.mCamera.position.x -= (delta.clientX - pos[0]) * 0.01;
      }
      pos = [delta.clientX, delta.clientY];
      // this.mCamera.position.y -= (delta.clientY - pos[1]) * 0.01;

      this.mCamera.lookAt(new THREE.Vector3(0, 3, 0));
    });

    window.addEventListener("pointerup", (delta: PointerEvent) => {
      pos = [delta.clientX, delta.clientY];
      rotationFlag = false;
    });
  }

  updateProc() {
    if (this.mCube) {
      for (let i = 0; i < this.mCube.length; i++) {
        this.mCube[i].rotation.x += 0.01;
        this.mCube[i].rotation.y += 0.01;
        if (this.mItemAry.length !== 0) {
          for (const item of this.mItemAry) {
            if (item.move) {
              item.move();
            }
          }
        }
      }
      this.checkKey();
      this.collisionCheck();
    }
  }

  renderProc() {
    if (this.mRenderer && this.mScene && this.mCamera)
      this.mRenderer.render(this.mScene, this.mCamera);
  }

  mainloop() {
    // console.log("->");
    this.updateProc();
    this.renderProc();
  }

  start(canvas: HTMLCanvasElement) {
    this.mScene = new THREE.Scene();
    this.mScene.background = new THREE.Color(0xcce0ff);
    // this.mDirectionalLight = new Light(`direct`, 0.5, 0xffffff);
    // this.mDirectionalLight.position.set(0, 0, 100);
    // this.mScene.add(this.mDirectionalLight);
    // this.mLight = new THREE.DirectionalLight(0xdfebff, 1);
    this.mLight = new THREE.DirectionalLight(0xffd399, 0.5);
    this.mLight.position.set(10, -10, 20);
    // this.mLight.position.multiplyScalar(1.3);
    this.mLight.position.multiplyScalar(0.8);
    this.mLight.castShadow = true;

    // gsap
    //   .to(this.mLight.position, {
    //     x: 0,
    //     z: 10,
    //     duration: 10,
    //     ease: Power0.easeNone,
    //   })
    //   .repeat(-1)
    //   .yoyo(true);

    this.mLight.shadow.mapSize.width = 1280;
    this.mLight.shadow.mapSize.height = 1280;

    const d = 10;
    this.mLight.shadow.camera.left = -d;
    this.mLight.shadow.camera.right = d;
    this.mLight.shadow.camera.top = d;
    this.mLight.shadow.camera.bottom = -d;

    this.mLight.shadow.camera.far = 100;

    this.mScene.add(this.mLight);

    const light1 = new THREE.DirectionalLight(0xffd399, 0.5);
    light1.position.set(-20, 0, 0);
    light1.position.multiplyScalar(0.8);
    const light2 = new THREE.DirectionalLight(0xffd399, 0.4);
    light2.position.set(20, 0, 0);
    light2.position.multiplyScalar(0.8);
    const light3 = new THREE.DirectionalLight(0xffd399, 0.5);
    light3.position.set(0, -10, 0);
    light3.position.multiplyScalar(0.8);

    this.mScene.add(light1, light2, light3);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas });
    this.mRenderer = renderer;
    this.mRenderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    renderer.setClearColor(0xcccccc);

    // const light = new Light("spot", 0xffffff, 0.5);
    // light.position.set(0, 0, 5);
    // this.mScene.add(light);

    this.mCube = [];
    const delay = [];
    for (let i = 0; i < 15; i++) {
      delay.push(i + 1);
    }
    const delayAry = shuffleArray(delay);
    for (let i = 0; i < 15; i++) {
      const cube = new Cube(0.5, 0x00fff0);
      let le = "+";
      let up = "+";
      const random1 = Math.floor(Math.random() * 2);
      const random2 = Math.floor(Math.random() * 2);
      random1 == 0 ? (le = "+") : (le = "-");
      random2 == 0 ? (up = "+") : (up = "-");
      const x = +`${le}${Math.ceil(Math.random() * 4)}`;
      const y = +`${up}${Math.ceil(Math.random() * 4)}`;
      cube.position.set(x, y, 1);
      this.mCube.push(cube);
      this.mScene.add(cube);
      this.mCube[i].visible = false;

      gsap.delayedCall(delayAry[i], () => {
        this.mCube[i].visible = true;
      });
    }

    this.mCar = new Car(0.5, 0xff0000);
    this.mCar.position.set(0, 0, 0.25);
    this.mScene.add(this.mCar);

    this.mCamera = new Camera();

    this.mCamera.position.y = -10;
    this.mCamera.position.z = 10;
    this.mCamera.lookAt(new THREE.Vector3(0, 3, 0));

    const mapTile = new Map(15, 0xffffff);

    this.mScene.add(mapTile);

    _mainLoop();
  }

  isKeyDown(key: string) {
    if (this.mKeyPressMap[key] === undefined) {
      return false;
    }
    return this.mKeyPressMap[key] == true;
  }

  checkKey() {
    if (this.isKeyDown(`a`)) {
      const moveV = this.mCar.position.x - this.mSpeed;
      if (moveV < -4.7) {
        return;
      }
      this.mCar.position.x -= this.mSpeed;
    }
    if (this.isKeyDown(`d`)) {
      const moveV = this.mCar.position.x + this.mSpeed;
      if (moveV > 4.7) {
        return;
      }
      this.mCar.position.x += this.mSpeed;
    }
    if (this.isKeyDown(`w`)) {
      const moveV = this.mCar.position.y + this.mSpeed;
      if (moveV > 4.7) {
        return;
      }
      this.mCar.position.y += this.mSpeed;
    }
    if (this.isKeyDown(`s`)) {
      const moveV = this.mCar.position.y - this.mSpeed;
      if (moveV < -4.7) {
        return;
      }
      this.mCar.position.y -= this.mSpeed;
    }

    if (this.isKeyDown(` `)) {
      if (this.mJumpFlag) {
        this.mJumpFlag = false;
        this.jumpMotion();
      }
    }
    if (this.isKeyDown(`r`)) {
      this.mCar.position.x = 0;
      this.mCar.position.y = 0;
      this.mCamera.position.x = 0;
      this.mCamera.position.y = -15;
      this.mCamera.position.z = 10;
      this.mCamera.lookAt(new THREE.Vector3(0, 3, 0));
    }
  }

  jumpMotion() {
    const jump = Math.ceil(this.mSpeed * 10);
    gsap
      .to(this.mCar.position, { z: jump, duration: this.mSpeed * 2 })
      .yoyo(true)
      .repeat(1)
      .eventCallback("onComplete", () => {
        this.mJumpFlag = true;
      });
  }

  collisionCheck() {
    const carBound = new THREE.Box3().setFromObject(this.mCar);
    for (let i = 0; i < this.mCube.length; i++) {
      const cubeBound = new THREE.Box3().setFromObject(this.mCube[i]);
      if (carBound.intersectsBox(cubeBound)) {
        this.mClearBoxCnt += 1;

        this.mCube[i].visible = false;

        this.mCube[i].position.set(this.randomPos().x, this.randomPos().y, 1);
        if (this.mClearBoxCnt % 5 == 0) {
          const item = new Item(0.3);
          item.position.set(this.randomPos().x, this.randomPos().y, 10);
          gsap.to(item.position, {
            x: this.randomPos().x,
            y: this.randomPos().y,
            z: 1,
            duration: 1,
          });
          if (this.mClearBoxCnt % 10 == 0) {
            item.setScale = Math.floor(this.mClearBoxCnt / 10) + 1;
          }
          this.mScene.add(item);
          this.mItemAry.push(item);
        }
        const delay = Math.ceil(Math.random() * 5);
        gsap.delayedCall(delay, () => {
          this.mCube[i].visible = true;
        });
      }
    }
    if (this.mItemAry.length > 0) {
      for (const item of this.mItemAry) {
        const itemBound = new THREE.Box3().setFromObject(item);
        if (carBound.intersectsBox(itemBound)) {
          this.mItemAry.splice(this.mItemAry.indexOf(item), 1);
          this.mScene.remove(item);
          if (item.skill == "speedUp") {
            // this.mSpeed > 2 ? null : (this.mSpeed += 0.02);
            this.mSpeed += 0.04;
          } else if (item.skill == "speedDown") {
            this.mSpeed <= 0.1 ? null : (this.mSpeed -= 0.08);
            // this.mSpeed -= 0.02;
          }
        }
      }
    }
  }

  randomPos(): { x: number; y: number } {
    let le = "+";
    let up = "+";
    const random1 = Math.floor(Math.random() * 2);
    const random2 = Math.floor(Math.random() * 2);
    random1 == 0 ? (le = "+") : (le = "-");
    random2 == 0 ? (up = "+") : (up = "-");
    const x = +`${le}${Math.ceil(Math.random() * 4)}`;
    const y = +`${up}${Math.ceil(Math.random() * 4)}`;

    return { x, y };
  }
}
