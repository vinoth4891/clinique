/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

//
//  AppDelegate.h
//  Clinique
//
//  Created by ___FULLUSERNAME___ on ___DATE___.
//  Copyright ___ORGANIZATIONNAME___ ___YEAR___. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreData/CoreData.h>
#import <Cordova/CDVViewController.h>
#import <JavaScriptCore/JavaScriptCore.h>
#import "CLQAlertView.h"

@interface AppDelegate : NSObject <UIApplicationDelegate,CLQAlertViewDelegate>{}

// invoke string is passed to your app on launch, this is only valid if you
// edit Clinique-Info.plist to add a protocol
// a simple tutorial can be found here :
// http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html

@property (nonatomic, strong) IBOutlet UIWindow* window;
@property (nonatomic, strong) IBOutlet CDVViewController* viewController;
@property (readonly, strong, nonatomic) NSManagedObjectContext *managedObjectContext;
@property (readonly, strong, nonatomic) NSManagedObjectModel *managedObjectModel;
@property (readonly, strong, nonatomic) NSPersistentStoreCoordinator *persistentStoreCoordinator;
@property (strong, nonatomic)NSTimer *idleTimer;
@property (strong, nonatomic)NSTimer *alertTimer;
@property (strong, nonatomic)CLQAlertView *alert;
@property (assign, nonatomic)BOOL isFromBlueOcean;

-(void)openPdf:(id)sender;
-(void)openScorm:(id)sender;
-(void)openExportFile:(id)sender;
-(void)resumeIdleTimer:(BOOL)isidleTimerStopped;
@end
