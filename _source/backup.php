<?php
shell_exec('rm -f -r /var/www/pictographr/backup/templates.zip'); 
shell_exec('zip /var/www/pictographr/backup/templates.zip /var/www/pictographr/templates/*.*'); 
shell_exec('rm -f -r /var/www/pictographr/backup/pictographr_db.sql'); 
shell_exec('mysqldump -uroot -pPr0spac3 pictographr_db > /var/www/pictographr/backup/pictographr_db.sql'); 
shell_exec('php /var/www/pictographr/index.php admin saveDBToDrive');
shell_exec('php /var/www/pictographr/index.php admin deleteOldBackups');
?>