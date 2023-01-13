// import { random } from "lodash";
import p5 from "p5";
import vShader from "./shader.vert?raw";
import fShader from "./shader.frag?raw";

interface ICoordinate {
  x: number;
  y: number;
}

interface IOrbitPoint {
  current: p5.Vector;
  lineDist: number;

  setScroll: (_scroll: number) => void;
  update: (_time: number) => void;
  draw: () => void;
}

const isMobile = () => {
  return "ontouchstart" in document.documentElement;
};

export class Itheum {
  private viewport: HTMLElement;
  private canvas!: p5.Renderer;
  private shader!: p5.Shader;
  private debug: boolean;
  private mobile: boolean;
  private scale: number;
  private connections: number[][];
  private logoBase: ICoordinate[];
  private logoPoints: ICoordinate[];
  private points: IOrbitPoint[];
  private u_x: number[];
  private u_y: number[];
  private u_r: number[];
  private time: number;
  private scrollHeight: number;
  private fixedHeight: number;
  private scrollVal: number;

  constructor(
    $viewport: HTMLElement,
    scrollHeight: number,
    fixedHeight: number
  ) {
    this.debug = false;
    this.viewport = $viewport;
    this.mobile = isMobile();
    this.canvas;
    this.shader;
    this.scrollHeight = scrollHeight;
    this.fixedHeight = fixedHeight;
    this.scale = 0.75;
    this.u_x = new Array<number>(10).fill(0);
    this.u_y = new Array<number>(10).fill(0);
    this.u_r = new Array<number>(10).fill(0);
    this.time = 0;
    this.scrollVal = 100;

    this.points = [];

    //list of points that are connected to create logo
    this.connections = [
      [0, 1],
      [0, 3],
      [1, 7],
      [1, 2],
      [1, 5],
      [2, 3],
      [2, 4],
      [2, 5],
      [3, 4],
      [3, 6],
      [3, 9],
      [4, 5],
      [4, 6],
      [4, 8],
      [7, 8],
      [8, 9],
    ];

    //default position for each point to create logo
    this.logoBase = [
      { x: 0, y: -291 },
      { x: -100, y: -117 },
      { x: 26, y: 14 },
      { x: 191, y: 36 },
      { x: 79, y: 135 },
      { x: -118, y: 160 },
      { x: 165, y: 181 },
      { x: -320, y: 266 },
      { x: 61, y: 266 },
      { x: 320, y: 266 },
    ];

    //current position for each point
    this.logoPoints = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];

    // window.addEventListener("scroll", this.updateScroll);
    new p5(this.sketch, this.viewport);
    console.log(isMobile());
  }

  testFunc = () => {
    console.log("testFunc");
  };

  sketch = (p: p5) => {
    // p.preload = () => {
    // 	this.shader = p.createShader(vShader, fShader);
    // };

    p.setup = () => {
      this.scale = p.windowWidth / 2000;
      this.canvas = p.createCanvas(
        window.innerWidth,
        window.innerHeight,
        p.WEBGL
      );
      const gl: any = (this.canvas as any).canvas.getContext("webgl");
      gl.disable(gl.DEPTH_TEST);
      p.colorMode(p.RGB);
      p.noStroke();
      p.pixelDensity(1);
      p.smooth();

      this.shader = p.createShader(vShader, fShader);

      this.logoBase.forEach((p, i) => {
        this.logoPoints[i].x = p.x * this.scale;
        this.logoPoints[i].y = p.y * this.scale;
        this.u_x[i] = this.logoPoints[i].x;
        this.u_y[i] = -this.logoPoints[i].y;
        const range: ICoordinate = { x: 0.4, y: 1.3 };
        let r: number = Math.random() * (range.y - range.x) + range.x;
        if (this.scale < 0.75) {
          this.u_r[i] = r * (0.25 + this.scale);
        } else {
          this.u_r[i] = r;
        }

        let plusOrMinus: number = Math.random() < 0.5 ? -1 : 1;
        this.points.push(
          new OrbitPoint(
            this.logoPoints[i].x,
            this.logoPoints[i].y,
            3 + Math.random() * 15 * 10,
            3 + Math.random() * 25 * 5,
            (Math.random() * 2 + 0.8) * plusOrMinus,
            this.mobile
          )
        );
      });
      // random(0.8, 2)
      // console.log(this.points);
    };

    p.draw = () => {
      this.u_x = [];
      this.u_y = [];
      p.background(255);
      p.noStroke();
      // p.clear();

      this.points.forEach((pt, i) => {
        pt.update(this.time); //time
        this.u_x[i] = pt.current.x;
        this.u_y[i] = -pt.current.y;
      });

      this.shader.setUniform("u_resolution", [p.width, p.height]);
      this.shader.setUniform("u_scroll", this.scrollVal);
      this.shader.setUniform("u_x", this.u_x);
      this.shader.setUniform("u_y", this.u_y);
      this.shader.setUniform("u_r", this.u_r);

      p.shader(this.shader);
      p.rect(0, 0, 0, 0);
      p.resetShader();

      this.connections.forEach((c) => {
        connect(this.points[c[0]], this.points[c[1]]);
      });

      this.points.forEach((p) => {
        p.draw();
      });
      this.time += 0.0015;
    };

    p.windowResized = () => {
      this.scale = p.windowWidth / 2000;
      if (this.debug) {
        console.log(`resized ${window.innerWidth}, ${window.innerHeight}`);
      }
      p.resizeCanvas(window.innerWidth, window.innerHeight);
      // this.x = window.innerWidth / 2;
      // this.y = window.innerHeight / 2;
    };

    const connect = (p1: IOrbitPoint, p2: IOrbitPoint) => {
      let distance = p.dist(
        p1.current.x,
        p1.current.y,
        p2.current.x,
        p2.current.y
      );
      p.strokeWeight(2);
      if (distance < p1.lineDist) {
        p.stroke(p.color(0, 0, 0, p.map(distance, 0, p1.lineDist, 255, 0)));
        p.line(p1.current.x, p1.current.y, p2.current.x, p2.current.y);
      }
      p.noStroke();
    };

    const updateScroll = () => {
      let target = window.scrollY || window.pageYOffset;
      if (target < this.fixedHeight) {
        this.viewport.style.position = "fixed";
        this.viewport.style.top = "0px";
      } else {
        this.viewport.style.position = "absolute";
        this.viewport.style.top = this.fixedHeight + "px";
      }
      if (this.debug) {
        console.log(target);
      }

      let pos = p.constrain(target, 0, this.scrollHeight + 1); //!!! +1??
      this.scrollVal = 100 - pos / (this.scrollHeight / 100);
      this.points.forEach((p) => {
        p.setScroll(this.scrollVal);
      });
    };

    window.addEventListener("scroll", updateScroll);

    class OrbitPoint {
      private base: p5.Vector;
      private baseRadius: number;
      private baseOffset: number;
      private radius: number;
      private offset: number;
      // private timeDist: number;
      // private repelDist: boolean;
      private timeOffset: number;
      private mobile: boolean;

      public current: p5.Vector;
      public lineDist: number;

      constructor(
        x: number,
        y: number,
        _radius: number,
        _offset: number,
        _timeOffset: number,
        _mobile: boolean
      ) {
        this.base = p.createVector(x, y);
        this.current = p.createVector(x, y);
        this.baseRadius = _radius;
        this.baseOffset = _offset;
        this.radius = 0;
        this.offset = 0;
        this.lineDist = 0;
        // this.timeDist = 0;
        // this.repelDist = false;
        this.timeOffset = _timeOffset;
        this.mobile = _mobile;
        this.setScroll(100);
      }

      setScroll(_scroll: number): void {
        this.radius = 3 + this.baseRadius * (_scroll / 100);
        this.offset = this.baseOffset * (_scroll / 100);
        this.lineDist = (160 - _scroll) * 5;
        // this.timeDist = (80 - _scroll) / 100;
      }

      update(_time: number): void {
        let time: number = _time * this.timeOffset;
        this.current.x =
          this.base.x -
          p.sin(time) * this.offset +
          this.radius * p.cos(2 * p.PI * time);
        this.current.y =
          this.base.y -
          p.cos(time) * this.offset +
          this.radius * p.sin(2 * p.PI * time);
        if (!this.mobile) {
          this.repel();
        }
      }

      repel(): void {
        let distance = p.dist(
          this.current.x,
          this.current.y,
          p.mouseX - p.width / 2,
          p.mouseY - p.height / 2
        );
        if (distance < 150) {
          // this.repelDist = true;
          let mouse = p.createVector(
            p.mouseX - p.width / 2,
            p.mouseY - p.height / 2
          );
          let difference = p5.Vector.sub(mouse, this.current);
          difference.setMag((150 - distance) / 5);
          // console.log(difference);
          this.current.sub(difference);
        } else {
          // this.repelDist = false;
        }
      }

      draw(): void {
        p.fill(0);
        p.ellipse(this.current.x, this.current.y, 8);
      }
    }
  };
}

declare global {
  interface Window {
    Itheum: typeof Itheum;
    onItheumLoaded: () => void;
  }
}

if (import.meta.env.MODE === "iife") {
  window.Itheum = Itheum;
  window.onItheumLoaded && window.onItheumLoaded();
}
