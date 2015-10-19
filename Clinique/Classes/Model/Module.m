//
//  Module.m
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import "Module.h"
#import "CLQStrings.h"
#import "CLQDataBaseManager.h"
#import "FMDB.h"
#import "CLQHelper.h"
#import "Course.h"
#import "QuizLocalStorage.h"

@implementation Module

@synthesize  courseId;
@synthesize json;
@synthesize moduleId;
@synthesize offlineJson;
@synthesize timeCreated;
@synthesize timeModified;
@synthesize topicsId;
@synthesize assetDict;

+(id)objectFromModule:(id )object{
    Module    *module = [[Module alloc]init];
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        module.moduleId = @([results intForColumn:kModuleId]);
        module.courseId  =  @([results intForColumn:kCourseId]);
        module.topicsId = @([results intForColumn:kTopicsId]);
        
        module.json = [results dataForColumn:kjson];
        module.offlineJson = [results dataForColumn:kOfflineJson];
        module.timeModified =@([results intForColumn:ktimeModified]);
        module.timeCreated = @([results intForColumn:ktimeCreated]);
        module.moduleOrder =@([results intForColumn:@"moduleOrder"]);
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        NSDictionary *dict = (NSDictionary *)object;
        
        if(dict[kId] != [NSNull null])
            module.moduleId = @([dict[kId] integerValue]);
        
        if( dict[Key_CourseId] != [NSNull null])
            module.courseId = @([dict[Key_CourseId] integerValue]);
        
        if( dict[Key_Topic_Id] != [NSNull null])
            module.topicsId = @([dict[Key_Topic_Id] integerValue]);
        
        NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
        module.json= data;
        module.offlineJson = data;
        module.assetType = @"";
        if(dict[kModName] && dict[kModName] != [NSNull null])
        {
            if([dict[kModName] isEqualToString:@"resource"] || [dict[kModName] isEqualToString:@"game"]){
                if(dict[Key_Contents] != [NSNull null]  && dict[Key_Contents])
                {
                    
                    id conetntObject = dict[Key_Contents];
                    if([conetntObject isKindOfClass:[NSDictionary class]]){
                        NSMutableDictionary *assetDict   = [NSMutableDictionary dictionaryWithDictionary:dict[Key_Contents]];
                        assetDict[kRefrenceId] = module.moduleId;
                        module.assetsArray = [Module getModuleContentAsset:assetDict];
                    }
                    else if([conetntObject isKindOfClass:[NSArray class]]){
                        NSArray *contents = (NSArray *)conetntObject;
                        NSMutableArray *contentArray  = [NSMutableArray array];
                        for (NSDictionary *contentDict in contents) {
                            NSMutableDictionary *assetDict   = [NSMutableDictionary dictionaryWithDictionary:contentDict];
                            assetDict[kRefrenceId] = module.moduleId;
                            [contentArray addObjectsFromArray:[Module getModuleContentAsset:assetDict]];

                        }
                        module.assetsArray = [NSArray arrayWithArray:contentArray];
                    }
                    
                }
            }
                                                                 }
        if(dict[Key_Quiz] != [NSNull null]  && dict[Key_Quiz]){
            id object = dict[Key_Quiz];
            if([object isKindOfClass:[NSDictionary class]]){
         
                NSMutableDictionary *quizDict = [NSMutableDictionary dictionaryWithDictionary:dict[Key_Quiz]];
                quizDict[kId]  = module.moduleId;
                module.assetsArray = [Module getModuleQuizContentAsset:quizDict];
            }
            
        }
        if(dict[kModName] && dict[kModName] != [NSNull null]){
            NSString *modName = dict[kModName];
            if([modName caseInsensitiveCompare:@"scorm"] == NSOrderedSame)
                module.assetsArray = [Module getScormAsset:dict];
        }
        if(dict[Key_Widget] != [NSNull null] && dict[Key_Widget]){
            NSArray *assetArray =  [Module makeAssetDictionary:@{kId : module.moduleId,kAsset :dict[Key_Widget] }];
            if(assetArray.count > 0)
                module.assetsArray =assetArray;
        }
        
        if(dict[ktimeCreated] != [NSNull null])
            module.timeCreated = dict[ktimeCreated];
        
        if(dict[ktimeModified] != [NSNull null])
            module.timeModified  = dict[ktimeModified];
    }
    return module;
}


+(Module *)getModuleForModuleId:(NSNumber *)moduleId{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Modules where moduleId= ?",moduleId];
    
    Module *module = nil;
    while([results next]) {
        module = [Module objectFromModule:results];
    }
    [database close];
    return module;
}

+(void)saveModule:(NSDictionary *)dict{
    @try {
   
        if(dict[kId] != [NSNull null]){
            Module *module = [Module getModuleForModuleId:@([dict[kId] intValue])];
           
            if(module == nil){
                [Module insertModule:dict];
                
            }
            else{
                if([CLQHelper isLastModifiedChanged:module.timeModified  withServerTimeStamp:dict[ktimeModified]])
                    [Module updateModule:dict];
            }
            // New attempts changes
             QuizLocalStorage *quizLocalStorage = [QuizLocalStorage getQuizLocalStoargeForCourseId:dict[Key_CourseId] andModuleId:dict[kId] andUserId:[[CLQDataBaseManager dataBaseManager].currentUser.userId stringValue]];
            if(quizLocalStorage.json != nil){
                
                 NSData *data = [quizLocalStorage.json dataUsingEncoding:NSUTF8StringEncoding];
                
                 NSDictionary *quiZDict = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:nil];
                NSMutableDictionary *quizLocalDict  = [NSMutableDictionary dictionaryWithDictionary:quiZDict];
                NSArray *quizInfoArray = quizLocalDict[Key_Quiz_Info];
                NSMutableArray *quizArray  = [NSMutableArray array];
                for (NSDictionary *quizInfoDictionay in quizInfoArray) {
                    NSMutableDictionary *quizInfoDict = [NSMutableDictionary dictionaryWithDictionary:quizInfoDictionay];
                    if(quizInfoDict[kAttempts] != [NSNull null] && quizInfoDict[kAttempts])
                    {
                        Module *module = [Module getModuleForModuleId:@([dict[kId] intValue])];
                        if(module.json != nil){
                            NSDictionary *moduleDict = [NSJSONSerialization JSONObjectWithData:module.json options:kNilOptions error:nil] ;
                            
                            
                            
                            if(moduleDict[Key_Quiz][Key_Quiz_Info] != [NSNull null] && moduleDict[Key_Quiz][Key_Quiz_Info])
                            {
                                
                                NSArray *moduleInfoArray =moduleDict[Key_Quiz][Key_Quiz_Info];
                                for (NSDictionary *moduleInfoDict in moduleInfoArray) {
                                    NSString *newAttempt = moduleInfoDict[kAttempts];
                                    if([newAttempt isKindOfClass:[NSString class]])
                                    {
                                        NSString *attempts  = quizInfoDict[kAttempts];
                                        if([newAttempt intValue] != [attempts intValue])
                                        {
                                            if(quizInfoDict[kNewAttempts])
                                                [quizInfoDict removeObjectForKey:kNewAttempts];
                                            quizInfoDict[kNewAttempts]  =newAttempt;
                                           
                                        }
                                        
                                    }
    
                                    if(quizInfoDict[Key_FeedBack] != [NSNull null] && quizInfoDict[Key_FeedBack])
                                    {
                                        NSMutableArray *feedBackArray  = [NSMutableArray array];
                                        NSArray *feedbacks = quizInfoDict[Key_FeedBack];
                                        for (NSDictionary *feedBack in feedbacks) {
                                            NSMutableDictionary *feedbackDict  = [NSMutableDictionary dictionaryWithDictionary:feedBack];
                                            if(feedBack[Key_Feedbacktext] != [NSNull null] && feedBack[Key_Feedbacktext])
                                            {
                                                NSArray *assets = [Asset getAssetsForReferenceId:@([dict[kId] intValue]) withIndex:@([feedBack[kId] intValue]) withGroup:kAsset_Feedbacktext];
                                                Asset *asset;
                                                if(assets.count > 0)
                                                    asset = [assets firstObject];
                                                if(asset != nil){
                                                    NSString *feedbackUrl = [NSString stringWithFormat:@"%@",feedBack[Key_Feedbacktext]];
                                                    NSString *string  = [feedbackUrl stringByReplacingOccurrencesOfString:asset.urlKey withString:[CLQHelper getAssetPath:asset]];
                                                    
                                                    [feedbackDict removeObjectForKey:Key_Feedbacktext];
                                                    feedbackDict[Key_Feedbacktext] = string;
                                                }
                                                
                                            }
                                            [feedBackArray addObject:feedbackDict];
                                        }
                                        if(quizInfoDict[Key_FeedBack]){
                                            [quizInfoDict removeObjectForKey:Key_FeedBack];
                                            quizInfoDict[Key_FeedBack]  = feedBackArray;
                                        }
                                    }
                                    
                                    
                                    if(quizLocalDict[Key_Quiz_Info]){
                                        [quizLocalDict removeObjectForKey:Key_Quiz_Info];
                                    }
                                    [quizArray addObject:quizInfoDict];
                                    
                                    quizLocalDict[Key_Quiz_Info] = quizArray;
                                    
                                    NSData *data = [NSJSONSerialization dataWithJSONObject:quizLocalDict options:kNilOptions error:nil];
                                    NSString *json = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
                                    quizLocalStorage.json = json;
                                    [QuizLocalStorage updateJsonForQuiz:quizLocalStorage];
                                }
                     
                            }
                            
                        }
                        //if([attempts intValue] !=
                        
                    }
                }
               
            }
            
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveModule :%@",exception.description);
    }

}

+(void)insertModule:(NSDictionary *)dict{
    Module *module = [Module objectFromModule:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    
    [database executeUpdate:@"INSERT INTO Modules (moduleId, courseId,topicsId, json,offlineJson,timecreated,timemodified) VALUES (?, ?, ?, ?,?,?,?)",module.moduleId,module.courseId,module.topicsId ,module.json,module.offlineJson, module.timeCreated,module.timeModified, nil];
    [database close];
    if(module.assetsArray != nil)
        [Asset saveAsset:@{kAsset : module.assetsArray}];
    if(dict[Key_Modicon] != nil){
         //[Asset saveAsset:@{kRefrenceId : module.moduleId, kAsset : module.assetDict, kUrlKey :dict[Key_Modicon], kAssetGroup : Key_Modicon,kAssetIndex : @(0)}];
    }
}

/*+(id)getAssetDictionaryForModIcon:(NSDictionary *)dict{
    NSMutableDictionary *assetDict = [NSMutableDictionary dictionary];
    NSDictionary *imageUrlsDict  = [NSDictionary dictionaryWithDictionary:dict[Key_Images]];
    
   // for (NSString *key  in imageUrlsDict.allKeys) {
    if(dict[Key_Modicon] != nil){
        NSString *imageurl = imageUrlsDict[Key_Modicon];
        
       // if(dict[Key_Contents]){
            NSDictionary *contentDict = dict[Key_Contents];
            
            if(contentDict[kId] != nil){
                assetDict[kRefrenceId] = contentDict[kId];
                
            }// make asset details dict
            if(imageurl != nil){
                NSString *filename =[imageurl lastPathComponent].length > 0 ? [imageurl lastPathComponent] : @"";
                NSString *fileType = [[imageurl lastPathComponent]pathExtension].length > 0 ? [[imageurl lastPathComponent]pathExtension] : @"";
                assetDict[kAsset] = @{Key_FileName : filename , Key_Type  : fileType, Key_FileUrl : imageurl};
            }
            assetDict[kUrlKey] = imageurl.length > 0 ?imageurl : @"";
            assetDict[kAssetGroup] = Key_Modicon;
            assetDict[kAssetIndex] =  @(0);
        //}
    }
  
   // }
   // NSLog(@"assetDict :%@",assetDict);
    return [NSDictionary dictionaryWithDictionary:assetDict];
}*/

+(void)updateModule:(NSDictionary *)dict{
    Module *module = [Module objectFromModule:dict];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Modules set courseId= ?,topicsId = ?, json= ?,offlineJson= ?,timecreated= ?,timemodified= ? where moduleId= ?",module.courseId,module.topicsId,module.json,module.offlineJson,module.timeCreated ,module.timeModified,module.moduleId, nil];
    [database close];
    if(module.assetsArray != nil)
      [Asset saveAsset:@{ kAsset : module.assetsArray}];
}

+(void)updateModuleOrder:(Module *)module{
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Modules set moduleOrder= ? where moduleId= ?",module.moduleOrder,module.moduleId, nil];
    [database close];
    if(module.assetsArray != nil)
        [Asset saveAsset:@{ kAsset : module.assetsArray}];
}

+(id)getModuleForTopicsId:(NSNumber *)topicsId andCourseId:(NSNumber*)courseId{
    NSMutableArray *modules  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Modules where topicsId= ? and courseId = ?",topicsId, courseId];
    
    Module *module = nil;
    while([results next]) {
        module = [Module objectFromModule:results];
        [modules addObject:module];
    }
    [database close];
    return modules;
}

+(id)getModulesForCourseId:(NSNumber *)courseId andModuleId:(NSNumber *)moduleId{
    NSMutableArray *modules  = [NSMutableArray array];
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Modules where courseId= ? and moduleId = ?",courseId, moduleId];
    
    Module *module = nil;
    while([results next]) {
        module = [Module objectFromModule:results];
        [modules addObject:module];
    }
    [database close];
    
    NSArray *sortedArray;
    sortedArray = [modules sortedArrayUsingComparator:^NSComparisonResult(id a, id b) {
        NSNumber *first = [(Module*)a moduleOrder];
        NSNumber *second = [(Module*)b moduleOrder];
        return [first compare:second];
    }];
    return [NSArray arrayWithArray:sortedArray];

}
#pragma mark - Get module images

+(NSArray *)makeAssetDictionary:(NSDictionary *)dict{
    NSMutableArray *assetsArray = [NSMutableArray array];
    
    NSDictionary *asset = dict[kAsset];
    if(asset[Key_QuestionText] != [NSNull null] && asset[Key_QuestionText]){
        
        id object  = asset[Key_QuestionText];
        
        if([object isKindOfClass:[NSArray class]]){
            
            NSArray *questionArray = (NSArray *)object;
            int i= 0;
            for (NSString *imageurl in questionArray) {
                NSMutableDictionary *assetDict = [NSMutableDictionary dictionary];
                if([imageurl isKindOfClass:[NSString class]]){
                    if(imageurl.length > 0  ){
                        NSString *fileName  = [imageurl lastPathComponent].length > 0 ?[imageurl lastPathComponent] : @"";
                        NSString *fileType  = [[imageurl lastPathComponent]pathExtension].length > 0 ? [[imageurl lastPathComponent]pathExtension] : @"";
                        assetDict[Key_FileName] =  fileName;
                        assetDict[Key_Type] =  fileType;
                        assetDict[Key_FileUrl] =  imageurl;
                        
                        assetDict[kUrlKey] = imageurl.length > 0 ?imageurl : @"";
                        assetDict[kAssetGroup] = kAsset_Module_Widget1;
                        assetDict[kAssetIndex] =  @(i);
                        
                        assetDict[Key_Type]  = kAsset_Module_Quiz;
                        assetDict[kRefrenceId] =dict[kId];
                        [assetsArray addObject:assetDict];
                        i++;
                        
                    }
                }
            }
            
        }
        else if([object isKindOfClass:[NSDictionary class]]){
            
            NSDictionary *questionDict = (NSDictionary *)object;
            
            for (NSString *key in questionDict.allKeys) {
                
                NSMutableDictionary *assetDict = [NSMutableDictionary dictionary];
                
                NSString *imageUrl = @"";
                if([key isEqualToString:@"hiddenimage"]){// getting hidden image
                    imageUrl = questionDict[key];
                    assetDict[kAssetGroup]  = kAsset_Module_HiddenImage;
                    assetDict[kAssetIndex] =  @(0);
                }
                else{  // get question text dict
                    imageUrl = questionDict[key];
                    assetDict[kAssetGroup] = kAsset_Module_Widget1;
                    assetDict[kAssetIndex] =  @([key intValue]);
                }
                
                
                if([imageUrl isKindOfClass:[NSString class]]){
                    if(imageUrl.length > 0  ){
                        NSString *fileName  = [imageUrl lastPathComponent].length > 0 ?[imageUrl lastPathComponent] : @"";
                        NSString *fileType  = [[imageUrl lastPathComponent]pathExtension].length > 0 ? [[imageUrl lastPathComponent]pathExtension] : @"";
                        
                        assetDict[Key_FileName] =  fileName;
                        assetDict[Key_Type] =  fileType;
                        assetDict[Key_FileUrl] =  imageUrl;
                        
                        assetDict[kUrlKey] = imageUrl.length > 0 ?imageUrl : @"";
                        
                        
                        assetDict[Key_Type]  = kAsset_Module_Widget1;
                        assetDict[kRefrenceId] =dict[kId];
                        [assetsArray addObject:assetDict];
                        
                    }
                }
            }
        }
        
    }
    if(asset[Key_Answertext] != [NSNull null] && asset[Key_Answertext]){
        id object = asset[Key_Answertext];
        if([object isKindOfClass:[NSArray class]]){
            NSArray *array = (NSArray *)object;
            int i =0;
            for (NSString *imageUrl in array) {
                if([imageUrl isKindOfClass:[NSString class]]){
                    if([imageUrl hasPrefix:@"http"]){
                        
                        if(imageUrl.length > 0  ){
                            
                            NSString *fileName  = [imageUrl lastPathComponent].length > 0 ?[imageUrl lastPathComponent] : @"";
                            NSString *fileType  = [[imageUrl lastPathComponent]pathExtension].length > 0 ? [[imageUrl lastPathComponent]pathExtension] : @"";
                            
                            NSDictionary *assetDict = @{kRefrenceId :dict[kId], Key_FileName : fileName,Key_Type : fileType,Key_FileUrl :imageUrl,kUrlKey :  imageUrl,Key_Type : kAsset_Module_Widget3, kAssetGroup :kAsset_Module_Widget3,kAssetIndex : @(i)};
                            [assetsArray addObject:assetDict];
                            i++;
                        }
                    }
                }
            }
        }
    }
    /* if(asset[Key_questionname] != [NSNull null] && asset[Key_questionname]){ // If quetion name key is in string
     if([asset[Key_questionname] isKindOfClass:[NSString class]]){
     NSString *questionname  =asset[Key_questionname];
     
     [assetsArray addObjectsFromArray:[Course getAssetDict:@{Key_Images : [Course getImageUrls:questionname],kRefrenceId : dict[kId],kAssetGroup : kAsset_Module_Widget2,Key_Type : kAsset_Module_Widget2}]];
     }
     
     else if ([asset[Key_questionname] isKindOfClass:[NSArray class]]){ // If quetion name key is in Array format
     NSArray *questArray = asset[Key_questionname];
     
     for (NSString *string in questArray) {
     NSDictionary *dict =  [Course getAssetDict:[Course getImageUrls:string]];
     [assetsArray addObjectsFromArray:[Module getAssetArrayFromImageUrls:@{kRefrenceId : dict[kId],kAsset : dict, kAssetGroup :kAsset_Module_Widget2,Key_Type :kAsset_Module_Widget2}]];
     }
     
     }
     else if ([asset[Key_questionname] isKindOfClass:[NSDictionary class]]){ // If quetion name key is in Dictionary format
     NSDictionary *questDict = asset[Key_questionname];
     for (NSString *key in questDict.allKeys) {
     NSString *imageurl = questDict[key];
     NSDictionary *dict = [Course getAssetDict:[Course getImageUrls:imageurl]];
     
     [assetsArray addObjectsFromArray:[Module getAssetArrayFromImageUrls:@{kRefrenceId : dict[kId],kAsset : dict, kAssetGroup :kAsset_Module_Widget2,Key_Type :kAsset_Module_Widget2}]];
     
     
     }
     
     }
     }*/
    return assetsArray;
}

+(NSArray *)getAssetArrayFromImageUrls:(NSDictionary *)dict{
    NSMutableDictionary *assetDict = [NSMutableDictionary dictionary];
    NSMutableArray *assetsArray  = [NSMutableArray array];
    int i = 0;
    for (NSString *key in dict.allKeys) {
        NSString *imageurl = dict[key];
        
        if(dict[kId] != nil){
            assetDict[kRefrenceId] = dict[kId];
            if(imageurl != nil){
                NSString *filename =[imageurl lastPathComponent].length > 0 ? [imageurl lastPathComponent] : @"";
                NSString *fileType = [[imageurl lastPathComponent]pathExtension].length > 0 ? [[imageurl lastPathComponent]pathExtension] : @"";
                NSDictionary *assetDict = @{kRefrenceId :dict[kId],
                                       Key_FileName  :filename,
                                       Key_Type : fileType,
                                       Key_FileUrl : imageurl,
                                       kUrlKey : imageurl.length > 0 ?imageurl : @"",
                                       kAssetIndex : @(i),
                                       kAssetGroup :dict[kAssetGroup],
                                       Key_Type : dict[Key_Type]};
                
                [assetsArray addObject:assetDict];
                i++;
            }
        }
        
    }
    return [NSArray arrayWithArray:assetsArray];
}

+(NSArray *)getModuleContentAsset:(NSDictionary *)dict{
    if(dict[Key_FileUrl]){
    NSMutableDictionary *assetDict = [NSMutableDictionary dictionary];
    NSString *fileName  =  dict[Key_FileName] != [NSNull null] ?  dict[Key_FileName] : @"";
    NSString *fileUrl = dict[Key_FileUrl] != [NSNull null] ? dict[Key_FileUrl] : @"";
    NSString *fileType  = dict[Key_Type] != [NSNull null] ?  dict[Key_Type] : @"";
    
    assetDict[Key_FileName] =  fileName.length > 0?  fileName : @"";
    assetDict[Key_Type] =   fileType.length > 0 ? fileType : @"";
    assetDict[Key_FileUrl] =  fileUrl;
    
    assetDict[kUrlKey] = fileUrl.length > 0 ?fileUrl : @"";
    assetDict[kAssetGroup] = kAsset_Module_Content;
    assetDict[kAssetIndex] =  @(0);
    
    assetDict[kRefrenceId] = dict[kRefrenceId];
    
    return @[assetDict];
    }
    return nil;
}

+(NSArray *)getModuleQuizContentAsset:(NSDictionary *)dict{
    NSMutableArray *assetsArray = [NSMutableArray array];
    id object  = dict[Key_QuizList];
    if([object isKindOfClass:[NSArray class]])
    {
        NSArray *quizList = (NSArray *)object;
        for (id quizListObject in quizList)
        {
            if([quizListObject isKindOfClass:[NSDictionary class]])
            {
                NSDictionary *quizListDict  = (NSDictionary *)quizListObject;
                for (NSString *key in quizListDict.allKeys)
                {
                    if([key isEqualToString:Key_Questions])
                    {
                        id questionObject  = quizListDict[key];
                        if([questionObject isKindOfClass:[NSArray class]])
                        {
                            NSArray *questionArray = (NSArray *)questionObject;
                            for (id questObject in questionArray)
                            {
                                if([questObject isKindOfClass:[NSDictionary class]])
                                {
                                    NSDictionary *questDict  = (NSDictionary *)questObject;
                                    if(questDict [Key_Question] != [NSNull null] && questDict [Key_Question]){
                                        NSString *question =questDict[Key_Question];
                                        if([question isKindOfClass:[NSString class]])
                                        {
                                            [assetsArray addObjectsFromArray:[Course getAssetDict:@{Key_Images : [Course getImageUrls:question], kRefrenceId : dict[kId],kAssetGroup : kAsset_Quiz_Question,Key_Type : kAsset_Quiz_Question,kAssetIndex :questDict[kId] } ]];
            
                                        }
                                    }
                                    if(questDict [Key_Choices] != [NSNull null] && questDict [Key_Choices]){
                                        NSArray *choices = questDict [Key_Choices];
                                        for (NSDictionary *choiceDict in choices) {
                                            if(choiceDict[Key_Label] != [NSNull null] && choiceDict[Key_Label]){
                                                [assetsArray addObjectsFromArray:[Course getAssetDict:@{Key_Images : [Course getImageUrls:choiceDict[Key_Label]], kRefrenceId : dict[kId],kAssetGroup : kAsset_Quiz_Choice_Label,Key_Type : kAsset_Quiz_Choice_Label, kAssetIndex : choiceDict[kId]} ]];
                                            }
                                            if(choiceDict[Key_SubQuestion] != [NSNull null] && choiceDict[Key_SubQuestion]){
                                                [assetsArray addObjectsFromArray:[Course getAssetDict:@{Key_Images : [Course getImageUrls:choiceDict[Key_SubQuestion]], kRefrenceId : dict[kId],kAssetGroup : kAsset_Quiz_Choice_SubQuestion,Key_Type : kAsset_Quiz_Choice_SubQuestion, kAssetIndex : choiceDict[kId]} ]];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    NSArray *quizInfo =  dict[Key_Quiz_Info];
    for (NSDictionary *quizInfoDict in quizInfo) {
        NSArray *feedbacks =quizInfoDict[Key_FeedBack];
        for (NSDictionary *feedBackDict in feedbacks)
        {
            NSString *feedbackurl  = feedBackDict[Key_Feedbacktext];
            if(feedbackurl.length > 0){
                [assetsArray addObjectsFromArray:[Course getAssetDict:@{Key_Images : [Course getImageUrls:feedbackurl], kRefrenceId : dict[kId],kAssetGroup : kAsset_Feedbacktext,Key_Type : kAsset_Feedbacktext,kAssetIndex :feedBackDict[kId] } ]];
            }
        }
    }
    return [NSArray arrayWithArray:assetsArray];
}

+(NSArray *)getScormAsset:(NSDictionary *)dict{
    NSArray *scorm = [NSArray array];
    if(dict[kId] != nil){
        NSString *filedownloadUrl  =[NSString stringWithFormat:@"%@?action=%@&courseid=%@&cmid=%@",kServiceUrl,kScormDownload, dict[Key_CourseId], dict[kId]];
        NSDictionary *assetDict  = @{kRefrenceId : dict[kId],
                                     Key_FileName :dict[kId],
                                     Key_Type :@"zip",
                                     Key_FileUrl  : filedownloadUrl,
                                     kUrlKey :filedownloadUrl,
                                     kAssetGroup : kAsset_Scorm,
                                     kAssetIndex : @(0),
                                     Key_Type :kAsset_Scorm};
        scorm =  @[assetDict];
        
    }
    return scorm;
}
@end
