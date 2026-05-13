<?php
require_once 'config.php';
\ = getPDO();
\ = \->query('SELECT COUNT(*) as count FROM users');
\ = \->fetch();
echo "Total users: " . \['count'] . PHP_EOL;

\ = \->query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
while (\ = \->fetch()) {
    echo \['name'] . " (" . \['email'] . ") - Created: " . \['created_at'] . PHP_EOL;
}
