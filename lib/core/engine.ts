import type { ConstructorOf } from "lib/types.d.ts"
import { EventEmitter } from "./event-emitter.ts"
import { Scene } from "./scene.ts"
import type { System } from "./system.ts"
import { Entity } from "./entity.ts"
import type { Component } from "./component.ts"
import { GraphicsSystem } from "../sdl/graphics/graphics.ts";
// import { AnimationSystem, GraphicsSystem } from "./features/graphics/index.ts"
import { VerletSystem } from "./features/motion/index.ts"
import { Pointer, SDL } from "SDL_ts";
// import { ConstraintSystem } from "./features/motion/constraints/index.ts"
// import { CollisionSystem } from "./features/motion/collision"

export interface EngineArgs<TSceneKey extends string> {
  fixedUpdateFps?: number
  systems?: System[]
}

export class Engine<TSceneKey extends string> extends EventEmitter<{
  update: { dt: number }
  fixedupdate: { dt: number }
  draw: void
  scenechange: { name: TSceneKey; scene: Scene }
}> {
  static defaultSystems = [
    new VerletSystem(),
    // new CollisionSystem(),
    // new ConstraintSystem(),
    // new AnimationSystem(),
    // new GraphicsSystem(),
  ]

  systems: System[] = []
  scenes: Record<TSceneKey, () => Scene> = {} as any
  currentScene!: Scene
  fixedUpdateFps = 60

  elapsedTime = 0
  deltaTime = 0
  fixedAccumulator = 0

  paused = false
  started = false

  private debugStepMode = false
  private debugStep = false

  constructor(args: EngineArgs<TSceneKey> = {}) {
    super()

    let systems = args.systems ?? Engine.defaultSystems

    if (args.fixedUpdateFps) {
      this.fixedUpdateFps = args.fixedUpdateFps
    }

    for (const system of systems) {
      this.addSystem(system)
    }

    // love.update = (dt: number) => {
    //   if (this.paused) {
    //     return
    //   }

    //   if (this.debugStepMode) {
    //     if (this.debugStep) {
    //       this.update({ dt })
    //       this.debugStep = false
    //     }
    //   } else {
    //     this.update({ dt })
    //   }
    // }

    // love.draw = () => {
    //   this.draw()
    // }

    // love.keypressed = (
    //   key: KeyConstant,
    //   scancode: Scancode,
    //   isrepeat: boolean
    // ) => {
    //   if (key === "`") {
    //     this.debugStepMode = !this.debugStepMode
    //   }

    //   if (this.debugStepMode && key === "space") {
    //     this.debugStep = true
    //   }
    // }
  }

  start({ scene }: { scene: TSceneKey }) {
    this.started = true
    this.gotoScene(scene)
  }


  update(currentTime: number) {
    if (!this.paused) {      
      this.deltaTime = currentTime - this.elapsedTime
      this.elapsedTime = currentTime
      this.fixedAccumulator += this.deltaTime

      const dt = this.deltaTime

      this.emit("update", { dt })
      this.currentScene.update({ dt})

      const fixedDt = 1000 / this.fixedUpdateFps 
      
      while (this.fixedAccumulator >= fixedDt) {       
        this.emit("fixedupdate", { dt: fixedDt })
        this.currentScene.fixedUpdate({ dt: fixedDt })
        this.fixedAccumulator -= fixedDt
      }
    }
  }

  draw(renderer: Pointer<SDL.Renderer>) {
    if (!this.paused) {
      this.emit("draw", undefined)
      this.currentScene.draw(renderer)
    }
  }

  addSystem(system: System) {
    this.systems.push(system)
    system.engine = this as any
  }

  removeSystem(system: System) {
    this.systems.splice(this.systems.indexOf(system), 1)
  }

  getSystem(system: ConstructorOf<System>) {
    return this.systems.find((s) => s.constructor === system)
  }

  pause() {
    this.paused = true
  }

  resume() {
    this.paused = false
  }

  gotoScene(name: TSceneKey) {
    if (!this.scenes[name]) {
      throw new Error(`Scene "${name.toString()}" not found`)
    }

    const scene = this.scenes[name]()

    if (!!this.currentScene) {
      this.currentScene.off("entityadd", this.onEntityAdd)
      this.currentScene.off("entityremove", this.onEntityRemove)
    }
    this.currentScene = scene
    this.currentScene.on("entityadd", this.onEntityAdd)
    this.currentScene.on("entityremove", this.onEntityRemove)

    this.emit("scenechange", {
      name: name,
      scene: this.currentScene,
    })
    this.currentScene.emit("start", undefined)
  }

  protected onEntityAdd = () => {}

  protected onEntityRemove = () => {}

  get Scene() {
    const _engine = this as Engine<TSceneKey>
    const ctor = class extends Scene {
      override engine = _engine
      protected systems = _engine.systems
    }

    return ctor
  }

  registerScene<Name extends TSceneKey>(
    name: Name,
    cb: (scene: Scene) => Scene
  ) {
    this.scenes[name] = () => {
      const scene = new Scene(this, name)
      // @ts-ignore
      scene.systems = this.systems
      return cb(scene)
    }
  }

  createEntity<
    Comp extends Component<any>[] = [],
    Props extends Record<string, any> = {},
    Events extends Record<string, unknown> = {},
    Ent extends Entity<Comp, Props, Events, Engine<TSceneKey>> = Entity<
      Comp,
      Props,
      Events,
      Engine<TSceneKey>
    >
  >(name: string): Ent {
    const entity = new Entity(this, name)

    return entity as any as Ent
  }

  timer = {
    wait: (s: number) => {
      return new Promise<void>((resolve) => {
        const onupdate = ({ dt }: { dt: number }) => {
          s -= dt
          if (s <= 0) {
            this.off("update", onupdate)
            resolve()
          }
        }

        this.on("update", onupdate)
      })
    },
  }
}
