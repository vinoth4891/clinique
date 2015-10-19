//
//  Notes.h
//  Clinique
//
//  Created by Brindha_shiva on 3/13/15.
//
//

#import <Foundation/Foundation.h>

@interface Notes : NSObject

@property (strong,nonatomic)NSNumber *notesId;
@property (strong,nonatomic)NSNumber *moduleId;
@property (strong,nonatomic)NSNumber *userId;
@property (strong,nonatomic)NSString *comments;
@property (strong,nonatomic)NSNumber *status;
@property (strong,nonatomic)NSData *json;
@property (strong,nonatomic)NSString *timeCreated;
@property (strong,nonatomic)NSString *timeModified;

+(id)objectFromNotes:(id)object;
+(id)getNotesForModuleId:(NSNumber *)moduleId andUserId:(NSNumber *)userId;
+(NSArray *)getAllUpdatedNotesWithUserId:(NSNumber *)userId;
+(id )getAllNotesForUser:(NSNumber *)userId;
+(void)saveNotes:(NSDictionary *)dict;
+(void)updateNotesForParams:(NSDictionary *)params;
@end
