import P5 from "p5";

export default class Camera {
    private static ZOOM_FACTOR: number = 10;
    private PI_DIV_BY_180: number | undefined;
    private rightVector: P5.Vector = new P5.Vector(1,0,0);
    private upVector: P5.Vector = new P5.Vector(0,1,0);
    private viewDir: P5.Vector = new P5.Vector(0,0,-1);
    private position: P5.Vector;
    private viewPoint: P5.Vector = new P5.Vector(0,0,0);
    private strafeFactor: number;
    private __P5Instance: P5 | undefined;
  
    constructor(x: number, y: number, z: number, strafeFactor: number, p5Instance?: P5) {
        this.position = new P5.Vector(x, y, z);
        this.strafeFactor = strafeFactor;
        if (p5Instance) {
            this.__P5Instance = p5Instance;
            this.PI_DIV_BY_180 = this.__P5Instance.PI/180;
        }
    }
    
    public setPositionTo(position: P5.Vector): void {
      this.position = position;
    }
  
    public render(): void {
        if (this.__P5Instance == undefined) {
            return;
        }

        const cam = this.__P5Instance.createCamera();
        //this.rotateAroundOrigin(xDragged, yDragged);
        /*
        eyeX camera position value on x axis
eyeY camera position value on y axis
eyeZ camera position value on z axis
centerX x coordinate representing center of the sketch
centerY y coordinate representing center of the sketch
centerZ z coordinate representing center of the sketch
upX x component of direction 'up' from camera
upY y component of direction 'up' from camera
upZ z component of direction 'up' from camera*/
        this.__P5Instance.camera(this.position.x, this.position.y, this.position.z, this.viewDir.x, this.viewDir.y, this.viewDir.z, this.upVector.x, this.upVector.y, this.upVector.z);      
    }
  
    private rotateAroundXAxis(angle: number): void {
        if (this.PI_DIV_BY_180 == undefined) {
            return;
        }
        // rotate viewDir around the right vector:
        const viewDirComponent: P5.Vector | undefined = this.getViewDirComponent(angle);
        if (viewDirComponent == undefined) {
            return;
        }
        const upVectorComponent: P5.Vector = new P5.Vector(this.upVector.x, this.upVector.y, this.upVector.z);
        upVectorComponent.mult(Math.sin(angle*this.PI_DIV_BY_180));

        viewDirComponent.add(upVectorComponent);
        viewDirComponent.normalize();

        this.viewDir.set(viewDirComponent);

        // now compute the new uP5.Vector (by CVec::cross product)
        this.upVector = this.viewDir.cross(this.rightVector);
        this.upVector.mult(-1);
    }
  
    public rotateAroundYAxis(angle: number): void {
        if (this.PI_DIV_BY_180 == undefined) {
            return;
        }
        // rotate viewDir around the up vector:
        const viewDirComponent: P5.Vector | undefined = this.getViewDirComponent(angle);
        if (viewDirComponent == undefined) {
            return;
        }

        const rightVectorComponent: P5.Vector = this.rightVector.copy();
        rightVectorComponent.mult(Math.sin(angle*this.PI_DIV_BY_180));

        viewDirComponent.sub(rightVectorComponent);
        viewDirComponent.normalize();
  
        this.viewDir.set(viewDirComponent);
   
        // now compute the new rightVector (by CVec::cross product)
        this.rightVector = this.viewDir.cross(this.upVector);
    }
    
    public rotateAroundOrigin(x: number, y: number): void {
      if (x == 0 && y == 0)
        return;
  
      const previousComponents:P5.Vector = new P5.Vector(
        this.position.dot(this.rightVector),
        this.position.dot(this.upVector),
        this.position.dot(this.viewDir));

      this.position.set(0,0,0);
  
      this.rotateAroundXAxis(x);
      this.rotateAroundYAxis(y);
    
      // go back by the recorded vector
      const tempRightVector: P5.Vector = this.rightVector.copy();
      tempRightVector.mult(previousComponents.x);
      
      const tempUpVector: P5.Vector = this.upVector.copy();
      tempUpVector.mult(previousComponents.y);
      
      const tempViewDir: P5.Vector = this.viewDir.copy();
      tempViewDir.mult(previousComponents.z);
  
      this.position.add(tempRightVector);
      this.position.add(tempUpVector);
      this.position.add(tempViewDir);
     
      //xDragged = 0;
      //yDragged = 0;
    }
    
    public viewAt(point: P5.Vector): void {
        this.viewPoint = point;
        this.position.z = -400;
    }
    
    public strafeUp(): void {
        this.position.y += this.strafeFactor;
        this.viewPoint.y += this.strafeFactor;
    }
  
    public strafeDown(): void {
        this.position.y -= this.strafeFactor;
        this.viewPoint.y -= this.strafeFactor;
    }
  
    public strafeLeft(): void {
        this.position.x -= this.strafeFactor;
        this.viewPoint.x -= this.strafeFactor;
    }
  
    public strafeRight(): void {
      this.position.x += this.strafeFactor;
      this.viewPoint.x += this.strafeFactor;
    }
    
    public zoomOut(): void {
      this.zoom(-Camera.ZOOM_FACTOR); 
    }
    
    public zoomIn(): void {
      this.zoom(Camera.ZOOM_FACTOR);
    }
  
    private zoom(zoomFactor: number): void {
      const v: P5.Vector = new P5.Vector(this.viewDir.x, this.viewDir.y, this.viewDir.z);
      v.mult(zoomFactor);
      this.position.x += v.x;
      this.position.y += v.y;
      this.position.z += v.z;    
    }
  
    private getViewDirComponent(angle: number): P5.Vector | undefined {
        if (this.PI_DIV_BY_180 == undefined) {
            return undefined;
        }
        const viewDirComponent: P5.Vector = new P5.Vector(this.viewDir.x, this.viewDir.y, this.viewDir.z);
        viewDirComponent.mult(Math.cos(angle*this.PI_DIV_BY_180));
        return viewDirComponent;
    }
  }
  