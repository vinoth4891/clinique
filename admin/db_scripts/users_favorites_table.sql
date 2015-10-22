CREATE TABLE `mdl_users_favorites` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userid` int(10) unsigned NOT NULL,
  `coursemoduleid` int(10) unsigned NOT NULL,
  `course_type` varchar(50) DEFAULT NULL,
  `file_name` varchar(200) DEFAULT NULL,
  `file_type` varchar(10) DEFAULT NULL,
  `fname_upload` varchar(512) DEFAULT NULL,
  `url` varchar(512) NOT NULL,
  `timecreated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8