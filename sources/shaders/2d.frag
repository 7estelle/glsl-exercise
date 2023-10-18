uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uSize;
varying vec2 vUv;

#define PI 3.1415926535897932384626433832795

float clampedSine(float t, float m){
    return (sin(t) + 1.0)*.5 * m;
}

void applyMirror(out vec2 uv) {
    uv.y = 1.0 - uv.y;
}

void applyVerticalSymmetry(out vec2 uv) {
    uv.y =  abs(uv.y - 0.5) + 0.5;
}

void applyRotation(out vec2 uv, float r) {
    // mettre le point de rotation au centre (initialement en bas à gauche)
    uv -= 0.5;
    float a = atan(uv.y, uv.x);
    a -= r;
    uv = vec2(cos(a), sin(a)) * length(uv);
    // remettre le point de rotation à sa place initiale
    uv += 0.5;
}

void applyZoom(out vec2 uv, float z) {
    uv -= 0.5;
    uv = uv * z; 
    uv += 0.5;
}

void applyFisheye(out vec2 uv, float s) {
    uv -= 0.5;
    float l = length(uv); // la length calcule la longueur du vecteur entre le centre et la position du pixel
    uv *= smoothstep(0., s * .5, l); // prend un min et max puis fait une interpolation pour nous donner une valeur smoothée
    uv += 0.5;
}

void applyRepeat(out vec2 uv, float x, float y) {
    // multiplier les UV le nb de fois qu'on veut  qu'ils se répètent
    // les 2 ligne ssuivantes sont pareilles que uv *= vec2(x, y)
    uv.x *= x;
    uv.y *= y;
    uv = fract(uv);
}






void main() {
    vec2 uv = vUv;

    // applyMirror(uv);
    // applyVerticalSymmetry(uv);
    // applyRotation(uv, PI/4.);
    // applyZoom(uv, 0.5);
    // applyZoom(uv, 1. + clampedSine(uTime, 1.));
    // applyFisheye(uv, 0.9);
    applyRepeat(uv, 3., 3.);


    vec4 col = texture2D(uImage, uv);
    gl_FragColor = col;
}

