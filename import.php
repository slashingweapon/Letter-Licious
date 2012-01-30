<?php

$dsn = 'mysql:host=localhost;dbname=letteredman';
$username = 'root';
$password = '';

$dbh = new PDO($dsn, $username, $password);
if (!($dbh instanceof PDO)) {
	echo "No db connection";
	exit(1);
}

processLines('TWL06.txt', $dbh);

function processLines($inFilename, $dbConn) {
	$query = "INSERT INTO words (len, letters, word) VALUES (?, ?, ?)";
	$statement = $dbConn->prepare($query);
	$linecount = 0;
	
	$lines = file($inFilename);
	foreach($lines as $oneLine) {
		if (!empty($oneLine)) {
			$oneLine = trim($oneLine);
			$oneLine = strtoupper($oneLine);
			$sortWord = lettersort($oneLine);
			$length = strlen($sortWord);
			
			if (! $statement->execute(array($length, $sortWord, $oneLine))) {
				echo "Insert failed\n";
				exit();
			}
			
			$linecount++;
			if (!($linecount % 1000))
				echo "Added $linecount words\n";
		}
	}
}

function lettersort($word) {
	$letters = array();
	$count = strlen($word);
	
	for($idx=0; $idx<$count; $idx++)
		$letters[] = $word[$idx];
	sort($letters);
	$word = implode('', $letters);
	return $word;
}
