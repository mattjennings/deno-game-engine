import { SDL } from "SDL_ts";
import { SDL_FUNCTIONS } from "./sdlConfig.ts";

SDL.Init(SDL.InitFlags.VIDEO, { functions: SDL_FUNCTIONS });

let window = SDL.CreateWindow("Hello World", 100, 100, 640, 480, SDL.WindowFlags.SHOWN | SDL.WindowFlags.RESIZABLE);
let renderer = SDL.CreateRenderer(window, -1, SDL.RendererFlags.ACCELERATED | SDL.RendererFlags.PRESENTVSYNC);

export function getWindow() {
  return window;
}

export function getRenderer() {
  return renderer;
}

addEventListener("hmr", () => {
  // SDL.DestroyWindow(window);
  // SDL.DestroyRenderer(renderer);
  // [window, renderer] = SDL.CreateWindowAndRenderer(
  //   1024,
  //   768,
  //   SDL.WindowFlags.SHOWN | SDL.WindowFlags.RESIZABLE,
  // );
})

