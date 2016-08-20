<?php
/********************************************************************************
   Documentation
*********************************************************************************

This file displays the result of each student with access under this course, the teacher can grade students
in this page.

Execution: resulted.js has an ajax call that runs at start up and displays the returned data on this page.
-------------==============######## Documentation End ###########==============-------------*/
session_start();
include_once "../../coursesyspw.php";
include_once "../Shared/sessions.php";
pdoConnect();
?>
<!DOCTYPE html>
<html>
<head>
	<link rel="icon" type="image/ico" href="../Shared/icons/favicon.ico"/>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Result Editor</title>

	<link type="text/css" href="../Shared/css/style.css" rel="stylesheet">
	<link type="text/css" href="../Shared/css/jquery-ui-1.10.4.min.css" rel="stylesheet">
	<link type="text/css" href="templates/dugga.css" rel="stylesheet">

	<script src="../Shared/js/jquery-1.11.0.min.js"></script>
	<script src="../Shared/js/jquery-ui-1.10.4.min.js"></script>

	<script src="../Shared/dugga.js"></script>
	<script src="resulted.js"></script>

</head>
<body>
	<?php
		$noup="SECTION";
		$resultedkind = true;
		include '../Shared/navheader.php';
	?>
	<div id="content"></div>

	<?php
		include '../Shared/loginbox.php';
	?>

<script>
		$(window).keyup(function(event){
			if(event.keyCode == 27) closeWindows();
		});
</script>
			
	<!---------------------=============####### Result Popover #######=============--------------------->
	
	<div id='resultpopover' class='resultPopover' style='display:none'>
		<div class='loginBoxheader'>
			<h3 style='width:100%;' id='Nameof'>Show Results</h3><div onclick='closeWindows();'>x</div>
		</div>
		<div id="MarkCont" style="position:absolute; left:4px; right:104px; top:34px; bottom:4px; border:2px inset #aaa;background:#bbb; overflow:scroll;"> </div>
		<div id='markMenuPlaceholder' style="position:absolute; right:2px; top:34px; background:#bbb; width:100px;"></div>
	</div>

	<!---------------------=============####### Preview Popover #######=============--------------------->
	
	<div id='previewpopover' class='previewPopover' style='display:none;'>
		<div class='loginBoxheader'>
			<h3 style='width:100%;' id='Nameof'>Document Preview</h3><div onclick='closeWindows();'>x</div>
		</div>
		<div style="position:absolute;left:0px;top:34px;bottom:0px;right:0px;">
			<table width="100%" height="100%">
					<tr>
							<td width="50%" height="100%" id="MarkCont" style="border:2px inset #aaa;background:#bbb; overflow:scroll;">
									<embed src="http://localhost/a.pdf" width="100%" height="100%" type='application/pdf' />
							</td>
							<td width="50%" height="100%" id='markMenuPlaceholder' style="background:#bbb;">
										<table width="100%" height="100%">
											<tr height="24px">
													<td>
															<button onclick='addCanned();'>Add</button>
															<select id="cannedResponse">
																	<option>&laquo; NONE &raquo;</option>
																	<option>(Y) </option>
																	<option>(N) </option>
																	<option>:) </option>
															</select>
													</td>
											</tr>
											<tr height="100%">
													<td>
															<textarea id="responseArea" style="width: 100%;height:100%;-webkit-box-sizing: border-box; -moz-box-sizing: border-box;box-sizing: border-box;">Glomar Explorer</textarea>
													</td>
											</tr>
											<tr height="24px">
													<td>
															<button onclick='saveResponse();'>Save</button>
													</td>
											</tr>											
										</table>
							</td>
					</tr>
			</table>
		</div>
	</div>

	<!---------------------=============####### Variant Editor Popup Window #######=============--------------------->

	<div id='editVariant' class='loginBox' style='width:464px;display:none;'>

	<div class='loginBoxheader'>
	<h3>Edit Variant</h3>
	<div onclick='closeEditVariant();'>x</div>
	</div>

	<table width="100%">
		<tr>
			<td><input type='hidden' id='vid' value='Toddler' /></td>
			<td colspan='2' style='line-height:40px;'>Param: <input style='float:right;width:390px;' class='form-control textinput' type='text' id='parameter' value='Variant Param' /></td>
		</tr>
		<tr>
			<td colspan='2' style='line-height:40px;'>Answer: <input style='float:right;width:390px;' class='form-control textinput' type='text' id='answer' value='Variant Answer' /></td>
		</tr>
	</table>

	<table width="100%">
		<tr>
			<td align='left'><input class='submit-button' type='button' value='Delete' onclick='deleteVariant();' /></td>
			<td align='center'></td>
			<td align='right'><input class='submit-button' type='button' value='Save' onclick='updateVariant();' /></td>
		</tr>
	</table>

	</div>
</body>
</html>
