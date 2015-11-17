//
//  PDFService.h
//  Cliqnue
//
//  Created by Benoit on 04/03/14.
//  Copyright (c) 2014 Lesmobilizers. All rights reserved.
//

#import <Foundation/Foundation.h>


@interface PDFService : NSObject

//#define ServiceDomain   @"http://clinique-dev.photoninfotech.com/trunk/admin/clinique_webservice" // dev url
#define ServiceDomain  @"http://01847-stg.photoninfotech.com/clinique/admin/v2/clinique_webservice" // Qa url

#define ServiceAddComment             ServiceDomain @"pdf-parser"
#define ServiceGetPdf             ServiceDomain @"/services.php?"
#define ServiceGetBookMark          @"get_course_pdf_bookmarks"
#define SerViceInsertBookMark      @"insert_course_pdf_bookmark"
#define ServiceDeleteBookMark     @"delete_course_pdf_bookmark"
#define ServiceGetComment          @"get_course_resource_comment"
#define ServiceInsertComment      @"insert_replace_course_resource_comment"
#define ServiceDeleteComment    @"delete_comment"


#define KEY_PDF_ID @"pdfid"
#define KEY_USER_ID @"userid"
#define KEY_PDF_URL @"pdfurl"
#define KEY_PDF_NAME @"pdfname"
#define KEY_PAGE_NUMBER @"page_number"
#define KEY_START_PAGE_NUMBER @"from_page"
#define KEY_END_PAGE_NUMBER @"to_page"
#define KEY_META_DATA_REQUIRED @"Metadatarequied"
#define KEY_COURSE_ID @"courseid"
#define KEY_COURSE_MODULE_ID @"coursemoduleid"
#define KEY_CID @"cid"
#define KEY_UID @"uid"
#define KEY_ACTION @"action"
#define KEY_PAGE_ID @"pageid"
#define KEY_TYPE @"type"
#define KEY_PDF @"pdf"


#define KEY_HIGHLIGHT @"Highlight"
#define KEY_COMMENT @"comment"
#define KEY_BOOKMARK_DETAIL @"bookmarks"
#define KEY_BOOK_MARK_PAGE_NO @"pageno"
#define KEY_TOTAL_NUM_OF_PAGES @"total_page"

#define KEY_PAGES @"pages"
#define KEY_CONTENT @"content"

#define KEY_COMMENTS @"comment"
#define KEY_LOCATIONX @"locationX"
#define KEY_LOCATIONY @"locationX"
@end
