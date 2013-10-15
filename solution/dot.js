$(function () {
    // Grab the data
    var data = [],
        axisx = [],
        axisy = [];
        
    var algorithm = {};
	var system = {};
	var dataType = {};
	var runtimeData = {};
	
	for (var i in runtime){
		var rt = runtime[i];
		algorithm[rt.algorithm] = true;
		system[rt.system] = true;
		dataType[rt.type] = true;
		var idx = rt.algorithm + rt.system + rt.type;
		runtimeData[idx] = rt.time;
	}
	// Axis Y -- System
	for (var s in system)  {
		axisy.push(s);
	}
	// Axis X -- Type
	for (var d in dataType) {
		axisx.push(d);
	}
	
	// Data -- runtime for each algorithm
	var algName = new Array(algorithm.length);
	var alg_idx = 0;
	for (var a in algorithm) {
		data[alg_idx] = new Array();
		for (var s in system) {
			for (var d in dataType) {
				var idx = a + s + d;
				data[alg_idx].push(runtimeData[idx]);
			}
		}
		algName[alg_idx] = a;
		alg_idx++;
	}
    // Draw Text on Axis
    var width = 800,
        height = 300,
        leftgutter = 30,
        bottomgutter = 20,
        r = Raphael("chart", width, height),
        txt = {"font": '18px Fontin-Sans, Arial', stroke: "none", fill: "#fff"},
        X = (width - leftgutter) / axisx.length,
        Y = (height - bottomgutter) / axisy.length,
        color = $("#chart").css("color");
        max = Math.round(X / 2) - 1;

    for (var i = 0, ii = axisx.length; i < ii; i++) {
        r.text(leftgutter + X * (i + .5), 280, axisx[i]).attr(txt);
    }
    for (var i = 0, ii = axisy.length; i < ii; i++) {
        r.text(30, Y * (i + .5), axisy[i]).attr(txt);
    }
    
    // Draw buttons
    var now = 0;
    curAlg = r.text(350, 10, algName[now]).attr({fill: "#fff", stroke: "none", "font": '100 18px "Helvetica Neue", Helvetica, "Arial Unicode MS", Arial, sans-serif'}),
    rightc = r.circle(404, 10, 10).attr({fill: "#fff", stroke: "none"}),
    right = r.path("M400,5l10,5 -10,5z").attr({fill: "#000"}),
    leftc = r.circle(296, 10, 10).attr({fill: "#fff", stroke: "none"}),
    left = r.path("M300,5l-10,5 10,5z").attr({fill: "#000"});
    
    // Array for all dots
    var dts = new Array();
    // Array for all the labels
    var lbls = new Array();
    
	// Initialize the first algorithm view
    var o = 0;
    for (var i = 0, ii = axisy.length; i < ii; i++) {
        for (var j = 0, jj = axisx.length; j < jj; j++) {
            var R = data[now][o] && Math.min(Math.round(Math.sqrt(data[now][o] / Math.PI) * 4), max)*12;
            if (R) {
                (function (dx, dy, R) {
                    var color = "hsb(" + [(1 - R / max) * .5, 1, .75] + ")";
                    var dt = r.circle(dx + 60 + R, dy + 10, R).attr({stroke: "none", fill: color});
                    var lbl = r.text(dx + 60 + R, dy + 10, data[now][o])
                            .attr({"font": '12px Fontin-Sans, Arial', stroke: "none", fill: "#fff"}).show();
                    dts.push(dt);
                    lbls.push(lbl);
                })(leftgutter + X * (j + .5) - 60 - R, Y * (i + .5) - 10, R);
            }
            o++;
        }
    }
    // when change the algorithm
    var changeAlgorithm = function () {
    	if (now < 0)
    		now = algName.length - 1;
    	else if (now > algName.length - 1)
    		now = 0;
    	curAlg.attr({text: algName[now]}); 
        var o = 0;
        for (var i = 0, ii = axisy.length; i < ii; i++) {
            for (var j = 0, jj = axisx.length; j < jj; j++) {
                var R = data[now][o] && Math.min(Math.round(Math.sqrt(data[now][o] / Math.PI) * 4), max)*12;
                if (R) {
                    (function (dx, dy, R) {
                    	var color = "hsb(" + [(1 - R / max) * .5, 1, .75] + ")";
                    	dts[o].animate({cx: dx + 60 + R, cy: dy + 10, r: R, fill:color}, 400);
                        lbls[o].attr({x:dx + 60 + R, y: dy + 10, text: data[now][o]});
                    })(leftgutter + X * (j + .5) - 60 - R, Y * (i + .5) - 10, R);
                }
                o++;
            }
        }
    	
    };
    
    var next = function () {
    	now ++;
    	changeAlgorithm();
    };
    
    var prev = function () {
    	now --;
    	changeAlgorithm();
    };
    
    rightc.click(next);
    right.click(next);
    leftc.click(prev);
    left.click(prev);
    
});