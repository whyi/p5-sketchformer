import p5 from "p5";
import Mesh2D, { BOUNDARY } from "./Mesh2D";
import GeometricOperations from "./GeometricOperations";

export default class DelaunayTriangulation extends Mesh2D {
    public addPoint(x: number, y: number): void {
        const newPoint = new p5.Vector(x, y);
        this.vertices.push(newPoint);
        ++this.numberOfVertices;

        let currentNumberOfTriangles = this.numberOfTriangles;

        for (let triangleIndex = 0; triangleIndex < currentNumberOfTriangles; ++triangleIndex) {
          if (this.isInTriangle(triangleIndex, newPoint)) {
            const A = triangleIndex*3;
            const B = A+1;
            const C = A+2;
      
            this.corners.push(this.corners[B]);
            this.corners.push(this.corners[C]);
            this.corners.push(this.numberOfVertices-1);
      
            this.corners.push(this.corners[C]);
            this.corners.push(this.corners[A]);
            this.corners.push(this.numberOfVertices-1);
      
            this.corners[C] = this.numberOfVertices-1;
            
            const dirtyCorner1 = C;
            const dirtyCorner2 = this.numberOfTriangles*3+2;
            const dirtyCorner3 = this.numberOfTriangles*3+5;

            const dirtyCorners: number[] = [dirtyCorner1, dirtyCorner2, dirtyCorner3];
      
            this.numberOfTriangles += 2;
            this.numberOfCorners += 6;
            this.fixMesh(dirtyCorners);
            break;
          }
        }
    }

    public isInTriangle(triangleId: number, point: p5.Vector): boolean {
        const cornerId = triangleId*3;
        const pointA = this.getGeometry(cornerId);
        const pointB = this.getGeometry(this.getNextCornerId(cornerId));
        const pointC = this.getGeometry(this.getPreviousCornerId(cornerId));
        
        if (GeometricOperations.isLeftTurn(pointA,pointB,point) == GeometricOperations.isLeftTurn(pointB,pointC,point) &&
            GeometricOperations.isLeftTurn(pointA,pointB,point) == GeometricOperations.isLeftTurn(pointC,pointA,point)) {
          return true;
        }
      
        return false;
    }

    public fixMesh(dirtyCorners: number[]): void {
        this.buildOTable();
  
        while (dirtyCorners.length > 0) {
          this.flipCorner(dirtyCorners[0]);
          dirtyCorners.shift();
        }
    }

    public flipCorner(cornerId: number): void {
        if (cornerId == BOUNDARY)
            return;

        this.buildOTable();    

        // boundary, do nothing..
        if (this.getOppositeCornerId(cornerId) == BOUNDARY)
            return;

        // already satisfy Delaunay property.
        if (this.isDelaunay(cornerId))
            return;

        const opposite = this.getOppositeCornerId(cornerId);
    
        this.corners[this.getNextCornerId(cornerId)] = this.corners[opposite];
        this.corners[this.getNextCornerId(opposite)] = this.corners[cornerId];
    
        this.buildOTable();
        this.flipCorner(cornerId);
        this.buildOTable();
        this.flipCorner(this.getNextCornerId(opposite));
    }

    public isDelaunay(cornerId: number): boolean {
        const pointA = this.getGeometry(cornerId);
        const pointB = this.getGeometry(this.getPreviousCornerId(cornerId));
        const pointC = this.getGeometry(this.getNextCornerId(cornerId));
        
        const circumcenter = GeometricOperations.circumcenter(pointA, pointB, pointC);
        const radius = pointA.dist(circumcenter);
        const oppositePoint = this.getGeometry(this.getOppositeCornerId(cornerId));

        return oppositePoint.dist(circumcenter) > radius;
    }
}
