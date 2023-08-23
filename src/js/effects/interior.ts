import { Curtains, Plane, PlaneParams, RenderTarget, ShaderPass, Texture, Vec2, Vec3 } from 'curtainsjs'
import gsap from 'gsap'

const PLANE_CLASS_NAME = 'interior-item-plane'

function init(curtains: Curtains) {
  initMouseEffect(curtains)
  initScrollEffect(curtains)
}

function initScrollEffect(curtains: Curtains) {
  let scrollEffect = 0

  curtains
    .onRender(() => {
      // update our planes deformation
      // increase/decrease the effect
      scrollEffect = curtains.lerp(scrollEffect, 0, 0.05)
    })
    .onScroll(() => {
      // get scroll deltas to apply the effect on scroll
      const delta = curtains.getScrollDeltas()

      // invert value for the effect
      delta.y = -delta.y

      // threshold
      if (delta.y > 100) {
        delta.y = 100
      } else if (delta.y < -100) {
        delta.y = -100
      }

      if (Math.abs(delta.y) > Math.abs(scrollEffect)) {
        scrollEffect = curtains.lerp(scrollEffect, delta.y, 0.5)
      }
    })
    .onError(() => {
      document.body.classList.add('no-curtains')
    })
    .onContextLost(() => {
      curtains.restoreContext()
    })

  // get our planes elements
  const planeElements = document.getElementsByClassName(PLANE_CLASS_NAME)

  const distortionTarget = new RenderTarget(curtains)
  const rgbTarget = new RenderTarget(curtains)

  const vertexShader = `
    precision mediump float;

    // default mandatory variables
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;

    uniform mat4 planeTextureMatrix;

    // custom variables
    varying vec3 vVertexPosition;
    varying vec2 vTextureMatrixCoord;

    void main() {
      vec3 vertexPosition = aVertexPosition;

      gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

      // varyings
      vVertexPosition = vertexPosition;
      vTextureMatrixCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    }
  `

  const fragmentShader = `
    precision mediump float;

    varying vec3 vVertexPosition;
    varying vec2 vTextureMatrixCoord;

    uniform sampler2D planeTexture;

    void main() {
      // just display our texture
      gl_FragColor = texture2D(planeTexture, vTextureMatrixCoord);
    }
  `

  // add our planes and handle them
  for (let i = 0; i < planeElements.length; i++) {
    const plane = new Plane(curtains, planeElements[i], {
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    })

    plane.setRenderTarget(distortionTarget)
  }

  // add the small planes as well
  // for (let i = 0; i < planeElements.length; i++) {
  //   const plane = new Plane(curtains, planeElements[i], {
  //     vertexShader: vertexShader,
  //     fragmentShader: fragmentShader,
  //     texturesOptions: {
  //       // textures images will be reduced, use LINEAR_MIPMAP_NEAREST
  //       minFilter: curtains.gl.LINEAR_MIPMAP_NEAREST,
  //     },
  //   })

  //   plane.setRenderTarget(rgbTarget)
  // }

  const distortionFs = `
    precision mediump float;

    varying vec3 vVertexPosition;
    varying vec2 vTextureCoord;

    uniform sampler2D uRenderTexture;

    uniform float uScrollEffect;

    void main() {
        vec2 textureCoords = vTextureCoord;
        vec2 texCenter = vec2(0.5, 0.5);

        // distort around scene center
        textureCoords.y += cos((textureCoords.x - texCenter.x) * 3.141592) * uScrollEffect / 2000.0;

        gl_FragColor = texture2D(uRenderTexture, textureCoords);
    }
  `

  const distortionPass = new ShaderPass(curtains, {
    fragmentShader: distortionFs,
    renderTarget: distortionTarget,
    uniforms: {
      scrollEffect: {
        name: 'uScrollEffect',
        type: '1f',
        value: 0,
      },
    },
  })

  distortionPass.onRender(() => {
    // update the uniform
    distortionPass.uniforms.scrollEffect.value = scrollEffect
  })

  const rgbFs = `
    precision mediump float;

    varying vec3 vVertexPosition;
    varying vec2 vTextureCoord;

    uniform sampler2D uRenderTexture;

    uniform float uScrollEffect;

    void main() {
        vec2 textureCoords = vTextureCoord;

        vec2 redTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 300.0);
        vec2 greenTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 600.0);
        vec2 blueTextCoords = vec2(vTextureCoord.x, vTextureCoord.y - uScrollEffect / 900.0);

        vec4 red = texture2D(uRenderTexture, redTextCoords);
        vec4 green = texture2D(uRenderTexture, greenTextCoords);
        vec4 blue = texture2D(uRenderTexture, blueTextCoords);

        vec4 finalColor = vec4(red.r, green.g, blue.b, min(1.0, red.a + blue.a + green.a));
        gl_FragColor = finalColor;
    }
  `

  const rgbPass = new ShaderPass(curtains, {
    fragmentShader: rgbFs,
    renderTarget: rgbTarget,
    uniforms: {
      scrollEffect: {
        name: 'uScrollEffect',
        type: '1f',
        value: 0,
      },
    },
  })

  rgbPass.onRender(() => {
    // update the uniform
    rgbPass.uniforms.scrollEffect.value = scrollEffect
  })

  const blurFs = `
    precision mediump float;

    varying vec3 vVertexPosition;
    varying vec2 vTextureCoord;

    uniform sampler2D uRenderTexture;

    uniform float uScrollEffect;
    uniform vec2 uResolution;


    // taken from https://github.com/Jam3/glsl-fast-gaussian-blur
    vec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
        vec4 color = vec4(0.0);
        vec2 off1 = vec2(0.3333333333333333) * direction;
        color += texture2D(image, uv) * 0.29411764705882354;
        color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;
        color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;
        return color;
    }

    void main() {
        vec4 original = texture2D(uRenderTexture, vTextureCoord);
        vec4 blur = blur5(uRenderTexture, vTextureCoord, uResolution, vec2(0.0, 1.0));

        gl_FragColor = mix(original, blur, min(1.0, abs(uScrollEffect) / 5.0));
    }
  `

  let curtainsBBox = curtains.getBoundingRect()

  const blurPass = new ShaderPass(curtains, {
    fragmentShader: blurFs,
    uniforms: {
      scrollEffect: {
        name: 'uScrollEffect',
        type: '1f',
        value: 0,
      },
      resolution: {
        name: 'uResolution',
        type: '2f',
        value: [curtainsBBox.width, curtainsBBox.height],
      },
    },
  })

  blurPass
    .onRender(() => {
      // update the uniform
      blurPass.uniforms.scrollEffect.value = scrollEffect
    })
    .onAfterResize(() => {
      curtainsBBox = curtains.getBoundingRect()
      blurPass.uniforms.resolution.value = [curtainsBBox.width, curtainsBBox.height]
    })
}

function initMouseEffect(curtains: Curtains) {
  const vs = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  
  #define PI 3.14159265359
  #define S(a,b,n) smoothstep(a,b,n)

  uniform vec2 uDirection;
  
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;

  uniform mat4 activeTextureMatrix;

  varying vec3 vVertexPosition;
  varying vec2 vActiveTextureCoord;
  varying vec2 vDirection;

  vec2 deformationCurve(vec2 uv, vec2 direction){
    float x = sin(vActiveTextureCoord.y * PI) * direction.x;
    float y = sin(vActiveTextureCoord.x * PI) * direction.y;
    
    return vec2(x, y);
  } 

  void main() {
    vec3 vertexPosition = aVertexPosition;
    
    vDirection = uDirection;

    vActiveTextureCoord = (activeTextureMatrix * vec4(aTextureCoord, 0., 1.)).xy;

    vertexPosition.xy += deformationCurve(vActiveTextureCoord, uDirection);

    gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);
    vVertexPosition = vertexPosition;
  }
  `

  const fs = `
  #ifdef GL_ES
    precision mediump float;
    #endif
    
    #define S(a,b,n) smoothstep(a,b,n)

    uniform float uAlpha;
    uniform vec2 uMouse;
    
    varying vec2 vActiveTextureCoord;
    varying vec2 vDirection;

    uniform sampler2D activeTexture;

    void main(){
        vec2 uv0 = vActiveTextureCoord;
      
        float r = texture2D(activeTexture, uv0 + vDirection * 0.2).r;
        float g = texture2D(activeTexture, uv0).g;
        float b = texture2D(activeTexture, uv0 - vDirection * 0.2).b;
      
        gl_FragColor = vec4(vec3(r, g, b), 1.0) * uAlpha;
    }
  `

  class WEBGL {
    webGLCurtain: Curtains
    planeElement: HTMLElement
    titles: HTMLElement[]
    mouse
    lastPosition
    boundingEl!: {
      width: number
      height: number
      top: number
      left: number
    }
    strength
    isOver
    startTime
    params: PlaneParams
    plane!: Plane
    texture!: Texture

    constructor(set: { curtains: Curtains; planeElement: HTMLElement; titles: HTMLElement[] }) {
      this.webGLCurtain = set.curtains
      this.planeElement = set.planeElement
      this.titles = set.titles

      this.mouse = {
        x: 0,
        y: 0,
      }

      this.lastPosition = {
        x: 0,
        y: 0,
      }

      this.strength = 0.25 // fuerza con la que se distorcionara el plano
      this.isOver = false
      this.startTime = performance.now() // tiempo inicial

      this.params = {
        vertexShader: vs,
        fragmentShader: fs,
        widthSegments: 40,
        heightSegments: 40,
        uniforms: {
          time: {
            name: 'uTime',
            type: '1f',
            value: 0,
          },
          mousepos: {
            name: 'uMouse',
            type: '2f',
            value: [0, 0],
          },
          progress: {
            name: 'uProgress',
            type: '1f',
            value: 0,
          },
          alpha: {
            name: 'uAlpha',
            type: '1f',
            value: 0,
          },
          direction: {
            name: 'uDirection',
            type: '2f',
            value: [0, 0],
          },
        },
      }
    }

    initPlane() {
      this.plane = new Plane(this.webGLCurtain, this.planeElement, this.params)
      console.log(this.planeElement)
      console.log(this.plane.images)

      this.texture = this.plane.createTexture({ sampler: 'activeTexture' })

      this.texture.setSource(this.plane.images[0])

      this.boundingEl = this.plane.getBoundingRect()

      if (this.plane) {
        this.plane.onReady(() => {
          this.update()
          this.initEvent()
        })
      }
    }

    update() {
      this.plane.onRender(() => {
        const currentTime = performance.now() // valor tiempo actual

        // Diferencia entre posicion incial y posicion final
        const distanceX = this.mouse.x - this.lastPosition.x
        const distanceY = this.mouse.y - this.lastPosition.y

        // Diferencia entre el tiempo inicial y tiempo final
        const time = currentTime - this.startTime

        // Le agregamos la fuerza y le damos animacion
        gsap.to(this.plane.uniforms.direction.value as Vec2, {
          0: (distanceX / time) * this.strength,
          1: -(distanceY / time) * this.strength,
          ease: 'power4.out',
          duration: 1,
        })

        // Pasar los valores de las variables iniciales a las variables finales
        this.lastPosition.x = this.mouse.x
        this.lastPosition.y = this.mouse.y
        this.startTime = currentTime
      })
    }

    movePlane(e: MouseEvent) {
      const target = e.target as HTMLElement // Elemento seleccionado
      const closestTarget = target.closest('.interior-item') as HTMLElement
      // Mover el plano

      gsap.to(this.mouse, {
        x: e.clientX - this.boundingEl.width / 2,
        y: e.clientY - this.boundingEl.height / 2 - this.plane.getBoundingRect().top,
        duration: 0.7,
        onUpdate: () => {
          this.plane.setRelativeTranslation(new Vec3(this.mouse.x, this.mouse.y, 0))
        },
      })

      // Revelar el plano si esta el puntero encima del texto

      if (closestTarget) {
        if (!this.isOver) {
          const index = this.titles.indexOf(closestTarget)

          this.texture.setSource(this.plane.images[index % this.plane.images.length])

          gsap.to(this.plane.uniforms.alpha, {
            value: 1,
            ease: 'power4.out',
            duration: 0.5,
          })

          this.isOver = true
        }
      } else {
        if (this.isOver) {
          gsap.to(this.plane.uniforms.alpha, {
            value: 0,
            ease: 'power4.out',
            duration: 0.5,
          })

          this.isOver = false
        }
      }
    }

    initEvent() {
      window.addEventListener('mousemove', (e) => this.movePlane(e))
      window.addEventListener('resize', () => this.onResize())
    }

    onResize() {
      this.boundingEl = this.plane.getBoundingRect()
    }
  }

  const interiorPlane = document.querySelector('.interior-plane') as HTMLElement

  if (interiorPlane) {
    const webgl = new WEBGL({
      curtains: curtains,
      planeElement: interiorPlane,
      titles: Array.from(document.querySelectorAll('.interior-item')),
    })

    webgl.initPlane()
  }
}

export default { init }
