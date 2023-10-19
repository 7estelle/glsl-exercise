uniform sampler2D uImage;
uniform float uTime;
uniform vec2 uSize;
varying vec2 vUv;

#define PI 3.1415926535897932384626433832795

/**
* helpers
*/

// random renvoie un nombre entre 0 et 1
// pour centrer la valeur, faire *2 puis -1
float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float clampedSine(float t, float m){
    return (sin(t) + 1.0)*.5 * m;
}

vec2 fmod(vec2 x, vec2 y) {
    return x - y * trunc(x/y);
}

float luminance(vec3 rgb){
    return dot(rgb, vec3(.299, .587, .114));
}

float sdCircle(vec2 centre, float r){
    return length(centre) - r;
}

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
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

void applyVerticalWave(out vec2 uv) {
    uv.x += sin(uv.y * 50. + uTime) * .05;
    // quand on multiplie à l'intérieur du sin, c'est la fréquence
    // quand on multiplie à l'extérieur du sin, c'est l'amplitude
    // ici, .05 représente l'amplitude 
}

void applyRows(out vec2 uv) {
    uv.x += sin((floor(uv.y * 25.)/25.) * 50. + uTime * 10.) * .05;
}

void applyFold(out vec2 uv, float s) {
    uv -= 0.5;
    uv.y += abs(uv.x) * s;
    uv += 0.5;
}

void applyVerticalClamp(out vec2 uv, float a, float b) {
    // a = limite basse
    // b = limite haute
    uv.y = clamp(uv.y, a, b);
}

void applyPixelate(out vec2 uv, float s) {
    // définir le nombre de colonnes de pixels qu'on veut
    vec2 pix = vec2(s) / vec2(textureSize(uImage, 0)); 
    // textureSize(uImage, level of details (lod) )
    uv = floor(uv / pix) * pix;

    // floor * qqch divisé par qqch pour faire le genre d'escalier
}

void applySpiral(out vec2 uv, float s) {
    uv -= 0.5;
    float l =  1. - length(uv); // pour que la strength soit moins atténuée sur les bords qu'au centre
    float a = atan(uv.y, uv.x);
    a += l * s;
    uv = vec2(cos(a), sin(a)) * length(uv);
    uv += 0.5;
}

void applyRand(out vec2 uv, float s, float t) {
    vec2 pix = vec2(s) / vec2(textureSize(uImage, 0)); 
    uv += vec2(-1. + random(floor(uv / pix)* pix) * 2., 0.) * t ;
}

void applyStaticNoise(out vec2 uv) {
    uv.x += random(uv) * 0.01;
}

void applyScan(out vec2 uv) {
    uv.x += (random(uv.yy)* 2. - 1.) * .05 * smoothstep(.0, 1., sin(uv.y*5. + uTime*5.));
    // uv.yy renverra un vec2 avec 2 fois la valeur de y dedans
    // pour l'animation : ajouter la partie à partir de * smoothstep
}

void applyFrostedGlass(out vec2 uv) {
    uv.x += (random(uv.xy)* 2. - 1.) * .05;
    // uv.yy renverra un vec2 avec 2 fois la valeur de y dedans
    // pour l'animation : ajouter la partie à partir de * smoothstep
}

void applyCRT(out vec2 uv, float s, float dir) {

    uv -= 0.5;
    float crt = sin(abs((uv.y + dir) * 1000.));
    uv.x += sign(crt) * s;
    uv += 0.5;
    // sign renvoie -1 pour un négatif donné, 0 pour 0, 1 pour un positif donné
}




// color effects

void applyBlackAndWhite(out vec4 col) {
    col.rgb = vec3(luminance(col.rgb));
}

void applyThreshold(out vec4 col, float t) {
    float c = step(t, luminance(col.rgb));
    col.rgb = vec3(c);
}

void applyColorThreshold(out vec4 col, float s) {
    // s = nombre de couleurs
    col = ceil(col * s) / s;
    // ceil est semblable à l'utilisation de floor qu'on faisait avec les uv, pour faire le genre d'escalier
}

void applySonar(inout vec4 col, vec2 uv) {
    uv -= 0.5;
    float l = length(uv);
    l *= 100.;
    l += uTime * 1.;
    l = sin(l);
    l = smoothstep(-1., -.9, l);
    col *= .5 + .5*l;
}

void applyGrid(out vec4 col, vec2 uv) {
    col *= .5 + .5*smoothstep(-1., -.9, sin(uv.x * 100.));
    col *= .5 + .5*smoothstep(-1., -.9, sin(uv.y * 100.));
    // les 2 premiers paramètres de smoothstep servent à définir l'épaisseur des traits de la grid
    // le *100. sert à définir la fréquence des traits de la grid
}

void applyWaves(out vec4 col, vec2 uv) {
    col *= .5 + .5*smoothstep(-1., -.9, sin(uv.y * 200. + sin(uv.x*40.)*2.));
}

void applyNegativeCircle(out vec4 col, vec2 uv, vec2 centre, float r) {
    uv -= 0.5;
    float l = step(length(uv - centre), r);
    col = vec4(mix(col.rgb, 1.-col.rgb, l), 1.);

    // sign distance field
    // float l = length(uv) -r;
    // l += step(l, r);
}

void applyNegativeBox(out vec4 col, vec2 uv, vec2 centre, vec2 boxWidth) {
    uv -= 0.5;
    float l = step(sdBox(uv - centre, boxWidth), 0.);
    col = vec4(mix(col.rgb, 1.-col.rgb, l), 1.);
}



void applyChromaticAberration(out vec4 col, vec2 uv, float radius, float angle) {
    vec2 uvR = vec2(cos(angle), sin(angle)) * radius;
    angle += PI;
    vec2 uvG = vec2(cos(angle), sin(angle)) * radius;
    angle += PI;
    vec2 uvB = vec2(cos(angle), sin(angle)) * radius;
    col.r = texture2D(uImage, uv + uvR).r;
    col.g = texture2D(uImage, uv + uvG).g;
    col.b = texture2D(uImage, uv + uvB).b;
}




void main() {
    vec2 uv = vUv;

    // applyMirror(uv);
    // applyVerticalSymmetry(uv);
    // applyRotation(uv, PI/4.);
    // applyZoom(uv, 0.5);
    // applyZoom(uv, 1. + clampedSine(uTime, 1.));
    // applyFisheye(uv, 0.9);
    // applyRepeat(uv, 3., 3.);
    // applyVerticalWave(uv);
    // applyRows(uv);
    // applyFold(uv, clampedSine(uTime, 0.5));
    // applyVerticalClamp(uv, .3, .7);
    // applyPixelate(uv, 50.);
    // applySpiral(uv, clampedSine(uTime, 5.));
    // applyRand(uv, 2. + clampedSine(uTime + PI, 6.), clampedSine(uTime, .2));
    // applyScan(uv);
    // applyFrostedGlass(uv);
    // applyCRT(uv, .001 + clampedSine(uTime, .01), uTime * .01);

    vec4 col = texture2D(uImage, uv);
    // applyBlackAndWhite(col);
    // applyThreshold(col, 0.5);
    // applyColorThreshold(col, 5.);
    // applySonar(col, uv);
    // applyGrid(col, uv);
    // applyWaves(col, uv);
    applyNegativeCircle(col, uv, vec2(0.), 0.25);
    // applyNegativeBox(col, uv, vec2(0.), vec2(.3, .3));
    // applyChromaticAberration(col, uv, .01, 0.);


    gl_FragColor = col;
}

