/**
 * Allows Javascript inheritance
 */
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

/// <reference path="..\typings\jquery.d.ts" />
//
// Module containing Drawing Shapes
//
var Shapes;
(function (Shapes) {
    Shapes.ShapeType = {
        Line: 1,
        Rectangle: 2,
        Square: 3,
        Circle: 4,
        Ellipse: 5,
        Arc: 6,
        PencilDrawing: 7
    };

    /**
    * @class Shape
    * @classdesc The base shape class.
    */
    var Shape = (function () {
        function Shape(options) {
            this.id = options.id;
            this.x = options.x;
            this.y = options.y;
            this.strokeStyle = options.strokeStyle;
            this.lineWidth = options.lineWidth;
        }
        Shape.prototype.draw = function (context) {
            //context.drawRect(this.x);
        };
        return Shape;
    })();
    Shapes.Shape = Shape;

    /**
    * @class Rectangle
    * @classdesc The rectangle shape.
    */
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle(options) {
            _super.call(this, options);
            this.shapeType = Shapes.ShapeType.Rectangle;
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
        Rectangle.prototype.draw = function (context) {
            context.strokeStyle = this.strokeStyle;
            context.lineWidth = this.lineWidth;
            if (!this.fill) {
                context.strokeRect(this.x, this.y, this.width, this.height);
            } else {
                var endX = this.x + this.width - 1;
                var endY = this.y + this.height - 1;
                context.beginPath();
                context.moveTo(this.x, this.y);
                context.lineTo(endX, this.y);
                context.lineTo(endX, endY);
                context.lineTo(this.x, endY);
                context.lineTo(this.x, this.y - (this.lineWidth / 2));
                context.stroke();
                context.closePath();

                context.fillStyle = this.fillStyle;
                context.fill();
            }
        };
        return Rectangle;
    })(Shape);
    Shapes.Rectangle = Rectangle;

    /**
    * @class Line
    * @classdesc The line shape.
    */
    var Line = (function (_super) {
        __extends(Line, _super);
        function Line(options) {
            _super.call(this, options);
            this.shapeType = Shapes.ShapeType.Line;
            this.endX = options.endX;
            this.endY = options.endY;
        }
        Line.prototype.draw = function (context) {
            context.strokeStyle = this.strokeStyle;
            context.lineWidth = this.lineWidth;
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.endX, this.endY);
            context.stroke();
            context.closePath();
        };
        return Line;
    })(Shape);
    Shapes.Line = Line;

    /**
    * @class Circle
    * @classdesc The circle shape.
    */
    var Circle = (function (_super) {
        __extends(Circle, _super);
        function Circle(options) {
            _super.call(this, options);
            this.shapeType = Shapes.ShapeType.Circle;
            this.radius = options.radius;
            if (undefined !== options.fill)
                this.fill = options.fill;
            else
                this.fill = false;
            if (undefined !== options.fillStyle)
                this.fillStyle = options.fillStyle;
        }
        Circle.prototype.draw = function (context) {
            context.strokeStyle = this.strokeStyle;
            context.lineWidth = this.lineWidth;
            context.beginPath();
            context.arc(this.x, this.y, this.radius, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
            context.stroke();
            context.closePath();

            if (this.fill) {
                context.fillStyle = this.fillStyle;
                context.fill();
            }
        };
        return Circle;
    })(Shape);
    Shapes.Circle = Circle;

    /**
    * @class Arc
    * @classdesc The circle shape.
    */
    var Arc = (function (_super) {
        __extends(Arc, _super);
        function Arc(options) {
            _super.call(this, options);
            this.shapeType = Shapes.ShapeType.Arc;
            this.radius = options.radius;
            this.angle = options.angle;
            this.counterclockwise = options.counterclockwise;
        }
        Arc.prototype.draw = function (context) {
            context.strokeStyle = this.strokeStyle;
            context.lineWidth = this.lineWidth;
            context.beginPath();
            context.arc(this.x, this.y, this.radius, (Math.PI / 180) * 0, (Math.PI / 180) * this.angle, this.counterclockwise);
            context.stroke();
            context.closePath();
        };
        return Arc;
    })(Shape);
    Shapes.Arc = Arc;

    /**
    * @class Line
    * @classdesc The line shape.
    */
    var PencilDrawing = (function (_super) {
        __extends(PencilDrawing, _super);
        function PencilDrawing(options) {
            _super.call(this, options);
            this.shapeType = Shapes.ShapeType.PencilDrawing;
            this.endX = options.endX;
            this.endY = options.endY;
            if (undefined !== options.points)
                this.points = options.points;
            else
                this.points = [];
        }
        PencilDrawing.prototype.addPoint = function (point) {
            this.points.push(point);
        };

        PencilDrawing.prototype.draw = function (context) {
            context.strokeStyle = this.strokeStyle;
            context.lineWidth = this.lineWidth;
            context.beginPath();
            context.moveTo(this.x, this.y);

            var i, len = this.points.length;
            for (i = 0; i < len; i += 1) {
                context.lineTo(this.points[i].x, this.points[i].y);
            }

            context.stroke();
            context.closePath();
        };
        return PencilDrawing;
    })(Shape);
    Shapes.PencilDrawing = PencilDrawing;
})(Shapes || (Shapes = {}));
