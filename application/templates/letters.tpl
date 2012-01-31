<html>
	<head>
		<title>Find a Word</title>
		<!--link media="only screen and (max-device-width: 480px)" href="small-device.css" type= "text/css" rel="stylesheet" -->
		<link href="/css/small-device.css" type= "text/css" rel="stylesheet"/>
		<meta name = "viewport" content = "width = device-width"/>
		<meta name = "viewport" content = "initial-scale = 1.0"/>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="black" />
	</head>
	<body>
		<div>
			<form action="{$url}" method='POST'>
				<input type="text" name="search" size="15" value="{$search}" autocorrect="off" autocapitalize="characters"/>
				<input type="submit" value="Find"/>
			</form>
		</div>
		<div>
			{foreach from=$words item=word name=wordFor}
				<span class="word">{$word}</span>
				{if $smarty.foreach.wordFor.iteration % 3 == 0}
					<br/>
				{/if}
			{foreachelse}
				No Matches<br/>
			{/foreach}
		</div>
	</body>
</html>