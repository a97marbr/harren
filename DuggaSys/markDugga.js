
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
		//console.log(momtmp);
		//console.log(students);
		
		// Redraw table
		
		// Magic heading 
		/*var strt ="<div id='upperDecker' style='z-index:1000;position:absolute;left:8px;'><table class='markinglist'>";
		strt += "<thead class='markinglist'>";
		strt += "<tr class='markinglist-header'><th><div id='froocht'>&nbsp;</div></th>";				

		strt += "</tr>";				
		strt += "</thead><tbody></tbody></table>";				
		*/
		str = "<div id='upperDecker' style='z-index:4000;position:absolute;left:8px;display:none;'>";
		str += "<table class='markinglist'>";
		str += "<thead>";
		str += "<tr class='markinglist-header'>";
		str += "<td><div id='froocht'>&nbsp;</div></th>"
		if (momtmp.length > 0){
				// Make first header row!
				/*
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
				*/
				
				// Make second header row!
				for(var j=0;j<momtmp.length;j++){
						if(momtmp[j].kind==3){
								str+="<th class='result-header dugga-result-subheadermagic'><div id='header"+j+"magic' class='dugga-result-subheader-div' title='"+momtmp[j].entryname+"'>"+momtmp[j].entryname+"</div></th>"													
						}else{
								//str+="<th class='result-header dugga-result-subheadermagic'>Course part grade</th>"								
								str+="<th class='result-header dugga-result-subheadermagic'><div id='header"+j+"magic' class='dugga-result-subheader-div' title='Course part grade'>Course part</div></th>"													
						}
				}
				str+="</tr>";
		}		
		str += "</thead>"
		str += "</table>"
		str += "</div>"
		
		str+="<table>"
		str+="<table class='markinglist'>";
		str+="<thead>";
		str+="<tr class='markinglist-header'>";

		str+="<th colspan='1' id='needMarking' class='result-header' rowspan='2'>";
		str+="";
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
								str+="<th class='result-header dugga-result-subheader' id='header"+j+"'><div class='dugga-result-subheader-div' title='"+momtmp[j].entryname+"'>"+momtmp[j].entryname+"</div></th>"													
						}else{
								str+="<th class='result-header dugga-result-subheader' id='header"+j+"'><div class='dugga-result-subheader-div' title='Course part grade'>Course part</div></th>"								
						}
				}
				str+="</tr></thead><tbody>";

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
										str += "<div class='gradeContainer";
										if(student[j].ishere===false){
											str += " grading-hidden";
										}
										str += "'>";
										if (student[j].grade === null){
												str += makeSelect(student[j].gradeSystem, querystring['cid'], student[j].vers, student[j].lid, student[j].uid, student[j].grade, 'I');
										} else {
												str += makeSelect(student[j].gradeSystem, querystring['cid'], student[j].vers, student[j].lid, student[j].uid, student[j].grade, 'U');
										}										
										str += "<img id='korf' class='fist";
										if(student[j].userAnswer===null){
											str += " grading-hidden";
										}
										str +="' src='../Shared/icons/FistV.png' onclick='clickResult(\"" + querystring['cid'] + "\",\"" + student[j].vers + "\",\"" + student[j].lid + "\",\"" + student[0].firstname + "\",\"" + student[0].lastname + "\",\"" + student[j].uid + "\",\"" + student[j].submitted + "\",\"" + student[j].marked + "\",\"" + student[j].grade + "\",\"" + student[j].gradeSystem + "\",\"" + student[j].lid + "\");' />";
										str += "</div>";
										str += "</td>";											

								}
						}
						str+="</tr></tbody>"
				}
				str+="</table>";
				document.getElementById("content").innerHTML=str;
		}
}

// Resort
// Column number and sorting kind
function resort(columnno,colkind)
{
		console.log(columnno+" "+colkind);
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
			colkind = localStorage.getItem("lena_"+querystring['cid']+"-"+querystring['coursevers']+"-type");
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
	clist=localStorage.getItem("lena_"+querystring['cid']+"-"+querystring['coursevers']+"-checkees");
	if (clist){	
			clist=clist.split("**"); 
	} 
	
	// Create temporary list that complies with dropdown
	momtmp=new Array;
	for(var l=0;l<moments.length;l++){
			if (clist !== null ){
					index=clist.indexOf("hdr"+moments[l].lid+"check");
					if(clist[index+1]=="true"){
							momtmp.push(moments[l]);
					}
			} else {
					/* default to show every moment/dugga */
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
				}	else {
						/* default to display every dugga/moment */
						dstr+=" checked ";
				}			
				dstr+=">";
				dstr+= "<label class='headerlabel' id='hdr"+lid;
				dstr+="' for='hdr"+lid+"check' ";
				dstr+=">"+name+"</label></div>";
		}
		dstr+="<div style='display:flex;justify-content:flex-end;border-top:1px solid #888'><button onclick='leave()'>Filter</button></div>"

		document.getElementById("dropdownc").innerHTML=dstr;	
		
		var dstr="";
		dstr+="<div style='border-bottom:1px solid #888'><input type='checkbox' class='headercheck'><label class='headerlabel'>Asc : date</label></div>";
		dstr+="<div ><input name='sorty' type='radio' class='headercheck' id='resort(0,0)'><label class='headerlabel' for='resort(0,0)' >Firstname</label></div>";
		dstr+="<div ><input name='sorty' type='radio' class='headercheck' id='resort(0,1)'><label class='headerlabel' for='resort(0,1)' >Lastname</label></div>";
		dstr+="<div style='border-bottom:1px solid #888;' ><input name='sorty' type='radio' class='headercheck' id='resort(0,2)'><label class='headerlabel' for='resort(0,2)' >SSN</label></div>";


		dstr+="<table><tr><td>";
		for(var j=0;j<moments.length;j++){
				var lid=moments[j].lid;
				var name=moments[j].entryname;

				dstr+="<div class='";				
				if (moments[j].visible == 0){
						dstr+="checkbox-dugga-hidden'><input name='sorty' type='radio' class='headercheck' id='resort("+(j+1)+",0)' onclick='resort("+(j+1)+",0)'><label class='headerlabel' for='resort("+(j+1)+",0)' >"+name+"</label></div>";
				}else{
						dstr+="'><input name='sorty' type='radio' class='headercheck' id='resort("+(j+1)+",0)' onclick='resort("+(j+1)+",0)'><label class='headerlabel' for='resort("+(j+1)+",0)' >"+name+"</label></div>";
				}
		}
		dstr+="</td><td style='vertical-align:top;'>";
		dstr+="<div><input name='sortysort' type='radio' class='headercheck' onclick='sorttype(0)'><label class='headerlabel' for='resort(0,1)' >Date</label></div>";
		dstr+="<div><input name='sortysort' type='radio' class='headercheck' onclick='sorttype(1)'><label class='headerlabel' for='resort(0,2)' >Grade</label></div>";
		dstr+="</td></tr></table>";
		dstr+="<div style='display:flex;justify-content:flex-end;border-top:1px solid #888'><button onclick='leave()'>Filter</button></div>"
		document.getElementById("dropdowns").innerHTML=dstr;	
		
	console.log(performance.now()-tim);
}

function hoverc()
{
	$('#dropdownc').css('display','block');
}

function leavec()
{
	console.log("LeaveC");
	$('#dropdownc').css('display','none'); 
	
	// Update columns only now
	var str="";
	$(".headercheck").each(function(){
			str+=$(this).attr("id")+"**"+$(this).is(':checked')+"**";
	});
	
	old=localStorage.getItem("lena_"+querystring['cid']+"-"+querystring['coursevers']+"-checkees");
	localStorage.setItem("lena_"+querystring['cid']+"-"+querystring['coursevers']+"-checkees",str);

	if(str!=old) process();
}

function hovers()
{
	$('#dropdowns').css('display','block');
}

function leaves()
{
	console.log("LeaveS");
	$('#dropdowns').css('display','none'); 
	
	// Update columns only now
	/*
	var str="";
	$(".headercheck").each(function(){
			str+=$(this).attr("id")+"**"+$(this).is(':checked')+"**";
	});
	
	old=localStorage.getItem(querystring['cid']+"-"+querystring['coursevers']+"-checkees");
	localStorage.setItem(querystring['cid']+"-"+querystring['coursevers']+"-checkees",str);

	if(str!=old) process();
	*/
}

function sorttype(t){
		localStorage.setItem("lena_"+querystring['cid']+"-"+querystring['coursevers']+"-sorttype",t);
}

function setup(){
	console.log("setup");
	// Benchmarking function
	benchmarkData = performance.timing;

	console.log("Network Latency: "+(benchmarkData.responseEnd-benchmarkData.fetchStart));
	console.log("responseEnd -> onload: "+(benchmarkData.loadEventEnd-benchmarkData.responseEnd));
	window.onscroll = function() {magicHeading()};
	

	AJAXService("GET", { cid : querystring['cid'],vers : querystring['coursevers'] }, "MARK");
	ajaxStart = new Date();
	console.log("ajax star: "+ajaxStart);
}


function magicHeading()
{
		if(window.pageYOffset-10>$("#needMarking").offset().top){
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

		$("#upperDecker").css("top",(window.pageYOffset+50)+"px");
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

		if ($(e.target ).hasClass("Uc")){
				changeGrade(1, gradesys, cid, vers, moment, uid, mark, ukind);
		} else if ($(e.target ).hasClass("Gc")) {
				changeGrade(2, gradesys, cid, vers, moment, uid, mark, ukind);
		} else if ($(e.target ).hasClass("VGc")){
				changeGrade(3, gradesys, cid, vers, moment, uid, mark, ukind);
		} else if ($(e.target ).hasClass("U")) {
				changeGrade(1, gradesys, cid, vers, moment, uid, mark, ukind);
		}
		else {
			//alert("This grading is not OK!");
		}

}

function makeImg(gradesys, cid, vers, moment, uid, mark, ukind,gfx,cls){
	return "<img src=\""+gfx+"\" id=\"grade-"+moment+"-"+uid+"\" class=\""+cls+"\" onclick=\"gradeDugga(event,"+gradesys+","+cid+",'"+vers+"',"+moment+","+uid+","+mark+",'"+ukind+"');\"  />";
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
		/*		Add filter menu		*/
		var filt ="";	
		filt+="<td><span class='dropdown' onmouseover='hoverc();' style='position:relative;z-index:9000;'>";
		filt+="<img class='navButt' src='../Shared/icons/tratt_white.svg'>";
		filt+="<div id='dropdownc' style='padding:8px;width:300px;overflow:hidden;font-size:12px;z-index:8000;display:none;position:absolute;background:#fff;box-shadow:2px 2px 8px #000;'>";
		filt+="</div>";
		filt+="</span></td>";

		filt+="<td><span class='dropdown' onmouseover='hovers();' style='position:relative;z-index:9000;'>";
		filt+="<img class='navButt' src='../Shared/icons/sort_white.svg'>";
		filt+="<div id='dropdowns' style='padding:8px;width:300px;overflow:hidden;font-size:12px;z-index:8000;display:none;position:absolute;background:#fff;box-shadow:2px 2px 8px #000;'>";
		filt+="</div>";
		filt+="</span></td>";

		$("#menuHook").html(filt);
		$(document).ready(function () {
						$("#dropdownc").mouseleave(function () {
								leavec();
						});
		});
		$(document).ready(function () {
						$("#dropdowns").mouseleave(function () {
								leaves();
						});
		});
		//console.log(students);
		allData = data;
	
		if (allData['dugganame'] !== "") {
			/*			Display student submission			*/
				$.getScript(allData['dugganame'], function() {
					$("#MarkCont").html(allData['duggapage']);
					showFacit(allData['duggaparam'],allData['useranswer'],allData['duggaanswer'], allData['duggastats'], allData['files'],allData['moment'],allData['duggafeedback']);
				});
				$("#resultpopover").css("display", "block");
		} else {
			/*			Process and render filtered data			*/
			process();	
		}


}
