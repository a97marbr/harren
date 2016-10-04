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
$ha=null;
$debug="NONE!";

$log_uuid = getOP('log_uuid');
$info=$opt." ".$cid." ".$coursename." ".$versid." ".$visibility;
logServiceEvent($log_uuid, EventTypes::ServiceServerStart, "courseedservice.php",$userid,$info);

//------------------------------------------------------------------------------------------------
// Services
//------------------------------------------------------------------------------------------------
$isSuperUserVar=false;

if(checklogin()){
	$isSuperUserVar=isSuperUser($userid);

	$ha = $isSuperUserVar;

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
				
				// Duplicate duggas and dugga variants
				$duggalist=array();
				$query = $pdo->prepare("SELECT * from quiz WHERE cid=:cid AND vers = :oldvers;");
				$query->bindParam(':cid', $cid);
				$query->bindParam(':oldvers', $copycourse);
				if(!$query->execute()) {
						$error=$query->errorInfo();
						$debug="Error reading quiz".$error[2];
				}else{
						foreach($query->fetchAll(PDO::FETCH_ASSOC) as $row){
								$ruery = $pdo->prepare("INSERT INTO quiz (cid,autograde,gradesystem,qname,quizFile,qrelease,deadline,modified,creator,vers) SELECT cid,autograde,gradesystem,qname,quizFile,qrelease,deadline,modified,creator,:newvers as vers from quiz WHERE id = :oldid;");
								$ruery->bindParam(':oldid', $row['id']);
								$ruery->bindParam(':newvers', $versid);
								if(!$ruery->execute()) {
									$error=$ruery->errorInfo();
									$debug.="Error copying quiz entry".$error[2];
								}else{
										$duggalist[$row['id']]=$pdo->lastInsertId();
								}
						}
						foreach($duggalist as $key => $value){
							$buery = $pdo->prepare("SELECT * from variant WHERE quizID=:quizid;");
							$buery->bindParam(':quizid', $key);
							if(!$buery->execute()) {
									$error=$buery->errorInfo();
									$debug="Error reading variants: ".$error[2];
							}else{
									foreach($buery->fetchAll(PDO::FETCH_ASSOC) as $rowz){
											$ruery = $pdo->prepare("INSERT INTO variant (quizID,param,variantanswer,modified,creator,disabled) SELECT :newquizid as quizID,param,variantanswer,modified,creator,disabled FROM variant WHERE vid = :oldvid;");
											$ruery->bindParam(':oldvid', $rowz["vid"]);
											$ruery->bindParam(':newquizid', $value);
											if(!$ruery->execute()) {
												$error=$ruery->errorInfo();
												$debug.="Error updating entry".$error[2];
											}						
									}
							}
						}
				}

				// Duplicate codeexamples and it's components box, improws, impwordlist
				$codeexamplelist=array();
				$query = $pdo->prepare("SELECT * from codeexample WHERE cid=:cid AND cversion = :oldvers;");
				$query->bindParam(':cid', $cid);
				$query->bindParam(':oldvers', $copycourse);
				if(!$query->execute()) {
						$error=$query->errorInfo();
						$debug="Error reading codeexample: ".$error[2];
				}else{
						foreach($query->fetchAll(PDO::FETCH_ASSOC) as $row){
								$ruery = $pdo->prepare("INSERT INTO codeexample (cid,examplename,sectionname,beforeid,afterid,runlink,cversion,public,updated,uid,templateid) SELECT cid,examplename,sectionname,beforeid,afterid,runlink,:newvers as cversion,public,updated,uid,templateid from codeexample WHERE exampleid = :oldid;");
								$ruery->bindParam(':oldid', $row['exampleid']);
								$ruery->bindParam(':newvers', $versid);
								if(!$ruery->execute()) {
									$error=$ruery->errorInfo();
									$debug.="Error copying codeexample entry".$error[2];
								}else{
										$codeexamplelist[$row['exampleid']]=$pdo->lastInsertId();
								}
						}
						/*
						 * Each code example has a number of associated boxes and potentially important rows (improw) and important words (impwordlist)
						 */
						foreach($codeexamplelist as $key => $value){
								$buery = $pdo->prepare("SELECT * from box WHERE exampleid=:exampleid;");
								$buery->bindParam(':exampleid', $key);
								if(!$buery->execute()) {
										$error=$buery->errorInfo();
										$debug="Error reading boxes: ".$error[2];
								}else{
										foreach($buery->fetchAll(PDO::FETCH_ASSOC) as $rowz){
												// Make duplicate of all boxes for current code example and bind to the new copy
												$ruery = $pdo->prepare("INSERT INTO box (boxid,exampleid,boxtitle,boxcontent,filename,settings,wordlistid,segment,fontsize) SELECT boxid,:newexampleid as exampleid,boxtitle,boxcontent,filename,settings,wordlistid,segment,fontsize FROM box WHERE boxid=:oldboxid and exampleid=:oldexampleid;");
												$ruery->bindParam(':oldboxid', $rowz["boxid"]);
												$ruery->bindParam(':oldexampleid', $key);
												$ruery->bindParam(':newexampleid', $value);
												if(!$ruery->execute()) {
													$error=$ruery->errorInfo();
													$debug.="Error duplicating boxes".$error[2];
												}
										}
										
										// Make duplicate of improws for current code example and bind to the new copy
										$pruery = $pdo->prepare("SELECT * FROM improw WHERE exampleid=:oldexampleid;");
										$pruery->bindParam(':oldexampleid', $key);
										if(!$pruery->execute()) {
											$error=$pruery->errorInfo();
											$debug.="Error finding improws".$error[2];
										}
										foreach ($pruery->fetchAll(PDO::FETCH_ASSOC) as $improwz) {
												if ($pruery->rowCount() > 0){
														$qruery = $pdo->prepare("INSERT INTO improw (boxid,exampleid,istart,iend,irowdesc,updated,uid) SELECT boxid,:newexampleid as exampleid,istart,iend,irowdesc,updated,uid FROM improw WHERE exampleid=:oldexampleid and impid=:oldimpid and boxid=:oldboxid;");
														$qruery->bindParam(':oldboxid', $improwz["boxid"]);
														$qruery->bindParam(':oldimpid', $improwz["impid"]);
														$qruery->bindParam(':oldexampleid', $key);
														$qruery->bindParam(':newexampleid', $value);
														if(!$qruery->execute()) {
															$error=$qruery->errorInfo();
															$debug.="Error duplicating improws".$error[2];
														}													
												}
										}
										
										// Make duplicate of impwordlist for current code example and bind to the new copy
										$zruery = $pdo->prepare("SELECT * FROM impwordlist WHERE exampleid=:oldexampleid;");
										$zruery->bindParam(':oldexampleid', $key);
										if(!$zruery->execute()) {
											$error=$zruery->errorInfo();
											$debug.="Error finding impwords".$error[2];
										}
										foreach ($zruery->fetchAll(PDO::FETCH_ASSOC) as $impwordz) {
												if ($zruery->rowCount() > 0){
														$zzqruery = $pdo->prepare("INSERT INTO impwordlist (exampleid,word,label,updated,uid) SELECT :newexampleid as exampleid,word,label,updated,uid FROM impwordlist WHERE exampleid=:oldexampleid and wordid=:oldwordid;");
														$zzqruery->bindParam(':oldwordid', $impwordz["wordid"]);
														$zzqruery->bindParam(':oldexampleid', $key);
														$zzqruery->bindParam(':newexampleid', $value);
														if(!$zzqruery->execute()) {
															$error=$zzqruery->errorInfo();
															$debug.="Error duplicating impwords: ".$error[2];
														}													
												}
										}																													
								}
						}
				}

				// Duplicate listentries
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
						// Update to correct moment
						foreach($momentlist as $key => $value){
								$ruery = $pdo->prepare("UPDATE listentries SET moment=:nyttmoment WHERE moment=:oldmoment AND vers=:updvers;");
								$ruery->bindParam(':nyttmoment', $value);
								$ruery->bindParam(':oldmoment', $key);
								$ruery->bindParam(':updvers', $versid);
								if(!$ruery->execute()) {
									$error=$ruery->errorInfo();
									$debug.="Error updating entry".$error[2];
								}
						}
						// Update to correct dugga
						foreach($duggalist as $key => $value){
								$puery = $pdo->prepare("UPDATE listentries SET link=:newquiz WHERE link=:oldquiz AND vers=:updvers;");
								$puery->bindParam(':newquiz', $value);
								$puery->bindParam(':oldquiz', $key);
								$puery->bindParam(':updvers', $versid);
								if(!$puery->execute()) {
									$error=$puery->errorInfo();
									$debug.="Error updating entry".$error[2];
								}
						}

						// Update to correct codeexample
						foreach($codeexamplelist as $key => $value){
								$puery = $pdo->prepare("UPDATE listentries SET link=:newexample WHERE link=:oldexample AND vers=:updvers;");
								$puery->bindParam(':newexample', $value);
								$puery->bindParam(':oldexample', $key);
								$puery->bindParam(':updvers', $versid);
								if(!$puery->execute()) {
									$error=$puery->errorInfo();
									$debug.="Error updating entry".$error[2];
								}
						}
						// Update to correct before and after in codeexample
						foreach($codeexamplelist as $key => $value){
								$puery = $pdo->prepare("UPDATE codeexample SET beforeid=:newexample WHERE beforeid=:oldexample AND cversion=:updvers;");
								$puery->bindParam(':newexample', $value);
								$puery->bindParam(':oldexample', $key);
								$puery->bindParam(':updvers', $versid);
								if(!$puery->execute()) {
									$error=$puery->errorInfo();
									$debug.="Error updating before link".$error[2];
								}
						}
						foreach($codeexamplelist as $key => $value){
								$puery = $pdo->prepare("UPDATE codeexample SET afterid=:newexample WHERE afterid=:oldexample AND cversion=:updvers;");
								$puery->bindParam(':newexample', $value);
								$puery->bindParam(':oldexample', $key);
								$puery->bindParam(':updvers', $versid);
								if(!$puery->execute()) {
									$error=$puery->errorInfo();
									$debug.="Error updating after link".$error[2];
								}
						}

				}
				
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
}
//------------------------------------------------------------------------------------------------
// Retrieve Information
//------------------------------------------------------------------------------------------------

$entries=array();
/*
if($ha){
	$query = $pdo->prepare("SELECT coursename,coursecode,cid,visibility,activeversion,activeedversion FROM course WHERE visibility<3 ORDER BY coursename");
}else{
	$query = $pdo->prepare("SELECT coursename,coursecode,cid,visibility,activeversion,activeedversion FROM course WHERE visibility>0 and visibility<3 ORDER BY coursename");
}
*/

$queryz = $pdo->prepare("SELECT cid,access FROM user_course WHERE uid=:uid;");
$queryz->bindParam(':uid', $userid);
if(!$queryz->execute()) {
	$error=$queryz->errorInfo();
	$debug="Error reading courses".$error[2];
}

$userCourse = array();
foreach($queryz->fetchAll(PDO::FETCH_ASSOC) as $row){
	$userCourse[$row['cid']] = $row['access'];
}


$query = $pdo->prepare("SELECT coursename,coursecode,cid,visibility,activeversion,activeedversion FROM course ORDER BY coursename");

/*

0 == hidden
1 == public
2 == login
3 == deleted

*/

/* Help function to determin if user has write access to aspecific course */
function checkWriteAcces($course, $array) {
		$ret = false;
    if (array_key_exists ($course, $array)){
				if ($array[$course] == "W") $ret = true;
		}
		return $ret;
} 

if(!$query->execute()) {
	$error=$query->errorInfo();
	$debug="Error reading courses".$error[2];
}else{
	foreach($query->fetchAll(PDO::FETCH_ASSOC) as $row){
			if ($isSuperUserVar || 
					$row['visibility']==1 || 
					($row['visibility']==2 && (array_key_exists ($row['cid'] , $userCourse ))) ||
					($row['visibility']==0 && (checkWriteAcces($row['cid'],$userCourse)))){
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
	);

echo json_encode($array);

logServiceEvent($log_uuid, EventTypes::ServiceServerEnd, "courseedservice.php",$userid,$info);

?>
