//
//  User.m
//  Clinique
//
//  Created by Brindha_shiva on 3/9/15.
//
//

#import "User.h"
#import "CLQDataBaseManager.h"
#import "CLQServiceManager.h"
#import "FMDB.h"
#import "CLQHelper.h"


@implementation User

@synthesize  userName;
@synthesize password;
@synthesize token;
@synthesize userId;
@synthesize json;
@synthesize firstTime;

-(NSDictionary *)dictionaryFromObject:(User *)login{
    NSDictionary *dict  = [NSDictionary dictionary];
    
    return dict;
}

+(id)getUserDetails:(NSDictionary *)dict{

    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Users where upper(username) = upper(?) and password = ? and firstTime = ?",dict[kUserName],dict[kPassword], @"N"];
    //FMResultSet *results = [database executeQuery:@"SELECT * from Users where username= ? and password = ? ",dict[kUserName],dict[kPassword]];
    
    User *user = nil;
    while([results next]) {
        user = [User objectFromUser:results];
    }
    [database close];
    if(user != nil){
        [CLQDataBaseManager dataBaseManager].currentUser = user;
        NSDictionary *dict = [NSJSONSerialization  JSONObjectWithData:user.json options:kNilOptions error:nil];
        NSMutableDictionary *respDict = [NSMutableDictionary dictionaryWithDictionary:dict];
        respDict[KEY_FIRST_TIME_USER] =  user.firstTime == nil ? @"Y" :  user.firstTime;
        //respDict[KEY_FIRST_TIME_USER] = @"N";
        return respDict;
    }
    return nil;
}

+(id)objectFromUser:(id)object{
    User    *user = [[User alloc]init];
    
    if([object isKindOfClass:[FMResultSet class]]){
        
        FMResultSet *results = (FMResultSet *)object;
        user.userId = @([results intForColumn:kuserId]);
        
        user.userName = [results stringForColumn:kUserName];
        user.firstName = [results stringForColumn:kFirstName];
        user.lastName = [results stringForColumn:kLastName];
        
        user.email = [results stringForColumn:kEmail];
        user.country = [results stringForColumn:kCountry];
        user.retailer = [results stringForColumn:kRetailer];
        user.region = [results stringForColumn:kRegion];
        user.store = [results stringForColumn:kStore];
        user.jobTitle = [results stringForColumn:kjobTitle];
        
        user.password = [results stringForColumn:kPassword];
        user.token = [results stringForColumn:kToken];
        user.json = [results dataForColumn:kjson];
        user.status = @([results intForColumn:kStatus]);
        user.firstTime  = [results stringForColumn:kFirstTime];
        
    }
    else if([object isKindOfClass:[NSDictionary class]]){
        
        NSDictionary *dict = (NSDictionary *)object;
        if(dict[kId] != [NSNull null])
            user.userId =@([dict[kId] integerValue]);
        
        if(dict[kUserName] != [NSNull null])
            user.userName = dict[kUserName];
        
        if(dict[Key_Firstname] != [NSNull null])
            user.firstName = dict[Key_Firstname];
        
        if(dict[Key_Lastname] != [NSNull null])
            user.lastName = dict[Key_Lastname];
        
        if(dict[kEmail] != [NSNull null])
            user.email = dict[kEmail];
        
        if(dict[kCountry] != [NSNull null])
            user.country = dict[kCountry];
        
        if(dict[kPassword] != [NSNull null]){
            user.password  = [CLQHelper md5:dict[kPassword]];
           
           // user.password = dict[kPassword];
        }
        
        if(dict[kFirstTime] != [NSNull null])
            user.firstTime = dict[kFirstTime];
        
        if(dict[kStatus] != [NSNull null])
            user.status = @([dict[kStatus] intValue]);
    

        if(dict[kToken] != [NSNull null]){
            user.token = dict[kToken];
        }
        else{
            user.token = [CLQDataBaseManager dataBaseManager].currentUser.token;
        }
        
        if(dict[Key_Profile] != [NSNull null]){
            NSDictionary *profileDict = dict[Key_Profile];
            
            if(profileDict[kRetailer] != [NSNull null])
                user.retailer = profileDict[kRetailer];
            
            if(profileDict[kRegion] != [NSNull null])
                user.region = profileDict[kRegion];
            
            if(profileDict[kStore] != [NSNull null])
                user.store = profileDict[kStore];
            
            if(profileDict[Key_JobTitle] != [NSNull null])
                user.jobTitle = profileDict[Key_JobTitle];
        }
        NSData *data =[NSJSONSerialization dataWithJSONObject:@{kUser : dict} options:kNilOptions error:nil];
        user.json = data;
    }
    
    return user;
}

+(User *)getUserForUserId:(NSNumber *)userId{

    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    FMResultSet *results = [database executeQuery:@"SELECT * from Users where userId= ?",userId];

    User *user = nil;
    while([results next]) {
        user = [User objectFromUser:results];
    }
    [database close];
    return user;

}
+(void)saveUser:(NSDictionary *)dict{
    @try {
        
        User *user = [User getUserForUserId:@([dict[kId] intValue])];
        if(user == nil){
            [User insertUser:dict];
        }
        else{
           
            [User updateUser:dict];
        }
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :saveUser :%@",exception.description);
    }
}

+(void)insertUser:(NSDictionary *)dict{
    User *user = [User objectFromUser:dict];
   

    [CLQDataBaseManager dataBaseManager].currentUser = user;
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"INSERT INTO Users (userId, username, password, token, json, firstTime,firstName,lastName,email,country,retailer,region,store,jobTitle,status) VALUES (?, ?, ?, ?, ?, ?, ? , ? , ? ,?, ?,?,?,?,?)",dict[kId] , user.userName,user.password,user.token,user.json,user.firstTime,user.firstName,user.lastName,user.email,user.country,user.retailer,user.region,user.store,user.jobTitle,user.status,nil];
   
    [database close];
}

+(void)updateUser:(id)dict{
    User *user =  nil;
    if([dict isKindOfClass:[NSDictionary class]])
        user = [User objectFromUser:dict];

    NSLog(@"User :%@",user);
    [CLQDataBaseManager dataBaseManager].currentUser = user;
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Users set username= ?,password= ?, token=  ?,json= ?,firstTime= ?, firstName = ?,lastName = ?,email= ?, country= ?,retailer= ?, region= ? ,store= ?,jobTitle = ?,status = ?, firstTime = ? where userId= ?",user.userName,user.password,user.token ,user.json,user.firstTime,user.firstName,user.lastName,user.email,user.country,user.retailer,user.region,user.store,user.jobTitle,user.status,user.firstTime,user.userId, nil];
    [database close];
    
}

+(void)updateUserPassword:(id)dict{
    User *user =  [User getUserForUserId:[CLQDataBaseManager dataBaseManager].currentUser.userId];
    if(user != nil){
        user.password  = [CLQHelper md5:dict[kPassword]];
        
        
        NSLog(@"User :%@",user);
        [CLQDataBaseManager dataBaseManager].currentUser = user;
        FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        [database executeUpdate:@"UPDATE Users set username= ?,password= ?, token=  ?,json= ?,firstTime= ?, firstName = ?,lastName = ?,email= ?, country= ?,retailer= ?, region= ? ,store= ?,jobTitle = ?,status = ?, firstTime = ? where userId= ?",user.userName,user.password,user.token ,user.json,user.firstTime,user.firstName,user.lastName,user.email,user.country,user.retailer,user.region,user.store,user.jobTitle,user.status,user.firstTime,user.userId, nil];
        [database close];
    }
    
}

+(void)updateFirstTimeUser:(User*)user{
    [CLQDataBaseManager dataBaseManager].currentUser = user;
    FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
    [database open];
    [database executeUpdate:@"UPDATE Users set firstTime= ? where userId= ?",user.firstTime,user.userId, nil];
    [database close];
}

+(void)updateUserProfile:(NSDictionary *)dict{
    @try {
        
        User *user = [User objectFromUser:dict];
        
        
        NSMutableDictionary *userDictionary = [NSMutableDictionary dictionaryWithDictionary:[NSJSONSerialization JSONObjectWithData:user.json options:kNilOptions error:nil]];
        
        if(userDictionary[kUser] != [NSNull null]){
            if(userDictionary[Key_Firstname])
            {
                [userDictionary removeObjectForKey:Key_Firstname];
                userDictionary[Key_Firstname] = user.firstName.length > 0 ? user.firstName : @"";
            }
            if(userDictionary[Key_Lastname]){
                [userDictionary removeObjectForKey:Key_Lastname];
                userDictionary[Key_Lastname] = user.lastName.length > 0 ? user.lastName : @"";
            }
            if(userDictionary[kEmail]){
                [userDictionary removeObjectForKey:kEmail];
                userDictionary[kEmail] = user.email.length >0  ? user.email : @"";
            }
            if(userDictionary[kCountry]){
                [userDictionary removeObjectForKey:kCountry];
                userDictionary[kCountry] = user.country.length > 0 ? user.country : @"";
            }
            if(userDictionary[Key_Profile]){
                NSMutableDictionary *profileDict = [NSMutableDictionary dictionaryWithDictionary:userDictionary[Key_Profile]];
                
                if(profileDict[kRetailer]){
                    [profileDict removeObjectForKey:kRetailer];
                    profileDict[kRetailer] = user.retailer.length > 0 ? user.retailer :@"";
                }
                if(profileDict[kRegion] ){
                    [profileDict removeObjectForKey:kRegion];
                    profileDict[kRegion] = user.region.length > 0 ? user.region :@"";
                }
                if(profileDict[kStore] ){
                    [profileDict removeObjectForKey:kStore];
                    profileDict[kStore] = user.store.length > 0 ? user.store :@"";
                }
                if(profileDict[Key_JobTitle]){
                    [profileDict removeObjectForKey:Key_JobTitle];
                    profileDict[Key_JobTitle] = user.jobTitle.length > 0 ? user.jobTitle :@"";
                }
                [userDictionary removeObjectForKey:Key_Profile];
                userDictionary[Key_Profile] = profileDict;
            }
          
            user.json = [NSJSONSerialization dataWithJSONObject:userDictionary options:kNilOptions error:nil];
            
        }
        
        FMDatabase *database = [FMDatabase databaseWithPath:[[CLQDataBaseManager dataBaseManager]getDBPath]];
        [database open];
        [database executeUpdate:@"UPDATE Users set username= ? ,token=  ?,json= ?,firstTime= ?, firstName = ?,lastName = ?,email= ?, country= ?,retailer= ?, region= ? ,store= ?,jobTitle = ?,status = ? where userId= ?",user.userName,user.token ,user.json,user.firstTime,user.firstName,user.lastName,user.email,user.country,user.retailer,user.region,user.store,user.jobTitle,user.status,user.userId, nil];
        [database close];
    }
    @catch (NSException *exception) {
        NSLog(@"Exception :updateUserProfile %@",exception.description);
        
    }

}



@end
