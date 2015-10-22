ALTER TABLE `mdl_course_sections` ADD `timemodified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `setlogo`;
UPDATE `mdl_course_sections` SET `timemodified`=NOW();