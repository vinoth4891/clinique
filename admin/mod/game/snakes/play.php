<?php  // $Id: play.php,v 1.26 2012/07/26 05:39:00 bdaloukas Exp $

// This files plays the game "Snakes and Ladders"

function game_snakes_continue( $id, $game, $attempt, $snakes, $context)
{
	if( $attempt != false and $snakes != false){
		return game_snakes_play( $id, $game, $attempt, $snakes, $context);
	}

	if( $attempt === false){
		$attempt = game_addattempt( $game);
	}
	
	$newrec = new stdClass();
	$newrec->id = $attempt->id;
	$newrec->snakesdatabaseid = $game->param3;
    if( $newrec->snakesdatabaseid == 0)
        $newrec->snakesdatabaseid = 1;
	$newrec->position = 1;
	$newrec->queryid = 0;
    $newrec->dice = rand( 1, 6);
	if( !game_insert_record(  'game_snakes', $newrec)){
		print_error( 'game_snakes_continue: error inserting in game_snakes');
	}
	
	game_updateattempts( $game, $attempt, 0, 0);
	
	return game_snakes_play( $id, $game, $attempt, $newrec, $context);
}

function game_snakes_play( $id, $game, $attempt, $snakes, $context)
{
	global $CFG, $DB, $OUTPUT;
	
    $board = game_snakes_get_board( $game);
    $showboard = false;

	if( $snakes->position > $board->cols * $board->rows && $snakes->queryid <> 0){
		$finish = true;
	
		if (! $cm = $DB->get_record('course_modules', array( 'id' => $id))) {
			print_error("Course Module ID was incorrect id=$id");
		}
	
		echo '<B>'.get_string( 'win', 'game').'</B><BR>';	
		echo '<br>';	
		echo "<a href=\"$CFG->wwwroot/mod/game/attempt.php?id=$id\">".get_string( 'nextgame', 'game').'</a> &nbsp; &nbsp; &nbsp; &nbsp; ';
		echo "<a href=\"$CFG->wwwroot/course/view.php?id=$cm->course\">".get_string( 'finish', 'game').'</a> ';
		
		$gradeattempt = 1;
		$finish = 1;
		game_updateattempts( $game, $attempt, $gradeattempt, $finish);		
	}else
	{
		$finish = false;
		if( $snakes->queryid == 0){
			game_snakes_computenextquestion( $game, $snakes, $query);
		}else
		{
			$query = $DB->get_record( 'game_queries', array( 'id' => $snakes->queryid));
		}
		if( $game->toptext != ''){
		    echo $game->toptext.'<br>';
	    }
	    $showboard = true;
	}
	
	if( $showboard and $game->param8 == 0)
		game_snakes_showquestion( $id, $game, $snakes, $query, $context);

?>
    <script language="javascript" event="onload" for="window">
    <!--    
    var retVal = new Array();
    var elements = document.getElementsByTagName("*");
    for(var i = 0;i < elements.length;i++){
        if( elements[ i].type == 'text'){
            elements[ i].focus();
            break;
        }
    }
    -->
    </script>

	<table>
	<tr>
		<td>

<div id="board" STYLE="position:relative; left:0px;top:0px; width:<?php p($board->width); ?>px; height:<?php p($board->height); ?>px;">
<img src="<?php echo $board->imagesrc; ?>"></img>
</div>

<?php


if( $finish  == false){
    game_snakes_showdice( $snakes, $board);
}
?>
		</td>
	</tr>
	</table>
<?php

	if( $game->bottomtext != ''){
		echo '<br>'.$game->bottomtext;
	}
	
	if( $showboard and $game->param8 != 0)
		game_snakes_showquestion( $id, $game, $snakes, $query, $context);	
}

function game_snakes_showdice( $snakes, $board)
{
	$pos = game_snakes_computeplayerposition( $snakes, $board);
?>
<div ID="player1" STYLE="position:relative; left:<?php p( $pos->x);?>px; top:<?php p( $pos->y);?>px;" >
<img src="snakes/1/player1.png" alt="<?php print_string('snakes_player', 'game', ($snakes->position +1)); /*Accessibility. */ ?>" width="<?php echo $pos->width; ?>" height="<?php echo $pos->height; ?>"/>
</div>

	<div ID="dice" STYLE="position:relative; left:<?php p( $board->width + round($board->width/3));?>px;top:<?php p( -2*round($board->height/3));?>px; ">
	<img src="snakes/1/dice<?php p($snakes->dice);?>.png" alt="<?php print_string('snakes_dice', 'game', $snakes->dice) ?>" />
	</div>	
<?php
}

function game_snakes_computeplayerposition( $snakes, $board)
{
	$x = ($snakes->position - 1) % $board->cols;
	$y = floor( ($snakes->position-1) / $board->cols);
	
	$cellwidth = ($board->width - $board->headerx - $board->footerx) / $board->cols;
	$cellheight = ($board->height - $board->headery - $board->footery) / $board->rows;
	
	$pos = new stdClass();
	$pos->width = 22;
	$pos->height = 22;
	
	$pos->ofsx = 0;
	$pos->ofsy = $pos->height;
	
	switch( $board->direction){
	case 1:
		if( ($y % 2) == 1){
			$x = $board->cols  - $x - 1;
		}
		$pos->x = $board->headerx + $x * $cellwidth + ($cellwidth - $pos->width)/2+ $pos->ofsx;
		$pos->y = $board->footery + $y * $cellheight + ($cellheight - $pos->height)/2 + $pos->ofsy;
		$pos->x = round( $pos->x);
		$pos->y = round( -$pos->y);
		break;
	}
		
	return $pos;
}

function game_snakes_computenextquestion( $game, &$snakes, &$query)
{
	global $DB, $USER;
	
    //Retrieves CONST_GAME_TRIES_REPETITION words and select the one which is used fewer times
	if( ($recs = game_questions_selectrandom( $game, 1, CONST_GAME_TRIES_REPETITION)) == false){
		return false;
	}

    $glossaryid = 0;
    $questionid = 0;
    $min_num = 0;
    $query = new stdClass();
    foreach( $recs as $rec){
        $a = array( 'gameid' => $game->id, 'userid' => $USER->id, 'questionid' => $rec->questionid, 'glossaryentryid' => $rec->glossaryentryid);
        if(($rec2 = $DB->get_record('game_repetitions', $a, 'id,repetitions r')) != false){
            if( ($rec2->r < $min_num) or ($min_num == 0)){
                $min_num = $rec2->r;
                $query->glossaryentryid = $rec->glossaryentryid;
                $query->questionid = $rec->questionid;
            }
        }
        else{
            $query->glossaryentryid = $rec->glossaryentryid;
            $query->questionid = $rec->questionid;
            break;
        }
    }
	
    if( ($query->glossaryentryid == 0) AND ($query->questionid == 0))
        return false;

    $query->attemptid = $snakes->id;
    $query->gameid = $game->id;
    $query->userid = $USER->id;
    $query->sourcemodule = $game->sourcemodule;
    $query->score = 0;
    $query->timelastattempt = time();
    if( !($query->id = $DB->insert_record( 'game_queries', $query))){
       print_error( "Can't insert to table game_queries");
    }
		
    $snakes->queryid = $query->id;
	
	$updrec = new stdClass();	
    $updrec->id = $snakes->id;
    $updrec->queryid = $query->id;
    $updrec->dice = $snakes->dice = rand( 1, 6);
		
	if( !$DB->update_record(  'game_snakes', $updrec)){
       print_error( 'game_questions_selectrandom: error updating in game_snakes');
    }

	game_update_repetitions($game->id, $USER->id, $query->questionid, $query->glossaryentryid);

    return true;
}

function game_snakes_showquestion( $id, $game, $snakes, $query, $context)
{
	if( $query->sourcemodule == 'glossary'){
		game_snakes_showquestion_glossary( $id, $snakes, $query, $game);
	}else
	{
		game_snakes_showquestion_question( $game, $id, $snakes, $query, $context);
	}
}

function game_snakes_showquestion_question( $game, $id, $snakes, $query, $context)
{
	global $CFG;
	
	$questionlist = $query->questionid;
    $questions = game_sudoku_getquestions( $questionlist);

	/// Start the form
    echo "<form id=\"responseform\" method=\"post\" action=\"{$CFG->wwwroot}/mod/game/attempt.php\" onclick=\"this.autocomplete='off'\">\n";
	echo "<center><input type=\"submit\" name=\"finishattempt\" value=\"".get_string('sudoku_submit', 'game')."\"></center>\n";

    // Add a hidden field with the quiz id
    echo '<input type="hidden" name="id" value="' . s($id) . "\" />\n";
    echo '<input type="hidden" name="action" value="snakescheck" />';
    echo '<input type="hidden" name="queryid" value="' . $query->id . "\" />\n";

	/// Print all the questions
	foreach( $questions as $question)
        game_print_question( $game, $question, $context);
    // Add a hidden field with questionids
    echo '<input type="hidden" name="questionids" value="'.$questionlist."\" />\n";

    echo "</form>\n";    
}

function game_snakes_showquestion_glossary( $id, $snakes, $query, $game)
{
	global $CFG, $DB;
	
	$entry = $DB->get_record( 'glossary_entries', array('id' => $query->glossaryentryid));

	/// Start the form
    echo "<form id=\"responseform\" method=\"post\" action=\"{$CFG->wwwroot}/mod/game/attempt.php\" onclick=\"this.autocomplete='off'\">\n";
	echo "<center><input type=\"submit\" name=\"finishattempt\" value=\"".get_string('sudoku_submit', 'game')."\"></center>\n";

    // Add a hidden field with the queryid
    echo '<input type="hidden" name="id" value="' . s($id) . "\" />\n";
    echo '<input type="hidden" name="action" value="snakescheckg" />';
    echo '<input type="hidden" name="queryid" value="' . $query->id . "\" />\n";

	/// Print all the questions

    // Add a hidden field with glossaryentryid
    echo '<input type="hidden" name="glossaryentryid" value="'.$query->glossaryentryid."\" />\n";

    $cmglossary = get_coursemodule_from_instance('glossary', $game->glossaryid, $game->course);
    $contextglossary = get_context_instance(CONTEXT_MODULE, $cmglossary->id);
    $s = game_filterglossary(str_replace( '\"', '"', $entry->definition), $query->glossaryentryid, $contextglossary->id, $game->course);
    echo $s.'<br>';
    
    echo get_string( 'answer').': ';
	echo "<input type=\"text\" name=\"answer\" size=30 /><br>";

    echo "</form>\n";
}


function game_snakes_check_questions( $id, $game, $attempt, $snakes, $context)
{
	global $QTYPES, $CFG, $DB;

    $responses = data_submitted();

	if( $responses->queryid != $snakes->queryid){
		game_snakes_play( $id, $game, $attempt, $snakes, $context);
		return;
	}

	$questionlist = $DB->get_field( 'game_queries', 'questionid', array(  'id' => $responses->queryid));

    $questions = game_sudoku_getquestions( $questionlist);
	$correct = false;
	$query = '';
    foreach($questions as $question) {
		$query = new stdClass();
        $query->id = $snakes->queryid;

        $grade = game_grade_responses( $question, $responses, 100, $answertext);
        if( $grade < 50){
			//wrong answer
			game_update_queries( $game, $attempt, $query, 0, $answertext);
            continue;
        }
        
        //correct answer
		$correct = true;

        game_update_queries( $game, $attempt, $query, 1, '');
    }
	
	//set the grade of the whole game
    game_snakes_position( $id, $game, $attempt, $snakes, $correct, $query, $context);
}


function game_snakes_check_glossary( $id, $game, $attempt, $snakes, $context)
{
	global $QTYPES, $CFG, $DB;

    $responses = data_submitted();

	if( $responses->queryid != $snakes->queryid){
		game_snakes_play( $id, $game, $attempt, $snakes, $context);
		return;
	}

	$query = $DB->get_record( 'game_queries', array( 'id' => $responses->queryid));

    $glossaryentry = $DB->get_record( 'glossary_entries', array( 'id' => $query->glossaryentryid));
    
    $name = 'resp'.$query->glossaryentryid;
    $useranswer = $responses->answer;
    
    if( game_upper( $useranswer) != game_upper( $glossaryentry->concept)){
        //wrong answer
        $correct = false;
		game_update_queries( $game, $attempt, $query, 0, $useranswer);//last param is grade
    }else
    {
        //correct answer
		$correct = true;

        game_update_queries( $game, $attempt, $query, 1, $useranswer);//last param is grade
    }
	
	//set the grade of the whole game
    game_snakes_position( $id, $game, $attempt, $snakes, $correct, $query, $context);
}


function game_snakes_position( $id, $game, $attempt, $snakes, $correct, $query, $context)
{
    global $DB;

	$data = $DB->get_field( 'game_snakes_database', 'data', array( 'id' => $snakes->snakesdatabaseid));

	if( $correct){		
		if( ($next=game_snakes_foundlander( $snakes->position + $snakes->dice, $data))){
			$snakes->position  = $next;
		}else
		{
			$snakes->position  = $snakes->position + $snakes->dice;
		}
	}else
	{
		if( ($next=game_snakes_foundsnake( $snakes->position, $data))){
			$snakes->position  = $next;
		}
	}

	$updrec = new stdClass();
	$updrec->id = $snakes->id;
	$updrec->position = $snakes->position;
	$updrec->queryid = 0;
	
	if( !$DB->update_record( 'game_snakes', $updrec)){
		print_error( "game_snakes_position: Can't update game_snakes");
	}

	$board = $DB->get_record_select( 'game_snakes_database', "id=$snakes->snakesdatabaseid");
	$gradeattempt = $snakes->position / ($board->cols  * $board->rows);
	$finished = ( $snakes->position > $board->cols  * $board->rows ? 1 : 0);

	game_updateattempts( $game, $attempt, $gradeattempt, $finished);

	game_snakes_computenextquestion( $game, $snakes, $query);

	game_snakes_play( $id, $game, $attempt, $snakes, $context);
}

//in lander go forward
function game_snakes_foundlander( $position, $data)
{
	preg_match( "/L$position-([0-9]*)/", $data, $matches);
	
	if( count( $matches)){
		return $matches[ 1];
	}
	
	return 0;
}

//in snake go backward
function game_snakes_foundsnake( $position, $data)
{
	preg_match( "/S([0-9]*)-$position,/", $data.',', $matches);
	
	if( count( $matches)){
		return $matches[ 1];
	}
	
	return 0;	
}

function game_snakes_remove_attemptdata ($questionusageid, $questionid) {
    global $DB;

    $sql = "SELECT qas.id
              FROM mdl_question_attempts qa
         LEFT JOIN mdl_question_attempt_steps qas
                ON qa.id=qas.questionattemptid
             WHERE questionusageid = $questionusageid
               AND questionid = $questionid
               AND state != 'todo'";

    if ($stepdata = $DB->get_records_sql($sql)) {
        foreach($stepdata as $step) {
            if ($step->id > 0) {
                $DB->delete_records('question_attempt_step_data', array('attemptstepid' => $step->id));
                $DB->get_records_sql("update {question_attempt_steps} set state='todo' where id = {$step->id}");
            }
        }
    }
}
