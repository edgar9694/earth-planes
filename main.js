import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import anime from 'animejs/lib/anime.es.js';

let sunBackground = document.querySelector(".sun-background");
let moonBackground = document.querySelector(".moon-background");


const scene =  new THREE.Scene();

//PerspectiveCamera(field of view of the camera, the aspect ratio of the screen, the distance of the closest object that can be rendered, the distance of the furthest object that can be rendered)
const camera =  new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 50);

const ringsScene =  new THREE.Scene();

const ringsCamera =  new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
ringsCamera.position.set(0, 0, 50);

// property alpha when a pixel is not opaque it is going to show through the html elements that are behind the canvas for us 
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true})
renderer.setSize(window.innerWidth, window.innerHeight);
// these two lines make sure that the physical values computed by the render can be properly displayed on our monitor
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;
// enabling shadows 
renderer.shadowMap.enabled = true;
renderer.shadowMap.type =  THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,0,0);
// these two values basically smooth the movement animation
controls.dampingFactor = 0.05;
controls.enableDamping = true;


const sunLight = new THREE.DirectionalLight(new THREE.Color("#FFFFFF"), 3.5);
sunLight.position.set(10, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 512;
sunLight.shadow.mapSize.height = 512;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 100;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.bottom = -10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.right = 10;
scene.add(sunLight);

const moonLight = new THREE.DirectionalLight(new THREE.Color("#77ccff").convertSRGBToLinear(), 0);
moonLight.position.set(-10, 20, 10);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 512;
moonLight.shadow.mapSize.height = 512;
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 100;
moonLight.shadow.camera.left = -10;
moonLight.shadow.camera.bottom = -10;
moonLight.shadow.camera.top = 10;
moonLight.shadow.camera.right = 10;
scene.add(moonLight);

let mousePos = new THREE.Vector2(0,0);


const asyncFunction = (async () => {
    let pmrem = new THREE.PMREMGenerator(renderer);
    let envmapTexture = await new RGBELoader().setDataType(THREE.FloatType).loadAsync("assets/room.hdr");
    let envMap = pmrem.fromEquirectangular(envmapTexture).texture;

    const ring1Geo = new THREE.RingGeometry(15, 13.5, 80, 1, 0);
    const ring1Mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#FFCB8E").convertSRGBToLinear().multiplyScalar(200),
        roughness: 0.25,
        envMap,
        envMapIntensity: 1.8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
    });

    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.sunOpacity = 0.35;
    ring1.moonOpacity = 0.03;
    ringsScene.add(ring1);

    const ring2Geo = new THREE.RingGeometry(16.5, 15.75, 80, 1, 0);
    const ring2Mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#FFCB8E").convertSRGBToLinear(),
        roughness: 0.25,
        envMap,
        envMapIntensity: 1.8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
    });

    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.sunOpacity = 0.35;
    ring2.moonOpacity = 0.03;
    ringsScene.add(ring2);

    const ring3Geo = new THREE.RingGeometry(18, 17.75, 80);
    const ring3Mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#FFCB8E").convertSRGBToLinear().multiplyScalar(50),
        roughness: 0.25,
        envMap,
        envMapIntensity: 1.8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35
    });

    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring2.sunOpacity = 0.35;
    ring2.moonOpacity = 0.03;
    ringsScene.add(ring3);

    let textures = {
        bump: await new THREE.TextureLoader().loadAsync("assets/earthbump.jpg"),
        map: await new THREE.TextureLoader().loadAsync("assets/earthmap.jpg"),
        spec: await new THREE.TextureLoader().loadAsync("assets/earthspec.jpg"),
        planeTrailMask: await new THREE.TextureLoader().loadAsync("assets/mask.png")
    }

    // cartoon plane
    let plane = (await new GLTFLoader().loadAsync("assets/plane/scene.glb")).scene.children[0];
    let planesData = [
        makePlane(plane, textures.planeTrailMask, envMap, scene),
        makePlane(plane, textures.planeTrailMask, envMap, scene),
        makePlane(plane, textures.planeTrailMask, envMap, scene),
        makePlane(plane, textures.planeTrailMask, envMap, scene),
        makePlane(plane, textures.planeTrailMask, envMap, scene),
        makePlane(plane, textures.planeTrailMask, envMap, scene),
    ]


    const sphereGeo = new THREE.SphereGeometry(10, 70, 70);
    const sphereMat = new THREE.MeshPhysicalMaterial({
        //base color of the sphere
        map: textures.map,
        // is a texture that represents how rough the surface of the sphere is in that particular texture
        roughnessMap: textures.spec,
        // to give the impresion that the texture has some variation in the perceived heights of the surface of the texture
        bumpMap: textures.bump,
        bumpScale: 0.05,
        envMap,
        // determines how strong is the effect of the envmap
        envMapIntensity: 0.4,
        sheen: 1,
        sheenRoughness: 0.75,
        sheenColor: new THREE.Color("#ff8a00").convertSRGBToLinear(),
        clearcoat: 0.5
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.sunEnvIntensity = 0.4;
    sphere.moonEnvIntensity = 0.1;
    sphere.rotation.y += Math.PI * 1.25;
    sphere.receiveShadow = true;
    scene.add(sphere);

    let clock = new THREE.Clock();

    let daytime = true;
    let animating  = false;
    window.addEventListener("mousemove", (e) =>{
        if(animating) return;
        
        let anim;
        if(e.clientX > (window.innerWidth - 200 ) && !daytime){
            anim = [1, 0];
        } else if(e.clientX <  200 && daytime) {
            anim = [0, 1];
        } else {
            return
        }

        animating = true;

        let obj = { t: 0 };
        anime({
            targets: obj,
            t: anim,
            complete: () => {
                animating = false;
                daytime = !daytime;
            },
            update: () => {
                sunLight.intensity = 3.5 * (1 - obj.t);
                moonLight.intensity = 3.5 * obj.t;

                sunLight.position.setY(20 * (1-obj.t));
                moonLight.position.setY(20* obj.t);

                sphere.material.sheen = (1 - obj.t);

                scene.children.forEach( (child) =>{
                    child.traverse( (object) =>{
                        if(object instanceof THREE.Mesh && object.material.envMap){
                            object.material.envMapIntensity = object.sunEnvIntensity * (1 - obj.t) + object.moonEnvIntensity * obj.t

                        }
                    })
                })

                sunBackground.style.opacity = 1 - obj.t;
                moonBackground.style.opacity = obj.t;
            },
            easing: 'easeInOutSine',
            duration: 500
        })
    })


    renderer.setAnimationLoop( () => {
        let delta = clock.getDelta();
        planesData.forEach(planeData => {
            let plane = planeData.group;

            plane.position.set(0,0,0);
            plane.rotation.set(0,0,0);
            plane.updateMatrixWorld();

            planeData.rot += delta * 0.25;

            plane.rotateOnAxis(planeData.randomAxis, planeData.randomAxisRot)
            plane.rotateOnAxis(new THREE.Vector3(0,1,0), planeData.rot); // y-axis rotation
            plane.rotateOnAxis(new THREE.Vector3(0,0,1), planeData.rad); // this decides the radius
            plane.translateY(planeData.yOff);
            plane.rotateOnAxis(new THREE.Vector3(1,0,0), +Math.PI * 0.5);
        });

        controls.update();
        renderer.render(scene, camera);

        ring1.rotation.x =  ring1.rotation.x * 0.95 + mousePos.y * 0.05 * 1.2;
        ring1.rotation.y =  ring1.rotation.y * 0.95 + mousePos.x * 0.05 * 1.2;

        ring2.rotation.x =  ring2.rotation.x * 0.95 + mousePos.y * 0.05 * 0.375;
        ring2.rotation.y =  ring2.rotation.y * 0.95 + mousePos.x * 0.05 * 0.375;

        ring3.rotation.x =  ring3.rotation.x * 0.95 + mousePos.y * 0.05 * 0.275;
        ring3.rotation.y =  ring3.rotation.y * 0.95 + mousePos.x * 0.05 * 0.275;

        renderer.autoClear = false;
        renderer.render(ringsScene, ringsCamera)
        renderer.autoClear = true;
    })
})();

const makePlane = (planeMesh, trailTexture, envMap, scene) =>{
    let plane = planeMesh.clone();
    plane.scale.set(0.001,0.001,0.001);
    plane.position.set(0,0,0);
    plane.rotation.set(0,0,0);
    plane.updateMatrixWorld();

    plane.traverse((object) => {
        if(object instanceof THREE.Mesh){
            object.material.envMap = envMap;
            object.sunEnvIntensity = 1;
            object.moonEnvIntensity = 0.3;
            object.castShadow = true;
            object.receiveShadow = true;
        }
    });

    const geo = new THREE.PlaneGeometry(1,2)
    const mat = new THREE.MeshPhysicalMaterial({
        envMap,
        envMapIntensity: 3,

        roughness: 0.4,
        metalness: 0,
        transmission: 1,

        transparent: true,
        opacity: 1,
        alphaMap: trailTexture
    })
    let trail = new THREE.Mesh(geo,mat);
    trail.sunEnvIntensity = 3;
    trail.moonEnvIntensity = 0.7;
    trail.rotateX(Math.PI);
    trail.translateY(1.1)

    let group = new THREE.Group();
    group.add(plane);
    group.add(trail)

    scene.add(group);

    return { 
        group, 
        rot: Math.random() * Math.PI * 2.0,
        rad: Math.random() * Math.PI * 0.45 + 0.2,
        yOff: 10.5 + Math.random() * 1.0,
        randomAxis: new THREE.Vector3(nr(), nr(), nr()).normalize(),
        randomAxisRot: Math.random() * Math.PI * 2
    };
}

const nr = () =>{
    return Math.random() * 2 - 1;
}

window.addEventListener("mousemove", (e) =>{
    let x = e.clientX - innerWidth *0.5;
    let y = e.clientY - innerHeight * 0.5

    mousePos.x = x * 0.0003;
    mousePos.y = y * 0.0003;
})