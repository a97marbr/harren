<?php

//---------------------------------------------------------------------------------------------------------------
// editorService - Saves and Reads content for Code Editor
//---------------------------------------------------------------------------------------------------------------

// Missing Functionality
//		New Code Example + New Dugga
//		Graying link accordingly

date_default_timezone_set("Europe/Stockholm");

// Include basic application services!
include_once "../Shared/basic.php";
include_once "../Shared/sessions.php";


// Connect to database and start session
pdoConnect();
session_start();

$opt=getOP('opt');
$cid=getOP('cid');
$coursename=getOP('coursename');
$visibility=getOP('visib');
$activevers=getOP('activevers');
$activeedvers=getOP('activeedvers');
$versid=getOP('versid');
$versname=getOP('versname');
$coursenamealt=getOP('coursenamealt');
$coursecode=getOP('coursecode');
$coursename=getOP('coursename');
$copycourse=getOP('copycourse');

if(isset($_SESSION['uid'])){
	$userid=$_SESSION['uid'];
}else{
	$userid="UNK";
}

$hr="";
if(isSuperUser($userid)){
	$ha=true;
}else{
	$ha=false;
}

$debug="NONE!";

$log_uuid = getOP('log_uuid');
$info=$opt." ".$cid." ".$coursename." ".$versid." ".$visibility;
logServiceEvent($log_uuid, EventTypes::ServiceServerStart, "courseedservice.php",$userid,$info);

//------------------------------------------------------------------------------------------------
// Services
//------------------------------------------------------------------------------------------------

if($ha){
	// The code for modification using sessions
	if(strcmp($opt,"DEL")===0){

	}else if(strcmp($opt,"NEW")===0){
		$query = $pdo->prepare("INSERT INTO course (coursecode,coursename,visibility,creator) VALUES(:coursecode,:coursename,0,:usrid)");

		$query->bindParam(':usrid', $userid);
		$query->bindParam(':coursecode', $coursecode);
		$query->bindParam(':coursename', $coursename);

		if(!$query->execute()) {
			$error=$query->errorInfo();
			$debug="Error updating entries".$error[2];
		}
	}else if(strcmp($opt,"NEWVRS")===0){
		$query = $pdo->prepare("INSERT INTO vers(cid,coursecode,vers,versname,coursename,coursenamealt) values(:cid,:coursecode,:vers,:versname,:coursename,:coursenamealt);");

		$query->bindParam(':cid', $cid);
		$query->bindParam(':coursecode', $coursecode);
		$query->bindParam(':vers', $versid);
		$query->bindParam(':versname', $versname);
		$query->bindParam(':coursename', $coursename);
		$query->bindParam(':coursenamealt', $coursenamealt);

		if(!$query->execute()) {
			$error=$query->errorInfo();
			$debug="Error updating entries".$error[2];
		}
	}else if(strcmp($opt,"UPDATEVRS")===0){
		$query = $pdo->prepare("UPDATE vers SET versname=:versname WHERE cid=:cid AND coursecode=:coursecode AND vers=:vers;");
		$query->bindParam(':cid', $courseid);
		$query->bindParam(':coursecode', $coursecode);
		$query->bindParam(':vers', $versid);
		$query->bindParam(':versname', $versname);

		if(!$query->execute()) {
			$error=$query->errorInfo();
			$debug="Error updating entries".$error[2];
		}
	}else if(strcmp($opt,"CHGVERS")===0){
		$query = $pdo->prepare("UPDATE course SET activeversion=:vers WHERE cid=:cid");
		$query->bindParam(':cid', $courseid);
		$query->bindParam(':vers', $versid);

		if(!$query->execute()) {
			$error=$query->errorInfo();
			$debug="Error updating entries".$error[2];
		}
	}else if(strcmp($opt, "CPYVRS")===0){
			$query = $pdo->prepare("INSERT INTO vers(cid,coursecode,vers,versname,coursename,coursenamealt) values(:cid,:coursecode,:vers,:versname,:coursename,:coursenamealt);");

			$query->bindParam(':cid', $cid);
			$query->bindParam(':coursecode', $coursecode);
			$query->bindParam(':vers', $versid);
			$query->bindParam(':versname', $versname);
			$query->bindParam(':coursename', $coursename);
			$query->bindParam(':coursenamealt', $coursenamealt);

			if(!$query->execute()) {
				$error=$query->errorInfo();
				$debug="Error updating entries".$error[2];
			}

			$query = $pdo->prepare("SELECT * from listentries WHERE vers = :oldvers;");
			$query->bindParam(':oldvers', $copycourse);
			if(!$query->execute()) {
					$error=$query->errorInfo();
					$debug="Error reading courses".$error[2];
			}else{
					$momentlist=array();
					foreach($query->fetchAll(PDO::FETCH_ASSOC) as $row){
							$ruery = $pdo->prepare("INSERT INTO listentries (cid,entryname,link,kind,pos,creator,ts,code_id,visible,vers,moment,gradesystem,highscoremode) SELECT cid,entryname,link,kind,pos,creator,ts,code_id,visible,:gubbe AS vers,moment,gradesystem,highscoremode from listentries WHERE lid = :olid;");
							$ruery->bindParam(':olid', $row['lid']);
							$ruery->bindParam(':gubbe', $versid);
							if(!$ruery->execute()) {
								$error=$ruery->errorInfo();
								$debug.="Error copying entry".$error[2];
							}else{
									$momentlist[$row['lid']]=$pdo->lastInsertId();
							}
					}
					foreach($momentlist as $key => $value){
							$debug.=$key." ".$value."\n";		

							$ruery = $pdo->prepare("UPDATE listentries SET moment=:nyttmoment WHERE moment=:oldmoment AND vers=:updvers;");
							$ruery->bindParam(':nyttmoment', $value);
							$ruery->bindParam(':oldmoment', $key);
							$ruery->bindParam(':updvers', $versid);
							if(!$ruery->execute()) {
								$error=$ruery->errorInfo();
								$debug.="Error updating entry".$error[2];
							}
					}
			}

			
/*


$val = 5;
$sql = "REPLACE table (column) VALUES (:val)";
$stmt = $dbh->prepare($sql);
$stmt->bindParam(':val', $val, PDO::PARAM_INT);
$stmt->execute();
$lastId = $dbh->lastInsertId();



			$query = $pdo->prepare("INSERT INTO tmplistentries SELECT * from listentries WHERE vers = :oldvers;");
			$query->bindParam(':oldvers', $copycourse);
			if(!$query->execute()) {
				$error=$query->errorInfo();
				$debug="Error copying table".$error[2];
			}

			$query = $pdo->prepare("UPDATE tmplistentries SET vers = :newvers WHERE vers = :oldvers;");
			$query->bindParam(':oldvers', $versid);
			$query->bindParam(':newvers', $copycourse);
			if(!$query->execute()) {
				$error=$query->errorInfo();
				$debug="Error updating temporary table".$error[2];
			}
*/

/*		 
			$query = $pdo->prepare("INSERT INTO listentries (cid,entryname,link,kind,pos,creator,ts,code_id,visible,vers,moment,gradesystem,highscoremode) SELECT cid,entryname,link,kind,pos,creator,ts,code_id,visible,vers,moment,gradesystem,highscoremode FROM tmpListEntry WHERE vers = :newvers;");
			$query->bindParam(':newvers', $copycourse);
			if(!$query->execute()) {
				$error=$query->errorInfo();
				$debug="Error copying new version from temporary".$error[2];
			}
*/

/*		
			$query = $pdo->prepare("DROP TABLE tmpListEntry;");
			if(!$query->execute()) {
				$error=$query->errorInfo();
				$debug="Error dropping temporary table".$error[2];
			}
*/		 
		 
 
			///prepare a stored procedure call, bind params for variables
/*
			$query = $pdo->prepare("CALL copyVersionItems(:overs,:nvers)");
			$query->bindParam(":overs",$copycourse,PDO::PARAM_STR);
			$query->bindParam(":nvers",$versid,PDO::PARAM_STR);

			if(!$query->execute()) {
				$error=$query->errorInfo();
				$debug="Error cloning course. ".$error[2];
			}
*/
		}else if(strcmp($opt,"UPDATE")===0){
		$query = $pdo->prepare("UPDATE course SET coursename=:coursename, visibility=:visibility, coursecode=:coursecode WHERE cid=:cid;");

		$query->bindParam(':cid', $cid);
		$query->bindParam(':coursename', $coursename);
		$query->bindParam(':visibility', $visibility);
		$query->bindParam(':coursecode', $coursecode);

		if(!$query->execute()) {
			$error=$query->errorInfo();
			$debug="Error updating entries".$error[2];
		}
	}
}

//------------------------------------------------------------------------------------------------
// Retrieve Information
//------------------------------------------------------------------------------------------------

$entries=array();

if($ha){
	$query = $pdo->prepare("SELECT coursename,coursecode,cid,visibility,activeversion,activeedversion FROM course WHERE visibility<3 ORDER BY coursename");
}else{
	$query = $pdo->prepare("SELECT coursename,coursecode,cid,visibility,activeversion,activeedversion FROM course WHERE visibility>0 and visibility<3 ORDER BY coursename");
}

if(!$query->execute()) {
	$error=$query->errorInfo();
	$debug="Error reading courses".$error[2];
}else{
	foreach($query->fetchAll(PDO::FETCH_ASSOC) as $row){
		array_push(
			$entries,
			array(
				'cid' => $row['cid'],
				'coursename' => $row['coursename'],
				'coursecode' => $row['coursecode'],
				'visibility' => $row['visibility'],
				'activeversion' => $row['activeversion'],
				'activeedversion' => $row['activeedversion']
				)
			);
	}
}

$versions=array();
$query=$pdo->prepare("SELECT cid,coursecode,vers,versname,coursename,coursenamealt FROM vers;");

if(!$query->execute()) {
	$error=$query->errorInfo();
	$debug="Error reading courses".$error[2];
}else{
	foreach($query->fetchAll(PDO::FETCH_ASSOC) as $row){
		array_push(
			$versions,
			array(
				'cid' => $row['cid'],
				'coursecode' => $row['coursecode'],
				'vers' => $row['vers'],
				'versname' => $row['versname'],
				'coursename' => $row['coursename'],
				'coursenamealt' => $row['coursenamealt']
			)
		);
	}
}

$array = array(
	'entries' => $entries,
	'versions' => $versions,
	"debug" => $debug,
	'writeaccess' => $ha,
	'readaccess' => $hr,
	);

echo json_encode($array);

logServiceEvent($log_uuid, EventTypes::ServiceServerEnd, "courseedservice.php",$userid,$info);

?>
