//
//  PDFViewerPlugin.h
//  Clinique
//
//  Created by BRINDHA_S on 22/07/14.
//
//

#import <Foundation/Foundation.h>
#import <Cordova/CDVViewController.h>

@interface PDFViewerPlugin :CDVPlugin<UIDocumentInteractionControllerDelegate,UIAlertViewDelegate>

@property(strong, nonatomic)UIDocumentInteractionController *controller;
@property (strong, nonatomic) UIActivityIndicatorView *indicator;
@property(strong, nonatomic) UIAlertView *alert;

-(void)openReportExportFile:(CDVInvokedUrlCommand *)sender;
@end


