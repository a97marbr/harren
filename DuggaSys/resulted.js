
/********************************************************************************
	 Globals
*********************************************************************************/

var sessionkind = 0;
var querystring = parseGet();
var filez;
var mmx = 0, mmy = 0;
var msx = 0, msy = 0;
var rProbe = null;
var needMarking=0;
var allData;

var clickedindex;

AJAXService("GET", { cid : querystring['cid'],vers : querystring['coursevers'] }, "RESULT");

$(function()
{
	$("#release").datepicker({ dateFormat : "yy-mm-dd" });
	$("#deadline").datepicker({ dateFormat : "yy-mm-dd" });
});

//----------------------------------------
// Commands:
//----------------------------------------

function gradeDugga(e, gradesys, cid, vers, moment, uid, mark, ukind){
		//console.log(e);

		closeWindows();

		var pressed = e.target.className;

		if (pressed === "Uc"){
				changeGrade(1, gradesys, cid, vers, moment, uid, mark, ukind);
		} else if (pressed === "Gc") {
				changeGrade(2, gradesys, cid, vers, moment, uid, mark, ukind);
		} else if (pressed === "VGc"){
				changeGrade(3, gradesys, cid, vers, moment, uid, mark, ukind);
		} else if (pressed === "U") {
				changeGrade(1, gradesys, cid, vers, moment, uid, mark, ukind);
		}
		else {
			//alert("This grading is not OK!");
		}

}

function makeImg(gradesys, cid, vers, moment, uid, mark, ukind,gfx,cls){
	return "<img src=\""+gfx+"\" id=\"grade-"+moment+"-"+uid+"\" class=\"grade-img "+cls+"\" onclick=\"gradeDugga(event,"+gradesys+","+cid+",'"+vers+"',"+moment+","+uid+","+mark+",'"+ukind+"');\"  />";
}


function makeSelect(gradesys, cid, vers, moment, uid, mark, ukind)
{

		var str = "";

		// Irrespective of marking system we allways print - and U
		if (mark === null || mark === 0){
				str += makeImg(gradesys, cid, vers, moment, uid, mark, ukind,"../Shared/icons/Uc.png","Uc");
		} else if (mark === 1) {
				str += makeImg(gradesys, cid, vers, moment, uid, mark, ukind,"../Shared/icons/U.png","U");
		} else {
				str += makeImg(gradesys, cid, vers, moment, uid, mark, ukind,"../Shared/icons/Uh.png","Uh");
		}

		// Gradesystem: 1== UGVG 2== UG 3== U345
		if (gradesys === 1) {
			if (mark === 2){
					str += makeImg(gradesys, cid, vers, moment, uid, mark, ukind,"../Shared/icons/G.png","G");
					str += makeImg(gradesys, cid, vers, moment, uid, mark, ukind,"../Shared/icons/VGh.png","VGh");
			} else if (mark === 3) {
					str += makeImg(gradesys, cid, vers, moment, uid, mark, ukind,"../Shared/icons/Gh.png","Gh");
					str += makeImg(gradesys, cid, vers, moment, uid, mark, ukind,"../Shared/icons/VG.png","VG");
			} else {
					str += makeImg(gradesys, cid, vers, moment, uid, mark, ukind,"../Shared/icons/Gc.png","Gc");
					str += makeImg(gradesys, cid, vers, moment, uid, mark, ukind,"../Shared/icons/VGc.png","VGc");
			}
		} else if (gradesys === 2) {
				if (mark === 2){
					str += makeImg(gradesys, cid, vers, moment, uid, mark, ukind,"../Shared/icons/G.png","G");
				} else {
					str += makeImg(gradesys, cid, vers, moment, uid, mark, ukind,"../Shared/icons/Gc.png","Gc");
				}
		} else if (gradesys === 3){
			/*
			if (mark === 4){
				str += "<input class=\"gradeInput\" type = \"radio\" name = \"grade-"+moment+"-"+ukind+"-"+uid+"\" id = \"grade-"+moment+"-"+ukind+"-"+uid+"-3\" value = \"4\" checked = \"checked\" onclick='changeGrade(this,\"" + gradesys + "\",\"" + cid + "\",\"" + vers + "\",\"" + moment + "\",\"" + uid + "\",\"" + mark + "\",\"" + ukind + "\");'> <label for = \"grade-"+moment+"-"+ukind+"-"+uid+"-3\">3</label>";
			}
			else{
				str += "<input class=\"gradeInput\" type = \"radio\" name = \"grade-"+moment+"-"+ukind+"-"+uid+"\" id = \"grade-"+moment+"-"+ukind+"-"+uid+"-3\" value = \"4\"  onclick='changeGrade(this,\"" + gradesys + "\",\"" + cid + "\",\"" + vers + "\",\"" + moment + "\",\"" + uid + "\",\"" + mark + "\",\"" + ukind + "\");'> <label for = \"grade-"+moment+"-"+ukind+"-"+uid+"-3\">3</label>";
			}
			if (mark === 5){
				str += "<input class=\"gradeInput\" type = \"radio\" name = \"grade-"+moment+"-"+ukind+"-"+uid+"\" id = \"grade-"+moment+"-"+ukind+"-"+uid+"-4\" value = \"5\" checked = \"checked\" onclick='changeGrade(this,\"" + gradesys + "\",\"" + cid + "\",\"" + vers + "\",\"" + moment + "\",\"" + uid + "\",\"" + mark + "\",\"" + ukind + "\");'> <label for = \"grade-"+moment+"-"+ukind+"-"+uid+"-4\">4</label>";
			}
			else{
				str += "<input class=\"gradeInput\" type = \"radio\" name = \"grade-"+moment+"-"+ukind+"-"+uid+"\" id = \"grade-"+moment+"-"+ukind+"-"+uid+"-4\" value = \"5\"  onclick='changeGrade(this,\"" + gradesys + "\",\"" + cid + "\",\"" + vers + "\",\"" + moment + "\",\"" + uid + "\",\"" + mark + "\",\"" + ukind + "\");'> <label for = \"grade-"+moment+"-"+ukind+"-"+uid+"-4\">4</label>";
			}
			if (mark === 6){
				str += "<input class=\"gradeInput\" type = \"radio\" name = \"grade-"+moment+"-"+ukind+"-"+uid+"\" id = \"grade-"+moment+"-"+ukind+"-"+uid+"-5\" value = \"6\" checked = \"checked\" onclick='changeGrade(this,\"" + gradesys + "\",\"" + cid + "\",\"" + vers + "\",\"" + moment + "\",\"" + uid + "\",\"" + mark + "\",\"" + ukind + "\");'> <label for = \"grade-"+moment+"-"+ukind+"-"+uid+"-5\">5</label>";
			}
			else{
				str += "<input class=\"gradeInput\" type = \"radio\" name = \"grade-"+moment+"-"+ukind+"-"+uid+"\" id = \"grade-"+moment+"-"+ukind+"-"+uid+"-5\" value = \"6\"  onclick='changeGrade(this,\"" + gradesys + "\",\"" + cid + "\",\"" + vers + "\",\"" + moment + "\",\"" + uid + "\",\"" + mark + "\",\"" + ukind + "\");'> <label for = \"grade-"+moment+"-"+ukind+"-"+uid+"-5\">5</label>";
			}
			*/
		} else {
			//alert("Unknown Grade System: "+gradesys);
		}

		return str;
}

function hoverResult(cid, vers, moment, firstname, lastname, uid, submitted, marked)
{
		$("#Nameof").html(firstname + " " + lastname + " - Submitted: " + submitted + " Marked: " + marked);

		// Start counting pixels
		msx = -1;
		msy = -1;

		AJAXService("DUGGA", { cid : cid, vers : vers, moment : moment, luid : uid }, "RESULT");
}

function clickResult(cid, vers, moment, firstname, lastname, uid, submitted, marked, foundgrade, gradeSystem, lid)
{
		$("#Nameof").html(firstname + " " + lastname + " - Submitted: " + submitted + " Marked: " + marked);

		var menu = "<div id='feedbackContainer'>";
		menu +=	"<div class='loginBoxheader text-center'>";
		menu += "<h3>Grade</h3>";
		menu += "</div>";
		menu += "<div class='gradeContainer'>";
		if (foundgrade === null && submitted === null) {
			menu += makeSelect(parseInt(gradeSystem), querystring['cid'], querystring['coursevers'], parseInt(lid), parseInt(uid), null, "I");
		}else if (foundgrade !== null){
			menu += makeSelect(parseInt(gradeSystem), querystring['cid'], querystring['coursevers'], parseInt(lid), parseInt(uid), parseInt(foundgrade), "U");
		}else {
			menu += makeSelect(parseInt(gradeSystem), querystring['cid'], querystring['coursevers'], parseInt(lid), parseInt(uid), null, "U");
		}
		menu += "</div>";
		menu += "</div> <!-- Menu Dialog END -->";
		document.getElementById('markMenuPlaceholder').innerHTML=menu;
		
		AJAXService("DUGGA", { cid : cid, vers : vers, moment : moment, luid : uid, coursevers : vers }, "RESULT");
}

function changeGrade(newMark, gradesys, cid, vers, moment, uid, mark, ukind)
{
		var newFeedback = "UNK";
		if (document.getElementById('newFeedback') !== null){
				newFeedback = document.getElementById('newFeedback').value;
		}
		AJAXService("CHGR", { cid : cid, vers : vers, moment : moment, luid : uid, mark : newMark, ukind : ukind, newFeedback : newFeedback }, "RESULT");
}

function moveDist(e)
{
		mmx = e.clientX;
		mmy = e.clientY;

		if (msx == -1 && msy == -1) {
			msx = mmx;
			msy = mmy;
		} else {
			// Count pixels and act accordingly
			if ((Math.abs(mmx - msx) + Math.abs(mmy - msy)) > 16) {
				$("#resultpopover").css("display", "none");
				closeFacit();
				document.getElementById('MarkCont').innerHTML="";
			}
		}
}

function enterCell(thisObj)
{
		var c="";
		var u="";
		var cls = thisObj.className;
		var clsArr = cls.split(" ");
		for (var i=0;i<clsArr.length;i++){
				if (clsArr[i].indexOf("dugga-")!= -1){
						c = clsArr[i];
				} else if (clsArr[i].indexOf("u_")!= -1){
						u="."+clsArr[i];
				}
		}
		// highligt the row first
		$("tr"+u).addClass("highlightRow");
		
		if (c==="dugga-pass")	{
				$(thisObj).addClass("dugga-pass-highlighted");
		} else if (c==="dugga-fail") {
				$(thisObj).addClass("dugga-fail-highlighted");			
		} else if (c==="dugga-pending") {
				$(thisObj).addClass("dugga-pending-highlighted");			
		} else if (c==="dugga-assigned") {
				$(thisObj).addClass("dugga-assigned-highlighted");
		} else if (c==="dugga-unassigned") {
				$(thisObj).addClass("dugga-unassigned-highlighted");			
		} else {
			
		}
}

function leaveCell(thisObj)
{
	
		$(thisObj).removeClass("dugga-pass-highlighted dugga-fail-highlighted dugga-assigned-highlighted dugga-unassigned-highlighted dugga-pending-highlighted");
		$("tr").removeClass("highlightRow");
		
}

function enterRow(thisObj)
{
	var u="";
	var cls = thisObj.className;
	var clsArr = cls.split(" ");
	for (var i=0;i<clsArr.length;i++){
			if (clsArr[i].indexOf("u_")!= -1){
					u="tr."+clsArr[i];
					break;
			} 
	}
	if (u!="")	$(u).addClass("highlightRow");
}

function leaveRow(thisObj)
{
	var u="";
	var cls = thisObj.className;
	var clsArr = cls.split(" ");
	for (var i=0;i<clsArr.length;i++){
			if (clsArr[i].indexOf("u_")!= -1){
					u="."+clsArr[i];
					break;
			} 
	}
	if (u!="")	$(u).removeClass("highlightRow");
}

//----------------------------------------
// Adds Canned Response to Response Dialog
//----------------------------------------

function displayPreview(filepath, filename, fileseq, filetype, fileext, fileindex, displaystate)
{
		clickedindex=fileindex;
		/*
		document.getElementById("responseArea").innerHTML="";
		document.getElementById("responseArea").innerHTML=allData["files"][allData["duggaentry"]][clickedindex].feedback;
		*/
		document.getElementById("responseArea").outerHTML='<textarea id="responseArea" class="responsArea">'+allData["files"][allData["duggaentry"]][clickedindex].feedback+'</textarea>'
		
		//alert(clickedindex+" : " + allData["files"][allData["duggaentry"]][clickedindex].feedback);
		if(displaystate){
				$("#markMenuPlaceholderz").addClass("show");
				//document.getElementById("markMenuPlaceholderz").style.display="block";		
		}else{
				$("#markMenuPlaceholderz").removeClass("show");
				document.getElementById("markMenuPlaceholderz").style.display="none";		
		} 
				
		var str ="";
		if (filetype === "text") {
				str+="<textarea style='width: 100%;height: 100%;box-sizing: border-box;'>"+allData["files"][allData["duggaentry"]][fileindex].content+"</textarea>";
		} else if (filetype === "link"){
				str += '<iframe src="'+allData["files"][allData["duggaentry"]][fileindex].content+'" width="100%" height="100%" />';			
		} else {
		 		if (fileext === "pdf"){
						str += '<embed src="'+filepath+filename+fileseq+'.'+fileext+'" width="100%" height="100%" type="application/pdf" />'; 			
		 		} else if (fileext === "zip" || fileext === "rar"){
		 				str += '<a href="'+filepath+filename+fileseq+'.'+fileext+'"/>'+filename+'.'+fileext+'</a>'; 			
		 		} else if (fileext === "txt"){
		 				str+="<pre style='width: 100%;height: 100%;box-sizing: border-box;'>"+allData["files"][allData["duggaentry"]][fileindex].content+"</pre>";
		 		}
		}
		document.getElementById("popPrev").innerHTML=str;

		$("#previewpopover").css("display", "block");
}

//----------------------------------------
// Adds Canned Response to Response Dialog
//----------------------------------------

function addCanned()
{
		document.getElementById("responseArea").innerHTML+=document.getElementById("cannedResponse").value;
}

//----------------------------------------
// Sort results
//----------------------------------------

function saveResponse()
{
		respo=document.getElementById("responseArea").value;
	
		var filename=allData["files"][allData["duggaentry"]][clickedindex].filename+allData["files"][allData["duggaentry"]][clickedindex].seq;
	
		AJAXService("RESP", { cid : querystring['cid'],vers : querystring['coursevers'],resptext:respo, respfile:filename, duggaid: allData["duggaid"],luid : allData["duggauser"],moment : allData["duggaentry"], luid : allData["duggauser"] }, "RESULT");	
		//AJAXService("DUGGA", { cid : querystring['cid'], vers : querystring['coursevers'], moment : allData["duggaentry"], luid : allData["duggauser"] }, "RESULT");
		document.getElementById("responseArea").innerHTML = "";
		$("#previewpopover").css("display", "none");
}

//----------------------------------------
// Sort results
//----------------------------------------
function orderResults(moments)
{
	var arr = [];
	var currentMomentIndex=0;
	arr[currentMomentIndex] = [];
	var currentMoment=null;
	for(var i=0; i < moments.length;i++){
		if(moments[i].kind === 3 && moments[i].moment === null){
			// Standalone dugga
			arr[currentMomentIndex] = moments[i];
			currentMomentIndex++;
			alert("Added standalone");
		} else if (moments[i].kind === 4 && moments[i].moment !== null){
			if (currentMoment === null){
				// Moment : first or same as previous
				arr[currentMomentIndex].push(moments[i]);
				currentMoment = moments[i].moment;
			} else if (currentMoment === moments[i].moment) {
				arr[currentMomentIndex].push(moments[i]);
			}else {
				// Moment : new
				currentMomentIndex++;
				currentMoment = moments[i].moment;
				arr[currentMomentIndex] = [];
				arr[currentMomentIndex].push(moments[i]);
			}
		} else if (moments[i].kind === 3 && moments[i].moment !== null){
				arr[currentMomentIndex].push(moments[i]);
		}
	}
	return arr;
}

//----------------------------------------
// Render Result Table Header
//----------------------------------------
function renderResultTableHeader(data)
{
		var str = "<thead>"
		str += "<tr><th id='needMarking' class='result-header text-right'></th>";
		for (var i = 0; i < data.length; i++) {
				if ((data[i][0].kind === 3 && data[i][0].moment === null) || (data[i][0].kind === 4)) {
					str += "<th class='result-header'>";
					str += data[i][0].entryname;
					str += "</th>";
				}
		}
		str += "</tr></thead>";
		return str;
}

//----------------------------------------
// Render Moment
//----------------------------------------
function renderMoment(data, userResults, userId, fname, lname)
{
	var str = "";
	// Each of the section entries (i.e. moments)
	for ( var j = 0; j < data.length; j++) {
			str += "<td class='result-data u_"+userId+"' id='u_"+userId+"_m_"+data[j][0].lid+"'>";

			// There are results to display.
			str += "<table width='100%' class='markinginnertable u_"+userId+"' >";
			str += "<tr class='u_"+userId+"' onmouseover='enterRow(this);' onmouseout='leaveRow(this);'>";

			if (data[j][0].kind === 3 && data[j][0] === null){
					//str += renderStandaloneDugga(data[j][0], userResults);

			} else if (data[j][0].kind === 4 && data[j][0] !== null && data[j][0].visible == 1) {
						str += renderMomentChild(data[j][0], userResults, userId, fname, lname, 1);
						str += "</tr><tr class='u_"+userId+"'>";
				for (var k = 1; k < data[j].length; k++){
					if(data[j][k].visible == 1){
						str += renderMomentChild(data[j][k], userResults, userId, fname, lname, 0);
					}
				}
			} else {
					alert("Malformed data!\nThe test may not have an existing moment");
			}
			str += "</tr>";
			str += "</table>";
			str += "</td>";
	}
	return str;

}

//----------------------------------------
// Render Standalone Dugga
//----------------------------------------
function renderStandaloneDugga(data, userResults)
{
	var foundgrade = null;
	var useranswer = null;
	var submitted = null;
	var marked = null;
	var variant = null;
	var studres = result[userId];

	if (studres !== null) {
		for (var l = 0; l < studres.length; l++) {
			var resultitem = studres[l];
			if (resultitem['moment'] === data.lid) {
				// There is a result to print
				foundgrade = resultitem['grade'];
				useranswer = resultitem['useranswer'];
				submitted = resultitem['submitted'];
				marked = resultitem['marked'];
				variant = resultitem['variant'];

				if(submitted!==null) {
					var t = submitted.split(/[- :]/);
					submitted=new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
				}
				if(marked!==null) {
					var tt = marked.split(/[- :]/);
					marked=new Date(tt[0], tt[1]-1, tt[2], tt[3], tt[4], tt[5]);
				}
			}
		}
	}

}

//----------------------------------------
// Render Moment child
//----------------------------------------

function renderMomentChild(dugga, userResults, userId, fname, lname, moment)
{
		var str = "";
		var foundgrade = null;
		var useranswer = null;
		var submitted = null;
		var marked = null;
		var variant = null;
		if (userResults !== undefined) {
				for (var l = 0; l < userResults.length; l++) {
						var resultitem = userResults[l];
						if (resultitem.moment === dugga.lid) {
								// There is a result to print
								foundgrade = resultitem.grade;
								useranswer = resultitem.useranswer;
								submitted = resultitem.submitted;
								marked = resultitem.marked;
								variant = resultitem.variant	;

								if(submitted!==null) {
									var t = submitted.split(/[- :]/);
									submitted=new Date(t[0], t[1]-1, t[2], t[3], t[4], t[5]);
								}
								if(marked!==null) {
									var tt = marked.split(/[- :]/);
									marked=new Date(tt[0], tt[1]-1, tt[2], tt[3], tt[4], tt[5]);
								}
						}
				}
		}

		var zttr="";
		if (moment){
			zttr += "<div class='result-data-cell'>";
		} else {
			zttr += "<div class='result-data-cell'>";
		}
		// If no result is found i.e. No Fist
		if (foundgrade === null && useranswer === null && submitted === null) {
			zttr += makeSelect(dugga.gradesystem, querystring['cid'], querystring['coursevers'], dugga.lid, userId, null, "I");
		}else if (foundgrade !== null){
			zttr += makeSelect(dugga.gradesystem, querystring['cid'], querystring['coursevers'], dugga['lid'], userId, foundgrade, "U");
		}else {
			zttr += makeSelect(dugga['gradesystem'], querystring['cid'], querystring['coursevers'], dugga['lid'], userId, null, "U");
		}
		if(useranswer!==null){
			zttr += "<img id='korf' class='fist' src='../Shared/icons/FistV.png' onclick='clickResult(\"" + querystring['cid'] + "\",\"" + querystring['coursevers'] + "\",\"" + dugga.lid + "\",\"" + fname + "\",\"" + lname + "\",\"" + userId + "\",\"" + submitted + "\",\"" + marked + "\",\"" + foundgrade + "\",\"" + dugga.gradesystem + "\",\"" + dugga["lid"] + "\");' />";
		}
		zttr += "</div>";
		// If no submission - white. If submitted and not marked or resubmitted U - yellow. If G or better, green. If U, pink. visited but not saved lilac
		if(foundgrade===1 && submitted<marked){
				yomama="dugga-fail";
		}else if(foundgrade>1){
				yomama="dugga-pass";
		}else if(variant!==null&&useranswer===null){
				yomama="dugga-assigned";
		}else if((useranswer!==null&&foundgrade===null)||(foundgrade===1&&submitted>marked)||(useranswer!==null&&foundgrade===0)){
				yomama="dugga-pending";
				needMarking++;
		}else{
				yomama="dugga-unassigned";
		}
		if (moment){
			str += "<td id='u_"+userId+"_d_"+dugga.lid+"' class='"+yomama+" u_"+userId+"' onmouseover='enterCell(this);' onmouseout='leaveCell(this);' colspan='0'>";
		} else {
			str += "<td id='u_"+userId+"_d_"+dugga.lid+"' class='"+yomama+" u_"+userId+"' onmouseover='enterCell(this);' onmouseout='leaveCell(this);'>";
		}
		str += "<div style=\"display:inline-block; overflow:hidden;\">"+dugga['entryname'] + "</div> ";
		str +=zttr;
		str += "</td>";
		return str;
}

//----------------------------------------
// Renderer
//----------------------------------------

function returnedResults(data)
{
		var str = "";
		var zstr = "";
		var ttr = "";
		var zttr = "";
		needMarking=0;

		if (data['debug'] !== "NONE!") alert(data['debug']);

		var showAll = false;
		allData = data;
	
		if (allData['dugganame'] !== "") {
				$.getScript(allData['dugganame'], function() {
					$("#MarkCont").html(allData['duggapage']);
					showFacit(allData['duggaparam'],allData['useranswer'],allData['duggaanswer'], allData['duggastats'], allData['files'],allData['moment'],allData['duggafeedback']);
				});
				$("#resultpopover").css("display", "block");
		} else {
	
//				str+="<span><label>Show Teachers</label><input id='teacherFilter' type='checkbox' name='showAll' value='1' onchange='returnedResults(allData)'>";
//				showAll = document.getElementById("teacherFilter").checked;
				showAll=true;

				results = allData['results'];

				m = orderResults(allData['moments']);
				str += "<table class='markinglist'>";
				str += renderResultTableHeader(m);
	
				if (allData['entries'].length > 0) {
						for ( i = 0; i < allData['entries'].length; i++) {
								var user = allData['entries'][i];
								if (user["role"]==="R" || showAll){
									str += "<tr class='fumo u_"+user['uid']+"'>";
	
									// One row for each student
									str += "<td class='result-data u_"+user['uid']+"'>";
									str += "<div>"+user['firstname'] + " " + user['lastname'] + "</div><div>" + user['username'] + "</div><div>" + user['ssn'] + "</div>";
									str += "</td>";
									str += renderMoment(m, results[user['uid']], user['uid'], user['firstname'], user['lastname']);
									str += "</tr>";
								}
						}
				}
				var slist = document.getElementById("content");
				slist.innerHTML = str;
				document.getElementById("needMarking").innerHTML = "Students: " + allData['entries'].length + "<BR />Unmarked : " + needMarking;
		}


}
