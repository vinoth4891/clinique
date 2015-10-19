//
//  CLQStrings.h
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#ifndef Clinique_CLQStrings_h
#define Clinique_CLQStrings_h


#endif
// Dev
//Service urls http://172.16.17.42/cliniquedev Cloud http://54.225.106.255/clinique

#define HosetName @"http://172.16.17.42/clinique"
#define kIsForBlueOcean 0  //set  1  for enable blue ocean, 0 for disable blue ocean


#define kServiceUrl             HosetName@"/admin/v2/clinique_webservice/services.php"
#define kSyncServiceUrl         HosetName@"/admin/v2/clinique_webservice/sync_service.php"
#define kContentDownloadUrl     HosetName@"/admin/webservice/pluginfile.php?"
#define kTermsAndConditionUrl   HosetName@"/language/%@/Clinique_Education_Terms_And_Conditions_WEBSITE_%@.docx"
#define kPrivacyPolicyUrl       HosetName@"/language/%@/Clinique_Education_Privacy_Policy_WEBSITE_%@.docx"



//Elearning app set up
#define kBlueoceanUrlScheme @"blueocean://"
#define kBlueOceanTimeOut 3*60
#define kBlueOceanCloseTimeOut 30
#define kBlueoceanAlert @"%d"
#define kBlueOceanCancel @"Press to cancel"
//#define kIsForBlueOcean  @"IsForBlueOcean"

#define  kUnlockPassCode @"clinique"


#define kAsset_Module_Content @"CONTENT"
#define kAsset_Module_Widget1 @"WIDGET-QuestionText"
#define kAsset_Module_Widget3 @"WIDGET-AnswerText"
#define kAsset_Module_Widget2 @"WIDGET-QuestionName"
#define kAsset_Module_HiddenImage @"HiddenImage"
#define kAsset_Module_Quiz @"QUIZ"
#define kAsset_Course @"COURSE"
#define kAsset_Topics @"TOPICS"
#define kAsset_Quiz_Question @"Quiz_Question"
#define kAsset_Quiz_Choice_Label @"Quiz_Choice_Label"
#define kAsset_Quiz_Choice_SubQuestion @"Quiz_Choice_SubQuestion"
#define kAsset_Scorm @"Scorm"
#define kAsset_TermsAndConditions @"TermsAndConditions"
#define kAsset_PrivacyPolicy @"PrivacyPolicy"
#define kAsset_Feedbacktext @"Feedbacktext"

//Errror message
#define kERR10001 @"Opps...Check your network connection."
#define kERR10003 @"We do not recognize your sign in information. Please try again. Please note the password field is case sensitive."
#define  kERR10004 @"Unable to process request, Please try again after some time"

#define kERR10006 @"You are the First Time user and the device is in Offline mode. Please connect your device to a network and re-enter your credentials with proper Internet connection"
#define kERR10007 @"An error occurred during download. Please try again in a few minutes."
#define kERR10009 @""
#define kErr10010 @"Password not changed successfully"


/*ERR10001="Oops...Check your network connection...";
 public static String ERR10002="We do not recognize your sign in information. Please try again. Please note the password field is case sensitive.";
 public static String ERR10003="We do not recognize your sign in information. Please try again. Please note the password field is case sensitive.";
 public static String ERR10004="You are the First Time user and the device is in Offline mode. Please connect your device to a network and re-enter your credentials with proper Internet connection";
 public static String ERR10005="We do not recognize your sign in information. Please try again. Please note the password field is case sensitive.";
 public static String ERR10006="You are the First Time user and the device is in Offline mode. Please connect your device to a network and re-enter your credentials with proper Internet connection";
 public static String ERR10007="An error occurred during download. Please try again in a few minutes.";*/


#define kLanguages  @[@"en", @"en_us",@"ar", @"zh_ct",@"cs", @"da",@"nl", @"fi",@"fr_ca", @"fr",@"de", @"el",@"he", @"hu",@"id", @"it",@"ja", @"ko",@"zh_cn", @"zh_tw",@"no", @"pl",@"pt_br", @"pt_br",@"ru", @"es_mx",@"es", @"sv",@"th",@"tr",@"vi"]

#define kUser_Mapping_Group_Course @"COURSE"
#define kUser_Mapping_Group_Asset @"ASSET"
#define kUser_Mapping_Group_Module @"MODULE"

#define kAction @"action"
#define kLoginActionName @"moodle_mobile_app"
#define kGetAllUserData @"complete_user_data"
#define kScormDownload @"scormpackage"

//Entity names

#define kEntityUser @"Users"
#define kEntityAsset @"Assets"
#define kEntityUserMapping @"UserMappings"
#define kEntityTopics @"Topics"
#define kEntityFavorite @"Favorites"
#define kEntityCategory @"Categories"
#define kEntityCourse  @"Courses"
#define kEntityModule @"Modules"
#define kEntityNotes @"Notes"
#define kEntityBookmarks @"Bookmarks"
#define KEntityRegion @"Region"
#define KEntityCountry @"Countries"
#define kEntityRetailers @"Retailers"
#define kEntityStore @"Stores"
#define kEntityProgress @"Progress"
#define kEntityQuizCourse @"QuizCourse"
#define kEntityBadges @"Badges"
#define kEntityUserBadges @"UserBadges"
#define kEntityPlayers @"Players"
#define kEntityNews @"News"
#define kEntityResources @"Resources"
#define kEntityClinique_Quiz @"clinique_quizLocalStorage"
#define kEntityScorm @"Scorm"
#define kEntityDependentActivity @"DependentActivities"
#define kEntityActivityCompletion @"CompletedActivities"

//Common keys
#define kId @"id"
#define kjson @"json"
#define ktimeCreated @"timecreated"
#define ktimeModified @"timemodified"
#define kAttemptsJson @"attemptsJson"


//User object
#define kUser     @"user"
#define kUserName @"username"
#define kFirstName @"firstName"
#define kLastName @"lastName"
#define kEmail @"email"
#define kRegion @"region"
#define kPassword @"password"
#define kFirstTime @"firstTime"
#define kuserId @"userId"
#define kjobTitle @"jobTitle"
#define kToken @"token"
#define kOfflineJson @"offlineJson"
#define kSession @"sesskey"


//user mapping
#define kUserMappingType @"mappingType"
#define kRefrenceId @"refrenceId"


//Assets object
#define kAsset @"asset"
#define kAssetGroup @"asset_group"
#define kUrlKey @"urlKey"
#define kOnlineUrl @"onlineUrl"
#define kOfflineUrl @"Offlineurl"
#define kfileType @"fileType"
#define kFileExtn @"fileExtn"
#define kAssetSize @"size"
#define kAssetIndex @"assetIndex"
#define kName @"name"
#define kUpdateRequired @"updateRequired"

//Course object
#define kCourse @"courses"
#define kCourseId @"courseId"
#define kActivateTime @"activateTime"
#define kStatus @"status"
#define kCategoryId @"categoryId"


// Topics object
#define kTopicsId @"topicsId"

// Module Object
#define kModuleId @"moduleId"
#define kModName @"modname"
#define kScormType @"scorm"
#define kManiFestPath @"manifest_path"

// Favourote Object
#define kStatus @"status"
#define kFavoriteId @"favoriteId"


// Notes Object
#define kComments @"comments"
#define kNotesId @"notesId"


//Bookmarks
#define kBookmarkId @"bookmarksId"
#define kPageNo @"pageNumbers"
#define kAddedBookmarks @"addedBookmarks"
#define kDeletedBookmarks @"deletedBookmarks"

//Region
#define kRegion @"region"

//Country
#define kcode @"code"
#define kCountry @"country"

//Retailer
#define kRetailer @"retailer"

//Store
#define kStore @"store"

//Progress
#define kProgressId @"progressId"
#define kCourseIndex @"courseIndex"
#define kCourseScore @"courseScore"

//Quiz Course
#define kQuizCourseRefId @"courseRefId"
#define kQuizName @"quizName"
#define kQuizIndex @"quizIndex"
#define kQuizScore @"score"

//Badges table
#define kBadgeId @"badgeId"
#define kBadgeName @"badgeName"
#define kBadgeValue @"badgeValue"

//User Badges Table
#define kUserBadgeId @"userBadgeId"


//Dependent activity table
#define kCompleted @"completed"
#define kDependsOn @"dependsOn"

#define Key_Depends_On @"depends_on"

#define kCompletedMoudleId @"completedMoudleId"
// News
#define kNewsId @"newsId"

//Resources
#define kResourceId @"resourceId"

// Json keys
#define Key_Profile @"profile"
#define Key_Firstname @"firstname"
#define Key_Lastname @"lastname"
#define Key_JobTitle @"jobtitle"

#define Key_Course_Categories @"course_categories"
#define Key_Topic_Id @"topicid"
#define Key_CourseId @"courseid"
#define Key_Category_Id @"categoryid"
#define Key_Module_Id @"moduleid"
#define Key_User_Id @"userid"
#define key_uid @"uid"
#define key_cid @"cid"
#define KEY_FIRST_TIME_USER @"FIRST_TIME_USER"

#define Key_Modules @"modules"
#define Key_Courses @"courses"
#define Key_Topics @"topics"
#define Key_Favorites @"favorites"
#define Key_Response @"response"
#define Key_Favorite @"favorite"

#define Key_Module_Dependencies @"module_dependencies"
#define Key_CompletedModules @"completed_modules"

#define Key_ActiveCourses @"activeCourses"

#define Key_Modicon @"modicon"

#define Key_Url @"url"
#define Key_Error @"error"
#define Key_Message @"msg"
#define Key_Success @"success"
#define Key_Contents @"contents"
#define Key_Quiz @"quiz"
#define Key_ShowAvailability @"showavailability"
#define Key_DependentFlag @"dependentflag"

#define Key_FileName @"filename"
#define Key_FileSize @"filesize"
#define Key_FileUrl @"fileurl"
#define Key_Type @"type"
#define Key_Data @"data"
#define Key_TotalCount @"totalcount"
#define Key_Deleted @"deleted"
#define Key_Added @"added"

#define Key_Images @"images"
#define Key_Summary @"summary"

#define key_Note @"note"
#define key_Notes @"notes"
#define key_Comment @"comment"


#define key_Bookmarks @"bookmarks"
#define key_Bookmark @"bookmark"
#define key_Pages @"pages"
#define key_CourseModuleid @"coursemoduleid"

#define KEY_CURRENT_FILE_NO  @"CURRENT_FILE_NO"
#define KEY_CURRENT_FILE_NAME @"CURRENT_FILE_NAME"
#define KEY_CURRENT_FILE_TOTAL_CONTENT @"CURRENT_FILE_TOTAL_CONTENT"
#define KEY_CURRENT_FILE_DOMNLOADED @"CURRENT_FILE_DOMNLOADED"
#define KEY_TOTAL_FILE_COUNT @"TOTAL_FILES"
#define KEY_PERCENTAGE @"TOTAL_FILE_COUNT"

#define Key_Error_Code @"errorCode"
#define key_Error_Message @"message"

#define Key_Progress @"progress"
#define Key_CourseName @"course_name"
#define Key_Course_Id @"course_id"
#define Key_CourseScore @"course_score"
#define Key_Course @"course"
#define Key_ModId  @"modid"
#define Key_Quiz @"quiz"
#define Key_Widget @"widget"
#define Key_Score @"score"
#define Key_Quiz_Info @"quizinfo"
#define Key_AttemptedCount @"attemptedcount"
#define Key_Anyfinished @"anyfinished"
#define Key_FeedBack @"feedback"
#define  Key_Feedbacktext  @"feedbacktext"

#define Key_QuestionText @"questiontext"
#define Key_Question_Answer_Text @"question_answertext"
#define Key_questionname @"questionname"
#define Key_Answertext  @"answertext"

#define Key_Badges @"badges"
#define Key_BadgeName @"badge_name"
#define Key_BadgeValue @"badge_value"

#define Key_Userbadges @"userbadges"
#define Key_UserBadgeId @"user_badge_id"

#define Key_Players @"players"
#define Key_Totalscore @"totalscore"

#define Key_News @"news"
#define Key_Resources @"resources"

#define Key_Resource_comment_count @"resource_comment_count"

#define Key_Quiz_Sync @"quizsync"

#define Key_QuizList @"quizlist"
#define Key_Questions @"questions"
#define Key_Question @"question"
#define Key_Choices @"choices"
#define Key_Label @"label"
#define Key_SubQuestion @"subquestion"
#define Key_AlreadyAttempted @"alreadyattempted"
#define Key_Row_Id @"rowid"

#define kAlertNewContentAvailable @"New content available.Do you want to download content?"
#define kYes @"Yes"
#define kNo @"No"
#define kOk @"Ok"
#define  kAlertAvailableSapce @"Sapce is not enough to download all content."


#define kCSV_FileName @"FileName"
#define kCSV_Courses @"Courses"
#define kCSv_Comments @"Comments"

#define kAttempts @"attempts"
#define kNewAttempts @"newattempts"
#define kAttempt @"attempt"
#define kPreview @"preview"
#define KState @"state"
#define kSumgrades @"sumgrades"
#define kStartedOn @"startedOn"
#define ktimeTaken @"timeTaken"
#define kCompletedOn @"completedOn"
#define kSlots @"slots"
#define Key_Scorm @"scorm"

