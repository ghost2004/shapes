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
	var alg_idx = 0;
	for (var a in algorithm) {
		data[alg_idx] = new Array();
		for (var s in system) {
			for (var d in dataType) {
				var idx = a + s + d;
				data[alg_idx].push(runtimeData[idx]);
			}
		}
		alg_idx++;
	}
    // Draw
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
    // r.rect(0, 0, width, height, 5).attr({fill: "#000", stroke: "none"});
    for (var i = 0, ii = axisx.length; i < ii; i++) {
        r.text(leftgutter + X * (i + .5), 280, axisx[i]).attr(txt);
    }
    for (var i = 0, ii = axisy.length; i < ii; i++) {
        r.text(30, Y * (i + .5), axisy[i]).attr(txt);
    }
    var o = 0;
    for (var i = 0, ii = axisy.length; i < ii; i++) {
        for (var j = 0, jj = axisx.length; j < jj; j++) {
            var R = data[0][o] && Math.min(Math.round(Math.sqrt(data[0][o] / Math.PI) * 4), max)*5;
            if (R) {
                (function (dx, dy, R, value) {
                    var color = "hsb(" + [(1 - R / max) * .5, 1, .75] + ")";
                    var dt = r.circle(dx + 60 + R, dy + 10, R).attr({stroke: "none", fill: color});
                    if (R < 6) {
                        var bg = r.circle(dx + 60 + R, dy + 10, 6).attr({stroke: "none", fill: "#000", opacity: .4}).hide();
                    }
                    var lbl = r.text(dx + 60 + R, dy + 10, data[0][o])
                            .attr({"font": '10px Fontin-Sans, Arial', stroke: "none", fill: "#fff"}).hide();
                    var dot = r.circle(dx + 60 + R, dy + 10, max).attr({stroke: "none", fill: "#000", opacity: 0});
                    dot[0].onmouseover = function () {
                        if (bg) {
                            bg.show();
                        } else {
                            var clr = Raphael.rgb2hsb(color);
                            clr.b = .5;
                            dt.attr("fill", Raphael.hsb2rgb(clr).hex);
                        }
                        lbl.show();
                    };
                    dot[0].onmouseout = function () {
                        if (bg) {
                            bg.hide();
                        } else {
                            dt.attr("fill", color);
                        }
                        lbl.hide();
                    };
                })(leftgutter + X * (j + .5) - 60 - R, Y * (i + .5) - 10, R, data[0][o]);
            }
            o++;
        }
    }
});