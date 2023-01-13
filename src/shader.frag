precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_scroll;

uniform float u_x[10];
uniform float u_y[10]; 
uniform float u_r[10];

vec3 rgb(float r, float g, float b){
  return vec3(r / 255.0, g / 255.0, b / 255.0);
}

float dist(vec2 p0, vec2 pf){
    return sqrt((pf.x-p0.x)*(pf.x-p0.x)+(pf.y-p0.y)*(pf.y-p0.y));
}

void main() {

    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    vec2 center = u_resolution * 0.5;

    //flip mouse Y
    vec2 mp = u_mouse;
    mp.y = u_resolution.y - mp.y;

    float intensity = 0.0;
    if(u_scroll>20.){
        for(int i=0; i<10; i++)
        {
            vec2 source = center + vec2(u_x[i],u_y[i]);
            vec2 position = gl_FragCoord.xy;
            float d = dist(position, source);
            // intensity += exp(-0.5*d*d);
            intensity += (u_r[i]) * (u_scroll-20.)/8./d;
        }
        intensity=pow(intensity,0.35);
        intensity = smoothstep(0.5,0.95,intensity);
    }
    else{
        intensity = 0.;
    }

    float d = smoothstep(0.0,1.0,dist(center.xy,gl_FragCoord.xy)*0.05);
    vec4 final = mix(vec4(1.0, 1.0, 1.0, 0.0), vec4(0.75, 0.5, 1.0, 1.0), intensity);

    gl_FragColor=vec4(final);
}