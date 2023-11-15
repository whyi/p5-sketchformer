/**
 * @jest-environment jsdom
 */

import {expect} from '@jest/globals';
import P5, { Vector } from "p5";
import DelaunayTriangulation from '../../src/DelaunayTriangulation';
import { BOUNDARY } from '../../src/Mesh2D';

const flipCornerSpy = jest.spyOn(DelaunayTriangulation.prototype, 'flipCorner')
const buildOTableSpy = jest.spyOn(DelaunayTriangulation.prototype, 'buildOTable')
const isDelaunayMock = jest
.spyOn(DelaunayTriangulation.prototype, 'isDelaunay')
.mockImplementation((cornerId: number) => {
  return true;
});

let twoTriangles: DelaunayTriangulation;
function InitTwoTriangles()
{
    /*
    0--1
    |\ |
    | \|
    3--2
    */
    twoTriangles = new DelaunayTriangulation(1)
    twoTriangles.vertices = [
        new P5.Vector(0,0),
        new P5.Vector(0,1),
        new P5.Vector(1,1),
        new P5.Vector(1,0)
    ];
    twoTriangles.numberOfVertices = 4;
    twoTriangles.corners = [0,1,2,2,3,0];
    twoTriangles.numberOfTriangles = 2;
    twoTriangles.numberOfCorners = 6;
}
beforeEach(() => {
    InitTwoTriangles();
});

afterEach(() => {
    InitTwoTriangles();
    flipCornerSpy.mockClear();
    buildOTableSpy.mockClear();
    isDelaunayMock.mockClear();
})

describe('DelaunayTriangulation', () => {
  describe("addPoint", () => {
    it ("creates a new point from x,y coordiante and add it to gemoetry table", () => {
      twoTriangles.addPoint(0.1, 0.1);
      expect(twoTriangles.vertices[twoTriangles.vertices.length-1]).toStrictEqual(new P5.Vector(0.1, 0.1));
      expect(twoTriangles.numberOfVertices).toBe(5);
    })
  })

  describe("isInTriangle", () => {
    it ("returns true when given point is in triangle", () => {
      var newPoint = new Vector(0.8, 0.1);
      expect(twoTriangles.isInTriangle(0, newPoint)).toBe(false);
    })

    it ("returns false when given point is not in triangle", () => {
      var newPoint = new Vector(0.8, 0.1);
      expect(twoTriangles.isInTriangle(1, newPoint)).toBe(true);
    })
  })

  describe("fixMesh", () => {
    it ("recursively flipCorners", () => {
      const dirtyCorners:number[] = [0,1,2];
      twoTriangles.fixMesh(dirtyCorners);
      expect(flipCornerSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
    })
  })

  describe("flipCorner", () => {
    it ("immediately returns when given a boundary", () => {
      twoTriangles.flipCorner(BOUNDARY);
      expect(flipCornerSpy).toBeCalledTimes(1);
    })

    it ("buid O Table and returns if opposite of given corner is a boundary", () => {
      twoTriangles.flipCorner(0);
      expect(flipCornerSpy).toBeCalledTimes(1);
      expect(buildOTableSpy).toBeCalledTimes(2);
    })

    it ("does not process if given corner already satisfy Delaunay property", () => {
      twoTriangles.flipCorner(4);
      expect(flipCornerSpy).toBeCalledTimes(1);
      expect(buildOTableSpy).toBeCalledTimes(2);
      expect(isDelaunayMock).toBeCalledTimes(1);
    })
  })

  describe("isDelaunay", () => {
    it ("returns false if opposite corner is inside of circumcircle's radius", () => {
      isDelaunayMock.mockRestore();
      twoTriangles.buildOTable();
      expect(twoTriangles.isDelaunay(4)).toBe(false);
    })
    
    it ("returns true if opposite corner is outside of circumcircle's radius", () => {
      /*
      Modify initial mock to make a very skewed triangles
      0--1          0--1
      |\ |   =>     |\_______________ 
      | \|          |                 \|
      3--2          3------------------2
      */
      twoTriangles.vertices = [
          new P5.Vector(0,0),
          new P5.Vector(0,1),
          new P5.Vector(1,1),
          new P5.Vector(1000,0)
      ];
      isDelaunayMock.mockRestore();
      twoTriangles.buildOTable();
      expect(twoTriangles.isDelaunay(1)).toBe(true);
    })
  })
});