<!DOCTYPE html>
<html>
	<head>
		<title>Cheat With Words</title>
		<!--link media="only screen and (max-device-width: 480px)" href="small-device.css" type= "text/css" rel="stylesheet" -->
		<link href="/css/small-device.css" type= "text/css" rel="stylesheet"/>
		<meta name = "viewport" content = "width = device-width"/>
		<meta name = "viewport" content = "initial-scale = 1.0"/>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black" />
	</head>
	<body>
		<div>
			<form action="/letters/index" method='POST'>
				<input type="text" name="search" size="15" value="{$search}" autocorrect="off" autocapitalize="characters"/>
				<input type="submit" value="Find"/>
			</form>
		</div>
		<table class="wordTable">
			{foreach from=$words item=word name=wordFor}
				{if $smarty.foreach.wordFor.iteration % 3 == 1}
					<tr>
				{/if}
				<td class="word">{$word|strtolower}</td>				
				{if $smarty.foreach.wordFor.iteration % 3 == 0}
					</tr>
				{/if}
			{foreachelse}
				No Matches<br/>
			{/foreach}

			{if $smarty.foreach.wordFor.iteration % 3 != 0}
				</tr>
			{/if}
			
		</table>
		<footer>
			Word Lists: <a href="/?list=two">2-Letter</a> <a href="/?list=3">3-Letter</a> <a href="/?list=qwithoutu">Q without U</a><br/>
		</footer>
	</body>
</html>