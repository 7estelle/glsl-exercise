import * as THREE from 'three'
import Experience from './Experience.js'
import vert2D from '../shaders/2d.vert'
import frag2D from '../shaders/2d.frag'
import Bulbi from './Materials/Bulbi.js'

export default class World
{
    constructor(_options)
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                // Pour la 2D
                // this.setup2D()
                
                this.setup3D()
            }
        })
    }

    // Pour la 2D
    setup2D(){

        const img = this.resources.items.wink;

        this.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(1,1),
            new THREE.ShaderMaterial({
                fragmentShader: frag2D,
                vertexShader: vert2D,
                uniforms: {
                    uImage: { value: img },
                    uTime: { value: this.elapsedTime },
                    uSize: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
                }
            })
        )

        this.scene.add(this.plane)
        this.elapsedTime = 0;
    }

    setup3D() {

        /**
         * @type {import ('three').Texture}
         */
        const tex = this.resources.items.diffuse;
        tex.flipY = false;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        this.material = new Bulbi({
            map: tex,
        });
    
    
        /**
         * @type {import ('three').Object3D}
         */
        const model = this.resources.items.bulbizarre.scene;
        model.traverse(o => {
            if(o.isMesh) o.material = this.material;
        });

        model.scale.set(0.3, 0.3, 0.3);
        this.scene.add(model);
        this.elapsedTime = 0;
    }


    resize()
    {
    }

    update()
    {
        this.deltaTime = this.time - window.performance.now();
        this.elapsedTime += this.deltaTime * 0.001;
        this.time = window.performance.now();

        // Pour la 2D
        // if(this.plane){
        //     this.plane.material.uniforms.uTime.value = this.elapsedTime;
        // }

        if(this.material){
            this.material.update(this.elapsedTime);
        }
    }

    destroy()
    {
    }
}