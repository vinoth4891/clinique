//
//  OfflineSyncPlugin.m
//  Clinique
//
//  Created by Brindha_shiva on 3/11/15.
//
//

#import "OfflineSyncPlugin.h"
#import "Reachability.h"
#import "ReachabilityManager.h"
#import "CLQDataBaseManager.h"
#import "User.h"
#import "CLQServiceManager.h"
#import "AppDelegate.h"
#import "QuizLocalStorage.h"
#import "ScormLocalStorage.h"

@implementation OfflineSyncPlugin
- (void)FirstLaunchSync:(CDVInvokedUrlCommand*)command{
    @try {
        self.jsCommand = command;
        NSLog(@"params :%@",command.arguments);
        //if([ReachabilityManager defaultManager].isNetworkAvailable){
        if(command.arguments.count > 0){
            NSArray *params = command.arguments;
            if(params.count > 1){
                
                [CLQServiceManager firstLaunchSyncWithuserId:@([params[0]intValue])  andToken:params[1] withCompletion:^(BOOL completed){
                    if(!completed){
                        
                        self.jsonOutput  = nil;
                        NSDictionary *dict =  [NSDictionary dictionary];
                        if([CLQDataBaseManager dataBaseManager].isSyncInprogress){
                            NSLog(@"Firstlaunch sync Failiure called");
                           if([ReachabilityManager defaultManager].isNetworkAvailable)
                              dict =  @{Key_Error_Code : @"ERR10001",key_Error_Message : kERR10001};
                            else
                              dict =  @{Key_Error_Code : @"ERR10007",key_Error_Message : kERR10007};
                            [CLQDataBaseManager dataBaseManager].isSyncInprogress = NO;
                            [CLQDataBaseManager dataBaseManager].isIdle = YES;
                            AppDelegate *appdelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
                            NSData *data = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
                            NSString *response = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
                            [appdelegate.viewController syncExceptionPluginCalled:response];
                        }
                    }
                    else{
                        //[CLQDataBaseManager defaultManager].isSyncInprogress = NO;
                        self.jsonOutput   = [NSData data];
                        [self sendPluginsendPlugin:command];
                    } 
                }];
            }
        }
        /*}
         else{
         [self sendPluginsendPluginForError:@{Key_Error_Code : @"ERR10004",key_Error_Message : kERR10004} withCommand:command];
         }*/
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : FirstLaunchSync : %@",exception.description);
        [self sendPluginsendPluginForError:@{Key_Error_Code : @"ERR10004",key_Error_Message : kERR10004} withCommand:command];
    }
}

- (void)DeltaSync:(CDVInvokedUrlCommand*)command{
    @try {
        if([ReachabilityManager defaultManager].isNetworkAvailable){
     
            NSString *lastSyncedDate  = [[NSUserDefaults standardUserDefaults] objectForKey:@"lastSyncedDate"];
            if(lastSyncedDate.length > 0){
            
            [CLQServiceManager deltaSyncWithParams:@{kuserId : [CLQDataBaseManager dataBaseManager].currentUser.userId, kToken:[CLQDataBaseManager dataBaseManager].currentUser.token,@"from" :lastSyncedDate} withCompletion:^(BOOL completed, BOOL isnewContent, id object)
             {
                 if(!completed){
                    NSDictionary * dict  = @{Key_Error : @(0), Key_Message : @"done", Key_Response : @{@"NEW_CONTENT" : @"N"}};
                      self.jsonOutput   = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
                     //[self sendPluginsendPluginForError:@{kStatus : @"Falied"} withCommand:command];
                     [self sendPluginsendPlugin:command];
                 }
                 if(completed){
                     NSDictionary *dict;
                     self.responseDict = object;
                     if(isnewContent){
                         dict  = @{Key_Error : @(0), Key_Message : @"done", Key_Response : @{@"NEW_CONTENT" : @"Y"}};
                     }
                     else{
                            dict  = @{Key_Error : @(0), Key_Message : @"done", Key_Response : @{@"NEW_CONTENT" : @"N"}};
                     }
                     
                     self.jsonOutput   = [NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil];
                     [self sendPluginsendPlugin:command];
                 }
             }];
            }
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : DeltaSync %@",exception.description);
        [self sendPluginsendPluginForError:@{Key_Error : @(0), Key_Message : @"done", Key_Response : @{@"NEW_CONTENT" : @"N"}} withCommand:command];
    }
}

-(void)QuizSync:(CDVInvokedUrlCommand *)command{
    NSLog(@"QuizSync : %@",command.arguments);
    if([ReachabilityManager defaultManager].isNetworkAvailable){
        [self performSelector:@selector(callSyncbackWithDelay) withObject:nil afterDelay:5];
       /* NSArray *quizes = [QuizLocalStorage getQuizLocalStoargeForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
        for (QuizLocalStorage *localStorage in quizes) {
            [CLQServiceManager updateRecordsToServerWithParams:@{kEntityClinique_Quiz : @{Key_Quiz :localStorage }} withCompletion:^(id object, BOOL completion){}];
        }*/
    }
}
-(void)callSyncbackWithDelay{
    [CLQServiceManager syncBackToServer:^(BOOL completion){}];
}

-(void)ScormSync:(CDVInvokedUrlCommand *)command{
    @try {
        if([ReachabilityManager defaultManager].isNetworkAvailable){
            [CLQServiceManager syncBackToServer:^(BOOL completion){}];
           /* NSArray *scorms = [ScormLocalStorage getScormLocalStorageForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
            for (ScormLocalStorage *localStorage in scorms) {
                [CLQServiceManager updateRecordsToServerWithParams:@{kEntityScorm : @{Key_Scorm :localStorage }} withCompletion:^(id object, BOOL completion){}];
            }*/
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception : ScormSync %@",exception.description);
    }
}

-(void)ManualSync:(CDVInvokedUrlCommand *)command{
    [CLQServiceManager syncBackToServer:^(BOOL completed)
    {
        [CLQServiceManager saveSyncDataInDatabase:self.responseDict withParams:@{kToken :[CLQDataBaseManager dataBaseManager].currentUser.token, kuserId : [CLQDataBaseManager dataBaseManager].currentUser.userId} forServiceType:ServiceTypeDelta withCompletion:^(BOOL completed)
        {
            if(completed)
            {
                [CLQDataBaseManager dataBaseManager].isIdle = NO;
                [CLQDataBaseManager dataBaseManager].isSyncInprogress = YES;
                
                AppDelegate *appdelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;;
                [appdelegate resumeIdleTimer:YES]; // To stop idle timer
                
                [CLQServiceManager getContentSyncWithUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId andToken:[CLQDataBaseManager dataBaseManager].currentUser.token];

            }
            // [CLQServiceManager syncBackToServer:^(BOOL completed){}];
        }];
    
    }];
    ;
}
-(void)SyncBack:(CDVInvokedUrlCommand *)command{
    if(command.arguments.count > 0)
    {
        NSDictionary *dict  = command.arguments[0];
        if(![dict[@"downloadlater"] boolValue]){
            [CLQServiceManager syncBackToServer:^(BOOL completed){
                [CLQServiceManager saveSyncDataInDatabase:self.responseDict withParams:@{kToken :[CLQDataBaseManager dataBaseManager].currentUser.token} forServiceType:ServiceTypeDelta withCompletion:^(BOOL completed){
                }];
            }];
            
           
        }
        else{
            [CLQServiceManager syncBackToServer:^(BOOL completed){}];
        }
    }
    else{
        [CLQServiceManager saveSyncDataInDatabase:self.responseDict withParams:@{kToken :[CLQDataBaseManager dataBaseManager].currentUser.token} forServiceType:ServiceTypeDelta withCompletion:^(BOOL completed){
        }];
        [CLQServiceManager syncBackToServer:^(BOOL completed){}];
    }
    
    
}
-(void)sendPluginsendPluginForError:(NSDictionary *)dict withCommand:(CDVInvokedUrlCommand *)command{
     NSString *response = [[NSString alloc] initWithData:[NSJSONSerialization dataWithJSONObject:dict options:kNilOptions error:nil] encoding:NSUTF8StringEncoding];
    NSLog(@"Error Response :%@",response);
    CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:response];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}


-(void) sendPluginsendPlugin:(CDVInvokedUrlCommand *)command
{
    if (self.jsonOutput)
    {
        NSString *response = [[NSString alloc] initWithData:self.jsonOutput encoding:NSUTF8StringEncoding];
        NSLog(@"Response :%@",response);
       CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:response];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }
    else
    {
         [self sendPluginsendPluginForError:@{Key_Error_Code : @"ERR10004",key_Error_Message : kERR10004} withCommand:command];
        
    }
}

@end
