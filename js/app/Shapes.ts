/// <reference path="..\typings\jquery.d.ts" />
//
// Module containing Drawing Shapes
// 
module Shapes {

	export var ShapeType = {
		Line : 1,
		Rectangle : 2,
		Square : 3,
		Circle : 4,
		Ellipse : 5,
		Arc : 6
	};

	export interface IShapeOptions {
		id: number;
	 	x: number;
	 	y: number;
	 	strokeStyle: string;
	 	lineWidth: number;
	 	ev?: JQueryMouseEventObject
	}

	export interface IShape { 
	 	draw: (context: CanvasRenderingContext2D) => void;
	}

	//
	// Shape
	//
	export class Shape implements IShape {

		shapeType: number;
		id: number;
	 	x: number;
	 	y: number;
	 	strokeStyle: string;
	 	lineWidth: number;

	 	constructor (options: IShapeOptions) {
	 		this.id = options.id;
	 		this.x = options.x;
	 		this.y = options.y;
	 		this.strokeStyle = options.strokeStyle;
	 		this.lineWidth = options.lineWidth;
	 	}

	 	draw (context: CanvasRenderingContext2D) {
	 		//context.drawRect(this.x);
	 	}
	}

	export interface IRectangleOptions extends IShapeOptions {
		width: number;
	 	height: number;
	 	fill?: boolean;
	 	fillStyle?: string;
	 }

	//
	// Rectangle
	//
	export class Rectangle extends Shape {

	 	width: number;
	 	height: number;
	 	fill: boolean;
	 	fillStyle: string;

	 	constructor (options: IRectangleOptions) {
	 		super(options);
	 		this.shapeType = ShapeType.Rectangle;
	 		this.width = options.width;
	 		if (undefined !== options.height)
	 			this.height = options.height;
	 		if (undefined !== options.fill)
	 			this.fill = options.fill;
	 		else
	 			this.fill = false;
	 		if (undefined !== options.fillStyle)
	 			this.fillStyle = options.fillStyle;
	 	}

	 	draw (context: CanvasRenderingContext2D) {
	 		context.strokeStyle = this.strokeStyle;
	 		context.lineWidth = this.lineWidth;
	 		if (!this.fill) {
				context.strokeRect (this.x, this.y, this.width, this.height);
			}
			else {
				var endX = this.x + this.width - 1;
				var endY = this.y + this.height - 1;
				context.beginPath();
				context.moveTo (this.x, this.y);
				context.lineTo (endX, this.y);
				context.lineTo (endX, endY);
				context.lineTo (this.x, endY);
				context.lineTo (this.x, this.y-(this.lineWidth/2));
				context.stroke();						
				context.closePath();

				context.fillStyle = this.fillStyle;
				context.fill();
			}
		}
	}

	export interface ILineOptions extends IShapeOptions {
		endX: number;
	 	endY: number;
	}

	//
	// Line
	//
	export class Line extends Shape {

	 	endX: number;
	 	endY: number;

	 	constructor (options: ILineOptions) {
	 		super(options);
	 		this.shapeType = ShapeType.Line;
	 		this.endX = options.endX;
	 		this.endY = options.endY;
	 	}

	 	draw (context: CanvasRenderingContext2D) {
	 		context.strokeStyle = this.strokeStyle;
	 		context.lineWidth = this.lineWidth;
			context.beginPath();
			context.moveTo (this.x, this.y);
			context.lineTo (this.endX,   this.endY);
			context.stroke();
			context.closePath();
	 	}
	}

	export interface ICircleOptions extends IShapeOptions {
		radius: number;
	 	fill?: boolean;
	 	fillStyle?: string;	
	 }

	//
	// Circle
	//
	export class Circle extends Shape {

		radius: number;
	 	fill: boolean;
	 	fillStyle: string;

	 	constructor (options: ICircleOptions) {
	 		super(options);
	 		this.shapeType = ShapeType.Circle;
	 		this.radius = options.radius;
	 		if (undefined !== options.fill)
	 			this.fill = options.fill;
	 		else
	 			this.fill = false;
	 		if (undefined !== options.fillStyle)
	 			this.fillStyle = options.fillStyle;
	 	}

	 	draw (context: CanvasRenderingContext2D) {
			context.strokeStyle = this.strokeStyle;
	 		context.lineWidth = this.lineWidth;
			context.beginPath();
			context.arc (this.x, this.y, this.radius, (Math.PI/180)*0, (Math.PI/180)*360, false);
			context.stroke();
			context.closePath();

			if (this.fill) {
				context.fillStyle = this.fillStyle;
				context.fill();
			}
	 	}
	}

	export interface IArcOptions extends IShapeOptions {
		radius: number;
	 	angle: number;
	 	counterclockwise: boolean;	
	 }

	//
	// Arc
	//
	export class Arc extends Shape {

		radius: number;
	 	angle: number;
	 	counterclockwise: boolean;	

	 	constructor (options: IArcOptions) {
	 		super(options);
	 		this.shapeType = ShapeType.Arc;
	 		this.radius = options.radius;
	 		this.angle = options.angle;
	 		this.counterclockwise = options.counterclockwise;
	 	}

	 	draw (context: CanvasRenderingContext2D) {
			context.strokeStyle = this.strokeStyle;
	 		context.lineWidth = this.lineWidth;
			context.beginPath();
			context.arc (this.x, this.y, this.radius, (Math.PI/180)*0, (Math.PI/180)*this.angle, this.counterclockwise);
			context.stroke();
			context.closePath();
	 	}
	}
}
