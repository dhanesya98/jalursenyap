/* Thin sepia contours from depth discontinuities; no extra silhouette meshes.
   Color target remains sRGB encoded; final pass deliberately avoids double gamma. */
(function(root){
 const T=root.THREE;
 class InkRender{
  constructor(renderer){
   this.renderer=renderer;this.size=new T.Vector2();this.target=new T.WebGLRenderTarget(1,1,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat});this.target.texture.encoding=T.sRGBEncoding;
   this.target.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);this.target.depthTexture.format=T.DepthFormat;
   this.material=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tColor:{value:this.target.texture},tDepth:{value:this.target.depthTexture},resolution:{value:new T.Vector2(1,1)},nearClip:{value:.1},farClip:{value:700}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',fragmentShader:`
    uniform sampler2D tColor;uniform sampler2D tDepth;uniform vec2 resolution;uniform float nearClip;uniform float farClip;varying vec2 vUv;
    float depthAt(vec2 p){float z=texture2D(tDepth,p).r;return (nearClip*farClip)/(farClip-(farClip-nearClip)*z);}
    void main(){
     vec2 stepUV=1.0/resolution;vec3 color=texture2D(tColor,vUv).rgb;float d=depthAt(vUv);
     float dx=depthAt(vUv+vec2(stepUV.x,0.0)),dy=depthAt(vUv+vec2(0.0,stepUV.y));
     float dm=depthAt(vUv-vec2(stepUV.x,0.0)),dn=depthAt(vUv-vec2(0.0,stepUV.y));
     float crease=max(abs(dx+dm-2.0*d),abs(dy+dn-2.0*d))/max(d,1.0);
     float silhouette=max(max(abs(dx-d),abs(dm-d)),max(abs(dy-d),abs(dn-d)))/max(d,1.0);
     float edge=smoothstep(.014,.035,max(crease,silhouette*.6));
     float fade=1.0-smoothstep(40.0,120.0,d);color=mix(color,vec3(.32,.25,.22),edge*.42*fade);
     float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;
     color+=grain*.009;gl_FragColor=vec4(color,1.0);
    }`});
   this.scene=new T.Scene();this.scene.add(new T.Mesh(new T.PlaneGeometry(2,2),this.material));this.camera=new T.Camera();
  }
  render(scene,camera){const r=this.renderer;r.getDrawingBufferSize(this.size);if(this.target.width!==this.size.x||this.target.height!==this.size.y){this.target.setSize(this.size.x,this.size.y);this.material.uniforms.resolution.value.copy(this.size);}this.material.uniforms.nearClip.value=camera.near;this.material.uniforms.farClip.value=camera.far;r.setRenderTarget(this.target);r.render(scene,camera);r.setRenderTarget(null);r.render(this.scene,this.camera);}
 }
 root.JSInkRender=InkRender;
})(globalThis);
