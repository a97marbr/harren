
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
var benchmarkData = performance.timing; // Will be updated after onload event
var ajaxStart;

var students=new Array;
var momtmp=new Array;
var sortcolumn=1;
var clickedindex;

var entries;
var moments;
var versions;
var results;
var clist;
var tim;

function redrawtable()
{
		console.log(momtmp);
		//console.log(students);
		
		// Redraw table
		str="<table>"
		str+="<table class='markinglist'>";
		str+="<thead>";
		str+="<tr class='markinglist-header'>";

		str+="<th colspan='1' id='needMarking' class='result-header text-right' rowspan='2'>";
		str+="Students: 40<br>Unmarked : 25";
		str+="</th>";

		if (momtmp.length > 0){
				// Make first header row!
				var colsp=1;
				var colpos=1;
				for(var j=1;j<momtmp.length;j++){
						if(momtmp[j].kind==4){
								str+="<th class='result-header' colspan='"+colsp+"'>"+momtmp[colpos].entryname+"</th>"								
								colpos=j;
								colsp=0;
						}
						colsp++;
				}
				str+="<th class='result-header' colspan='"+colsp+"'>"+momtmp[colpos].entryname+"</th>"								
				str+="</tr><tr class='markinglist-header'>";

				// Make second header row!
				for(var j=0;j<momtmp.length;j++){
						if(momtmp[j].kind==3){
								str+="<th class='result-header dugga-result-subheader'>"+momtmp[j].entryname+"</th>"													
						}else{
								str+="<th class='result-header dugga-result-subheader'>Course part grade</th>"								
						}
				}
				str+="</tr>";

				// Make mf table
				for(var i=0;i<students.length;i++){
						str+="<tr class='fumo'>"
						var student=students[i];
						for(var j=0;j<student.length;j++){
								str+="<td id='u"+student[j].uid+"_d"+student[j].lid+"' class='result-data";
								if(j==0){
									str+="'>"+student[j].grade+"</td>";																	
								}else{
										if(student[j].kind==4){	str+=" dugga-moment"; }
										//str+="<td id='u"+student[j].uid+"_d"+student[j].lid+"' class='u"+student[j].uid+" result-data";
										// color based on pass,fail,pending,assigned,unassigned
										if (student[j].grade === 1 && student[j].needMarking === false) {str += " dugga-fail"}
										else if (student[j].grade > 1) {str += " dugga-pass"}
										else if (student[j].grade === 0 /*&& student[j].userAnswer === null*/) {str += " dugga-assigned"}
										else if (student[j].needMarking === true) {str += " dugga-pending"}
										else {str += " dugga-unassigned"}
										str += "'>";
										str += "<div class='gradeContainer'>";
										if (student[j].ishere) str += makeSelect(student[j].gradeSystem, querystring['cid'], student[j].vers, student[j].lid, student[j].uid, student[j].grade, student[j].kind);
										if(student[j].useranswer!==null){
											str += "<img id='korf' class='fist' src='../Shared/icons/FistV.png' onclick='clickResult(\"" + querystring['cid'] + "\",\"" + student[j].vers + "\",\"" + student[j].lid + "\",\"" + "fname" + "\",\"" + "lname" + "\",\"" + student[j].uid + "\",\"" + student[j].submitted + "\",\"" + student[j].marked + "\",\"" + student[j].grade + "\",\"" + student[j].gradeSystem + "\",\"" + student[j].lid + "\");' />";
										}
										str += "</div>";
										str += "</td>";											

								}
						}
						str+="</tr>"
				}
				str+="</table>";
				document.getElementById("content").innerHTML=str;
		}
}

// Resort
// Column number and sorting kind
function resort(columnno,colkind)
{
	 if(columnno==0){
			 if(colkind==0){
					 students.sort(function compare(a,b){
							 if(a[0].firstname>b[0].firstname){
									 return 1;
							 }else if(a[0].firstname<b[0].firstname){
									 return -1;
							 }else{
									 return 0;
							 }
					 });
			 }else if(colkind==1){
					 students.sort(function compare(a,b){
							 if(a[0].lastname>b[0].lastname){
									 return 1;
							 }else if(a[0].lastname<b[0].lastname){
									 return -1;
							 }else{
									 return 0;
							 }
					 });
			 }else{
					 students.sort(function compare(a,b){
							 if(a[0].ssn>b[0].ssn){
									 return 1;
							 }else if(a[0].ssn<b[0].ssn){
									 return -1;
							 }else{
									 return 0;
							 }
					 });
			 }
	 }else{
			 // other columns sort by 
			 // 0. unmarked or marked submitted date 
			 // 1. grade
			 sortcolumn=columnno;
			 console.log(columnno+" "+colkind+" "+sortcolumn);
			 if(colkind==0){
					 students.sort(function compare(a,b){
							 console.log(a[sortcolumn].marked+" "+b[sortcolumn].marked);
							 if(a[sortcolumn].grade==""&&b[sortcolumn].grade==""){
									 if(a[sortcolumn].marked>b[sortcolumn.marked]){
											 return 1;
									 }if(a[sortcolumn].marked>b[sortcolumn.marked]){
											 return -1;									
									 }else{
											 return 0;
									 }
							 }else if(a[sortcolumn].grade!=""&&b[sortcolumn].grade!=""){
									 if(a[sortcolumn].submitted>b[sortcolumn.submitted]){
											 return 1;
									 }if(a[sortcolumn].submitted>b[sortcolumn.submitted]){
											 return -1;									
									 }else{
											 return 0;
									 }
							 }else if(a[sortcolumn].grade==""&&b[sortcolumn].grade!=""){
									 return -1;
							 }else if(a[sortcolumn].grade!=""&&b[sortcolumn].grade==""){
									 return 1;
							 }else{
									 return 0
							 }
					 });				
			 }else{
					 students.sort(function compare(a,b){
							 if(a[sortcolumn].grade>b[sortcolumn].grade){		  				
									 return 1;
							 }else if(a[sortcolumn].grade<b[sortcolumn].grade){
									 return -1;
							 }else{
									 return 0;
							 }
					 });				
			 }
	 }
	 
	 redrawtable();
}

function process()
{			
	console.log("process");
		
	// Read dropdown from local storage
	clist=localStorage.getItem("checkees");
	if (clist){	
			clist=clist.split("**"); 
	} else {
		// Update dropdown list
		var dstr="";
		for(var j=0;j<moments.length;j++){
				var lid=moments[j].lid;
				var name=moments[j].entryname;
				dstr+="<div";				
				if (moments[j].visible == 0) dstr +=" style='opacity:0.4;'";
				
				dstr +="><input type='checkbox' class='headercheck' id='hdr"+lid;
				dstr+="check'";
				dstr+=">";
				dstr += "<label id='hdr"+lid;
				dstr+="' for='hdr"+lid+"check' ";
				dstr+=">"+name+"</label></div>";
			}
			document.getElementById("dropdownc").innerHTML=dstr;	
	}
		
	// Create temporary list that complies with dropdown
	momtmp=new Array;
	for(var l=0;l<moments.length;l++){
			index=clist.indexOf("hdr"+moments[l].lid+"check");
			if(clist[index+1]=="true"){
					momtmp.push(moments[l]);
			}
	}
	// Reconstitute table
	students=new Array;
		for(i=0;i<entries.length;i++){

			var uid=entries[i].uid;
								
			// All results of this student
			var res=results[uid];
			var restmp=new Array;
			
			if (typeof res != 'undefined'){
					// Pre-filter result list for a student for lightning-fast access
					for(var k=0;k<res.length;k++){
							restmp[res[k].dugga]=res[k];
					}
			}

			var student=new Array;
			student.push({grade:("<div>"+entries[i].firstname+" "+entries[i].lastname+"</div><div>"+entries[i].username+"</div><div>"+entries[i].ssn+"</div>"),firstname:entries[i].firstname,lastname:entries[i].lastname,ssn:entries[i].ssn});
			
			// Now we have a sparse array with results for each moment for current student... thus no need to loop through it
			for(var j=0;j<momtmp.length;j++){
					var momentresult=restmp[momtmp[j].lid];
					if(typeof momentresult!='undefined'){							
							student.push({ishere:true,grade:momentresult.grade,marked:momentresult.marked,submitted:momentresult.submitted,kind:momtmp[j].kind,lid:momtmp[j].lid,uid:uid,needMarking:momentresult.needMarking,gradeSystem:momtmp[j].gradesystem,vers:momentresult.vers,userAnswer:momentresult.useranswer});
					}else{
							student.push({ishere:false,kind:momtmp[j].kind,grade:"",lid:momtmp[j].lid,uid:uid,needMarking:false});							
					}		
			}
			
			students.push(student);
		}
		
		redrawtable();
		
		// Update dropdown list
		var dstr="";
		for(var j=0;j<moments.length;j++){
				var lid=moments[j].lid;
				var name=moments[j].entryname;
				dstr+="<div class='";				
				if (moments[j].visible == 0) {dstr +=" checkbox-dugga-hidden";}
				
				if (moments[j].kind == 4) {dstr +=" checkbox-dugga-moment";}
				
				dstr+="'><input type='checkbox' class='headercheck' id='hdr"+lid+"check'";
				if (clist){
					index=clist.indexOf("hdr"+lid+"check");
					if(index>-1){
							if(clist[index+1]=="true"){
									dstr+=" checked ";
							}
					}										
				}				
				dstr+=">";
				dstr+= "<label id='hdr"+lid;
				dstr+="' for='hdr"+lid+"check' ";
				dstr+=">"+name+"</label></div>";
		}
		document.getElementById("dropdownc").innerHTML=dstr;	
		
	console.log(performance.now()-tim);
}

function hover()
{
	$('#dropdownc').css('display','block');
}

function leave()
{
	console.log("Leave");
	$('#dropdownc').css('display','none'); 
	
	// Update columns only now
	var str="";
	$(".headercheck").each(function(){
			str+=$(this).attr("id")+"**"+$(this).is(':checked')+"**";
	});
	
	old=localStorage.getItem("checkees");
	localStorage.setItem("checkees",str);

	if(str!=old) process();
}


function setup(){
	console.log("setup");
	// Benchmarking function
	benchmarkData = performance.timing;

	$(document).ready(function () {
					$("#dropdownc").mouseleave(function () {
							leave();
					});
	});
	console.log("Network Latency: "+(benchmarkData.responseEnd-benchmarkData.fetchStart));
	console.log("responseEnd -> onload: "+(benchmarkData.loadEventEnd-benchmarkData.responseEnd));
	window.onscroll = function() {magicHeading()};
	

	AJAXService("GET", { cid : querystring['cid'],vers : querystring['coursevers'] }, "MARK");
	ajaxStart = new Date();
	console.log("ajax star: "+ajaxStart);
}


function magicHeading()
{
		if(window.pageYOffset-20>$("#needMarking").offset().top){
				$("#upperDecker").css("display","block");
		}else{
				$("#upperDecker").css("display","none");						
		}
		
		$("#froocht").css("width",$("#needMarking").outerWidth()+"px");
		
		$(".dugga-result-subheader").each(function(){
				var elemid=$(this).attr('id');
				var elemwidth=$(this).width();
				$("#"+elemid+"magic").css("width",elemwidth+"px");
				
		});

		$("#upperDecker").css("top",(window.pageYOffset+30)+"px");
}

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
	return "<img style=\"width:24px;height:24px\" src=\""+gfx+"\" id=\"grade-"+moment+"-"+uid+"\" class=\""+cls+"\" onclick=\"gradeDugga(event,"+gradesys+","+cid+",'"+vers+"',"+moment+","+uid+","+mark+",'"+ukind+"');\"  />";
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

		AJAXService("DUGGA", { cid : cid, vers : vers, moment : moment, luid : uid }, "MARK");
}

function clickResult(cid, vers, moment, firstname, lastname, uid, submitted, marked, foundgrade, gradeSystem, lid)
{
		$("#Nameof").html(firstname + " " + lastname + " - Submitted: " + submitted + " Marked: " + marked);

		var menu = "<div class='' style='width:100px;display:block;'>";
		menu +=	"<div class='loginBoxheader'>";
		menu += "<h3>Grade</h3>";
		menu += "</div>";
		menu += "<table>";
		menu += "<tr><td>";
		if (foundgrade === null && submitted === null) {
			menu += makeSelect(parseInt(gradeSystem), querystring['cid'], querystring['coursevers'], parseInt(lid), parseInt(uid), null, "I");
		}else if (foundgrade !== null){
			menu += makeSelect(parseInt(gradeSystem), querystring['cid'], querystring['coursevers'], parseInt(lid), parseInt(uid), parseInt(foundgrade), "U");
		}else {
			menu += makeSelect(parseInt(gradeSystem), querystring['cid'], querystring['coursevers'], parseInt(lid), parseInt(uid), null, "U");
		}
		menu += "</td></tr>";
		menu += "</table>";
		menu += "</div> <!-- Menu Dialog END -->";
		document.getElementById('markMenuPlaceholder').innerHTML=menu;
		
		AJAXService("DUGGA", { cid : cid, vers : vers, moment : moment, luid : uid, coursevers : vers }, "MARK");
}

function changeGrade(newMark, gradesys, cid, vers, moment, uid, mark, ukind)
{
		var newFeedback = "UNK";
		if (document.getElementById('newFeedback') !== null){
				newFeedback = document.getElementById('newFeedback').value;
		}
		AJAXService("CHGR", { cid : cid, vers : vers, moment : moment, luid : uid, mark : newMark, ukind : ukind, newFeedback : newFeedback }, "MARK");
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
		rProbe=$(thisObj).css('backgroundColor');
		if(rProbe!="transparent"){
				if(rProbe=="rgb(248, 232, 248)"){
						cliffton="rgb(208,192,208)";
				}else if(rProbe=="rgb(221, 255, 238)"){
						cliffton="rgb(181,215,168)";
				}else if(rProbe=="rgb(255, 255, 221)"){
						cliffton="rgb(215,215,181)";
				}else if(rProbe=="rgb(255, 238, 221)"){
						cliffton="rgb(215,198,181)";
				}else if(rProbe=="rgb(255, 255, 255)"){
						cliffton="rgb(215,215,215)";
				}else{
						cliffton="#FFF";
				}

				$(thisObj).css('backgroundColor',cliffton);
		}
}

function leaveCell(thisObj)
{
		if(rProbe!==null&&rProbe!=="transparent") $(thisObj).css('backgroundColor',rProbe);
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
		document.getElementById("responseArea").outerHTML='<textarea id="responseArea" style="width: 100%;height:100%;-webkit-box-sizing: border-box; -moz-box-sizing: border-box;box-sizing: border-box;">'+allData["files"][allData["duggaentry"]][clickedindex].feedback+'</textarea>'
		
		//alert(clickedindex+" : " + allData["files"][allData["duggaentry"]][clickedindex].feedback);
		if(displaystate){
				document.getElementById("markMenuPlaceholderz").style.display="block";		
		}else{
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
	
		AJAXService("RESP", { cid : querystring['cid'],vers : querystring['coursevers'],resptext:respo, respfile:filename, duggaid: allData["duggaid"],luid : allData["duggauser"],moment : allData["duggaentry"], luid : allData["duggauser"] }, "MARK");	
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
	//console.log(data);
		var str = "<thead>"
		str += "<tr><th id='needMarking' style='text-align:right;'></th>";
		for (var i = 0; i < data.length; i++) {
				if ((data[i][0].kind === 3 && data[i][0].moment === null) || (data[i][0].kind === 4)) {
					str += "<th style='border-left:2px solid white;'>";
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
			str += "<td style='padding:0px;'>";

			// There are results to display.
			str += "<table width='100%' class='markinginnertable' >";
			str += "<tr>";

			if (data[j][0].kind === 3 && data[j][0] === null){
					//str += renderStandaloneDugga(data[j][0], userResults);

			} else if (data[j][0].kind === 4 && data[j][0] !== null && data[j][0].visible == 1) {
						str += renderMomentChild(data[j][0], userResults, userId, fname, lname, 1);
						str += "</tr><tr>";
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
			zttr += '<div style="display:inline-block;min-width:95px">'
		} else {
			zttr += '<div style="min-width:95px">'
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
			zttr += "<img id='korf' style='width:24px;height:24px;float:right;margin-right:8px;' src='../Shared/icons/FistV.png' onclick='clickResult(\"" + querystring['cid'] + "\",\"" + querystring['coursevers'] + "\",\"" + dugga.lid + "\",\"" + fname + "\",\"" + lname + "\",\"" + userId + "\",\"" + submitted + "\",\"" + marked + "\",\"" + foundgrade + "\",\"" + dugga.gradesystem + "\",\"" + dugga["lid"] + "\");' />";
		}
		zttr += '</div>'
		// If no submission - white. If submitted and not marked or resubmitted U - yellow. If G or better, green. If U, pink. visited but not saved lilac
		if(foundgrade===1 && submitted<marked){
				yomama="background-color:#faa";
		}else if(foundgrade>1){
				yomama="background-color:#dfe";
		}else if(variant!==null&&useranswer===null){
				yomama="background-color:#F8E8F8";
		}else if((useranswer!==null&&foundgrade===null)||(foundgrade===1&&submitted>marked)||(useranswer!==null&&foundgrade===0)){
				yomama="background-color:#ffd";
				needMarking++;
		}else{
				yomama="background-color:#fff";
		}
		if (moment){
			str += "<td style='border-left:2px solid #dbd0d8;"+yomama+"' onmouseover='enterCell(this);' onmouseout='leaveCell(this);' colspan='0'>";
		} else {
			str += "<td style='border-left:2px solid #dbd0d8;"+yomama+"' onmouseover='enterCell(this);' onmouseout='leaveCell(this);'>";
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
		entries=data.entries;
		moments=data.moments;
		versions=data.versions;
		results=data.results;
		
		tim=performance.now();

		needMarking=0;

		if (data['debug'] !== "NONE!") alert(data['debug']);

		var showAll = false;
		process();
		//console.log(students);
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
		    		   
			 //console.log(students);
				var strt ="<div id='upperDecker' style='z-index:1000;position:absolute;left:8px;'><table class='markinglist'>";
				strt += "<thead class='markinglist'>";
				strt += "<tr class='markinglist-header'><th><div id='froocht'>&nbsp;</div></th>";				
				/*
				var hd = daBomb[Object.keys(daBomb)[0]]; // Get one of the rows and use as template for headings
				for (var umf in moments) {
						strt += "<th colspan='"+Object.keys(moments[umf].duggas).length+"'>"+hd.moments[umf].name+"</th>";
				}
				strt += "</tr><tr class='markinglist-header'><th>&nbsp;</th>";
				
				var idx=0;
				for (var umf in hd.moments) {
						idx++;
						for (var lumf in hd.moments[umf].duggas) {
								strt += "<th class='dugga-result-subheader'><div id='header"+idx+"magic' class='dugga-result-subheader-div' title='"+hd.moments[umf].duggas[lumf].entryname+"'>"+hd.moments[umf].duggas[lumf].entryname+"</div></th>";
						}
				}
				*/
				strt += "</tr>";				
				strt += "</thead><tbody></tbody></table></div><table id='needMarking' class='markinglist'>";				
				strt += "<tr class='markinglist-header'><th><div>&nbsp;</div></th>";				
				/*
				hd = daBomb[Object.keys(daBomb)[0]]; // Get one of the rows and use as template for headings
				for (var umf in hd.moments) {
						strt += "<th colspan='"+Object.keys(hd.moments[umf].duggas).length+"'>"+hd.moments[umf].name+"</th>";
				}*/
				strt += "</tr><tr class='markinglist-header'><th>&nbsp;</th>";
				var idx=0;
				/*
				for (var umf in hd.moments) {
						idx++;
						for (var lumf in hd.moments[umf].duggas) {
								strt += "<th class='dugga-result-subheader'><div id='header"+idx+"' class='dugga-result-subheader-div' title='"+hd.moments[umf].duggas[lumf].entryname+"'>"+hd.moments[umf].duggas[lumf].entryname+"</div></th>";
						}
				}*/
				strt += "</tr>";				
				strt += "</thead><tbody>";				
/*
				for (i=0;i<students.length;i++) {
						strt +="<tr><td>";
						strt += "<div>"+entries.firstname+ " " +entries.lastname+ "</div>";
						strt += "<div>"+entries.username+"</div>";
						strt += "<div>"+entries.ssn+"</div>";
						strt += "</td>";
								for (j=0;j<students[i].length;j++){
													strt += "<td class='result-data";
													if  (students[i][j].kind === 4) {
														strt += " dugga-moment"
													}
													// color based on pass,fail,pending,assigned,unassigned
													if (students[i][j].result.grade === 1 && students[i][j].result.needMarking === false) {strt += " dugga-fail"}
													else if (students[i][j].result.grade > 1) {strt += " dugga-pass"}
													else if (students[i][j].result.variant !== null && students[i][j].result.userAnswer === null) {strt += " dugga-assigned"}
													else if (students[i][j].result.needMarking === true) {strt += " dugga-pending"}
													else {strt += " dugga-unassigned"}
													strt += "'>";
													strt += "<div class='gradeContainer'>";
													if (students[i][j].ishere) strt += students[i][j].grade;
												//	strt += makeSelect(u.moments[m].duggas[j].gradesystem, querystring['cid'], u.moments[m].duggas[j].vers, u.moments[m].duggas[j].lid, uid, null, u.moments[m].duggas[j].ukind);
													strt += "</div>";
													strt += "</td>";											
									}
								strt += "</tr>";							
				}
				strt += "</table>"
				var slist = document.getElementById("content").innerHTML = strt;
				*/
/*
				m = orderResults(allData['moments']);
				str += "<table class='markinglist'>";
				str += renderResultTableHeader(m);
	
				if (allData['entries'].length > 0) {
						for ( i = 0; i < allData['entries'].length; i++) {
								var user = allData['entries'][i];
								if (user["role"]==="R" || showAll){
									str += "<tr class='fumo'>";
	
									// One row for each student
									str += "<td>";
									str += user['firstname'] + " " + user['lastname'] + "<br/>" + user['username'] + "<br/>" + user['ssn'];
									str += "</td>";
									str += renderMoment(m, results[user['uid']], user['uid'], user['firstname'], user['lastname']);
									str += "</tr>";
								}
						}
				}
				var slist = document.getElementById("content");
				slist.innerHTML = str;
				console.log("ajaxStart -> pre table:"+ (new Date() - ajaxStart));
				document.getElementById("needMarking").innerHTML = "Students: " + allData['entries'].length + "<BR />Unmarked : " + needMarking;
		    console.log("ajaxStart -> post table:"+ (new Date() - ajaxStart));
				*/
		}


}
