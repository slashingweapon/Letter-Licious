<html>
	<head>
		<title>Find a Word</title>
	</head>
	<body>
		<div>
			<form action="{$url}" method='POST'>
				<input type="text" name="search" size="15" value="{$search}"/>
				<input type="submit" value="Find Words"/>
			</form>
		</div>
		<div>
			{foreach from=$words item=word}
				{$word}<br/>
			{foreachelse}
				No Matches<br/>
			{/foreach}
		</div>
	</body>
</html>