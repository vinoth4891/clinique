package com.artifex.mupdf;

import java.util.ArrayList;
import java.util.Locale;

import CustomView.CliniqueCheckBox;
import CustomView.CliniqueEditText;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DownloadManager;
import android.app.ProgressDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.RectF;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.text.Editable;
import android.text.TextWatcher;
import android.text.method.PasswordTransformationMethod;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.View.OnTouchListener;
import android.view.Window;
import android.view.animation.Animation;
import android.view.animation.TranslateAnimation;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.CompoundButton.OnCheckedChangeListener;
import android.widget.EditText;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.ViewSwitcher;

import com.JSONparser.JSONParser;
import com.JSONparser.Utilities;
import com.JSONparser.Variable;
import com.clinique.phresco.hybrid.FileOpener;
import com.clinique.phresco.hybrid.MainActivity;
import com.photon.phresco.db.BookmarkDao;
import com.photon.phresco.db.NoteDao;
import com.clinique.phresco.hybrid.R;
import com.photon.phresco.model.Bookmark;
import com.photon.phresco.model.Note;
import com.photon.phresco.service.SyncBackService;

public class MuPDFActivity extends Activity implements OnClickListener, OnCheckedChangeListener {
	private BookmarkDao bookmarkDao = new BookmarkDao(
			MainActivity.dbStore.getMDbHelper());
	private NoteDao noteDao = new NoteDao(
			MainActivity.dbStore.getMDbHelper());	
	private SyncBackService syncBackService = new SyncBackService();

	private final int										TAP_PAGE_MARGIN			= 5;
	private static final int								SEARCH_PROGRESS_DELAY	= 200;
	public static MuPDFCore									core;
	private String											mFileName;
	private ReaderView										mDocView;
	private View											mButtonsView;
	private boolean											mButtonsVisible;
	private EditText										mPasswordView;
	private TextView										mPageNumberView;
	private Button											mSearchButton;
	private Button											mCancelButton;
	private ViewSwitcher									mTopBarSwitcher;
	private boolean											mTopBarIsSearch;
	private Button											mSearchBack;
	private Button											mSearchFwd;
	private CustomView.CliniqueEditText						mSearchText;

	private Button											btnDone, btnNotes, btnThumbnail, btnDownload, btnSearchCancel;
	private CliniqueCheckBox								btnBookmark;
	JSONParser												parser;
	private String											getBookmark				= "";
	private String											ModuleID				= "";
	private long											downloadReference;
	private String 											uid 					= "";
	String													PdfToken				= "";
	// private String cid = "";
	private String											Message					= "";
	private String											FileName				= "";
	private ArrayList<String>								bookmarkPages;
	private SafeAsyncTask<Void, Integer, SearchTaskResult>	mSearchTask;
	private Dialog											mAlertBuilder;
	private final LinkState									mLinkState				= LinkState.DEFAULT;
	private final Handler									mHandler				= new Handler();
	private String											downloadURL				= "";
	BroadcastReceiver										downloadPDFReceiver;
	DownloadManager											downloadManager;
	public static ArrayList<Bitmap>							bitmap=null;
	String													Language				= "";
	String													OriginalFileName		= "";
	ProgressDialog											loading					= null;

	class DeleteBookmark1 extends AsyncTask<Void, Void, Void> {

		@Override
		protected Void doInBackground(Void... params) {

			try {
				Bookmark bookmark = bookmarkDao.getBookmark(Integer.parseInt(uid), Integer.parseInt(ModuleID));
				String currentPage = mPageNumberView.getTag().toString().split("/")[0];
				if(bookmark.getId()!=0){
					String pages = ","+bookmark.getPageNo();
					String deleted = ","+bookmark.getDeleted();
					Log.d("currentPage:"+ModuleID+"-",currentPage);
					if(pages.contains(","+currentPage+",")){
						pages = pages.replace(","+currentPage+",", ",");
						pages = pages.substring(1);
						bookmark.setPageNo(pages);
						if(!deleted.contains(","+currentPage+",")){
							deleted = deleted+currentPage+",";
						}						
						bookmark.setDeleted(deleted);
						Log.d("Delete Bookmark:"+ModuleID+"-",pages+",");
						bookmark.setStatus("U");
					}

				}				
				bookmark.setTimeModified(System.currentTimeMillis());
				bookmarkDao.updateBookmark(bookmark);

				syncBackService.syncBookmarks(Integer.parseInt(uid), MuPDFActivity.this);

				Message="null";
				/*List<NameValuePair> param = new ArrayList<NameValuePair>(); // ?coursemoduleid=1&action=get_course_pdf_bookmarks&uid=1&pageid=2&cid=1"
				param.add(new BasicNameValuePair(Variable.MODULE_ID, ModuleID));
				param.add(new BasicNameValuePair(Variable.ACTION, Variable.DELETE_BOOKMARK));
				// param.add(new BasicNameValuePair(Variable.U_ID, uid));
				param.add(new BasicNameValuePair(Variable.TYPE, "pdf"));
				param.add(new BasicNameValuePair(Variable.PDF_TOKEN, PdfToken));
				String currentPage = mPageNumberView.getTag().toString().split("/")[0];
				param.add(new BasicNameValuePair(Variable.PAGE_ID, "" + currentPage));
				// param.add(new BasicNameValuePair(Variable.C_ID, cid));
				JSONObject object = parser.makeHttpRequest(getBookmark, "POST", param);*/
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			return null;
		}

		@Override
		protected void onPostExecute(Void result) {
			super.onPostExecute(result);
			if (loading != null) {
				loading.cancel();
				String currentPage = mPageNumberView.getTag().toString().split("/")[0];
				if (bookmarkPages.contains(currentPage + "")) {
					bookmarkPages.remove(currentPage + "");
				}
			}

		}

		@Override
		protected void onPreExecute() {
			super.onPreExecute();

			loading = new ProgressDialog(MuPDFActivity.this);
			loading.setMessage(getResources().getString(R.string.loading));
			loading.setCancelable(false);
			loading.show();
		}

	};

	class GetBookmark1 extends AsyncTask<Void, Void, Void> {

		@Override
		protected Void doInBackground(Void... params) {
			try {
				Bookmark bookmark = bookmarkDao.getBookmark(Integer.parseInt(uid), Integer.parseInt(ModuleID));
				bookmarkPages.clear();
				if(bookmark.getModuleId()!=0 && !"".equals(bookmark.getPageNo())){
					String[] pages = bookmark.getPageNo().split(",");
					for (int i = 0; i < pages.length; i++) {
						bookmarkPages.add(pages[i]);
						Log.d("bookmarkPages:"+ModuleID+"-",pages[i]);
					}
				}
				Note note = noteDao.getNote(Integer.parseInt(uid), Integer.parseInt(ModuleID));
				if(note.getModuleId()!=0 && !"".equals(note.getComment())){
					Message = note.getComment();
				}
				/*List<NameValuePair> param = new ArrayList<NameValuePair>();
				param.add(new BasicNameValuePair(Variable.MODULE_ID, ModuleID));
				param.add(new BasicNameValuePair(Variable.ACTION, Variable.GET_BOOKMARK));
				// param.add(new BasicNameValuePair(Variable.U_ID, uid));
				param.add(new BasicNameValuePair(Variable.TYPE, "pdf"));
				param.add(new BasicNameValuePair(Variable.PDF_TOKEN, PdfToken));
				// param.add(new BasicNameValuePair(Variable.C_ID, cid));
				JSONObject object = parser.makeHttpRequest(getBookmark, "POST", param);
				try {
					JSONArray pages = object.getJSONObject("response").getJSONArray("bookmarks");
					Log.e("Result from", pages.toString());
					bookmarkPages.clear();
					for (int i = 0; i < pages.length(); i++) {
						bookmarkPages.add(pages.getJSONObject(i).getString("pageno"));
					}

				} catch (JSONException e) {
					e.printStackTrace();
				}

				List<NameValuePair> param1 = new ArrayList<NameValuePair>();
				param1.add(new BasicNameValuePair(Variable.MODULE_ID, ModuleID));
				param1.add(new BasicNameValuePair(Variable.ACTION, Variable.GET_COMMENT));
				// param1.add(new BasicNameValuePair(Variable.U_ID, uid));
				param1.add(new BasicNameValuePair(Variable.TYPE, "pdf"));
				param1.add(new BasicNameValuePair(Variable.PDF_TOKEN, PdfToken));
				// param1.add(new BasicNameValuePair(Variable.C_ID, cid));

				JSONObject commentObject = parser.makeHttpRequest(getBookmark, "POST", param1);
				Log.e("Result from", commentObject.toString());
				try {
					JSONArray arr = commentObject.getJSONArray("response");
					if (arr.length() > 0) {
						Message = arr.getJSONObject(arr.length() - 1).getString("comment");
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}*/
			} catch (Exception e) {
				e.printStackTrace();
			}

			return null;
		}

		@Override
		protected void onPostExecute(Void result) {
			super.onPostExecute(result);
			if (loading != null) {
				loading.cancel();
				updatePageNumView(0);
				if (!Message.trim().equals("") && !Message.equalsIgnoreCase("null")) {
					btnNotes.setBackgroundResource(R.drawable.comment_select);
				} else {
					btnNotes.setBackgroundResource(R.drawable.comment);
				}

			}
		}

		@Override
		protected void onPreExecute() {
			super.onPreExecute();

			loading = new ProgressDialog(MuPDFActivity.this);
			loading.setMessage(getResources().getString(R.string.loading));
			loading.setCancelable(false);
			loading.show();
		}

	}

	class InsertBookmark1 extends AsyncTask<Void, Void, Void> {

		@Override
		protected Void doInBackground(Void... params) {

			try {
				Bookmark bookmark = bookmarkDao.getBookmark(Integer.parseInt(uid), Integer.parseInt(ModuleID));
				String currentPage = mPageNumberView.getTag().toString().split("/")[0];

				if(bookmark.getId()==0){
					bookmark = new Bookmark();
					bookmark.setModuleId(Integer.parseInt(ModuleID));
					bookmark.setUserId(Integer.parseInt(uid));
					bookmark.setPageNo(currentPage+",");
					bookmark.setAdded(currentPage+",");
					Log.d("Insert Bookmark:"+ModuleID+"-",currentPage+",");
				}
				else{
					String pages = bookmark.getPageNo();
					if(!(","+pages+",").contains(","+currentPage+",")){
						bookmark.setPageNo(pages+currentPage+",");
					}
					String added = bookmark.getAdded();
					if(!(","+added+",").contains(","+currentPage+",")){
						bookmark.setAdded(added+currentPage+",");
					}
					Log.d("Insert Bookmark:"+ModuleID+"-",pages+",");
				}
				bookmark.setStatus("U");
				bookmark.setTimeModified(System.currentTimeMillis());
				bookmarkDao.updateBookmark(bookmark);
				syncBackService.syncBookmarks(Integer.parseInt(uid), MuPDFActivity.this);
				Message="null";

				/*List<NameValuePair> param = new ArrayList<NameValuePair>(); // ?coursemoduleid=1&action=get_course_pdf_bookmarks&uid=1&pageid=2&cid=1"
				param.add(new BasicNameValuePair(Variable.MODULE_ID, ModuleID));
				param.add(new BasicNameValuePair(Variable.ACTION, Variable.INSERT_BOOKMARK));
				// param.add(new BasicNameValuePair(Variable.U_ID, uid));
				param.add(new BasicNameValuePair(Variable.TYPE, "pdf"));
				param.add(new BasicNameValuePair(Variable.PDF_TOKEN, PdfToken));
				String currentPage = mPageNumberView.getTag().toString().split("/")[0];
				param.add(new BasicNameValuePair(Variable.PAGE_ID, "" + currentPage));
				// param.add(new BasicNameValuePair(Variable.C_ID, cid));
				JSONObject object = parser.makeHttpRequest(getBookmark, "POST", param);
				try {
					Message = object.getString("msg");
				} catch (JSONException e) {
					e.printStackTrace();
				}*/
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			return null;
		}

		@Override
		protected void onPostExecute(Void result) {
			super.onPostExecute(result);
			if (loading != null) {
				loading.cancel();
				String currentPage = mPageNumberView.getTag().toString().split("/")[0];
				if (!bookmarkPages.contains(currentPage + "")) {
					bookmarkPages.add(currentPage + "");
				}
			}

		}

		@Override
		protected void onPreExecute() {
			super.onPreExecute();

			loading = new ProgressDialog(MuPDFActivity.this);
			loading.setMessage(getResources().getString(R.string.loading));
			loading.setCancelable(false);
			loading.show();
		}

	}

	class InsertComment1 extends AsyncTask<String, String, String> {
		String	url	= "";

		@Override
		protected String doInBackground(String... params) {

			try {
				Note note = noteDao.getNote(Integer.parseInt(uid), Integer.parseInt(ModuleID));
				if(note.getId()==0){
					note = new Note();
					note.setModuleId(Integer.parseInt(ModuleID));
					note.setUserId(Integer.parseInt(uid));
				}
				note.setComment(params[0]);
				note.setStatus("U");
				note.setTimeModified(System.currentTimeMillis());
				noteDao.updateNote(note);
				syncBackService.syncNotes(Integer.parseInt(uid), MuPDFActivity.this);
				Message = params[0];
				/*
				List<NameValuePair> param = new ArrayList<NameValuePair>(); // coursemoduleid=641&type=pdf&action=insert_replace_course_resource_comment&uid=2&comment=Tesrt&cid=53

				param.add(new BasicNameValuePair(Variable.MODULE_ID, ModuleID));
				param.add(new BasicNameValuePair(Variable.ACTION, Variable.INSERT_COMMENT));
				// param.add(new BasicNameValuePair(Variable.U_ID, uid));
				param.add(new BasicNameValuePair(Variable.TYPE, "pdf"));
				param.add(new BasicNameValuePair(Variable.PDF_TOKEN, PdfToken));
				param.add(new BasicNameValuePair(Variable.COMMENT, "" + params[0]));
				// param.add(new BasicNameValuePair(Variable.C_ID, cid));

				JSONObject object = parser.makeHttpRequest(getBookmark, "POST", param);
				Message = params[0];*/

			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			return null;
		}

		@Override
		protected void onPostExecute(String result) {
			super.onPostExecute(result);
			if (loading != null) {

				try {
					if (!Message.trim().equals("") && !Message.equalsIgnoreCase("null")) {
						btnNotes.setBackgroundResource(R.drawable.comment_select);
					} else {
						btnNotes.setBackgroundResource(R.drawable.comment);
					}
				} catch (Exception e) {
					e.printStackTrace();
				}
				loading.cancel();
				loading = null;
			}

		}

		@Override
		protected void onPreExecute() {
			super.onPreExecute();

			loading = new ProgressDialog(MuPDFActivity.this);
			loading.setMessage(getResources().getString(R.string.loading));
			loading.setCancelable(false);
			loading.show();
		}

	}

	/* The core rendering instance */
	private enum LinkState {
		DEFAULT, HIGHLIGHT, INHIBIT
	}

	public void createUI(Bundle savedInstanceState) {
		if (core == null) {
			return;
		}
		// Now create the UI.
		// First create the document view making use of the ReaderView's
		// internal
		// gesture recognition
		mDocView = new ReaderView(this) {
			private boolean	showButtonsDisabled;

			@Override
			protected void onChildSetup(int i, View v) {
				if (SearchTaskResult.get() != null && SearchTaskResult.get().pageNumber == i) {
					((PageView) v).setSearchBoxes(SearchTaskResult.get().searchBoxes);
				} else {
					((PageView) v).setSearchBoxes(null);
				}

				((PageView) v).setLinkHighlighting(mLinkState == LinkState.HIGHLIGHT);
			}

			@Override
			public void onMoveToChild(int i) {
				if (core == null) {
					return;
				}

				i += 1;
				if (bookmarkPages.contains(i + "")) {
					btnBookmark.setBackgroundResource(R.drawable.bookmark_select);
					btnBookmark.setTag("true");
				} else {
					btnBookmark.setBackgroundResource(R.drawable.bookmark);
					btnBookmark.setTag("false");
				}

				mPageNumberView.setText(String.format("%d of %d", i, core.countPages()));
				mPageNumberView.setTag(String.format("%d/%d", i, core.countPages()));
				if (SearchTaskResult.get() != null && SearchTaskResult.get().pageNumber != i) {
					SearchTaskResult.set(null);
					mDocView.resetupChildren();
				}
			}

			@Override
			protected void onNotInUse(View v) {
				((PageView) v).releaseResources();
			}

			@Override
			public boolean onScaleBegin(ScaleGestureDetector d) {
				showButtonsDisabled = true;
				return super.onScaleBegin(d);
			}

			@Override
			public boolean onScroll(MotionEvent e1, MotionEvent e2, float distanceX, float distanceY) {
				if (!showButtonsDisabled) {
					// hideButtons();
				}

				return super.onScroll(e1, e2, distanceX, distanceY);
			}

			@Override
			protected void onSettle(View v) {
				// When the layout has settled ask the page to render
				// in HQ
				((PageView) v).addHq();
			}

			@Override
			public boolean onSingleTapUp(MotionEvent e) {
				if (e.getX() < super.getWidth() / TAP_PAGE_MARGIN) {
					super.moveToPrevious();
				} else if (e.getX() > super.getWidth() * (TAP_PAGE_MARGIN - 1) / TAP_PAGE_MARGIN) {
					super.moveToNext();
				} else if (!showButtonsDisabled) {
					int linkPage = -1;
					if (mLinkState != LinkState.INHIBIT) {
						MuPDFPageView pageView = (MuPDFPageView) mDocView.getDisplayedView();
						if (pageView != null) {
							// XXX linkPage = pageView.hitLinkPage(e.getX(),
							// e.getY());
						}
					}

					if (linkPage != -1) {
						mDocView.setDisplayedViewIndex(linkPage);
					} else {
						if (!mButtonsVisible) {
							showButtons();
						} else {
							// hideButtons();
						}
					}
				}
				return super.onSingleTapUp(e);
			}

			@Override
			@SuppressLint("NewApi")
			public boolean onTouchEvent(MotionEvent event) {
				if (event.getActionMasked() == MotionEvent.ACTION_DOWN) {
					showButtonsDisabled = false;
				}

				return super.onTouchEvent(event);
			}

			@Override
			protected void onUnsettle(View v) {
				// When something changes making the previous settled view
				// no longer appropriate, tell the page to remove HQ
				((PageView) v).removeHq();
			}
		};
		mDocView.setAdapter(new MuPDFPageAdapter(this, core));

		// Make the buttons overlay, and store all its
		// controls in variables
		makeButtonsView();
		Log.e("getBookmark", getBookmark + "------------------>");

		//if (Utilities.hasActiveInternetConnection(MuPDFActivity.this)) {
		new GetBookmark1().execute();
		//} else {
		//Utilities.AlertView(MuPDFActivity.this);
		//}

		// Search invoking buttons are disabled while there is no text specified
		mSearchBack.setEnabled(false);
		mSearchFwd.setEnabled(false);

		// React to interaction with the text widget
		mSearchText.addTextChangedListener(new TextWatcher() {

			@Override
			public void afterTextChanged(Editable s) {
				boolean haveText = s.toString().length() > 0;
				mSearchBack.setEnabled(haveText);
				mSearchFwd.setEnabled(haveText);

				if (mSearchText.getText().toString().trim().equals("")) {
					btnSearchCancel.setVisibility(View.GONE);
				} else {
					btnSearchCancel.setVisibility(View.VISIBLE);
				}

				// Remove any previous search results
				if (SearchTaskResult.get() != null && !mSearchText.getText().toString().equals(SearchTaskResult.get().txt)) {
					SearchTaskResult.set(null);
					mDocView.resetupChildren();
				}
			}

			@Override
			public void beforeTextChanged(CharSequence s, int start, int count, int after) {
			}

			@Override
			public void onTextChanged(CharSequence s, int start, int before, int count) {
			}
		});

		// React to Done button on keyboard
		mSearchText.setOnEditorActionListener(new TextView.OnEditorActionListener() {
			@Override
			public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
				if (actionId == EditorInfo.IME_ACTION_DONE) {
					mSearchText.setCursorVisible(false);
					if (!mSearchText.getText().toString().trim().equals("")) {
						search(1, true);

					}
				}
				return false;
			}
		});

		mSearchText.setOnKeyListener(new View.OnKeyListener() {
			@Override
			public boolean onKey(View v, int keyCode, KeyEvent event) {
				mSearchText.setCursorVisible(false);
				if (event.getAction() == KeyEvent.ACTION_DOWN && keyCode == KeyEvent.KEYCODE_ENTER) {
					search(1, true);
				}
				return false;
			}
		});

		// Activate search invoking buttons
		mSearchBack.setOnClickListener(this);
		mSearchFwd.setOnClickListener(this);

		mSearchText.setOnClickListener(this);
		mSearchButton.setOnClickListener(this);
		mPageNumberView.setOnClickListener(this);
		mCancelButton.setOnClickListener(this);
		btnDone.setOnClickListener(this);
		btnNotes.setOnClickListener(this);
		btnThumbnail.setOnClickListener(this);
		btnDownload.setOnClickListener(this);
		btnSearchCancel.setOnClickListener(this);
		btnBookmark.setOnCheckedChangeListener(this);

		if (savedInstanceState == null || !savedInstanceState.getBoolean("ButtonsHidden", false)) {
			showButtons();
		}

		if (savedInstanceState != null && savedInstanceState.getBoolean("SearchMode", false)) {
			searchModeOn();
		}

		// Stick the document view and the buttons overlay into a parent view
		RelativeLayout layout = new RelativeLayout(this);
		layout.addView(mDocView);
		layout.addView(mButtonsView);
		layout.setBackgroundResource(R.drawable.tiled_background);
		// layout.setBackgroundResource(R.color.canvas);
		setContentView(layout);

	}

	void hideButtons() {
		if (mButtonsVisible) {
			mButtonsVisible = false;
			hideKeyboard();

			Animation anim = new TranslateAnimation(0, 0, 0, -mTopBarSwitcher.getHeight());
			anim.setDuration(200);
			anim.setAnimationListener(new Animation.AnimationListener() {
				@Override
				public void onAnimationEnd(Animation animation) {
					mTopBarSwitcher.setVisibility(View.INVISIBLE);
				}

				@Override
				public void onAnimationRepeat(Animation animation) {
				}

				@Override
				public void onAnimationStart(Animation animation) {
				}
			});
			mTopBarSwitcher.startAnimation(anim);

			anim = new TranslateAnimation(0, 0, 0, mPageNumberView.getHeight()); // mPageSlider
			anim.setDuration(200);
			anim.setAnimationListener(new Animation.AnimationListener() {
				@Override
				public void onAnimationEnd(Animation animation) {
					// mPageSlider.setVisibility(View.INVISIBLE);
				}

				@Override
				public void onAnimationRepeat(Animation animation) {
				}

				@Override
				public void onAnimationStart(Animation animation) {
					mPageNumberView.setVisibility(View.INVISIBLE);
				}
			});
			mPageNumberView.startAnimation(anim);
		}
	}

	void hideKeyboard() {
		InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
		if (imm != null) {
			imm.hideSoftInputFromWindow(mSearchText.getWindowToken(), 0);
		}
	}

	void hideKeyboard(EditText editText) {
		InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
		if (imm != null) {
			imm.hideSoftInputFromWindow(editText.getWindowToken(), 0);
		}
	}

	void killSearch() {
		if (mSearchTask != null) {
			mSearchTask.cancel(true);
			mSearchTask = null;
		}
	}

	void makeButtonsView() {

		mButtonsView = getLayoutInflater().inflate(R.layout.buttons, null);
		mPageNumberView = (TextView) mButtonsView.findViewById(R.id.pageNumber);
		mSearchButton = (Button) mButtonsView.findViewById(R.id.searchButton);
		mCancelButton = (Button) mButtonsView.findViewById(R.id.cancel);
		mTopBarSwitcher = (ViewSwitcher) mButtonsView.findViewById(R.id.switcher);
		mSearchBack = (Button) mButtonsView.findViewById(R.id.searchBack);
		mSearchFwd = (Button) mButtonsView.findViewById(R.id.searchForward);
		mSearchText = (CustomView.CliniqueEditText) mButtonsView.findViewById(R.id.searchText);

		btnDone = (Button) mButtonsView.findViewById(R.id.btnDone);
		btnNotes = (Button) mButtonsView.findViewById(R.id.btnNotes);
		btnThumbnail = (Button) mButtonsView.findViewById(R.id.btnThumbnail);
		btnDownload = (Button) mButtonsView.findViewById(R.id.btnDownload);
		btnSearchCancel = (Button) mButtonsView.findViewById(R.id.btnSearchCancel);
		btnBookmark = (CliniqueCheckBox) mButtonsView.findViewById(R.id.btnBookmark);

		mTopBarSwitcher.setVisibility(View.INVISIBLE);
		mPageNumberView.setVisibility(View.INVISIBLE);
		btnSearchCancel.setVisibility(View.GONE);
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (resultCode >= 0) {
			mDocView.setDisplayedViewIndex(resultCode);
		}

		if (requestCode == 1) {
			if (resultCode == RESULT_OK) {
				int result = data.getIntExtra(Variable.PAGE_NO, 1);
				mDocView.setDisplayedViewIndex(result);
			}
			if (resultCode == RESULT_CANCELED) {
			}
		}
		super.onActivityResult(requestCode, resultCode, data);
	}

	@Override
	public void onCheckedChanged(CompoundButton buttonView, boolean arg1) {
		switch (buttonView.getId()) {
		case R.id.btnBookmark:
			if (btnBookmark.getTag().toString().equals("false")) {
				//if (Utilities.hasActiveInternetConnection(MuPDFActivity.this)) {
				new InsertBookmark1().execute();
				btnBookmark.setTag("true");
				btnBookmark.setBackgroundResource(R.drawable.bookmark_select);
				//} else {
				//Utilities.AlertView(MuPDFActivity.this);
				//btnBookmark.setBackgroundResource(R.drawable.bookmark);
				//}

			} else {
				//if (Utilities.hasActiveInternetConnection(MuPDFActivity.this)) {
				new DeleteBookmark1().execute();
				btnBookmark.setTag("false");
				btnBookmark.setBackgroundResource(R.drawable.bookmark);
				//} else {
				//Utilities.AlertView(MuPDFActivity.this);
				//btnBookmark.setBackgroundResource(R.drawable.bookmark_select);
				//}

			}
			break;

		default:
			break;
		}
	}

	@Override
	public void onClick(View v) {
		switch (v.getId()) {

		case R.id.btnSearchCancel:
			mSearchText.setText("");
			mSearchText.clearFocus();
			break;
		case R.id.searchButton:
			searchModeOn();
			mSearchText.setCursorVisible(true);
			break;
		case R.id.cancel:
			searchModeOff();
			break;
		case R.id.searchBack:
			if (!mSearchText.getText().toString().trim().equals("")) {
				search(-1, false);
			}
			break;
		case R.id.searchForward:
			if (!mSearchText.getText().toString().trim().equals("")) {
				search(1, false);
			}
			break;
		case R.id.btnDone:
			finish();
			break;
		case R.id.btnNotes:
			final Dialog pgDialog = new Dialog(MuPDFActivity.this);
			pgDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
			pgDialog.setContentView(R.layout.inflate_alert_view);
			pgDialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.argb(0, 0, 0, 0)));
			Button pgDone = (Button) pgDialog.findViewById(R.id.btnDone);
			pgDone.setText(getResources().getString(R.string.save));
			Button pgCancel = (Button) pgDialog.findViewById(R.id.btnCancel);
			final CustomView.CliniqueEditText pgNumber = (CustomView.CliniqueEditText) pgDialog.findViewById(R.id.txtNotes);

			pgDialog.getWindow().getDecorView().getRootView().setOnTouchListener(new OnTouchListener() {

				@Override
				public boolean onTouch(View arg0, MotionEvent event) {
					if (event.getAction() == MotionEvent.ACTION_DOWN) {
						hideKeyboard(pgNumber);
						return true;
					}
					return false;
				}

			});

			Message = Message.trim();
			if (!Message.equals("") && !Message.equalsIgnoreCase("null")) {
				pgNumber.setText(Message);
			}

			pgDone.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					pgDialog.cancel();
					//if (Utilities.hasActiveInternetConnection(MuPDFActivity.this)) {
					new InsertComment1().execute(pgNumber.getText().toString());
					//} else {
					//Utilities.AlertView(MuPDFActivity.this);
					//}

				}
			});
			pgCancel.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					pgDialog.cancel();
				}
			});
			pgDialog.setCancelable(false);
			pgDialog.show();
			break;
		case R.id.btnThumbnail:
			if (bitmap == null || bitmap.isEmpty()) {
				new AsynTask1().execute();
			} else {
				if(bitmap.size()>0){
					Intent intent = new Intent(MuPDFActivity.this, Thumb.class);
					intent.putStringArrayListExtra("bookmark", bookmarkPages);
					startActivityForResult(intent, 1);
				}else
				{
					new AsynTask1().execute();
				}
			}
			break;

		case R.id.pageNumber:
			final Dialog pageNumberDialog = new Dialog(MuPDFActivity.this);
			pageNumberDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
			pageNumberDialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.argb(0, 0, 0, 0)));

			pageNumberDialog.setContentView(R.layout.inflate_alert_page_no_view);
			Button pageNumberDialogDone = (Button) pageNumberDialog.findViewById(R.id.btnDone);
			Button pageNumberDialogCancel = (Button) pageNumberDialog.findViewById(R.id.btnCancel);
			final CliniqueEditText pageNumberDialogNumber = (CliniqueEditText) pageNumberDialog.findViewById(R.id.txtNotes);
			final TextView lblPgExceed = (TextView) pageNumberDialog.findViewById(R.id.lblPgExceed);

			lblPgExceed.setText(getResources().getString(R.string.alert_pg_no) + " - (1-" + core.countPages() + ")");
			lblPgExceed.setVisibility(View.GONE);

			pageNumberDialog.getWindow().getDecorView().getRootView().setOnTouchListener(new OnTouchListener() {

				@Override
				public boolean onTouch(View arg0, MotionEvent event) {
					if (event.getAction() == MotionEvent.ACTION_DOWN) {
						hideKeyboard(pageNumberDialogNumber);
						return true;
					}
					return false;
				}

			});

			lblPgExceed.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View arg0) {
					lblPgExceed.setVisibility(View.GONE);
					pageNumberDialogNumber.setFocusable(true);
					showKeyboard(pageNumberDialogNumber);
				}
			});

			pageNumberDialogDone.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					try {
						hideKeyboard(pageNumberDialogNumber);
						if (!pageNumberDialogNumber.getText().toString().trim().equals("") && !pageNumberDialogNumber.getText().toString().trim().equals("0") && Integer.parseInt(pageNumberDialogNumber.getText().toString()) <= core.countPages()) {
							pageNumberDialog.cancel();
							mDocView.setDisplayedViewIndex(Integer.parseInt(pageNumberDialogNumber.getText().toString()) - 1);
						} else {
							lblPgExceed.setVisibility(View.VISIBLE);
							pageNumberDialogNumber.setText("");
						}
					} catch (Exception e) {
						lblPgExceed.setVisibility(View.VISIBLE);
						pageNumberDialogNumber.setText("");
						e.printStackTrace();
					}
				}
			});
			pageNumberDialogCancel.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					pageNumberDialog.cancel();
				}
			});
			pageNumberDialog.setCancelable(false);
			pageNumberDialog.show();
			showKeyboard(pageNumberDialogNumber);
			break;

		case R.id.btnDownload:

			Utilities.makeDirectories(Variable.PUBLIC_STORAGE+"/PDF/");
			String outputFileName = Variable.PUBLIC_STORAGE+"/PDF/"+"Clinique.pdf";
			Utilities.copy(this.getApplicationContext(),downloadURL,outputFileName);

			Uri uri = Uri.parse("file://"+outputFileName);

			Intent intent = new Intent(Intent.ACTION_VIEW);
			intent.setDataAndType(uri, "application/pdf");
			intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			this.startActivity(intent);
			/*downloadManager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
			Uri Download_Uri = Uri.parse(downloadURL);
			DownloadManager.Request request = new DownloadManager.Request(Download_Uri);
			OriginalFileName = URLUtil.guessFileName(Download_Uri.toString(), null, null);

			request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI | DownloadManager.Request.NETWORK_MOBILE);
			request.setAllowedOverRoaming(false);
			request.setTitle("Clinique");
			request.setDescription(OriginalFileName);
			String state = Environment.getExternalStorageState();
			if (Environment.MEDIA_MOUNTED.equals(state)) {
				request.setDestinationInExternalFilesDir(this, null, "Clinique.pdf");// Environment.DIRECTORY_DOWNLOADS
				Log.e("Filename", URLUtil.guessFileName(Download_Uri.toString(), null, null));
				request.setDestinationInExternalPublicDir("/Clinique", URLUtil.guessFileName(Download_Uri.toString(), null, null));
				downloadReference = downloadManager.enqueue(request);
			} else {
				Utilities.AlertView(MuPDFActivity.this, getResources().getString(R.string.no_sdcard));
			}*/

			break;
		case R.id.searchText:
			mSearchText.setCursorVisible(true);
			break;

		default:
			break;
		}
	}

	class AsynTask1 extends AsyncTask<Void, Void, Void> {

		@Override
		protected void onPreExecute() {
			loading = new ProgressDialog(MuPDFActivity.this);
			loading.setMessage(getResources().getString(R.string.loading));
			loading.show();
			super.onPreExecute();
		}

		@Override
		protected Void doInBackground(Void... params) {
			try {
				bitmap = new ArrayList<Bitmap>();
				for (int i = 0; i < core.countPages(); i++) {
					Bitmap bmp = core.drawPage(i, 200, 200, 0, 0, 200, 200);
					if (bitmap != null) {
						final float densityMultiplier = getApplicationContext().getResources().getDisplayMetrics().density;
						int h = (int) (100 * densityMultiplier);
						int w = (int) (h * bmp.getWidth() / ((double) bmp.getHeight()));
						Bitmap photo = Bitmap.createScaledBitmap(bmp, w, h, true);
						bitmap.add(photo);

					}

				}
			} catch (Exception e) {
				e.printStackTrace();
			}
			return null;
		}

		@Override
		protected void onPostExecute(Void result) {
			if (loading != null) {
				loading.cancel();
			}
			Intent intent = new Intent(MuPDFActivity.this, Thumb.class);
			intent.putStringArrayListExtra("bookmark", bookmarkPages);
			startActivityForResult(intent, 1);
			super.onPostExecute(result);
		}

	}

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);

		bookmarkPages = new ArrayList<String>();
		parser = new JSONParser();

		if (core == null) {
			core = (MuPDFCore) getLastNonConfigurationInstance();
			if (savedInstanceState != null && savedInstanceState.containsKey("FileName")) {
				mFileName = savedInstanceState.getString("FileName");
				FileName = savedInstanceState.getString("FileName");
				ModuleID = savedInstanceState.getString("ModuleID");
				uid = savedInstanceState.getString("uid");
				// cid = savedInstanceState.getString("cid");
				PdfToken = savedInstanceState.getString("PdfToken");
				downloadURL = savedInstanceState.getString("downloadURL");
				Language = savedInstanceState.getString("Language");
				getBookmark = savedInstanceState.getString("getBookmark");
			}
		}
		if (core == null) {
			Intent intent = getIntent();
			if (Intent.ACTION_VIEW.equals(intent.getAction())) {
				Uri uri = intent.getData();
				FileName = uri.toString();
				mFileName = uri.toString();
				ModuleID = intent.getStringExtra(Variable.MODULE_ID);
				uid = intent.getStringExtra(Variable.U_ID);
				// cid = intent.getStringExtra(Variable.C_ID);
				PdfToken = intent.getStringExtra(Variable.PDF_TOKEN);
				downloadURL = intent.getStringExtra(Variable.PDF_URL);
				Language = intent.getStringExtra(Variable.LANGUAGE);
				getBookmark = intent.getStringExtra(Variable.BASE_URL);
				Log.e("getBookmark", getBookmark + "------------------>");
				settingLanguage(Language);

				if (uri.toString().startsWith("content://media/external/file")) {
					Cursor cursor = getContentResolver().query(uri, new String[] { "_data" }, null, null, null);
					if (cursor.moveToFirst()) {
						uri = Uri.parse(cursor.getString(0));
					}
				}
				core = openFile(Uri.decode(uri.getEncodedPath()));
				SearchTaskResult.set(null);
			}
			if (core != null && core.needsPassword()) {
				requestPassword(savedInstanceState);
				return;
			}
		}
		if (core == null) {
			// AlertDialog alert = mAlertBuilder.create();
			mAlertBuilder = new Dialog(MuPDFActivity.this);
			mAlertBuilder.requestWindowFeature(Window.FEATURE_NO_TITLE);
			mAlertBuilder.setContentView(R.layout.inflate_alert);
			mAlertBuilder.getWindow().setBackgroundDrawable(new ColorDrawable(Color.argb(0, 0, 0, 0)));

			((TextView) mAlertBuilder.findViewById(R.id.txtMessage)).setText(R.string.open_failed);
			((Button) mAlertBuilder.findViewById(R.id.btnOk)).setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					mAlertBuilder.cancel();
					finish();
				}
			});

			mAlertBuilder.show();
			return;
		}

		createUI(savedInstanceState);
	}

	void settingLanguage(String lang) {
		try {
			if (lang != null || lang != "" || lang != "en_us") {
				if (lang.contains("_")) {
					String[] split = lang.split("_");
					lang = split[0] + "-r" + split[1].toUpperCase();
				}
				Locale myLocale = null;
				if (lang.equals("zh-rCN")) {
					myLocale = Locale.SIMPLIFIED_CHINESE;
				} else if (lang.equals("zh-rTW")) {
					myLocale = Locale.TRADITIONAL_CHINESE;
				} else {
					myLocale = new Locale(lang);
				}
				Locale.setDefault(myLocale);
				Configuration config = new Configuration();
				config.locale = myLocale;
				getBaseContext().getResources().updateConfiguration(config, getBaseContext().getResources().getDisplayMetrics());
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	protected void onPause() {
		super.onPause();

		if (loading != null) {
			loading.cancel();
		}
		killSearch();

		if (mFileName != null && mDocView != null) {
			SharedPreferences prefs = getPreferences(Context.MODE_PRIVATE);
			SharedPreferences.Editor edit = prefs.edit();
			edit.putInt("page" + mFileName, mDocView.getDisplayedViewIndex());
			edit.commit();
		}
	}

	@Override
	public void onDestroy() {
		if (core != null) {
			core.onDestroy();
		}

		core = null;

		try {
			if (downloadPDFReceiver != null) {
				unregisterReceiver(downloadPDFReceiver);
				downloadPDFReceiver = null;
			}

			if (bitmap != null) {
				bitmap.clear();
				bitmap = null;
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		FileOpener.count = 0;

		super.onDestroy();
	}

	@Override
	public boolean onPrepareOptionsMenu(Menu menu) {
		if (mButtonsVisible && !mTopBarIsSearch) {
			// hideButtons();
		} else {
			showButtons();
			searchModeOff();
		}
		return super.onPrepareOptionsMenu(menu);
	}

	@Override
	public Object onRetainNonConfigurationInstance() {
		MuPDFCore mycore = core;

		core = null;
		return mycore;
	}

	@Override
	protected void onSaveInstanceState(Bundle outState) {
		super.onSaveInstanceState(outState);

		if (mFileName != null && mDocView != null) {
			outState.putString("FileName", mFileName);

			outState.putString("ModuleID", ModuleID);
			outState.putString("uid", uid);
			// outState.putString("cid", cid);
			outState.putString("downloadURL", downloadURL);
			outState.putString("Language", Language);
			outState.putString("PdfToken", PdfToken);
			outState.putString("getBookmark", getBookmark);

			// Store current page in the prefs against the file name,
			// so that we can pick it up each time the file is loaded
			// Other info is needed only for screen-orientation change,
			// so it can go in the bundle
			SharedPreferences prefs = getPreferences(Context.MODE_PRIVATE);
			SharedPreferences.Editor edit = prefs.edit();
			edit.putInt("page" + mFileName, mDocView.getDisplayedViewIndex());
			edit.commit();
		}

		if (!mButtonsVisible) {
			outState.putBoolean("ButtonsHidden", true);
		}

		if (mTopBarIsSearch) {
			outState.putBoolean("SearchMode", true);
		}
	}

	@Override
	public boolean onSearchRequested() {
		if (mButtonsVisible && mTopBarIsSearch) {
			// hideButtons();
		} else {
			showButtons();
			searchModeOn();
		}
		return super.onSearchRequested();
	}

	private MuPDFCore openFile(String path) {
		int lastSlashPos = path.lastIndexOf('/');
		mFileName = new String(lastSlashPos == -1 ? path : path.substring(lastSlashPos + 1));
		try {
			core = new MuPDFCore(path);
			// New file: drop the old outline data
			OutlineActivityData.set(null);
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
		return core;
	}

	public void requestPassword(final Bundle savedInstanceState) {
		mPasswordView = new EditText(this);
		mPasswordView.setInputType(EditorInfo.TYPE_TEXT_VARIATION_PASSWORD);
		mPasswordView.setTransformationMethod(new PasswordTransformationMethod());

		AlertDialog.Builder mBuilder = new AlertDialog.Builder(MuPDFActivity.this);
		AlertDialog alert = mBuilder.create();
		alert.setTitle(R.string.enter_password);
		alert.setView(mPasswordView);
		alert.setButton(AlertDialog.BUTTON_POSITIVE, "Ok", new DialogInterface.OnClickListener() {
			@Override
			public void onClick(DialogInterface dialog, int which) {
				if (core.authenticatePassword(mPasswordView.getText().toString())) {
					createUI(savedInstanceState);
				} else {
					requestPassword(savedInstanceState);
				}
			}
		});
		alert.setButton(AlertDialog.BUTTON_NEGATIVE, "Cancel", new DialogInterface.OnClickListener() {

			@Override
			public void onClick(DialogInterface dialog, int which) {
				finish();
			}
		});
		alert.show();
	}

	void search(final int direction, final boolean isSearchBtn) {
		hideKeyboard();
		if (core == null) {
			return;
		}
		killSearch();

		final int increment = direction;

		final int startIndex = SearchTaskResult.get() == null ? mDocView.getDisplayedViewIndex() : SearchTaskResult.get().pageNumber + increment;
		Log.e("startIndex", startIndex + "");
		final ProgressDialogX1 progressDialog = new ProgressDialogX1(this);
		progressDialog.setProgressStyle(ProgressDialog.STYLE_SPINNER);
		progressDialog.setMessage(getString(R.string.searching_));
		progressDialog.setOnCancelListener(new DialogInterface.OnCancelListener() {
			@Override
			public void onCancel(DialogInterface dialog) {
				killSearch();
			}
		});
		progressDialog.setMax(core.countPages());

		mSearchTask = new SafeAsyncTask<Void, Integer, SearchTaskResult>() {
			@Override
			protected SearchTaskResult doInBackground(Void... params) {
				int index = startIndex;

				while (0 <= index && index < core.countPages() && !isCancelled()) {
					publishProgress(index);
					RectF searchHits[] = core.searchPage(index, mSearchText.getText().toString().trim());

					if (searchHits != null && searchHits.length > 0) {
						return new SearchTaskResult(mSearchText.getText().toString().trim(), index, searchHits);
					}

					index += increment;
				}
				if (isSearchBtn) {
					int preIndex = 0;
					while (0 <= preIndex && preIndex < startIndex && !isCancelled()) {
						publishProgress(preIndex);
						RectF searchHits[] = core.searchPage(preIndex, mSearchText.getText().toString().trim());

						if (searchHits != null && searchHits.length > 0) {
							return new SearchTaskResult(mSearchText.getText().toString().trim(), preIndex, searchHits);
						}

						preIndex += increment;
					}
				}
				return null;
			}

			@Override
			protected void onCancelled() {
				super.onCancelled();
				progressDialog.cancel();
			}

			@Override
			protected void onPostExecute(SearchTaskResult result) {
				progressDialog.cancel();
				if (result != null) {
					// Ask the ReaderView to move to the resulting page
					mSearchBack.setEnabled(true);
					mSearchFwd.setEnabled(true);
					mSearchBack.getBackground().setAlpha(255);
					mSearchFwd.getBackground().setAlpha(255);
					mDocView.setDisplayedViewIndex(result.pageNumber);
					SearchTaskResult.set(result);
					// Make the ReaderView act on the change to
					// mSearchTaskResult
					// via overridden onChildSetup method.
					mDocView.resetupChildren();
				} else {
					mAlertBuilder = new Dialog(MuPDFActivity.this);
					mAlertBuilder.requestWindowFeature(Window.FEATURE_NO_TITLE);
					mAlertBuilder.setContentView(R.layout.inflate_alert);
					mAlertBuilder.getWindow().setBackgroundDrawable(new ColorDrawable(Color.argb(0, 0, 0, 0)));

					((TextView) mAlertBuilder.findViewById(R.id.txtMessage)).setText(SearchTaskResult.get() == null ? R.string.text_not_found : R.string.no_further_occurences_found);

					if (SearchTaskResult.get() == null) {
						mAlertBuilder.show();
						mSearchBack.setEnabled(false);
						mSearchFwd.setEnabled(false);
						mSearchBack.getBackground().setAlpha(155);
						mSearchFwd.getBackground().setAlpha(155);
					} else {

						if (direction == 1) {
							mSearchFwd.setEnabled(false);
							mSearchFwd.getBackground().setAlpha(155);
							mSearchBack.setEnabled(true);
							mSearchBack.getBackground().setAlpha(255);
						} else {
							mSearchBack.setEnabled(false);
							mSearchBack.getBackground().setAlpha(155);
							mSearchFwd.setEnabled(true);
							mSearchFwd.getBackground().setAlpha(255);

						}
					}

					((Button) mAlertBuilder.findViewById(R.id.btnOk)).setOnClickListener(new OnClickListener() {
						@Override
						public void onClick(View v) {
							mAlertBuilder.cancel();
						}
					});

				}
			}

			@Override
			protected void onPreExecute() {
				super.onPreExecute();
				mHandler.postDelayed(new Runnable() {
					@Override
					public void run() {
						if (!progressDialog.isCancelled()) {
							progressDialog.show();
							progressDialog.setProgress(startIndex);
						}
					}
				}, SEARCH_PROGRESS_DELAY);
			}

			@Override
			protected void onProgressUpdate(Integer... values) {
				super.onProgressUpdate(values);
				progressDialog.setProgress(values[0].intValue());
			}
		};

		mSearchTask.safeExecute();
	}

	void searchModeOff() {
		if (mTopBarIsSearch) {
			mTopBarIsSearch = false;
			hideKeyboard();
			mTopBarSwitcher.showPrevious();
			SearchTaskResult.set(null);
			// Make the ReaderView act on the change to mSearchTaskResult
			// via overridden onChildSetup method.
			mDocView.resetupChildren();
		}
	}

	void searchModeOn() {
		if (!mTopBarIsSearch) {
			mTopBarIsSearch = true;
			// Focus on EditTextWidget
			mSearchText.requestFocus();
			showKeyboard();
			mTopBarSwitcher.showNext();
		}
	}

	void showButtons() {
		if (core == null) {
			return;
		}
		if (!mButtonsVisible) {
			mButtonsVisible = true;
			// Update page number text and slider
			int index = mDocView.getDisplayedViewIndex();
			updatePageNumView(index);
			// mPageSlider.setMax((core.countPages()-1)*mPageSliderRes);
			// mPageSlider.setProgress(index*mPageSliderRes);
			if (mTopBarIsSearch) {
				mSearchText.requestFocus();
				showKeyboard();
			}

			Animation anim = new TranslateAnimation(0, 0, -mTopBarSwitcher.getHeight(), 0);
			anim.setDuration(200);
			anim.setAnimationListener(new Animation.AnimationListener() {
				@Override
				public void onAnimationEnd(Animation animation) {
				}

				@Override
				public void onAnimationRepeat(Animation animation) {
				}

				@Override
				public void onAnimationStart(Animation animation) {
					mTopBarSwitcher.setVisibility(View.VISIBLE);
				}
			});
			mTopBarSwitcher.startAnimation(anim);

			anim = new TranslateAnimation(0, 0, mPageNumberView.getHeight(), 0); // mPageSlider
			anim.setDuration(200);
			anim.setAnimationListener(new Animation.AnimationListener() {
				@Override
				public void onAnimationEnd(Animation animation) {
					mPageNumberView.setVisibility(View.VISIBLE);
				}

				@Override
				public void onAnimationRepeat(Animation animation) {
				}

				@Override
				public void onAnimationStart(Animation animation) {
					// mPageSlider.setVisibility(View.VISIBLE);
				}
			});
			mPageNumberView.startAnimation(anim);
		}
	}

	void showKeyboard() {
		InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
		if (imm != null) {
			imm.showSoftInput(mSearchText, 0);
		}
	}

	void showKeyboard(EditText edit) {
		InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
		if (imm != null) {
			imm.showSoftInput(edit, 0);
		}
	}

	void updatePageNumView(int index) {
		if (core == null) {
			return;
		}
		index += 1;

		if (bookmarkPages.contains(index + "")) {
			btnBookmark.setBackgroundResource(R.drawable.bookmark_select);
			btnBookmark.setTag("true");
		} else {
			btnBookmark.setBackgroundResource(R.drawable.bookmark);
			btnBookmark.setTag("false");
		}
		mPageNumberView.setText(String.format("%d of %d", index, core.countPages()));
		mPageNumberView.setTag(String.format("%d/%d", index, core.countPages()));
	}

}

class ProgressDialogX1 extends ProgressDialog {
	private boolean	mCancelled	= false;

	public ProgressDialogX1(Context context) {
		super(context);
	}

	@Override
	public void cancel() {
		mCancelled = true;
		super.cancel();
	}

	public boolean isCancelled() {
		return mCancelled;
	}
}

class SearchTaskResult1 {

	static public SearchTaskResult1 get() {
		return singleton;
	}

	static public void set(SearchTaskResult1 r) {
		singleton = r;
	}

	public final String				txt;

	public final int				pageNumber;

	public final RectF				searchBoxes[];

	static private SearchTaskResult1	singleton;

	SearchTaskResult1(String _txt, int _pageNumber, RectF _searchBoxes[]) {
		txt = _txt;
		pageNumber = _pageNumber;
		searchBoxes = _searchBoxes;
	}

}
