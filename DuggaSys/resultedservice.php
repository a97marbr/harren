<?php

date_default_timezone_set("Europe/Stockholm");

// Include basic application services!
include_once "../Shared/sessions.php";
include_once "../Shared/basic.php";

// Connect to database and start session
pdoConnect();
session_start();

if(isset($_SESSION['uid'])){
	$userid=$_SESSION['uid'];
	$loginname=$_SESSION['loginname'];
	$lastname=$_SESSION['lastname'];
	$firstname=$_SESSION['firstname'];
}else{
	$userid=1;
	$loginname="UNK";		
	$lastname="UNK";
	$firstname="UNK";
} 	

$opt = getOP('opt');
$cid = getOP('cid');
$luid = getOP('luid');
$vers = getOP('vers');
$listentry = getOP('moment');
$mark = getOP('mark');
$ukind = getOP('ukind');
$newDuggaFeedback = getOP('newFeedback');
$coursevers=getOP('coursevers');

$responsetext=getOP('resptext');
$responsefile=getOP('respfile');

$duggaid = getOP('duggaid');

$duggapage="";
$dugganame="";
$duggaparam="";
$duggaanswer="";
$useranswer="";
$duggastats="";
$duggaentry="";
$duggauser="";
$duggafeedback="";

$debug="NONE!";

$log_uuid = getOP('log_uuid');
$info=$opt." ".$cid." ".$coursevers." ".$luid." ".$vers." ".$listentry." ".$mark;
logServiceEvent($log_uuid, EventTypes::ServiceServerStart, "resultedservice.php",$userid,$info);

//------------------------------------------------------------------------------------------------
// Services
//------------------------------------------------------------------------------------------------
if(checklogin() && (hasAccess($_SESSION['uid'], $cid, 'w') || isSuperUser($_SESSION['uid']))) {
	if(strcmp($opt,"CHGR")==0){
		if($ukind=="U"){
			$query = $pdo->prepare("UPDATE userAnswer SET grade=:mark,creator=:cuser,marked=NOW() WHERE cid=:cid AND moment=:moment AND vers=:vers AND uid=:uid");
			$query->bindParam(':mark', $mark);
			$query->bindParam(':cuser', $userid);

			$query->bindParam(':cid', $cid);
			$query->bindParam(':moment', $listentry);
			$query->bindParam(':vers', $vers);
			$query->bindParam(':uid', $luid);

			if(!$query->execute()) {
				$error=$query->errorInfo();
				$debug="Error updating entries".$error[2];
			}
			if ($newDuggaFeedback != ""){
					$query = $pdo->prepare("update userAnswer set feedback = :newDuggaFeedback WHERE cid=:cid AND moment=:moment AND vers=:vers AND uid=:uid");
					$query->bindParam(':newDuggaFeedback', $newDuggaFeedback);
					$query->bindParam(':cid', $cid);
					$query->bindParam(':moment', $listentry);
					$query->bindParam(':vers', $vers);
					$query->bindParam(':uid', $luid);
					if(!$query->execute()) {
						$error=$query->errorInfo();
						$debug="Error updating dugga feedback".$error[2];
					}
			}
		}else if($ukind=="I"){
			$query = $pdo->prepare("INSERT INTO userAnswer(grade,creator,cid,moment,vers,uid,marked) VALUES(:mark,:cuser,:cid,:moment,:vers,:uid,NOW());");
			$query->bindParam(':mark', $mark);
			$query->bindParam(':cuser', $userid);

			$query->bindParam(':cid', $cid);
			$query->bindParam(':moment', $listentry);
			$query->bindParam(':vers', $vers);
			$query->bindParam(':uid', $luid);

			if(!$query->execute()) {
				$error=$query->errorInfo();
				$debug="Error updating entries\n".$error[2];
			}
		}
	}

	if(strcmp($opt,"DUGGA")==0){

		// in this case moment refers to the listentry and not the parent moment listentry
		$query = $pdo->prepare("SELECT userAnswer.useranswer as aws,entryname,quizFile,qrelease,deadline,param,variant.variantanswer as facit,timeUsed,totalTimeUsed,stepsUsed,totalStepsUsed,link,feedback as duggaFeedback FROM userAnswer,listentries,quiz,variant WHERE variant.vid=userAnswer.variant AND userAnswer.cid=listentries.cid AND listentries.cid=quiz.cid AND userAnswer.vers=listentries.vers AND listentries.link=quiz.id AND listentries.lid=userAnswer.moment AND uid=:luid AND userAnswer.moment=:moment AND listentries.cid=:cid AND listentries.vers=:vers;");

		$query->bindParam(':cid', $cid);
		$query->bindParam(':vers', $vers);
		$query->bindParam(':moment', $listentry);
		$query->bindParam(':luid', $luid);

		if(!$query->execute()) {
			$error=$query->errorInfo();
			$debug="Error reading entries".$error[2];
		}

		if ($row = $query->fetch(PDO::FETCH_ASSOC)) {
			$duggatitle=$row['entryname'];
			$duggafile=$row['quizFile'];
			$duggarel=$row['qrelease'];
			$duggadead=$row['deadline'];

			$duggaid=$row['link'];
			$duggauser=$luid;
			$duggaentry=$listentry;

			$useranswer=$row['aws'];
			$useranswer = str_replace("*##*", '"', $useranswer);
			$useranswer = str_replace("*###*", '&cap;', $useranswer);
			if(strcmp($useranswer,"") == 0){$useranswer = "UNK";} // Return UNK if we have not submitted any user answer

			$duggaparam=html_entity_decode($row['param']);

			$duggaanswer=html_entity_decode($row['facit']);

			$duggastats = array($row['timeUsed'],$row['totalTimeUsed'],$row['stepsUsed'],$row['totalStepsUsed']);

			$dugganame="templates/".$duggafile.".js";

			$duggafeedback = html_entity_decode($row['duggaFeedback']);

			if(file_exists ( "templates/".$duggafile.".html")) {
				$duggapage=file_get_contents("templates/".$duggafile.".html");
			}
		}
	}
	
	if(strcmp($opt,"RESP")==0){

			$currcvd=getcwd();

			// Create a file area with format Lastname-Firstname-Login
			$userdir = $lastname."_".$firstname."_".$loginname;
			
			// First replace a predefined list of national characters
			// Then replace any additional character that is not a-z, a number, period or underscore
			$national = array("&ouml;", "&Ouml;", "&auml;", "&Auml;", "&aring;", "&Aring;","&uuml;","&Uuml;");
			$nationalReplace = array("o", "O", "a", "A", "a", "A","u","U");
			$userdir = str_replace($national, $nationalReplace, $userdir);
			$userdir=preg_replace("/[^a-zA-Z0-9._]/", "", $userdir);				
	
			if(!file_exists ($currcvd."/submissions/".$cid."/".$vers."/".$duggaid."/".$userdir)){
					if(!mkdir($currcvd."/submissions/".$cid."/".$vers."/".$duggaid."/".$userdir)){
							echo "Error creating folder: ".$currcvd."/submissions/cid/vers/duggaid/".$userdir;
							$error=true;
					}
			}
			
			$movname=$currcvd."/submissions/".$cid."/".$vers."/".$duggaid."/".$userdir."/".$responsefile."_FB.txt";
			file_put_contents($movname,$responsetext);
				
			$debug="RESZPONZY\n".$movname;
			
	}	
}

//------------------------------------------------------------------------------------------------
// Retrieve Information
//------------------------------------------------------------------------------------------------
$entries=array();
$gentries=array();
$sentries=array();
$lentries=array();

if(strcmp($opt,"DUGGA")!==0){
	if(checklogin() && (hasAccess($_SESSION['uid'], $cid, 'w') || isSuperUser($_SESSION['uid']))) {
		// Users connected to the current course (irrespective of version)
		$query = $pdo->prepare("select user_course.cid as cid,user.uid as uid,username,firstname,lastname,ssn,access from user,user_course where user.uid=user_course.uid and user_course.cid=:cid;");
		$query->bindParam(':cid', $cid);

		if(!$query->execute()) {
			$error=$query->errorInfo();
			$debug="Error retreiving users. (row ".__LINE__.") ".$query->rowCount()." row(s) were found. Error code: ".$error[2];
		}

		foreach($query->fetchAll(PDO::FETCH_ASSOC) as $row){
			// Create array entry for each course participant

			$entry = array(
				'cid' => (int)$row['cid'],
				'uid' => (int)$row['uid'],
				'username' => $row['username'],
				'firstname' => $row['firstname'],
				'lastname' => $row['lastname'],
				'ssn' => $row['ssn'],
				'role' => $row['access']
			);
			array_push($entries, $entry);
		}

		// All results from current course and vers?
		$query = $pdo->prepare("select aid,quiz,variant,moment,grade,uid,useranswer,submitted,vers,marked,timeUsed,totalTimeUsed,stepsUsed,totalStepsUsed from userAnswer where cid=:cid;");
		$query->bindParam(':cid', $cid);

		if(!$query->execute()) {
			$error=$query->errorInfo();
			$debug="Error retreiving userAnswers. (row ".__LINE__.") ".$query->rowCount()." row(s) were found. Error code: ".$error[2];
		}

		foreach($query->fetchAll(PDO::FETCH_ASSOC) as $row){
			if(!isset($lentries[$row['uid']])){
					$lentries[$row['uid']]=array();
			}

			array_push(
				$lentries[$row['uid']],
				array(
					'aid' => (int)$row['quiz'],
					'variant' => (int)$row['variant'],
					'moment' => (int)$row['moment'],
					'grade' => (int)$row['grade'],
					'uid' => (int)$row['uid'],
					'useranswer' => $row['useranswer'],
					'submitted'=> $row['submitted'],
					'vers'=> $row['vers'],
					'marked' => $row['marked'],
					'timeUsed' => $row['timeUsed'],
					'totalTimeUsed' => $row['totalTimeUsed'],
					'stepsUsed' => $row['stepsUsed'],
					'totalStepsUsed' => $row['totalStepsUsed']
				)
			);
		}

		// All dugga/moment entries from all versions of course
		$query = $pdo->prepare("SELECT lid,moment,entryname,pos,kind,link,visible,code_id,vers,gradesystem FROM listentries WHERE listentries.cid=:cid and vers=:vers and (listentries.kind=3 or listentries.kind=4) ORDER BY pos");
		$query->bindParam(':cid', $cid);
		$query->bindParam(':vers', $vers);

		if(!$query->execute()) {
			$error=$query->errorInfo();
			$debug="Error retreiving moments and duggas. (row ".__LINE__.") ".$query->rowCount()." row(s) were found. Error code: ".$error[2];
		}

		$currentMoment=null;
		foreach($query->fetchAll(PDO::FETCH_ASSOC) as $row){
			array_push(
				$gentries,
				array(
					'entryname' => $row['entryname'],
					'lid' => (int)$row['lid'],
					'pos' => (int)$row['pos'],
					'kind' => (int)$row['kind'],
					'moment' => (int)$row['moment'],
					'link'=> $row['link'],
					'visible'=> (int)$row['visible'],
					'code_id' => $row['code_id'],
					'vers' => $row['vers'],
					'gradesystem' => (int)$row['gradesystem']
				)
			);
		}

		// All extant versions of course
		$query = $pdo->prepare("SELECT cid,coursecode,vers FROM vers");

		if(!$query->execute()) {
			$error=$query->errorInfo();
			$debug="Error retreiving. (row ".__LINE__.") ".$query->rowCount()." row(s) were found. Error code: ".$error[2];
		}

		foreach($query->fetchAll(PDO::FETCH_ASSOC) as $row){
			array_push(
				$sentries,
				array(
					'cid' => $row['cid'],
					'coursecode' => $row['coursecode'],
					'vers' => $row['vers']
				)
			);
		}
	}
}

$files= array();
$query = $pdo->prepare("select subid,uid,vers,did,fieldnme,filename,extension,mime,updtime,kind,filepath,seq,segment from submission where uid=:uid and vers=:vers and cid=:cid order by filename,updtime asc;");
$query->bindParam(':uid', $luid);
$query->bindParam(':cid', $cid);
$query->bindParam(':vers', $vers);


if(!$query->execute()) {
	$error=$query->errorInfo();
	$debug="Error retreiving submissions. (row ".__LINE__.") ".$query->rowCount()." row(s) were found. Error code: ".$error[2];
}


foreach($query->fetchAll() as $row) {
		$content = "UNK";
		$feedback = "UNK";

		$currcvd=getcwd();
		
		$fedbname=$currcvd."/".$row['filepath'].$row['filename'].$row['seq']."_FB.txt";				
		if(!file_exists($fedbname)) {
				$feedback="No feedback yet...";
		} else {
				$feedback=file_get_contents($fedbname);
		}			
		
		
		if($row['kind']=="3"){
				// Read file contents
				$movname=$currcvd."/".$row['filepath']."/".$row['filename'].$row['seq'].".".$row['extension'];

				if(!file_exists($movname)) {
						$content="UNK!";
				} else {
						$content=file_get_contents($movname);
				}
		}	else if($row['kind']=="2"){
				// File content is an URL
				$movname=$currcvd."/".$row['filepath']."/".$row['filename'].$row['seq'];

				if(!file_exists($movname)) {
						$content="UNK URL!";
				} else {
						$content=file_get_contents($movname);
				}
		}else{
				$content="Not a text-submit or URL";
		}

		$entry = array(
			'uid' => $row['uid'],
			'subid' => $row['subid'],
			'vers' => $row['vers'],
			'did' => $row['did'],
			'fieldnme' => $row['fieldnme'],
			'filename' => $row['filename'],
			'filepath' => $row['filepath'],
			'extension' => $row['extension'],
			'mime' => $row['mime'],
			'updtime' => $row['updtime'],
			'kind' => $row['kind'],
			'seq' => $row['seq'],
			'segment' => $row['segment'],
			'content' => $content,
			'feedback' => $feedback
		);

		// If the filednme key isn't set, create it now
  	if (!isset($files[$row['segment']])) $files[$row['segment']] = array();
		array_push($files[$row['segment']], $entry);

}

if (sizeof($files) === 0) {$files = (object)array();} // Force data type to be object

$array = array(
	'entries' => $entries,
	'moments' => $gentries,
	'versions' => $sentries,
	'debug' => $debug,
	'results' => $lentries,

	'duggauser' => $duggauser,
	'duggaentry' => $duggaentry,
	'duggaid' => $duggaid,
	'duggapage' => $duggapage,
	'dugganame' => $dugganame,
	'duggaparam' => $duggaparam,
	'duggaanswer' => $duggaanswer,
	'useranswer' => $useranswer,
	'duggastats' => $duggastats,
	'duggafeedback' => $duggafeedback,
	'moment' => $listentry,
	'files' => $files
);

echo json_encode($array);

logServiceEvent($log_uuid, EventTypes::ServiceServerEnd, "resultedservice.php",$userid,$info);
?>
