import * as THREE from 'three'
import Experience from './Experience.js'
import vert2D from '../shaders/2d.vert'
import frag2D from '../shaders/2d.frag'

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
                this.setup2D()
            }
        })
    }

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

    resize()
    {
    }

    update()
    {

        this.deltaTime = this.time - window.performance.now();
        this.elapsedTime += this.deltaTime * 0.001;
        this.time = window.performance.now();

        if(this.plane){
            this.plane.material.uniforms.uTime.value = this.elapsedTime;
        }
    }

    destroy()
    {
    }
}