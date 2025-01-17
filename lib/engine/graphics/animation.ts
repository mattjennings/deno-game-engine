import type { Spritesheet } from "./spritesheet.ts"
import type { Entity } from "game-engine-core/entity.ts"
import { Component } from "game-engine-core/component.ts"
import { GraphicsComponent } from "./graphics.ts"
import type { SystemEntities, SystemQuery } from "game-engine-core/system.ts"
import { System } from "game-engine-core/system.ts"

export interface AnimationDefinition {
  // quads: Quad[]
  frameDuration?: number
  loop?: boolean
}

export class AnimationComponent<Key extends string> extends Component<{
  animationend: Key
  animationstart: Key
  animationloop: Key
}> {
  static override type = "animation"
  spritesheet: Spritesheet
  animations: Record<Key, AnimationDefinition>

  currentAnimationKey: Key
  currentFrame = 0
  prevFrame = 0
  paused = false

  private elapsed = 0

  constructor(args: {
    spritesheet: Spritesheet
    initial: NoInfer<Key>
    animations: Record<Key, AnimationDefinition>
  }) {
    super()

    this.spritesheet = args.spritesheet
    this.animations = args.animations
    this.currentAnimationKey = args.initial
  }

  override onAdd = (entity: Entity<any, any, any>) => {
    if (!entity.components.has(GraphicsComponent)) {
      // entity.addComponent(new GraphicsComponent())
    }
  }

  get currentAnimation() {
    return this.animations[this.currentAnimationKey]
  }

  play(key: Key, frame = 0) {
    this.currentAnimationKey = key
    this.currentFrame = frame
  }

  pause() {
    this.paused = true
  }

  resume() {
    this.paused = false
  }

  update(dt: number) {
    if (this.paused) {
      return
    }

    this.elapsed += dt
    const frameDuration = this.currentAnimation.frameDuration ?? 1
    const nextFrame = Math.floor(this.elapsed / frameDuration)

    // if (this.currentAnimation.loop) {
    //   this.currentFrame = nextFrame % this.currentAnimation.quads.length
    // } else {
    //   this.currentFrame = Math.min(
    //     nextFrame,
    //     this.currentAnimation.quads.length - 1
    //   )
    // }

    // if (this.currentFrame !== this.prevFrame) {
    //   switch (this.currentFrame) {
    //     case 0:
    //       this.emit("animationstart", this.currentAnimationKey)
    //       break
    //     case this.currentAnimation.quads.length - 1:
    //       if (this.currentAnimation.loop) {
    //         this.emit("animationloop", this.currentAnimationKey)
    //       } else {
    //         this.emit("animationend", this.currentAnimationKey)
    //       }
    //       break
    //   }
    // }

    this.prevFrame = this.currentFrame
  }
}

type Query = SystemQuery<[AnimationComponent<any>, GraphicsComponent]>
export class AnimationSystem extends System<Query> {
  override query = [AnimationComponent, GraphicsComponent] as const

  override update = (entities: SystemEntities<Query>, event: any) => {
    for (const [entity, [animation, graphics]] of entities) {
      animation.update(event.dt)
      // graphics.drawable = animation.spritesheet.image
      // graphics.quad = animation.currentAnimation.quads[animation.currentFrame]
    }
  }
}
