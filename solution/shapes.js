var NS="http://www.w3.org/2000/svg";

// Object Line
function Line() {
	this.leftX = 0;
	this.leftY = 0;
	this.rightX = 0;
	this.rightY = 0;
	this.color = "red";
	this.width = 1;
		
	this.x1 = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.leftX;
		else {
			this.leftX = arguments[0];
			return this;
		}
	};
	
	this.y1 = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.leftY;
		else {
			this.leftY = arguments[0];
			return this;
		}
	};
	
	this.x2 = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.rightX;
		else {
			this.rightX = arguments[0];
			return this;
		}
	};
	
	this.y2 = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.rightY;
		else {
			this.rightY = arguments[0];
			return this;
		}
	};
	
	this.stroke = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.color;
		else {
			this.color = arguments[0];
			return this;
		}
	};
	
	this.strokeWidth = function() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.width;
		else {
			this.width = arguments[0];
			return this;
		}
	};
	
	this.draw = function(svg) {
		var shape = document.createElementNS(NS, "line");
    	shape.setAttributeNS(null, "x1", this.leftX);
    	shape.setAttributeNS(null, "y1", this.leftY);
    	shape.setAttributeNS(null, "x2", this.rightX);
    	shape.setAttributeNS(null, "y2", this.rightY);
    	shape.setAttributeNS(null, "stroke", this.color);
    	shape.setAttributeNS(null, "stroke-width", this.width);
		svg.appendChild(shape);
		return this;
	};
}
// 
function Rectangle() {
	this.color = red;
	this.cX = 0;
	this.cY = 0;
	this.height = 0;
	this._width = 0;
	
	this.center = function(c1, c2) {
		this.cX = c1;
		this.cY = c2;
		return this;
	};
	this.width = function() {
		
	};
	
}
