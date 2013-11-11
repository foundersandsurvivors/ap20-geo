   
    var initTime_id, lookAt, controlerTimeSpan;

	var docloc = document.location+'';
	var rootPath = docloc.substr(0,docloc.indexOf('pages')); // includes slash
	
	var folderPath = docloc.substr(0,docloc.lastIndexOf('/')+1); 
	
	//alert(rootPath);
	if (rootPath.indexOf('file:')===0) rootPath='http://collection.temporalearth.local/';
	var controllerTimeSpan;

	
	google.load("earth", "1");
	
	var ge = null;
	
	var controlerTimeSpan;
	
	
	function init() {
		google.earth.createInstance("map3d", initCallback, failureCallback);
	}
	
	function initCallback(object) {
		ge = object;
		ge.getWindow().setVisibility(true);
		
		ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
		//ge.getNavigationControl().getScreenXY().setXUnits(ge.UNITS_PIXELS);
		//ge.getNavigationControl().getScreenXY().setYUnits(ge.UNITS_INSET_PIXELS);
	
		ge.getTime().getControl().setVisibility(ge.VISIBILITY_SHOW);
		//ge.getTime().setRate(0);
		controlerTimeSpan = ge.createTimeSpan('controlerTimeSpan');

		
		initKMLCheckboxes();
		
		initView();
		initTime();
			
		google.earth.addEventListener(ge.getView(), 'viewchangeend', function(){
			//ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);
		  }
		);	
	}

	function initView() {
		//alert('initView');
		var lookAt = ge.createLookAt('');

		ge.getWindow().setVisibility(true);
		
		ge.getOptions().setFlyToSpeed(1);
		
		lookAt.setLatitude(-36.5);
		lookAt.setLongitude(145);
		lookAt.setRange(1000000); //default is 0.0
		//alert(document.getElementById("lookAt_latitude").value);
		if (document.getElementById("lookAt_latitude")) { lookAt.setLatitude(parseFloat(document.getElementById("lookAt_latitude").value)); }
		if (document.getElementById("lookAt_longitude")) { lookAt.setLongitude(parseFloat(document.getElementById("lookAt_longitude").value)); }
		if (document.getElementById("lookAt_range")) { lookAt.setRange(parseFloat(document.getElementById("lookAt_range").value)); }
		
		lookAt.setTilt(0); //default is 0.0
		ge.getView().setAbstractView(lookAt);
	
	}

	function initKMLCheckboxes() {
		kml_checkboxes = document.getElementsByClassName('kml-checkbox');
		for (var i = 0; i < kml_checkboxes.length; i++) {
			var kml_checkbox = kml_checkboxes[i];
			treatKMLCheckbox(kml_checkbox);
			kml_checkbox.addEventListener("click", function(event) {treatKMLCheckbox(event.target);}, false);
		}
		
		kml_inputs = document.getElementsByClassName('kml-replay');
		for (var i = 0; i < kml_inputs.length; i++) {
			var kml_input = kml_inputs[i];
			if (kml_input.value == 'replay') {
				kml_input.addEventListener("click", function(event) {initTime();}, false);
			} else if (kml_input.value == 'slow') {
				kml_input.addEventListener("click", function(event) {slowTime();}, false);
			}	
		}	

	}


	function treatKMLCheckbox(kml_checkbox) {
		//alert (kml_checkbox.value + " is " + (kml_checkbox.checked ? "checked" : "unchecked"));
	
		if (!kml_checkbox.loadingNode) {
			loadingText = document.createTextNode('');
			loadingNode = document.createElement('span');
			loadingNode.style.paddingLeft = '0.5em';
			loadingNode.appendChild(loadingText);			
			kml_checkbox.loadingNode = kml_checkbox.parentNode.appendChild(loadingNode);
		}

		if (kml_checkbox.checked) {
			var href = absolute(docloc, kml_checkbox.value);
			//var href = 'file:///_Development/_TemporalEarth/_collection_temporalearth/outputKML/JamesCook-1stVoyage.kml';
			//alert(href);
			
			//alert(kml_checkbox.parentNode);
			kml_checkbox.loadingNode.innerHTML = 'loading';
			kml_checkbox.loadingNode.style.color = '#666';
			
			google.earth.fetchKml(ge, href, function(kmlObject) {
				if (kmlObject) {
					kml_checkbox.kmlObject = kmlObject;
					
					//alert(kml_checkbox.parentNode.lastChild.innerHTML);
					kml_checkbox.loadingNode.innerHTML = 'done';
					kml_checkbox.loadingNode.style.color = '#6A6';
					//kml_checkbox.parentNode.getElementById('loading').style.display = 'none';
					
					ge.getFeatures().appendChild(kmlObject);

					clearTimeout(initTime_id);
					initTime_id = setTimeout('initTime()', 1000);
					//initTime();
					
			
				} else {
					kml_checkbox.loadingNode.innerHTML = 'failed';
					kml_checkbox.loadingNode.style.color = '#F66';
				}
			});
		} else {
			if (kml_checkbox.kmlObject) {
				ge.getFeatures().removeChild(kml_checkbox.kmlObject);
				kml_checkbox.loadingNode.innerHTML = '';
				kml_checkbox.loadingNode.style.color = '#fff';
			}
		}
	}
	
	function initTime() {
		clearTimeout(initTime_id);
		//alert('initTime');
		controlerTimeSpan.getBegin().set('1790');
		controlerTimeSpan.getEnd().set('1800');
		if (document.getElementById("timeline_begin")) { controlerTimeSpan.getBegin().set(document.getElementById("timeline_begin").value); }
		if (document.getElementById("timeline_end")) { controlerTimeSpan.getEnd().set(document.getElementById("timeline_end").value); }
		if (document.getElementById("timeline_when")) {
			controlerTimeSpan.getBegin().set(document.getElementById("timeline_when").value); 
			controlerTimeSpan.getEnd().set(document.getElementById("timeline_when").value); 
		}
		ge.getTime().setTimePrimitive(controlerTimeSpan);
		//ge.getTime().setRate(60*60*24*10*10);
		if (document.getElementById("timeline_rate")) {
			ge.getTime().setRate(parseFloat(document.getElementById("timeline_rate").value));			
		} else {
			ge.getTime().setRate(60*60*24*365*10);
		}
	
	}
	
	function slowTime() {
		clearTimeout(initTime_id);
		if (document.getElementById("timeline_rate")) {
			ge.getTime().setRate(parseFloat(document.getElementById("timeline_rate").value)/10);			
		} else {
			ge.getTime().setRate(60*60*24*365*10/10);
		}
	}
	
	
	function tourCook() {
	
		google.earth.addEventListener(ge, 'frameend', checkDate);	

		ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);

		gotoStart();
		
		ge.getTime().setRate(60*60*24*10);
		
		google.earth.addEventListener(ge.getGlobe(), 'mousedown', function() { dontFollowShip=true;  });

		//ge.getTime().getControl().setCalculatedRate(60*60*24*10);  //DNW
	
		//STUFF DOWN HERE DOESN'T SEEM TO WORK!!
	}
	
	function checkDate() {
	   var time = ge.getTime().getTimePrimitive();
		var currentDate;
		currentDate = time.getEnd().get();
		  /* if (time.getType() == 'KmlTimeSpan') {
		      //alert('TimeSpan from ' + time.getBegin().get() + ' to ' + time.getEnd().get());
			currentDate = time.getEnd().get();
		   } else {
		     // alert('TimeStamp at ' + time.getWhen().get());
			currentDate = time.getWhen().get();
		   }*/
		
		if (lastDate == currentDate) {
			if (shownDate != currentDate) {
				//alert(currentDate);
				//document.getElementById('showDate').innerHTML = currentDate;
				shownDate = currentDate;
			}
		} else {
	
	
			year = parseInt(currentDate.substr(0,4));
			month = getVal(currentDate.substr(5,2));
			day = getVal(currentDate.substr(8,2));

			showDate();
			loadPageForDate(year+twoDigits(month)+twoDigits(day));
			
			followShip();
		}
		
		lastDate = currentDate;
	}

	function showDate() {
		document.getElementById('showDate').innerHTML = day + ' ' + monthNames[month-1] + ' ' + year;
		
		
		
	
		//document.getElementById('showDate').innerHTML = currentDate;
	}

	function forwardMonth() {
		month++;
		if (month > 12) {month = 1; year++;}
	}
	
	function backMonth() {
		month--;
		if (month < 1) {month = 12; year--;}
	}
	
	function forwardDay() {
		day++;
		if (day > monthDays[month-1]) {day = 1; forwardMonth()};
	}
	
	function backDay() {
		day--;
		if (day < 1) {backMonth(); day = monthDays[month-1];} 
	}
	
	function feedTime() {
		//alert(day);
		showDate();
		//alert('feedTime');
		
	   var time = ge.getTime().getTimePrimitive();
		var currentBegin = time.getBegin().get();
		var currentEnd = time.getEnd().get();
		
		var currentDiff = parseInt(currentEnd.substr(0,4)) - parseInt(currentBegin.substr(0,4));
		if (currentDiff > 2) {
			yearBack = year-currentDiff;
			monthBack=month;
		} else {
			var yearBack = year;
			var monthBack = month-2;
			if (monthBack < 1) {monthBack+=12; yearBack--;}
		}
		
		//alert(yearBack + '-' + twoDigits(monthBack) + '-' + twoDigits(day) + ' to ' + year + '-' + twoDigits(month) + '-' + twoDigits(day));
		
		var beginCode = yearBack + '-' + twoDigits(monthBack) + '-' + twoDigits(day);
		var endCode = year + '-' + twoDigits(month) + '-' + twoDigits(day);
		currentDate = endCode;
		
		//google.earth.removeEventListener(ge, 'frameend', checkDate);	
		controllerTimeSpan.getBegin().set(beginCode);
		controllerTimeSpan.getEnd().set(endCode);
		ge.getTime().setTimePrimitive(controllerTimeSpan);
		ge.getTime().setRate(0);
		//google.earth.addEventListener(ge, 'frameend', checkDate);	
		
		return false;
	}

	function twoDigits(value) {
		if (value < 10) {
			return '0'+value;
		} else {
			return ''+value;
		}
	}

	function followShip() {
	
	if (dontFollowShip) return;
	
	//alert("doing it");
	
		var days = (year-1768)*365+month*30+day-238
		//alert(year+' | '+month+' | '+day+' = '+ days);
		//alert(days);
		
		if (days >=0 && days <= 1081) {
			var long = -days/1081*360;
			if (long<-180) long+=360;
			
			//onInterval = Math.sqrt(.2+.8*(180-days)*(180-days)*(490-days)*(490-days)*(940-days)*(940-days)/180/180/490/490/940/940);
			t = Math.sqrt((200-days)*(200-days)*(500-days)*(500-days)*(960-days)*(960-days)/200/200/500/500/960/960);
			onInterval = t*t*(3-2*t);
			//wShape = (onInterval-1)*(onInterval-1)*(onInterval+1)*(onInterval+1);
			//if (long>1065) long = (-days/1000*360)*Math.max(1081-days,0)/81;
		
			//alert(year+' | '+month+' | '+day+' = '+ days +'-> ' +long);
			
			ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);
			var lookAt = ge.createLookAt('');
			var squareLong = (180-Math.abs(long))*(180-Math.abs(long))/180/180;
			lookAt.setLatitude(onInterval*75-25);
			lookAt.setLongitude(long);
			lookAt.setRange(10000000.0); //default is 0.0
			//lookAt.setTilt(45*squareLong); //default is 0.0
			lookAt.setTilt(0); //default is 0.0
			ge.getView().setAbstractView(lookAt);
		}
		
	}

	function pushButton() {
	followShip();
	/*
	ge.getTime().getControl().setVisibility(ge.VISIBILITY_SHOW);
	var timeStamp = ge.createTimeStamp('optional_id');
	timeStamp.getWhen().set('1771');
	ge.getTime().setTimePrimitive(timeStamp);
	*/
	}

	function getVal(z) {
		if (z == '') return 1;
		if (z.length == 1) return parseInt(z);
		return parseInt(z.substr(0,1))*10 + parseInt(z.substr(1,1));
	}
	
	function failureCallback(object) {
		document.getElementById("plugin-fail").style.display = "inline";
	}
	
	
function absolute(base, relative) {
    var stack = base.split("/"),
        parts = relative.split("/");
    stack.pop(); // remove current file name (or empty string)
                 // (omit if "base" is the current folder without trailing slash)
    for (var i=0; i<parts.length; i++) {
        if (parts[i] == ".")
            continue;
        if (parts[i] == "..")
            stack.pop();
        else
            stack.push(parts[i]);
    }
    return stack.join("/");
}

	function feedTime() {
		//alert(day);
		showDate();
		//alert('feedTime');
		
	   var time = ge.getTime().getTimePrimitive();
		var currentBegin = time.getBegin().get();
		var currentEnd = time.getEnd().get();
		
		var currentDiff = parseInt(currentEnd.substr(0,4)) - parseInt(currentBegin.substr(0,4));
		if (currentDiff > 2) {
			yearBack = year-currentDiff;
			monthBack=month;
		} else {
			var yearBack = year;
			var monthBack = month-2;
			if (monthBack < 1) {monthBack+=12; yearBack--;}
		}
		
		//alert(yearBack + '-' + twoDigits(monthBack) + '-' + twoDigits(day) + ' to ' + year + '-' + twoDigits(month) + '-' + twoDigits(day));
		
		var beginCode = yearBack + '-' + twoDigits(monthBack) + '-' + twoDigits(day);
		var endCode = year + '-' + twoDigits(month) + '-' + twoDigits(day);
		currentDate = endCode;
		
		//google.earth.removeEventListener(ge, 'frameend', checkDate);	
		timeSpan.getBegin().set(beginCode);
		timeSpan.getEnd().set(endCode);
		ge.getTime().setTimePrimitive(timeSpan);
		ge.getTime().setRate(0);
		//google.earth.addEventListener(ge, 'frameend', checkDate);	
		
		return false;
	}
