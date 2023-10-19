import { MeshBasicMaterial } from "three";

// Faire une classe à part si on veut utiliser un material three déjà existant sans tout écrire avant et en pouvoir ajouter notre petit bout de shader

export default class Bulbi extends MeshBasicMaterial {

    /**
     * 
     * @param {import { "three"}.MeshBasicMaterialParameters} params 
     */
    constructor(params) {
        super({
            ...params
        })
    }

    /**
     * 
     * @param {import { 'three' }.Shader} shader 
     * @param {import { 'three' }.WebGLRenderer} renderer 
     */
    onBeforeCompile(shader, renderer) {
        super.onBeforeCompile(shader, renderer);
        shader.uniforms.uTime = { value: 0 };

        // const snoise4 = glsl`#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)`;
        // console.log(snoise4);

        // on remet les helpers dans le shader tout en haut 

        shader.vertexShader = shader.vertexShader.replace(`void main() {`, [
            `uniform float uTime;`,
            `float clampedSine(float t){`,
            `    return (sin(t) + 1.0)*.5;`,
            `}`,
            `float random(vec2 st)`,
            `{`,
            `    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);`,
            `}`,
 
            `void main() {`,
        ].join('\n'));
        

        // le code qu'on va écrire pour modifer les shaders s'ajoutera après #include <project_vertex>

        // // WAVE
        // shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', [
        //     `transformed.x += sin(transformed.y*2.0 + uTime) * .5;`,
        //     `#include <project_vertex>;`
        // ].join('\n'));

        // // CHUBBY
        // // normaliser la normale (la direction de la face)
        // // transformed est une variable créée par three qui contient la position du vertex et qu'on peut modifier
        // shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', [
        //     `transformed += normalize(normal) * clampedSine(uTime);`,
        //     `#include <project_vertex>;`
        // ].join('\n'));

        // TWIST
        shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', [
            `float angle = atan(transformed.z, transformed.x);`,
            `angle += transformed.y * sin(uTime) * .5;`,
            `transformed.xz = vec2(cos(angle), sin(angle)) * length(transformed.xz);`,


            `#include <project_vertex>;`
        ].join('\n'));
        

        // tous les materials de three ont un userData et on peut y mettre ce qu'on veut
        this.userData.shader = shader;
    }


    update(time){
        if (this.userData && this.userData.shader) {
            this.userData.shader.uniforms.uTime.value = time;
        }
    }
}