

function Line() {
	
	this.leftX = 0;
	this.leftY = 0;
	this.rightX = 0;
	this.rightY = 0;
	this.color = "red";
	this.width = 1;

		
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.stroke = stroke;
	this.strokeWidth = strokeWidth;
	this.draw = draw;
		
	function x1() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.leftX;
		else {
			this.leftX = arguments[0];
			return this;
		}
	}
	function y1() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.leftY;
		else {
			this.leftY = arguments[0];
			return this;
		}
	}
	function x2() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.rightX;
		else {
			this.rightX = arguments[0];
			return this;
		}
	}
	function y2() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.rightY;
		else {
			this.rightY = arguments[0];
			return this;
		}
	}
	function stroke() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.color;
		else {
			this.color = arguments[0];
			return this;
		}
	}
	function strokeWidth() {
		var numargs = arguments.length;
		if (numargs == 0)
			return this.rightX;
		else {
			this.rightX = arguments[0];
			return this;
		}
	}
	function draw(svg) {
		//svg.moveTo(this.leftX, this.leftY);
		return this;
	}
	

			
}
