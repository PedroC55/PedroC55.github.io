const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

const FS = [
  'precision mediump float;',
  'uniform vec2 uRes;uniform float uT;uniform float uD;',
  'vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}',
  'vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}',
  'vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}',
  'float snoise(vec2 v){const vec4 C=vec4(0.211324865,0.366025403,-0.577350269,0.024390243);',
  'vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);',
  'vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);',
  'vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);',
  'vec3 pp=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));',
  'vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;',
  'vec3 x=2.*fract(pp*C.www)-1.;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;',
  'm*=1.79284291-0.85373472*(a0*a0+h*h);',
  'vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;',
  'return 130.*dot(m,g);}',
  'float fbm(vec2 p){float s=0.,a=0.55;for(int i=0;i<4;i++){s+=a*snoise(p);p*=2.03;a*=0.5;}return s;}',
  'void main(){',
  'vec2 uv=gl_FragCoord.xy/uRes;float ar=uRes.x/uRes.y;',
  'vec2 p=vec2(uv.x*ar,uv.y);float t=uT;',
  'float f1=fbm(p*1.05+vec2(t*0.019,-t*0.012));',
  'float f2=fbm(p*0.78+vec2(-t*0.014,t*0.010)+4.7);',
  'vec3 VOID=vec3(0.071,0.039,0.110),DEEP=vec3(0.118,0.071,0.188),MID=vec3(0.200,0.110,0.302),LIFT=vec3(0.306,0.173,0.459),EMB=vec3(0.910,0.349,0.247);',
  'vec3 c=mix(VOID,DEEP,smoothstep(-0.6,0.55,f1));',
  'c=mix(c,MID,smoothstep(0.05,0.85,f2));',
  'c=mix(c,LIFT,smoothstep(0.45,1.05,f1*0.6+f2*0.6));',
  'vec2 ec=vec2((0.30+0.34*snoise(vec2(t*0.013,1.7)))*ar,0.34+0.32*snoise(vec2(2.3,t*0.010)));',
  'float r=0.145+0.025*snoise(vec2(t*0.026,5.1));',
  'c=mix(c,EMB,smoothstep(r,0.0,distance(p,ec))*0.5);',
  'c*=uD;',
  'vec3 lin=pow(c,vec3(2.2));float L=dot(lin,vec3(0.2126,0.7152,0.0722));',
  'if(L>0.115)c*=pow(0.115/L,1.0/2.2);',
  'gl_FragColor=vec4(c,1.);}'
].join('\n');

export function initColorField({ canvas, fallback, reduced, getDepth }) {
  const narrow = window.innerWidth < 768;
  let gl = null;
  if (!narrow) {
    try {
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    } catch (e) {
      gl = null;
    }
  }

  if (!gl) {
    canvas.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
    return { resize() {}, teardown() {} };
  }

  const compile = (type, src) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    canvas.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
    return { resize() {}, teardown() {} };
  }

  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uT = gl.getUniformLocation(prog, 'uT');
  const uD = gl.getUniformLocation(prog, 'uD');

  function sizeField() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }

  function drawField(t) {
    gl.uniform1f(uT, t);
    gl.uniform1f(uD, getDepth ? getDepth() : 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  sizeField();
  drawField(reduced ? 8.4 : 0);

  let dead = false;
  let fieldTimer = null;
  let onVis = null;

  if (!reduced) {
    const t0 = Date.now();
    // 33ms interval ≈ 30.3fps — this is the fps cap. Do not lower the interval.
    fieldTimer = setInterval(() => {
      if (dead || document.hidden) return;
      drawField((Date.now() - t0) / 1000);
    }, 33);
    onVis = () => {
      if (!document.hidden) drawField((Date.now() - t0) / 1000);
    };
    document.addEventListener('visibilitychange', onVis);
  }

  return {
    resize: sizeField,
    teardown() {
      if (dead) return;
      dead = true;
      if (fieldTimer) clearInterval(fieldTimer);
      if (onVis) document.removeEventListener('visibilitychange', onVis);
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
  };
}
