package com.photon.phresco.service;

import java.util.ArrayList;
import java.util.List;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.util.Log;

import com.JSONparser.CliniqueException;
import com.JSONparser.ErrorConstants;
import com.JSONparser.JSONParser;
import com.JSONparser.Utilities;
import com.JSONparser.Variable;
import com.clinique.phresco.hybrid.activity.MainActivity;
import com.clinique.phresco.hybrid.activity.OfflineStore;
import com.photon.phresco.db.ActivityMaintenanceDao;
import com.photon.phresco.db.AssetDao;
import com.photon.phresco.db.BookmarkDao;
import com.photon.phresco.db.FavoritesDao;
import com.photon.phresco.db.NoteDao;
import com.photon.phresco.db.QuizDao;
import com.photon.phresco.db.ScormDao;
import com.photon.phresco.db.UserBadgesDao;
import com.photon.phresco.model.ActivityMaintenance;
import com.photon.phresco.model.Asset;
import com.photon.phresco.model.Bookmark;
import com.photon.phresco.model.Favorite;
import com.photon.phresco.model.Note;
import com.photon.phresco.model.Quiz;
import com.photon.phresco.model.Scorm;
import com.photon.phresco.model.User;
import com.photon.phresco.model.UserBadges;

public class SyncBackService {
	private Activity activity;
	private JSONParser parser = new JSONParser();
	private LoginService loginService = new LoginService();

	private FavoritesDao favoritesDao = new FavoritesDao(
			MainActivity.dbStore.getMDbHelper());
	private BookmarkDao bookmarkDao = new BookmarkDao(
			MainActivity.dbStore.getMDbHelper());
	private NoteDao noteDao = new NoteDao(MainActivity.dbStore.getMDbHelper());
	private QuizDao quizDao = new QuizDao(MainActivity.dbStore.getMDbHelper());
	private ScormDao scormDao = new ScormDao(
			MainActivity.dbStore.getMDbHelper());
	private AssetDao assetDao = new AssetDao(
			MainActivity.dbStore.getMDbHelper());
	private UserBadgesDao userBadgesDao = new UserBadgesDao(
			MainActivity.dbStore.getMDbHelper());
	private ActivityMaintenanceDao activityMaintenanceDao = new ActivityMaintenanceDao(
			MainActivity.dbStore.getMDbHelper());

	private OfflineStore offlineStore = new OfflineStore();

	public void syncBackAll(int userId, Activity activity)
			throws CliniqueException, JSONException {
		this.activity = activity;
		syncBookmarks(userId, activity);
		syncNotes(userId, activity);
		syncFavorites(userId, activity);
		syncUserBadges(userId, activity);
		JSONObject jbj = new JSONObject();
		jbj.put(Variable.U_ID, userId);
		quizSync(jbj, activity);
		syncActivityCompletion(userId, activity);

	}

	public void syncBookmarks(int userId, Activity activity)
			throws CliniqueException {
		String result = null;
		JSONArray responseData = new JSONArray();
		JSONObject requestData = new JSONObject();
		JSONObject data = new JSONObject();
		JSONArray added = new JSONArray();
		JSONArray deleted = new JSONArray();
		User user = offlineStore.getUser(userId);
		try {
			requestData.put("token", user.getToken());
			requestData.put("type", "bookmark");
			List<Bookmark> bookmarks = bookmarkDao.getBookmarks(userId);
			for (Bookmark bookmark : bookmarks) {
				if (bookmark.getStatus().equals("U")) {
					if (bookmark.getAdded() != "") {
						JSONObject bookReq = new JSONObject();
						bookReq.put(Variable.MODULE_ID, bookmark.getModuleId());
						JSONArray pages = new JSONArray();
						String[] pagesArr = bookmark.getAdded().split(",");
						for (String page : pagesArr) {
							if (!"".equals(page))
								pages.put(page);
						}
						bookReq.put(Variable.PAGES, pages);
						added.put(bookReq);
					}
					if (bookmark.getDeleted() != "") {
						JSONObject bookReq = new JSONObject();
						bookReq.put(Variable.MODULE_ID, bookmark.getModuleId());
						JSONArray pages = new JSONArray();
						String[] pagesArr = bookmark.getDeleted().split(",");
						for (String page : pagesArr) {
							if (!"".equals(page))
								pages.put(page);
						}
						bookReq.put(Variable.PAGES, pages);
						bookReq.put(Variable.PAGES, pages);
						deleted.put(bookReq);
					}
				}
			}
			data.put("added", added);
			data.put("deleted", deleted);
			requestData.put("data", data);
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				result = parser.makeHttpRequest(Variable.SYNC_SERVICES_URL,
						"POST", requestData);
				responseData = new JSONArray(result);

				for (int i = 0; i < responseData.length(); i++) {
					JSONObject bookmarkObj = responseData.getJSONObject(i);
					String pageNo = "";
					Bookmark bookmark = bookmarkDao.getBookmark(userId,
							bookmarkObj.getInt(Variable.MODULE_ID));
					if (bookmark.getId() == 0) {
						bookmark = new Bookmark();
						bookmark.setModuleId(bookmarkObj
								.getInt(Variable.MODULE_ID));
						bookmark.setUserId(userId);
					}
					if (bookmarkObj.optJSONArray(Variable.PAGES) != null) {
						JSONArray pages = bookmarkObj
								.getJSONArray(Variable.PAGES);
						for (int j = 0; j < pages.length(); j++) {
							if (!"".equals(pages.getString(j)))
								pageNo += pages.getString(j) + ",";
						}
					}
					bookmark.setPageNo(pageNo);
					bookmark.setAdded("");
					bookmark.setDeleted("");
					bookmark.setStatus("S");
					// bookmark.setTimeModified(bookmarkObj.getLong(Variable.TIMEMODIFIED));
					bookmarkDao.updateBookmark(bookmark);
				}
				bookmarkDao.deleteBookmark(userId);
			}

		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	public void syncNotes(int userId, Activity activity)
			throws CliniqueException {
		String result = null;
		JSONArray responseData = new JSONArray();
		JSONObject requestData = new JSONObject();
		JSONObject data = new JSONObject();
		JSONArray added = new JSONArray();
		User user = offlineStore.getUser(userId);
		try {
			requestData.put("token", user.getToken());
			requestData.put("type", "notes");
			List<Note> notes = noteDao.getNotes(userId);
			for (Note note : notes) {
				if (note.getId() != 0 && note.getStatus().equals("U")) {
					JSONObject noteReq = new JSONObject();
					noteReq.put(Variable.MODULE_ID, note.getModuleId());
					noteReq.put(Variable.COMMENT, note.getComment());
					added.put(noteReq);
				}
			}
			data.put("added", added);
			requestData.put("data", data);
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				result = parser.makeHttpRequest(Variable.SYNC_SERVICES_URL,
						"POST", requestData);
				responseData = new JSONArray(result);

				for (int i = 0; i < responseData.length(); i++) {
					JSONObject noteObj = responseData.getJSONObject(i);
					Note note = noteDao.getNote(userId,
							noteObj.getInt(Variable.MODULE_ID));
					if (note.getId() == 0) {
						note = new Note();
						note.setModuleId(noteObj.getInt(Variable.MODULE_ID));
						note.setUserId(userId);
					}
					note.setComment(noteObj.getString(Variable.COMMENT));
					note.setStatus("S");
					// note.setTimeModified(noteObj.getLong(Variable.TIMEMODIFIED));
					noteDao.updateNote(note);
				}
			}

		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	public void syncFavorites(int userId, Activity activity)
			throws CliniqueException {
		String result = null;
		JSONArray responseData = new JSONArray();
		JSONObject requestData = new JSONObject();
		JSONObject data = new JSONObject();
		JSONArray added = new JSONArray();
		JSONArray deleted = new JSONArray();
		User user = offlineStore.getUser(userId);
		try {
			requestData.put("token", user.getToken());
			requestData.put("type", "favorite");
			List<Favorite> favorites = favoritesDao.getFavorites(userId);
			for (Favorite favorite : favorites) {
				if (favorite.getId() != 0) {
					if (favorite.getStatus().equals("U")) {
						JSONObject favoriteReq = new JSONObject();
						JSONObject favoriteObj = new JSONObject(
								favorite.getJson());
						favoriteReq.put(Variable.MODULE_ID,
								favorite.getModuleId());
						favoriteReq.put("course_type",
								favoriteObj.getString("course_type"));
						favoriteReq.put("file_name",
								favoriteObj.getString("file_name"));
						favoriteReq.put("file_type",
								favoriteObj.getString("file_type"));
						favoriteReq.put("fname_upload",
								favoriteObj.getString("fname_upload"));
						favoriteReq.put("url", favoriteObj.getString("url"));
						added.put(favoriteReq);
					} else if (favorite.getStatus().equals("D")) {
						JSONObject favoriteReq = new JSONObject();
						JSONObject favoriteObj = new JSONObject(
								favorite.getJson());
						favoriteReq.put(Variable.MODULE_ID,
								favorite.getModuleId());
						favoriteReq.put("course_type",
								favoriteObj.getString("course_type"));
						favoriteReq.put("file_name",
								favoriteObj.getString("file_name"));
						favoriteReq.put("file_type",
								favoriteObj.getString("file_type"));
						favoriteReq.put("fname_upload",
								favoriteObj.getString("fname_upload"));
						favoriteReq.put("url", favoriteObj.getString("url"));
						deleted.put(favoriteReq);
					}
				}
			}
			data.put("added", added);
			data.put("deleted", deleted);
			requestData.put("data", data);
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				result = parser.makeHttpRequest(Variable.SYNC_SERVICES_URL,
						"POST", requestData);
				responseData = new JSONArray(result);

				for (int i = 0; i < responseData.length(); i++) {
					JSONObject favorite = responseData.getJSONObject(i);
					Favorite favoriteObj = favoritesDao.getFavorite(userId,
							favorite.getInt(Variable.MODULE_ID));
					if (favoriteObj.getId() == 0) {
						favoriteObj = new Favorite();
					}
					favoriteObj.setUserId(userId);
					favoriteObj
							.setModuleId(favorite.getInt(Variable.MODULE_ID));
					favoriteObj.setJson(favorite.toString());
					favoriteObj.setStatus("S");
					// favoriteObj.setTimeModified(favorite.getLong(Variable.TIMEMODIFIED));
					favoritesDao.updateFavorite(favoriteObj);
				}

				favoritesDao.deleteFavorite(userId);
			}

		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	public void syncUserBadges(int userId, Activity activity)
			throws CliniqueException {
		String result = null;
		JSONObject responseData = new JSONObject();
		JSONObject requestData = new JSONObject();
		JSONObject data = new JSONObject();
		JSONArray added = new JSONArray();
		User user = offlineStore.getUser(userId);
		try {
			requestData.put("token", user.getToken());
			requestData.put("type", "badges");
			UserBadges userBadges = userBadgesDao.getUserBadges(userId);
			if (userBadges.getId() != 0 && userBadges.getStatus().equals("U")) {
				added = new JSONArray(userBadges.getAdded());
			}
			data.put("added", added);
			requestData.put("data", data);
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				result = parser.makeHttpRequest(Variable.SYNC_SERVICES_URL,
						"POST", requestData);
				responseData = new JSONObject(result);

				if (userBadges.getId() == 0) {
					userBadges = new UserBadges();
				}
				added = new JSONArray();
				if (responseData.optJSONArray("userbadges") != null) {
					added = responseData.getJSONArray("userbadges");
				}
				userBadges.setAdded((new JSONArray()).toString());
				userBadges.setBadges(added.toString());
				userBadges.setStatus("S");
				userBadges.setUserId(user.getUserId());
				userBadgesDao.updateUserBadges(userBadges);
			}

		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	public void syncActivityCompletion(int userId, Activity activity)
			throws CliniqueException {
		String result = null;
		JSONObject responseData = new JSONObject();
		JSONObject requestData = new JSONObject();
		JSONArray data = new JSONArray();
		JSONObject comple = new JSONObject();
		JSONArray added = new JSONArray();
		User user = offlineStore.getUser(userId);
		try {
			requestData.put("token", user.getToken());
			requestData.put("type", "completion");
			List<ActivityMaintenance> activities = activityMaintenanceDao
					.getCompletionStatus(userId);

			for (ActivityMaintenance activityMain :activities ) {
				if ("C".equals(activityMain.getStatus())) {
					JSONObject jbj = new JSONObject();
					jbj.put("id", activityMain.getModuleId());
					added.put(jbj);
				}
			}

			comple.put("completion_tracking", added);
			data.put(comple);
			requestData.put("data", data);
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				result = parser.makeHttpRequest(Variable.SYNC_SERVICES_URL,
						"POST", requestData);
				responseData = new JSONObject(result);
				if ( (responseData.opt("error") != null && !"false"
								.equals(responseData.getString("error")))) {
					throw new CliniqueException(ErrorConstants.ERR_10001,
							ErrorConstants.ERR10007);
				} else if (responseData.optJSONObject("response") != null) {
					responseData = responseData.getJSONObject("response");
					if(responseData.optJSONArray("completed_modules")!=null){
						added = responseData.getJSONArray("completed_modules");
						for (int i = 0; i < added.length(); i++) {
							int moduleId = added.getInt(i);
							ActivityMaintenance activityMain = activityMaintenanceDao
									.getCompletionStatus(userId,moduleId);
							if(activityMain.getId()==0){
								activityMain = new ActivityMaintenance();
								activityMain.setModuleId(moduleId);
								activityMain.setUserId(userId);
								activityMain.setIsCompletion(1);
							}
							activityMain.setStatus("S");
							activityMaintenanceDao.updateCompletionStatus(activityMain);
						}
					}
				}
			}

		} catch (JSONException e) {
			e.printStackTrace();
		}
	}

	public JSONObject getDeltaSyncData(User user) throws CliniqueException {
		JSONObject result = null;
		String url;
		try {

			List<NameValuePair> param = new ArrayList<NameValuePair>();
			param.add(new BasicNameValuePair(Variable.TOKEN, user.getToken()));
			Log.d("TOKEN:", user.getToken());
			Log.d("server_time:", user.getServerTime() + "");
			param.add(new BasicNameValuePair(Variable.FROM, user
					.getServerTime() + ""));
			param.add(new BasicNameValuePair(Variable.ACTION,
					"complete_user_data"));
			url = Variable.SERVICES_URL;
			result = parser.makeHttpRequest(url, "POST", param);
			Log.d("result:>>", result.toString());
		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10001,
					e.getLocalizedMessage());
		}
		return result;
	}

	public String deltaSync(JSONObject jbj, Activity activity)
			throws JSONException, CliniqueException {
		JSONObject responseData = new JSONObject();
		JSONObject onlineJson = new JSONObject();
		try {
			this.activity = activity;
			int userId = jbj.getInt(Variable.U_ID);
			User user = offlineStore.getUser(userId);
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				onlineJson = getDeltaSyncData(user);
				if (onlineJson == null
						|| (onlineJson.optString("error") != null && !"false"
								.equals(onlineJson.getString("error")))) {
					throw new CliniqueException(ErrorConstants.ERR_10003,
							ErrorConstants.ERR10003);
				}
				onlineJson = onlineJson.getJSONObject("response");
				if (newContentExists(onlineJson)) {
					responseData.put("NEW_CONTENT", "Y");
				} else {
					syncBackAll(userId, activity);
					JSONObject offlineJson = new JSONObject();
					loginService.copyOnlineToOfflineJson(offlineJson,
							onlineJson);
					user.setOfflineJson(offlineJson.toString());
					offlineStore.updateUser(user);
					loginService.processOnlineJson(user, onlineJson, true);
					responseData.put("NEW_CONTENT", "N");
				}
			} else {
				responseData.put("NEW_CONTENT", "N");
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10007,
					ErrorConstants.ERR10007);
		}
		return responseData.toString();
	}

	public boolean newContentExists(JSONObject onlineJson) throws JSONException {
		if (onlineJson.optJSONArray("courses") != null
				&& onlineJson.getJSONArray("courses").length() > 0) {
			return true;
		} else if (onlineJson.optJSONArray("topics") != null
				&& onlineJson.getJSONArray("topics").length() > 0) {
			return true;
		} else if (onlineJson.optJSONArray("modules") != null
				&& onlineJson.getJSONArray("modules").length() > 0) {
			return true;
		}

		if (onlineJson.optJSONObject("news") != null) {
			JSONObject news = onlineJson.getJSONObject("news");

			if (news.optJSONArray("courses") != null
					&& news.getJSONArray("courses").length() > 0) {
				return true;
			} else if (news.optJSONArray("topics") != null
					&& news.getJSONArray("topics").length() > 0) {
				return true;
			} else if (news.optJSONArray("modules") != null
					&& news.getJSONArray("modules").length() > 0) {
				return true;
			}
		}
		JSONObject resources = onlineJson.getJSONObject("resources");

		if (resources.optJSONArray("courses") != null
				&& resources.getJSONArray("courses").length() > 0) {
			return true;
		} else if (resources.optJSONArray("topics") != null
				&& resources.getJSONArray("topics").length() > 0) {
			return true;
		} else if (resources.optJSONArray("modules") != null
				&& resources.getJSONArray("modules").length() > 0) {
			return true;
		}
		return false;
	}

	public String manualSync(JSONObject jbj, MainActivity activity)
			throws JSONException, CliniqueException {
		String result = null;
		JSONObject onlineJson = new JSONObject();
		List<Asset> userAssets = new ArrayList<Asset>();
		List count = new ArrayList();
		try {
			int userId = jbj.getInt(Variable.U_ID);

			User user = offlineStore.getUser(userId);
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				syncBackAll(userId, activity);
				onlineJson = getDeltaSyncData(user);
				if (onlineJson == null
						|| (onlineJson.optString("error") != null && !"false"
								.equals(onlineJson.getString("error")))) {
					throw new CliniqueException(ErrorConstants.ERR_10003,
							ErrorConstants.ERR10003);
				}
				onlineJson = onlineJson.getJSONObject("response");
				JSONObject offlineJson = new JSONObject();
				loginService.copyOnlineToOfflineJson(offlineJson, onlineJson);
				user.setOfflineJson(offlineJson.toString());
				offlineStore.updateUser(user);
				loginService.processOnlineJson(user, onlineJson, true);
				if (!onlineJson.isNull("server_time")) {
					user.setServerTime(onlineJson.getLong("server_time"));
				}
				offlineStore.updateUser(user);
			} else {
				throw new CliniqueException(ErrorConstants.ERR_10008,
						ErrorConstants.ERR10008);
			}
			userAssets = loginService.collectDownloadAssets(user, count);

			if (userAssets.size() > 0) {
				if (Utilities.hasActiveInternetConnection(activity
						.getApplicationContext())) {
					String[] downLoadParams = new String[1];
					DownloadOnlineAsset download = new DownloadOnlineAsset(
							userAssets, user);
					download.setActivity(activity);
					download.setAlreadyDownloaded(count.size());
					download.execute(downLoadParams);
					for (Asset asset : userAssets) {
						asset.setUpdateRequired(Variable.STATUS_C);
						assetDao.updateAssetStatus(asset);
					}
				} else {
					throw new CliniqueException(ErrorConstants.ERR_10008,
							ErrorConstants.ERR10008);
				}
			} else {
				activity.sendJavascript("noContent_HideProgres();");
			}
		} catch (CliniqueException e) {
			e.printStackTrace();
			activity.sendJavascript("progressFailiure("
					+ Utilities.buildErrorResponse(e.getErrorCode(),
							e.getLocalizedMessage()) + ");");
		}
		return result;
	}

	public synchronized String quizSync(JSONObject jbj, Activity activity)
			throws JSONException, CliniqueException {
		String result = "";

		JSONObject requestData = new JSONObject();
		JSONArray data = new JSONArray();
		JSONObject quizRequest = new JSONObject();
		JSONArray quizListRequest = new JSONArray();
		JSONObject quizJson = new JSONObject();
		try {
			int userId = jbj.getInt(Variable.U_ID);
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				User user = offlineStore.getUser(userId);

				requestData.put("token", user.getToken());
				requestData.put("type", "quiz");
				requestData.put("sesskey", "h5yQqojxpC");
				List<Quiz> quizzes = quizDao.getQuizzes(userId);

				for (Quiz quiz : quizzes) {

					if (quiz.getId() != 0) {
						data = new JSONArray();
						quizRequest = new JSONObject();
						quizListRequest = new JSONArray();
						quizJson = new JSONObject(quiz.getValue());

						if (quizJson.optJSONArray(Variable.QUIZLIST) != null) {

							JSONArray quizListArray = quizJson
									.getJSONArray(Variable.QUIZLIST);

							for (int j = 0; j < quizListArray.length(); j++) {

								JSONObject quizList = quizListArray
										.getJSONObject(j);

								if (quizList.optJSONArray("attempts") != null
										&& quizList.getJSONArray("attempts")
												.length() > 0) {
									JSONObject quizAttempt = quizList
											.getJSONArray("attempts")
											.getJSONObject(0);

									if (quizAttempt.optString("state") != null
											&& "finished"
													.equalsIgnoreCase(quizAttempt
															.getString("state")) ) {
										quizListRequest.put(quizList);
									}
								}
							}
						}
						if (quizListRequest.length() > 0) {
							if (quizJson.optJSONArray(Variable.QUIZINFO) != null) {

								JSONArray quizInfoArray = quizJson
										.getJSONArray(Variable.QUIZINFO);

								quizRequest.put(Variable.QUIZINFO,
										quizInfoArray);

								quizRequest.put(Variable.QUIZLIST,
										quizListRequest);
								JSONObject info = quizInfoArray
										.getJSONObject(0);

								data.put(quizRequest);
								requestData.put("data", data);
								quizServiceUpdate(requestData, userId,
										info.getInt("course"),
										info.getInt("modid"));
							}
						}
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10007,
					ErrorConstants.ERR10007);
		}
		return result;
	}

	public void quizServiceUpdate(JSONObject requestData, int userId,
			int courseId, int modId) throws JSONException, CliniqueException {
		String result = null;
		JSONObject responseData = new JSONObject();
		JSONArray data = new JSONArray();
		JSONObject quizJson = new JSONObject();
		JSONObject quizUpdated = new JSONObject();

		try {
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				Log.d("requestData-->",requestData.toString());
				result = parser.makeHttpRequest(Variable.SYNC_SERVICES_URL,
						"POST", requestData);
				responseData = new JSONObject(result);
				if (responseData == null
						|| (responseData.opt("error") != null && !"false"
								.equals(responseData.getString("error")))) {

					throw new CliniqueException(ErrorConstants.ERR_10007,
							ErrorConstants.ERR10007);

				} else if (responseData.optJSONObject("response") != null) {
					responseData = responseData.getJSONObject("response");

					if (responseData.optJSONArray("data") != null) {
						data = responseData.getJSONArray("data");
						if (data.length() > 0) {
							quizJson = data.getJSONObject(0);
							Quiz quiz = quizDao
									.getQuiz(userId, courseId, modId);
							if (quiz.getId() != 0) {
								quizUpdated = new JSONObject(quiz.getValue());
							}
							if (quizJson.optJSONArray(Variable.QUIZLIST) != null) {

								JSONArray quizListArray = quizJson
										.getJSONArray(Variable.QUIZLIST);

								for (int j = 0; j < quizListArray.length(); j++) {

									JSONObject quizList = quizListArray
											.getJSONObject(j);
									if (quizList.optJSONArray("attempts") != null
											&& quizList
													.getJSONArray("attempts")
													.length() > 0) {
										JSONObject quizAttempt = quizList
												.getJSONArray("attempts")
												.getJSONObject(0);

										if (quizAttempt.optString("state") != null
												&& quizAttempt
														.optString("sumgrades") != null) {
											quizUpdateAtttempt(quizUpdated,
													quizAttempt);

										}
									}
								}
							}
							quiz.setValue(quizUpdated.toString());
							quizDao.updateQuiz(quiz);
						}
					}
				}
			}
		} catch (CliniqueException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10007,
					ErrorConstants.ERR10007);
		}
	}

	public JSONObject quizUpdateAtttempt(JSONObject quizJson, JSONObject attempt)
			throws JSONException, CliniqueException {
		JSONObject result = new JSONObject();
		try {

			if (quizJson.optJSONArray(Variable.QUIZLIST) != null) {
				JSONArray quizListArray = quizJson
						.getJSONArray(Variable.QUIZLIST);

				for (int j = 0; j < quizListArray.length(); j++) {

					JSONObject quizList = quizListArray.getJSONObject(j);

					if (quizList.optJSONArray("attempts") != null
							&& quizList.getJSONArray("attempts").length() > 0) {
						JSONObject quizAttempt = quizList.getJSONArray(
								"attempts").getJSONObject(0);

						if (quizAttempt.optString("attempt") != null
								&& quizAttempt.getString("attempt").equals(
										attempt.getString("attempt"))) {
							quizAttempt
									.put("state", attempt.getString("state"));
							if (quizAttempt.opt("sumgrades") != null) {
								try{
								quizAttempt.put("sumgrades",
										attempt.getDouble("sumgrades"));
								quizAttempt.put("rowid",
										attempt.getInt("rowid"));
								}catch(Exception e){
									e.printStackTrace();
								}
								
							}
							
							}						
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10007,
					ErrorConstants.ERR10007);
		}
		return result;
	}

	public String scormSync(JSONObject jbj, Activity activity)
			throws JSONException, CliniqueException {
		String result = "";

		JSONObject requestData = new JSONObject();
		JSONArray data = new JSONArray();
		JSONObject scormJson = new JSONObject();
		try {
			int userId = jbj.getInt(Variable.U_ID);
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				User user = offlineStore.getUser(userId);

				requestData.put("token", user.getToken());
				requestData.put("type", "scorm");
				List<Scorm> scorms = scormDao.getScorms(userId);

				for (Scorm scorm : scorms) {

					if (scorm.getUserId() != 0) {
						data = new JSONArray();
						scormJson = new JSONObject(scorm.getValue());
						data.put(scormJson);
						requestData.put("data", data);
						quizServiceUpdate(requestData, userId,
								scorm.getCourseId(), scorm.getModId());
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10007,
					ErrorConstants.ERR10007);
		}
		return result;
	}

	public void scormServiceUpdate(JSONObject requestData, int userId,
			int courseId, int modId) throws JSONException, CliniqueException {
		String result = null;
		JSONObject responseData = new JSONObject();
		try {
			result = parser.makeHttpRequest(Variable.SYNC_SERVICES_URL, "POST",
					requestData);
			responseData = new JSONObject(result);
			if (responseData == null
					|| (responseData.opt("error") != null && !"false"
							.equals(responseData.getString("error")))) {

				throw new CliniqueException(ErrorConstants.ERR_10007,
						ErrorConstants.ERR10007);

			} else if (responseData.optJSONObject("response") != null) {
				responseData = responseData.getJSONObject("response");

			}
		} catch (CliniqueException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10007,
					ErrorConstants.ERR10007);
		}
	}

}
