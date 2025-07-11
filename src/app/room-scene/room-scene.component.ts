import { isPlatformBrowser } from '@angular/common';
import { 
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Import GLTFLoader
import { ConfigService } from '../config.service';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
// import { NodeMaterial, color, float, texture, vec2 } from 'three';



@Component({
  selector: 'app-room-scene',
  standalone: true, // Mark as a standalone component
  templateUrl: './room-scene.component.html',
  styleUrls: ['./room-scene.component.css'],
})
export class RoomSceneComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly dialog = inject(MatDialog);
  @ViewChild('rendererCanvas') private rendererCanvas!: ElementRef<HTMLCanvasElement>;
  renderer: THREE.WebGLRenderer | null = null;
  scene: THREE.Scene | null = null;
  camera: THREE.PerspectiveCamera | null = null;
  cameraControls: OrbitControls | null = null;
  animationFrameId: number | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private glbModel!: THREE.Group | null; // To store the loaded GLB model
  private isIntersectingGLB = false; // Flag to track if mouse is over the GLB
  

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private config: ConfigService) { 
    this.config.$currentItem.subscribe((value: any)=> {
        console.log(value);
        if (this.glbModel) {
          this.scene?.remove(this.glbModel);
          // Important: Remove the reference to the object if you no longer need it
          this.glbModel = null;
        }
        this.loadGlb(value);
    });

    // for wall comm
    this.config.$currentWall.subscribe((value: any)=> {
        console.log(value);

        let valWall = (value == 'green') ? 0x188038 : (value == 'white') ? 0xffffff : (value == 'pink') ?  0xc90076 : (value == 'brown') ?  0x744700 : 0xa60000;
        const planeGeo = new THREE.PlaneGeometry(200, 200.1);

        // 0x7f7fff 
        const planeBack = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: valWall }));
        planeBack.position.z = -100;
        planeBack.position.y = 50;
        this.scene?.add(planeBack);

        // 0x00ff00
        const planeFront = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: valWall  }));
        planeFront.position.z = 100;
        planeFront.position.y = 50;
        planeFront.rotateX(-Math.PI);
        this.scene?.add(planeFront);

        // 0x00ff00
        const planeRight = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: valWall }));
        planeRight.position.x = 100;
        planeRight.position.y = 50;
        planeRight.rotateY(-Math.PI / 2);
        this.scene?.add(planeRight);

        // 0x00ff00
        const planeLeft = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: valWall }));
        planeLeft.position.x = -100;
        planeLeft.position.y = 50;
        planeLeft.rotateY(Math.PI / 2);
        this.scene?.add(planeLeft);
    });
  }

  ngOnInit(): void {
    // Any initialization logic that doesn't depend on the DOM
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      await this.init();
      this.animate();
    }
  }

  onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  async init(): Promise<void> {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 500);
    this.camera.position.set(0, 0, 0);

    const loader = new THREE.TextureLoader();
    const floorNormal = await loader.loadAsync('/FloorsCheckerboard_S_Normal.jpg');
    floorNormal.wrapS = THREE.RepeatWrapping;
    floorNormal.wrapT = THREE.RepeatWrapping;

    const verticalNormalScale = 0.1;
    // Note: TSL nodes might need a different approach in a standard WebGL/WebGPU renderer setup
    // You might need to create a custom shader material for this refraction effect
    const planeGeo = new THREE.PlaneGeometry(200, 200.1);

    const planeTop = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0x188038 }));
    planeTop.position.y = 150;
    planeTop.rotateX(Math.PI / 2);
    this.scene.add(planeTop);

    //0xffffff
    const planeBottom = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0x188038 }));
    planeBottom.position.y = -50;
    planeBottom.rotateX(-Math.PI / 2);
    this.scene.add(planeBottom);

    // 0x7f7fff 
    const planeBack = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0xffffff }));
    planeBack.position.z = -100;
    planeBack.position.y = 50;
    this.scene.add(planeBack);

    // 0x00ff00
    const planeFront = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0xffffff  }));
    planeFront.position.z = 100;
    planeFront.position.y = 50;
    planeFront.rotateX(-Math.PI);
    this.scene.add(planeFront);

    // 0x00ff00
    const planeRight = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0xffffff }));
    planeRight.position.x = 100;
    planeRight.position.y = 50;
    planeRight.rotateY(-Math.PI / 2);
    this.scene.add(planeRight);

    // 0x00ff00
    const planeLeft = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: 0xffffff }));
    planeLeft.position.x = -100;
    planeLeft.position.y = 50;
    planeLeft.rotateY(Math.PI / 2);
    this.scene.add(planeLeft);

    const mainLight = new THREE.PointLight(0xe7e7e7, 2.5, 250, 0);
    mainLight.position.y = 60;
    this.scene.add(mainLight);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.rendererCanvas.nativeElement });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth - 20, window.innerHeight);

    this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.cameraControls.target.set(0, 0, 0);
    this.cameraControls.maxDistance = 100;
    this.cameraControls.minDistance = 10;
    this.cameraControls.update();

    this.loadGlb('mfp');

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }


  loadGlb(type: string) {
    // Load GLB Model
    const glbloader = new GLTFLoader();
    let getConfig = this.config.getWebGlInfo(type);
    glbloader.load(
      `myfiles/${type}.glb`, // Replace with the actual path to your GLB file
      (gltf:any) => {
       this.glbModel = gltf.scene;
       if (this.glbModel != null) {
           // Model loaded successfully
           this.scene?.add(this.glbModel); // Add the loaded model to the scene

           // Optional: Adjust model position, scale, rotation
           this.glbModel.position.set(getConfig.position.x, getConfig.position.y, getConfig.position.z);
           this.glbModel.scale.set(getConfig.scale.x, getConfig.scale.y, getConfig.scale.z);
           // gltf.scene.rotation.y = Math.PI / 2;

           // Optional: Access animations
           // console.log('Animations:', gltf.animations);
         }
      },
      (xhr) => {
        // Called while loading is progressing
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        // Called when loading has errors
        console.error('An error happened while loading the GLB model:', error);
      }
    );
  }

  onWindowResize(): void {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  animate(): void {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));


    //

    this.raycaster.setFromCamera(this.mouse, this.camera!);

    if (this.glbModel) {
      const intersects = this.raycaster.intersectObject(this.glbModel, true); // Check all children

      if (intersects.length > 0) {
        // Mouse pointer is touching the GLB model
        if (!this.isIntersectingGLB) {
          this.isIntersectingGLB = true;
          this.onGLBPointerEnter(); // Trigger your "touch" event
        }
      } else {
        // Mouse pointer is no longer touching the GLB model
        if (this.isIntersectingGLB) {
          this.isIntersectingGLB = false;
          this.onGLBPointerLeave(); // Trigger an optional "untouch" event
        }
      }
    }

    //
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }


  onGLBPointerEnter(): void {
    console.log('Mouse pointer is touching the GLB model!');
    // Trigger your desired event here:
    // - Change material color
    // - Play an animation
    // - Emit an Angular event
    if (this.glbModel) {
      this.glbModel.traverse((child) => {
       //alert("Hi");
       this.openDialog('0ms', '0ms');
      });
    }

  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
          this.dialog.open(DialogAnimationsExampleDialog, {
            width: '250px',
            enterAnimationDuration,
            exitAnimationDuration,
          });
  }

  onGLBPointerLeave(): void {
    console.log('Mouse pointer left the GLB model.');
    // Trigger an optional event when the mouse leaves
    if (this.glbModel) {
      this.glbModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).material instanceof THREE.MeshBasicMaterial) {
          // Revert to the original material (you might need to store this)
          (child as THREE.Mesh).material = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x8d8d8d }); // Example: Revert to a default material
        }
      });
    }
  }

}


@Component({
  selector: 'dialog-animations-example-dialog',
  templateUrl: 'dialog-animations-example-dialog.html',
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogAnimationsExampleDialog {
  readonly dialogRef = inject(MatDialogRef<DialogAnimationsExampleDialog>);
}