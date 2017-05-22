<?php
// php /var/www/pictographr/_source/showtemp.php
$count = 0;
while( 1 == 1){
	$count++;
	echo(shell_exec('clear'));
	echo $count;
	echo "\n";
	echo "\n";
	echo(shell_exec('pgrep phan -l'));
	echo(shell_exec('pgrep pngquant -l'));
	echo "\n";
	echo "\n";
	echo(shell_exec('ls -l  /var/www/pictographr/temp'));
	echo "\n";
	echo "\n";
	echo(shell_exec('php /var/www/pictographr/index.php more showswitch'));

	sleep(1);
}
?>