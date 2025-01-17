import {
  Renderer,  
  Texture,
} from "SDL_ts/SDL";
import { Component } from "game-engine-core/component.ts";
import { TransformComponent } from "game-engine-core/motion/transform.ts";
import type { SystemEntities, SystemQuery } from "game-engine-core/system.ts";
import { System } from "game-engine-core/system.ts";
import { Pointer, SDL } from "SDL_ts";
import { getRenderer } from "../../../window.ts";
import { AnyEntity } from "game-engine-core/entity.ts";

export class GraphicsComponent<
  T extends Record<string, any> = Record<string, any>,
> extends Component {
  static override type = "graphics";

  texture: Pointer<Texture>;
  ctx: T = {} as T;
  draw?: (renderer: Pointer<Renderer>, ctx: T) => any;
  width: number;
  height: number;

  constructor(
    args: {
      width: number;
      height: number;
      ctx?: T;
      draw?: (renderer: Pointer<Renderer>, ctx: T) => any;
      cleanup?: (entity: AnyEntity, ctx: T) => void;
    },
  ) {
    super();
    this.texture = SDL.CreateTexture(
      getRenderer(),
      SDL.PIXELFORMAT_RGBA8888,
      SDL.TextureAccess.TARGET,
      args.width,
      args.height,
    );
    this.draw = args.draw;
    this.width = args.width;
    this.height = args.height;
    if (args.ctx) {
      this.ctx = args.ctx;
    }

    this.onRemove = (entity: AnyEntity) => {
      if (args.cleanup) {
        args.cleanup(entity, args.ctx!);
      }
    };
  }
}

type Query = SystemQuery<[GraphicsComponent, TransformComponent]>;
export class GraphicsSystem extends System<Query> {
  override query = [GraphicsComponent, TransformComponent] as const;
  override draw = (entities: SystemEntities<Query>, renderer: Pointer<SDL.Renderer>) => {        
    for (const [entity, [graphics, transform]] of entities) {
      if (graphics.draw) {
        SDL.SetRenderTarget(renderer, graphics.texture);
        graphics.draw(renderer, graphics.ctx);        
        SDL.SetRenderTarget(renderer, null);
        SDL.RenderCopyEx(
          renderer,
          graphics.texture,
          new SDL.Rect({
            x: 0,
            y: 0,
            w: graphics.width,
            h: graphics.height,
          }),
          new SDL.Rect({
            x: transform.position.x,
            y: transform.position.y,
            w: graphics.width,
            h: graphics.height,
          }),
          0,
          new SDL.Point({ x: 0, y: 0 }),
          SDL.RendererFlip.NONE
        );
      }
    }
  };
}
