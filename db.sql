create table words (
	len smallint NOT NULL,
	sortLetters char(15) NOT NULL,
	letters char(2)[],
	word char(15) NOT NULL
);

create index by_sortedLetters on words using BTREE (sortLetters);
create index by_letters on words using GIN (letters);
