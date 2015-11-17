package com.photon.phresco.service;

import java.net.URLDecoder;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

import com.JSONparser.CliniqueException;
import com.JSONparser.ErrorConstants;
import com.JSONparser.JSONParser;
import com.JSONparser.Utilities;
import com.JSONparser.Variable;
import com.photon.phresco.db.ActivityMaintenanceDao;
import com.photon.phresco.db.AssetDao;
import com.photon.phresco.db.BookmarkDao;
import com.photon.phresco.db.CategoriesDao;
import com.photon.phresco.db.CoursesDao;
import com.photon.phresco.db.DependentActivityDao;
import com.photon.phresco.db.FavoritesDao;
import com.photon.phresco.db.LookupDao;
import com.photon.phresco.db.ModuleDao;
import com.photon.phresco.db.NoteDao;
import com.photon.phresco.db.PlayersDao;
import com.photon.phresco.db.ProgressDao;
import com.photon.phresco.db.QuizDao;
import com.photon.phresco.db.TopicsDao;
import com.photon.phresco.db.UserBadgesDao;
import com.photon.phresco.db.UserMappingDao;
import com.photon.phresco.hybrid.activity.MainActivity;
import com.photon.phresco.hybrid.activity.OfflineStore;
import com.photon.phresco.model.ActivityMaintenance;
import com.photon.phresco.model.Asset;
import com.photon.phresco.model.Bookmark;
import com.photon.phresco.model.Category;
import com.photon.phresco.model.Course;
import com.photon.phresco.model.DependentActivity;
import com.photon.phresco.model.Favorite;
import com.photon.phresco.model.Lookup;
import com.photon.phresco.model.Module;
import com.photon.phresco.model.Note;
import com.photon.phresco.model.Player;
import com.photon.phresco.model.Progress;
import com.photon.phresco.model.Quiz;
import com.photon.phresco.model.Topics;
import com.photon.phresco.model.User;
import com.photon.phresco.model.UserBadges;
import com.photon.phresco.model.UserMapping;

public class LoginService {
	private JSONParser parser = new JSONParser();
	private CoursesDao courseDao = new CoursesDao(
			MainActivity.dbStore.getMDbHelper());
	private CategoriesDao categoriesDao = new CategoriesDao(
			MainActivity.dbStore.getMDbHelper());
	private TopicsDao topicsDao = new TopicsDao(
			MainActivity.dbStore.getMDbHelper());
	private ModuleDao moduleDao = new ModuleDao(
			MainActivity.dbStore.getMDbHelper());
	private AssetDao assetDao = new AssetDao(
			MainActivity.dbStore.getMDbHelper());
	private UserMappingDao userMappingDao = new UserMappingDao(
			MainActivity.dbStore.getMDbHelper());
	private FavoritesDao favoritesDao = new FavoritesDao(
			MainActivity.dbStore.getMDbHelper());

	private ProgressDao progressDao = new ProgressDao(
			MainActivity.dbStore.getMDbHelper());
	private BookmarkDao bookmarkDao = new BookmarkDao(
			MainActivity.dbStore.getMDbHelper());
	private NoteDao noteDao = new NoteDao(MainActivity.dbStore.getMDbHelper());
	private QuizDao quizDao = new QuizDao(MainActivity.dbStore.getMDbHelper());

	private PlayersDao playersDao = new PlayersDao(
			MainActivity.dbStore.getMDbHelper());

	private LookupDao lookupDao = new LookupDao(
			MainActivity.dbStore.getMDbHelper());

	private UserBadgesDao userBadgesDao = new UserBadgesDao(
			MainActivity.dbStore.getMDbHelper());

	private DependentActivityDao dependentActivityDao = new DependentActivityDao(
			MainActivity.dbStore.getMDbHelper());
	private ActivityMaintenanceDao activityMaintenanceDao = new ActivityMaintenanceDao(
			MainActivity.dbStore.getMDbHelper());

	private MainActivity activity;

	private OfflineStore offlineStore = new OfflineStore();

	public JSONObject validateLogin(User user) throws CliniqueException {
		JSONObject result = null;
		try {

			List<NameValuePair> param = new ArrayList<NameValuePair>();

			param.add(new BasicNameValuePair(Variable.USERNAME, user
					.getUsername()));
			param.add(new BasicNameValuePair(Variable.PASSWORD, user
					.getPassword()));
			param.add(new BasicNameValuePair(Variable.SERVICE,
					"moodle_mobile_app"));
			param.add(new BasicNameValuePair(Variable.ACTION, "login"));
			result = parser.makeHttpRequest(Variable.SERVICES_URL, "POST",
					param);

		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10002,
					ErrorConstants.ERR10002);
		}
		return result;
	}

	public JSONObject getUserSyncData(int userId, String token)
			throws CliniqueException {
		JSONObject result = null;
		String url;
		try {

			List<NameValuePair> param = new ArrayList<NameValuePair>();
			param.add(new BasicNameValuePair(Variable.TOKEN, token));
			param.add(new BasicNameValuePair(Variable.ACTION,
					"complete_user_data"));
			url = Variable.SERVICES_URL;
			result = parser.makeHttpRequest(url, "POST", param);

		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10007,
					e.getLocalizedMessage());
		}
		Log.d("result", result.toString());
		return result;
	}

	public String getSecureDetails(JSONObject jbj, MainActivity activity)
			throws CliniqueException {
		JSONObject result = new JSONObject();
		User user;
		try {
			if (Utilities.hasActiveInternetConnection(activity
					.getApplicationContext())) {
				int userId = jbj.getInt(Variable.USERID);
				user = offlineStore.getUser(userId);
				result.put("username", user.getUsername());
				result.put("pass", user.getPass());
			} else {
				throw new CliniqueException(ErrorConstants.ERR_10001,
						ErrorConstants.ERR10001);
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10001,
					e.getLocalizedMessage());
		}
		return result.toString();
	}

	public JSONObject firstLaunchSync(MainActivity activity, int userId)
			throws CliniqueException {
		User user;
		try {
			this.activity = activity;
			userDataSync(userId);
			downloadContentSync(userId);
			user = offlineStore.getUser(userId);
			user.setFirstTime(1);
			offlineStore.updateUser(user);
		} catch (CliniqueException e) {
			activity.sendJavascript("progressFailiure("
					+ Utilities.buildErrorResponse(e.getErrorCode(),
							e.getLocalizedMessage()) + ");");
		}

		return null;
	}

	public boolean userDataSync(int userId) throws CliniqueException {
		JSONObject onlineJson;
		JSONObject jbj;
		User user;
		boolean success = false;
		try {
			user = offlineStore.getUser(userId);
			jbj = getUserSyncData(user.getUserId(), user.getToken());
			if (jbj == null
					|| (jbj.opt("error") != null && !"false".equals(jbj
							.getString("error")))) {
				throw new CliniqueException(ErrorConstants.ERR_10007,
						ErrorConstants.ERR10007);
			}
			onlineJson = jbj.getJSONObject("response");
			JSONObject offlineJson = new JSONObject();
			copyOnlineToOfflineJson(offlineJson, onlineJson);
			user.setOfflineJson(offlineJson.toString());
			if (!onlineJson.isNull("server_time")) {
				user.setServerTime(onlineJson.getLong("server_time"));
			}
			offlineStore.updateUser(user);
			processOnlineJson(user, onlineJson, false);
			success = true;
		} catch (CliniqueException e) {
			e.printStackTrace();
			throw new CliniqueException(e.getErrorCode(),
					e.getLocalizedMessage());
		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR_10001,
					e.getLocalizedMessage());
		}
		return success;
	}

	public boolean downloadContentSync(int userId) throws CliniqueException {
		User user;
		boolean success = false;
		try {
			user = offlineStore.getUser(userId);
			success = downloadAttachments(user);
		} catch (CliniqueException e) {
			throw new CliniqueException(e.getErrorCode(),
					e.getLocalizedMessage());
		}
		return success;
	}

	public List<Asset> collectDownloadAssets(User user, List count) {
		int userId = user.getUserId();
		int assetId;
		int courseId;
		List<Asset> userAssets = new ArrayList<Asset>();
		List<Asset> courseAssets = new ArrayList<Asset>();
		List<Asset> staticAssets = new ArrayList<Asset>();

		List<UserMapping> userMappings = userMappingDao.getUserMappings(userId,
				Variable.USER_MAPPING_GROUP_ASSET);
		for (int i = 0; i < userMappings.size(); i++) {
			UserMapping userMapping = userMappings.get(i);
			assetId = userMapping.getReferenceId();
			Asset asset = assetDao.getAsset(assetId);
			if (asset.getUpdateRequired().contains(Variable.STATUS_Y)) {
				userAssets.add(asset);
			} else if (asset.getUpdateRequired().contains(Variable.STATUS_S)) {
				count.add("");
			}
		}
		userMappings = userMappingDao.getUserMappings(userId,
				Variable.USER_MAPPING_GROUP_COURSE);
		for (int i = 0; i < userMappings.size(); i++) {
			UserMapping userMapping = userMappings.get(i);
			courseId = userMapping.getReferenceId();
			courseAssets = assetDao.getAllAssets(courseId,
					Variable.ASSET_GROUP_SUMMARY_TAG,
					Variable.SUMMARY_IMAGE_DOWNLOAD_TAG);
			for (Asset asset : courseAssets) {
				if (asset.getUpdateRequired().contains(Variable.STATUS_Y)) {
					userAssets.add(asset);
				} else if (asset.getUpdateRequired()
						.contains(Variable.STATUS_S)) {
					count.add("");
				}
			}
		}

		staticAssets = assetDao.getAllAssets(Variable.ASSET_GROUP_LINKS,
				Variable.PRIVACY_DOWNLOAD_TAG);
		staticAssets.addAll(assetDao.getAllAssets(Variable.ASSET_GROUP_LINKS,
				Variable.TERMS_DOWNLOAD_TAG));
		for (int i = 0; i < staticAssets.size(); i++) {
			Asset asset = staticAssets.get(i);
			if (asset.getUpdateRequired().contains(Variable.STATUS_Y)) {
				userAssets.add(asset);
			} else if (asset.getUpdateRequired().contains(Variable.STATUS_S)) {
				count.add("");
			}
		}
		return userAssets;
	}

	public boolean downloadAttachments(User user) throws CliniqueException {
		boolean success = false;
		String[] downLoadParams;
		List<Asset> userAssets = new ArrayList<Asset>();
		List count = new ArrayList();
		try {
			userAssets = collectDownloadAssets(user, count);
			if (userAssets.size() > 0) {
				downLoadParams = new String[1];
				if (Utilities.hasActiveInternetConnection(activity
						.getApplicationContext())) {
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
			}
			success = true;
			Log.d("download completed", "");
		} catch (CliniqueException e) {
			throw new CliniqueException(e.getErrorCode(),
					e.getLocalizedMessage());
		}
		return success;
	}

	public void processOnlineJson(User user, JSONObject onlineJson,
			boolean isDeltaSync) throws CliniqueException, JSONException {
		if (onlineJson != null) {
			try {

				validateAvailableSpace(onlineJson);

				processCategoriesData(onlineJson);

				processSubCategoryCoursesData(onlineJson, user, isDeltaSync);

				processTopicsData(onlineJson, user, 2, isDeltaSync);

				processFavoritesData(onlineJson, user);

				processBookmarksData(onlineJson, user);

				processNotesData(onlineJson, user);

				processModulesData(onlineJson, user, isDeltaSync);

				processProgressData(onlineJson, user);

				processPlayersData(onlineJson, user);

				processBadgesData(onlineJson, user);

				// processNewsData(onlineJson, user,isDeltaSync);

				processResourcesData(onlineJson, user, isDeltaSync);

				processDependentActivities(onlineJson, user);

				processDeletionData(onlineJson, user);

				processQuizSyncData(onlineJson, user);

				processStaticLinkDownload();

			} catch (CliniqueException e) {
				e.printStackTrace();
				throw new CliniqueException(e.getErrorCode(),
						e.getLocalizedMessage());
			}
		}
	}

	private void validateAvailableSpace(JSONObject onlineJson)
			throws JSONException, CliniqueException {
		if (onlineJson.optString("contentsize") != null) {
			String contentSize = onlineJson.getString("contentsize");
			Log.d("contentSize:", contentSize + "");
			long size = 0;
			long availableSize = Utilities.getAvailableSpaceInMB();
			List<Asset> staticAssets = assetDao.getAllAssets(
					Variable.ASSET_GROUP_LINKS, Variable.PRIVACY_DOWNLOAD_TAG);
			if (staticAssets.size() > 0) {
				Asset asset = staticAssets.get(0);
				if (Variable.STATUS_C.equals(asset.getUpdateRequired())) {
					size = 5;
				}
			}
			if (contentSize.length() > 2) {
				contentSize = contentSize
						.substring(0, contentSize.length() - 2);
				if (contentSize.indexOf(".") != -1) {
					contentSize = contentSize.substring(0,
							contentSize.indexOf("."));
					size += Long.parseLong(contentSize) + 1;
				} else {
					size += Long.parseLong(contentSize);
				}
				// size = 2478766;
			}

			if (size > availableSize) {
				throw new CliniqueException(ErrorConstants.ERR_10009, size
						- availableSize + " MB");
			}
		}
	}

	public void processStaticLinkDownload() {
		String[] languages = Variable.languages;
		int i = 0;
		Asset asset = new Asset();
		for (String lang : languages) {
			asset = assetDao.getAsset(lang, Variable.ASSET_GROUP_LINKS,
					Variable.PRIVACY_DOWNLOAD_TAG);
			if (asset.getId() == 0) {
				asset = new Asset();
				asset.setAssetGroup(Variable.ASSET_GROUP_LINKS);
				asset.setReferenceId(i);
				asset.setIndex(lang);
				asset.setUrlKey(Variable.PRIVACY_DOWNLOAD_TAG);
				asset.setOnlineUrl(Variable.DOC_DOWNLOAD_URL + lang + "/"
						+ Variable.PRIVACY_DOC_NAME + "_" + lang + ".docx");
				asset.setFileType("doc");
				asset.setAssetSize(0);
				asset.setAssetName(Variable.PRIVACY_DOWNLOAD_TAG + "_" + lang
						+ ".docx");
				asset.setOfflineUrl("");
				asset.setUpdateRequired(Variable.STATUS_Y);
				assetDao.updateAsset(asset);
			}

			asset = assetDao.getAsset(lang, Variable.ASSET_GROUP_LINKS,
					Variable.TERMS_DOWNLOAD_TAG);
			if (asset.getId() == 0) {
				asset.setAssetGroup(Variable.ASSET_GROUP_LINKS);
				asset.setReferenceId(i);
				asset.setIndex(lang);
				asset.setUrlKey(Variable.TERMS_DOWNLOAD_TAG);
				asset.setOnlineUrl(Variable.DOC_DOWNLOAD_URL + lang + "/"
						+ Variable.TERMS_DOC_NAME + "_" + lang + ".docx");
				asset.setFileType("doc");
				asset.setAssetSize(0);
				asset.setAssetName(Variable.TERMS_DOWNLOAD_TAG + "_" + lang
						+ ".docx");
				asset.setOfflineUrl("");
				asset.setUpdateRequired(Variable.STATUS_Y);
				assetDao.updateAsset(asset);
			}
			i++;
		}

	}

	public void copyOnlineToOfflineJson(JSONObject offlineJson,
			JSONObject onlineJson) throws JSONException {
		Log.d("copyOnlineToOfflineJson:", onlineJson.getJSONObject("user")
				.toString());
		offlineJson.put("user", onlineJson.getJSONObject("user"));
	}

	public String getCategories(JSONObject jbj) throws CliniqueException {
		JSONArray categoryJsonArray = new JSONArray();
		JSONObject categoryJson = new JSONObject();
		try {
			List<Category> categories = categoriesDao.getAllCategories();
			for (Category category : categories) {

				categoryJson = new JSONObject(category.getJson());

				categoryJsonArray.put(categoryJson);
			}
		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					ErrorConstants.ERR10001);
		}
		return categoryJsonArray.toString();
	}

	public String getCoursesData(JSONObject jbj) throws CliniqueException {
		JSONArray courseJsonArray = new JSONArray();
		String courseIds = "";
		String summary;
		Asset asset;
		User user;
		JSONArray courseArray = new JSONArray();
		try {
			int userId = jbj.getInt(Variable.USERID);
			int categoryId = jbj.getInt(Variable.CATEGORYID);
			user = offlineStore.getUser(userId);
			List<UserMapping> userMappings = userMappingDao.getUserMappings(
					userId, Variable.USER_MAPPING_GROUP_COURSE);
			for (UserMapping userMapping : userMappings) {
				courseIds += userMapping.getReferenceId() + ",";
			}
			if (courseIds.length() > 1) {
				courseIds = courseIds.substring(0, courseIds.length() - 1);
			}
			courseArray = new JSONArray(user.getActiveCourses());
			Map<Integer, Course> courses = courseDao.getCourses(courseIds,
					categoryId);
			for (int i = 0; i < courseArray.length(); i++) {
				JSONObject activeCourse = courseArray.getJSONObject(i);
				String courseId = activeCourse.getString(Variable.ID);
				Course course = courses.get(Integer.valueOf(courseId));
				if (course != null) {
					JSONObject courseJson = new JSONObject(course.getJson());
					processCourseArraival(courseJson);
					if (categoryId == 2
							&& courseJson
									.optString(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG) != null) {
						summary = courseJson
								.getString(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG);
						List<String> summaryImags = Utilities
								.htmlImageParsing(summary);
						int index = 0;
						for (String contentImage : summaryImags) {
							if (contentImage != null
									&& contentImage.startsWith(Variable.HTTP)) {
								asset = assetDao.getAsset(course.getCourseId(),
										index + "",
										Variable.ASSET_GROUP_SUMMARY_TAG,
										Variable.SUMMARY_IMAGE_DOWNLOAD_TAG);
								if (asset.getId() != 0) {
									String onlineUrl = asset.getOnlineUrl();
									summary = summary.replaceFirst(onlineUrl,
											"file://" + asset.getOfflineUrl());
									index++;
								}
							}
						}
						courseJson.put(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG,
								summary);
					}
					courseJsonArray.put(courseJson);
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					ErrorConstants.ERR10001);
		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					ErrorConstants.ERR10001);
		}
		return courseJsonArray.toString();
	}

	public void processCourseArraival(JSONObject jbj) throws JSONException,
			ParseException {
		String status = "";
		DateFormat format = new SimpleDateFormat("dd/MM/yyyy");
		if (jbj.optString("startdate") != null) {
			long startdate = jbj.getLong("startdate");
			Log.d("startdate:", startdate + "");
			Log.d("courseId:", jbj.getInt(Variable.ID) + "");

			Date start = format.parse(format
					.format(new Date(startdate * 1000L)));
			Date today = format.parse(format.format(new Date()));

			Date aweekago = format.parse(format.format(new Date()));
			aweekago.setDate(aweekago.getDate() - 30);
			/*
			 * Log.d("date:", start.toString()); Log.d("today:",
			 * today.toString()); Log.d("aweekago:", aweekago.toString());
			 */if (start.after(today)) {
				status = "Coming Soon";
			} else if (start.after(aweekago) && start.before(today)) {
				status = "New";
			} else {
				status = "Old";
			}
			jbj.put("coursearrival", status);
		}
	}

	public String getTopicsData(JSONObject jbj) throws CliniqueException {
		JSONArray topicJsonArray = new JSONArray();
		JSONObject topicJson = new JSONObject();
		int topicId;
		String summary;
		Asset asset;
		try {
			int courseId = jbj.getInt(Variable.COURSEID);
			int userId = jbj.getInt(Variable.USERID);
			int categoryId = jbj.getInt(Variable.CATEGORYID);

			List<Topics> topics = topicsDao.getTopicsByCourseId(courseId);
			for (Topics topic : topics) {
				topicId = topic.getTopicsId();
				topicJson = new JSONObject(topic.getJson());
				if ((categoryId == 3 || categoryId == 4)
						&& topicJson
								.optString(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG) != null) {
					summary = topicJson
							.getString(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG);
					List<String> summaryImags = Utilities
							.htmlImageParsing(summary);
					int index = 0;
					for (String contentImage : summaryImags) {
						if (contentImage != null
								&& contentImage.startsWith(Variable.HTTP)) {
							asset = assetDao.getAsset(topic.getCourseId(),
									topicId + "_" + index,
									Variable.ASSET_GROUP_SUMMARY_TAG,
									Variable.SUMMARY_IMAGE_DOWNLOAD_TAG);
							if (asset.getId() != 0) {
								String onlineUrl = asset.getOnlineUrl();
								summary = summary.replaceFirst(onlineUrl,
										"file://" + asset.getOfflineUrl());
								index++;
							}
						}
					}
					topicJson.put(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG, summary);
				}

				JSONArray moduleJson = getModulesData(topicId, courseId, userId);
				topicJson.put("modules", moduleJson);
				topicJsonArray.put(topicJson);
			}
		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					ErrorConstants.ERR10001);
		} catch (CliniqueException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					ErrorConstants.ERR10001);
		}
		return topicJsonArray.toString();
	}

	public JSONObject buildModuleData(Module module, int userId)
			throws JSONException, CliniqueException {
		int moduleId = module.getModuleId();
		Asset asset;
		JSONObject moduleJson = new JSONObject(module.getJson());
		if (moduleJson.optJSONObject("contents") != null) {
			JSONObject content = moduleJson.getJSONObject("contents");
			if (moduleJson.opt("modname") != null
					&& "game".equals(moduleJson.getString("modname"))) {
				moduleJson.remove("contents");
			} else if (content.optString(Variable.CONTENTS_DOWNLOAD_TAG) != null) {
				asset = assetDao.getAsset(moduleId,
						Variable.ASSET_GROUP_CONTENT,
						Variable.CONTENTS_DOWNLOAD_TAG);
				content.put(Variable.CONTENTS_DOWNLOAD_TAG,
						"file://" + asset.getOfflineUrl());
			}
		}
		if (moduleJson.optString("modname") != null
				&& "scorm".equalsIgnoreCase(moduleJson.getString("modname"))) {

			asset = assetDao.getAsset(moduleId, Variable.ASSET_GROUP_SCORM,
					Variable.ASSET_GROUP_SCORM);
			if (asset.getId() != 0) {
				moduleJson.put(Variable.SCORM_MANIFEST_PATH_TAG, "file://"
						+ asset.getOfflineUrl());
			}

		}
		if (moduleJson.optJSONObject("widget") != null) {
			JSONObject widget = moduleJson.getJSONObject("widget");
			if (widget
					.optJSONObject(Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG) != null) {
				JSONObject questionText = widget
						.getJSONObject(Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG);

				Iterator<String> questions = questionText.keys();
				while (questions.hasNext()) {
					String question = (String) questions.next();
					if (!questionText.isNull(question)) {
						String questionUrl = questionText.getString(question);
						if (questionUrl.startsWith(Variable.HTTP)) {
							asset = assetDao.getAsset(moduleId, question,
									Variable.ASSET_GROUP_WIDGET,
									Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG);
							if (asset.getId() != 0) {
								questionText.put(question,
										"file://" + asset.getOfflineUrl());
							}
						}
					}
				}
			}
			if (widget.optJSONArray(Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG) != null) {
				JSONArray questionText = widget
						.getJSONArray(Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG);

				for (int i = 0; i < questionText.length(); i++) {
					if (!questionText.isNull(i)) {
						String answerUrl = questionText.getString(i);
						if (answerUrl.startsWith(Variable.HTTP)) {
							asset = assetDao.getAsset(moduleId, i + "",
									Variable.ASSET_GROUP_WIDGET,
									Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG);
							if (asset.getId() != 0) {
								questionText.put(i,
										"file://" + asset.getOfflineUrl());
							}
						}
					}
				}
			}
			if (widget.optJSONArray(Variable.WIDGET_ANSWER_TEXT_DOWNLOAD_TAG) != null) {
				JSONArray answerText = widget
						.getJSONArray(Variable.WIDGET_ANSWER_TEXT_DOWNLOAD_TAG);

				for (int i = 0; i < answerText.length(); i++) {
					if (!answerText.isNull(i)) {
						String answerUrl = answerText.getString(i);
						if (answerUrl.startsWith(Variable.HTTP)) {
							asset = assetDao.getAsset(moduleId, i + "",
									Variable.ASSET_GROUP_WIDGET,
									Variable.WIDGET_ANSWER_TEXT_DOWNLOAD_TAG);
							if (asset.getId() != 0) {
								answerText.put(i,
										"file://" + asset.getOfflineUrl());
							}
						}
					}
				}
			}
		}

		if (moduleJson.optJSONObject(Variable.QUIZ) != null) {
			JSONObject quiz = moduleJson.getJSONObject(Variable.QUIZ);
			if (quiz.optJSONArray(Variable.QUIZLIST) != null) {

				JSONArray quizlist = quiz.getJSONArray(Variable.QUIZLIST);

				for (int j = 0; j < quizlist.length(); j++) {

					JSONObject quizQuestion = quizlist.getJSONObject(j);
					if (quizQuestion.optJSONArray(Variable.QUESTIONS) != null) {
						JSONArray questions = quizQuestion
								.getJSONArray(Variable.QUESTIONS);

						for (int k = 0; k < questions.length(); k++) {
							JSONObject questionObj = questions.getJSONObject(k);

							processQuizOffline(moduleId, questionObj,
									Variable.ASSET_GROUP_QUIZ,
									Variable.QUIZ_QUESTION_TEXT_DOWNLOAD_TAG,
									questionObj.getString(Variable.ID));

							if (questionObj.optJSONArray(Variable.CHOICES) != null) {
								JSONArray choices = questionObj
										.getJSONArray(Variable.CHOICES);
								for (int l = 0; l < choices.length(); l++) {

									JSONObject choiceObj = choices
											.getJSONObject(l);
									if (choiceObj
											.opt(Variable.QUIZ_CHOICES_LABEL_DOWNLOAD_TAG) != null) {
										String label = choiceObj
												.getString(Variable.QUIZ_CHOICES_LABEL_DOWNLOAD_TAG);
										if (label.toLowerCase().contains(
												Variable.HTTP)) {
											processQuizOffline(
													moduleId,
													choiceObj,
													Variable.ASSET_GROUP_QUIZ,
													Variable.QUIZ_CHOICES_LABEL_DOWNLOAD_TAG,
													choiceObj
															.getString(Variable.ID));

										}
									}
									if (choiceObj
											.opt(Variable.QUIZ_CHOICES_SUBQUESTION_DOWNLOAD_TAG) != null) {
										String label = choiceObj
												.getString(Variable.QUIZ_CHOICES_SUBQUESTION_DOWNLOAD_TAG);
										if (label.toLowerCase().contains(
												Variable.HTTP)) {
											processQuizOffline(
													moduleId,
													choiceObj,
													Variable.ASSET_GROUP_QUIZ,
													Variable.QUIZ_CHOICES_SUBQUESTION_DOWNLOAD_TAG,
													choiceObj
															.getString(Variable.ID));

										}
									}

								}

							}
						}

						

					}
					if (quizQuestion.optJSONArray(Variable.ATTEMPTS) != null) {
						User user = offlineStore.getUser(userId);
						if(user.getQuizData()!=null){
							JSONArray quizsync = new JSONArray(
									user.getQuizData());
							for (int l = 0; l < quizsync.length(); l++) {
								JSONObject moduleNew = quizsync
										.getJSONObject(l);
								int moduleIdNew = moduleNew.getInt(Variable.ID);
								if (moduleId == moduleIdNew) {
									if (moduleNew.optJSONObject(Variable.QUIZ) != null) {
										JSONObject quizJson = moduleNew
												.getJSONObject(Variable.QUIZ);
										if (quizJson.optJSONArray(Variable.ATTEMPTS) != null) {
											quizQuestion.put(Variable.ATTEMPTS, quizJson.getJSONArray(Variable.ATTEMPTS));
										}
									}
								}
							}
						}
					}
					
				}
			}
			if (quiz.optJSONArray(Variable.QUIZINFO) != null) {

				JSONArray quizinfoArray = quiz
						.getJSONArray(Variable.QUIZINFO);

				for (int j = 0; j < quizinfoArray.length(); j++) {

					JSONObject quizInfo = quizinfoArray.getJSONObject(j);
					if (quizInfo.opt(Variable.FEEDBACK) != null) {
						JSONArray feedback = quizInfo
								.getJSONArray(Variable.FEEDBACK);

						for (int k = 0; k < feedback.length(); k++) {
							JSONObject feedbackObj = feedback
									.getJSONObject(k);

							if (feedbackObj
									.opt(Variable.QUIZ_FEEDBACK_TEXT_DOWNLOAD_TAG) != null) {
								String label = feedbackObj
										.getString(Variable.QUIZ_FEEDBACK_TEXT_DOWNLOAD_TAG);
								if (label.toLowerCase().contains(
										Variable.HTTP)) {
									processQuizOffline(
											moduleId,
											feedbackObj,
											Variable.ASSET_GROUP_QUIZ,
											Variable.QUIZ_FEEDBACK_TEXT_DOWNLOAD_TAG,
											feedbackObj
													.getString(Variable.ID));

								}
							}

						}
					}

				}
			}

		}
		return moduleJson;

	}

	public JSONArray getModulesData(int topicId, int courseId, int userId)
			throws CliniqueException {
		JSONArray moduleJsonArray = new JSONArray();
		JSONObject moduleJson = new JSONObject();
		int moduleId;
		try {

			List<Integer> modIds = moduleDao.getModuleIdByTopics(topicId,
					courseId);
			for (Integer modId : modIds) {
				Module module = moduleDao.getModule(modId);
				moduleId = module.getModuleId();
				moduleJson = new JSONObject();
				moduleJson = buildModuleData(module,userId);
				moduleJson = buildDependentMapping(moduleJson, moduleId, userId);
				Favorite favorite = favoritesDao.getFavorite(userId, moduleId);
				if (favorite.getId() != 0
						&& !"D".equalsIgnoreCase(favorite.getStatus())) {
					moduleJson.put("favorite", "Yes");
				} else {
					moduleJson.put("favorite", "No");
				}
				moduleJsonArray.put(moduleJson);
			}
		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					ErrorConstants.ERR10001);
		} catch (CliniqueException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					ErrorConstants.ERR10001);
		}
		return moduleJsonArray;
	}

	public JSONObject buildDependentMapping(JSONObject moduleJson,
			int moduleId, int userId) throws JSONException, CliniqueException {
		int showAvailability = 0;
		boolean status = false;
		showAvailability = moduleJson.getInt("showavailability");
		ActivityMaintenance activityMain = activityMaintenanceDao
				.getCompletionStatus(userId, moduleId);

		if ("N".equals(activityMain.getStatus())) {
			status = true;
		}
		moduleJson.put("dependentflag", status ? 1 : 0);
		Log.d("dependentflag:", moduleId + ":," + (status ? 1 : 0));

		Log.d("showavailability:", moduleId + ":," + showAvailability);
		if (showAvailability > 1) {
			status = true;
			List<DependentActivity> activities = dependentActivityDao
					.getDependentActivity(userId, moduleId);
			for (DependentActivity activity : activities) {
				int referenceId = activity.getReferenceId();
				if (activity.getId() != 0) {
					ActivityMaintenance activityMaintenance = activityMaintenanceDao
							.getCompletionStatus(userId, referenceId);
					if ("N".equals(activityMaintenance.getStatus())) {
						status = false;
					} else {
						status = true;
					}
					showAvailability = status ? 1 : 2;
					moduleJson.put("showavailability", status ? 1 : 2);
					if (!status) {
						break;
					}
				}
			}
		}

		Log.d("showavailability:",
				moduleId + ":," + moduleJson.getInt("showavailability"));

		return moduleJson;
	}

	public void processBadgesData(JSONObject onlineJson, User user)
			throws JSONException {
		if (onlineJson.getJSONObject("badges") != null) {
			JSONObject badges = onlineJson.getJSONObject("badges");
			JSONArray badgeJson = badges.getJSONArray("badges");

			for (int j = 0; j < badgeJson.length(); j++) {
				JSONObject badgeObj = badgeJson.getJSONObject(j);
				Lookup lookup = lookupDao.getLookup(
						Variable.LOOKUP_GROUP_BADGES,
						badgeObj.getString(Variable.ID));
				if (lookup.getId() == 0) {
					lookup = new Lookup();
					lookup.setGroup(Variable.LOOKUP_GROUP_BADGES);
					lookup.setValue1(badgeObj.getString(Variable.ID));
					lookup.setValue2(badgeObj.getString("badge_name"));
					lookup.setValue3(badgeObj.getString("badge_value"));
					lookup.setTimeModified(Utilities.currentTime());
					lookupDao.addLookup(lookup);
				} else {
					lookup.setValue2(badgeObj.getString("badge_name"));
					lookup.setValue3(badgeObj.getString("badge_value"));
					lookup.setTimeModified(Utilities.currentTime());
					lookupDao.updatelookup(lookup);
				}
			}

			if (badges.optJSONObject("userbadges") != null) {
				JSONArray userBadgesObj = badges.getJSONArray("userbadges");
				UserBadges userBadges = userBadgesDao.getUserBadges(user
						.getUserId());
				if (userBadges.getId() == 0) {
					userBadges = new UserBadges();
				}
				userBadges.setAdded((new JSONArray()).toString());
				userBadges.setBadges(userBadgesObj.toString());
				userBadges.setStatus(Variable.STATUS_S);
				userBadges.setUserId(user.getUserId());
				userBadgesDao.updateUserBadges(userBadges);
			}

		}
	}

	public void processPlayersData(JSONObject onlineJson, User user)
			throws JSONException {
		if (onlineJson.optJSONArray("players") != null) {
			JSONArray players = onlineJson.getJSONArray("players");
			for (int j = 0; j < players.length(); j++) {
				JSONObject playerObj = players.getJSONObject(j);
				int courseId = playerObj.getInt(Variable.COURSEID);
				Player player = playersDao
						.getPlayer(user.getUserId(), courseId);
				if (player.getId() == 0) {
					player = new Player();
					player.setCourseId(courseId);
					player.setJson(playerObj.toString());
					player.setUserId(user.getUserId());
					player.setTimeModified(Utilities.currentTime());
					playersDao.addPlayer(player);
				} else {
					player.setJson(playerObj.toString());
					player.setTimeModified(Utilities.currentTime());
					playersDao.updatePlayer(player);
				}
			}
		}
	}

	public void processProgressData(JSONObject onlineJson, User user)
			throws JSONException {
		int userId = user.getUserId();
		if (onlineJson.getJSONObject("progress") != null) {
			JSONObject progressObj = onlineJson.getJSONObject("progress");

			if (progressObj.optJSONArray("course_id") != null) {
				Progress progress = progressDao.getProgress(userId);
				if (progress.getId() == 0) {
					progress = new Progress();
					progress.setUserId(userId);
					progress.setJson(progressObj.toString());
					progress.setTimeModified(Utilities.currentTime());
					progressDao.addProgress(progress);
				} else {
					progress.setJson(progressObj.toString());
					progress.setTimeModified(Utilities.currentTime());
					progressDao.updateProgress(progress);
				}

			}
		}
	}

	public void processModulesData(JSONObject onlineJson, User user,
			boolean isDeltaSync) throws JSONException, CliniqueException {
		int userId = user.getUserId();
		int courseId = 0;
		int topicsId = 0;
		int moduleId = 0;
		long timeModified;
		Asset asset;

		if (onlineJson.optJSONArray("modules") == null) {
			return;
		}
		JSONArray modules = onlineJson.getJSONArray("modules");

		for (int i = 0; i < modules.length(); i++) {
			JSONObject module = modules.getJSONObject(i);
			moduleId = module.getInt(Variable.ID);
			if (!module.isNull("topicid")) {
				topicsId = module.getInt("topicid");
			}
			courseId = module.getInt(Variable.COURSEID);
			Module moduleObj = moduleDao.getModule(moduleId);
			timeModified = 0;// module.getLong(Variable.TIMEMODIFIED);
			// if (timeModified != moduleObj.getTimeModified()) {
			if (moduleObj.getId() == 0) {
				moduleObj = new Module();
			}
			moduleObj.setTopicsId(topicsId);
			moduleObj.setCourseId(courseId);
			moduleObj.setModuleId(moduleId);

			moduleObj.setJson(module.toString());
			moduleObj.setTimeModified(timeModified);
			moduleDao.updateModule(moduleObj);

			if (module.optJSONObject("contents") != null) {
				JSONObject content = module.getJSONObject("contents");
				if (content.opt("fileurl") != null
						&& content.getString("fileurl").startsWith(
								Variable.HTTP) ) {
					// !content.getString("filename").toLowerCase().contains("mp4")
					asset = assetDao.getAsset(moduleId,
							Variable.ASSET_GROUP_CONTENT,
							Variable.CONTENTS_DOWNLOAD_TAG);
					if (asset.getId() == 0) {
						asset = new Asset();
					}
					String onlineUrl = content
							.getString(Variable.CONTENTS_DOWNLOAD_TAG);
					if (!getOnlineUrl(onlineUrl).equals(asset.getOnlineUrl())
							|| isDeltaSync) {
						asset.setUpdateRequired(Variable.STATUS_Y);
						asset.setOfflineUrl("");
					}
					asset.setAssetGroup(Variable.ASSET_GROUP_CONTENT);
					asset.setReferenceId(moduleId);
					asset.setUrlKey(Variable.CONTENTS_DOWNLOAD_TAG);

					asset.setOnlineUrl(getOnlineUrl(onlineUrl));
					asset.setFileType(content.getString("type"));
					asset.setAssetSize(content.getLong("filesize"));
					asset.setAssetName(content.getString("filename"));
					assetDao.updateAsset(asset);
					asset = assetDao.getAsset(moduleId,
							Variable.ASSET_GROUP_CONTENT,
							Variable.CONTENTS_DOWNLOAD_TAG);
					UserMapping userMapping = userMappingDao.getUserMapping(
							userId, Variable.USER_MAPPING_GROUP_ASSET,
							asset.getId());
					if (userMapping.getId() == 0) {
						userMapping = new UserMapping();
					}
					userMapping
							.setMappingType(Variable.USER_MAPPING_GROUP_ASSET);
					userMapping.setReferenceId(asset.getId());
					userMapping.setUserId(userId);
					userMappingDao.updateUserMapping(userMapping);
				}
			}

			if (module.optString("modname") != null
					&& "scorm".equalsIgnoreCase(module.getString("modname"))) {

				asset = assetDao.getAsset(moduleId, Variable.ASSET_GROUP_SCORM,
						Variable.ASSET_GROUP_SCORM);

				if (asset.getId() == 0) {
					asset = new Asset();
				}
				String onlineUrl = Variable.SERVICES_URL
						+ "?action=scormpackage&courseid=" + courseId
						+ "&cmid=" + moduleId;
				if (!getOnlineUrl(onlineUrl).equals(asset.getOnlineUrl())
						|| isDeltaSync) {
					asset.setUpdateRequired(Variable.STATUS_Y);
					asset.setOfflineUrl("");
				}
				asset.setAssetGroup(Variable.ASSET_GROUP_SCORM);
				asset.setReferenceId(moduleId);
				asset.setUrlKey(Variable.ASSET_GROUP_SCORM);
				asset.setOnlineUrl(getOnlineUrl(onlineUrl));
				asset.setFileType(Variable.ASSET_GROUP_SCORM);
				asset.setAssetSize(0);
				asset.setAssetName(moduleId + "_S_" + module.getString("name"));
				assetDao.updateAsset(asset);
				asset = assetDao.getAsset(moduleId, Variable.ASSET_GROUP_SCORM,
						Variable.ASSET_GROUP_SCORM);
				UserMapping userMapping = userMappingDao.getUserMapping(userId,
						Variable.USER_MAPPING_GROUP_ASSET, asset.getId());
				if (userMapping.getId() == 0) {
					userMapping = new UserMapping();
				}
				userMapping.setMappingType(Variable.USER_MAPPING_GROUP_ASSET);
				userMapping.setReferenceId(asset.getId());
				userMapping.setUserId(userId);
				userMappingDao.updateUserMapping(userMapping);
			}

			if (module.optJSONObject("widget") != null) {
				JSONObject widget = module.getJSONObject("widget");
				if (widget.optJSONObject("questiontext") != null) {

					JSONObject questionText = widget
							.getJSONObject("questiontext");

					Iterator<String> questions = questionText.keys();
					while (questions.hasNext()) {
						String question = (String) questions.next();
						if (!questionText.isNull(question)) {
							String questionUrl = questionText
									.getString(question);
							if (questionUrl.startsWith(Variable.HTTP)) {
								asset = assetDao
										.getAsset(
												moduleId,
												question,
												Variable.ASSET_GROUP_WIDGET,
												Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG);

								if (asset.getId() == 0) {
									asset = new Asset();
								}
								if (!getOnlineUrl(questionUrl).equals(
										asset.getOnlineUrl())
										|| isDeltaSync) {
									asset.setUpdateRequired(Variable.STATUS_Y);
									asset.setOfflineUrl("");
								}
								asset.setAssetGroup(Variable.ASSET_GROUP_WIDGET);
								asset.setReferenceId(moduleId);
								asset.setUrlKey(Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG);
								asset.setOnlineUrl(getOnlineUrl(questionUrl));
								asset.setFileType(Variable.IMAGE_TYPE);
								asset.setIndex(question);
								asset.setAssetSize(0);
								asset.setAssetName(moduleId
										+ "_W_"
										+ question
										+ "_"
										+ URLDecoder.decode(questionUrl
												.substring(questionUrl
														.lastIndexOf("/") + 1,
														questionUrl.length())));
								assetDao.updateAsset(asset);
								asset = assetDao
										.getAsset(
												moduleId,
												question,
												Variable.ASSET_GROUP_WIDGET,
												Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG);
								UserMapping userMapping = userMappingDao
										.getUserMapping(
												userId,
												Variable.USER_MAPPING_GROUP_ASSET,
												asset.getId());
								if (userMapping.getId() == 0) {
									userMapping = new UserMapping();
								}
								userMapping
										.setMappingType(Variable.USER_MAPPING_GROUP_ASSET);
								userMapping.setReferenceId(asset.getId());
								userMapping.setUserId(userId);
								userMappingDao.updateUserMapping(userMapping);
							}
						}

					}

				}

				if (widget
						.optJSONArray(Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG) != null) {

					JSONArray questionText = widget
							.getJSONArray(Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG);

					for (int j = 0; j < questionText.length(); j++) {
						if (!questionText.isNull(j)) {
							String questionUrl = questionText.getString(j);
							if (questionUrl.startsWith(Variable.HTTP)) {
								asset = assetDao
										.getAsset(
												moduleId,
												j + "",
												Variable.ASSET_GROUP_WIDGET,
												Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG);

								if (asset.getId() == 0) {
									asset = new Asset();
								}
								if (!getOnlineUrl(questionUrl).equals(
										asset.getOnlineUrl())
										|| isDeltaSync) {
									asset.setUpdateRequired(Variable.STATUS_Y);
									asset.setOfflineUrl("");
								}
								asset.setAssetGroup(Variable.ASSET_GROUP_WIDGET);
								asset.setReferenceId(moduleId);
								asset.setUrlKey(Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG);
								asset.setOnlineUrl(questionUrl + "?&token="
										+ user.getToken());
								asset.setFileType(Variable.IMAGE_TYPE);
								asset.setIndex(j + "");
								asset.setAssetSize(0);
								asset.setAssetName(moduleId
										+ "_W_"
										+ j
										+ "_"
										+ URLDecoder.decode(questionUrl
												.substring(questionUrl
														.lastIndexOf("/") + 1,
														questionUrl.length())));
								asset.setAssetLastModified(timeModified);
								assetDao.updateAsset(asset);
								asset = assetDao
										.getAsset(
												moduleId,
												j + "",
												Variable.ASSET_GROUP_WIDGET,
												Variable.WIDGET_QUESTION_TEXT_DOWNLOAD_TAG);
								UserMapping userMapping = userMappingDao
										.getUserMapping(
												userId,
												Variable.USER_MAPPING_GROUP_ASSET,
												asset.getId());
								if (userMapping.getId() == 0) {
									userMapping = new UserMapping();
								}
								userMapping
										.setMappingType(Variable.USER_MAPPING_GROUP_ASSET);
								userMapping.setReferenceId(asset.getId());
								userMapping.setUserId(userId);
								userMappingDao.updateUserMapping(userMapping);
							}
						}
					}

				}

				if (widget
						.optJSONArray(Variable.WIDGET_ANSWER_TEXT_DOWNLOAD_TAG) != null) {

					JSONArray answerText = widget
							.getJSONArray(Variable.WIDGET_ANSWER_TEXT_DOWNLOAD_TAG);

					for (int j = 0; j < answerText.length(); j++) {
						if (!answerText.isNull(j)) {
							String answerUrl = answerText.getString(j);
							if (answerUrl.startsWith(Variable.HTTP)) {
								asset = assetDao
										.getAsset(
												moduleId,
												j + "",
												Variable.ASSET_GROUP_WIDGET,
												Variable.WIDGET_ANSWER_TEXT_DOWNLOAD_TAG);

								if (asset.getId() == 0) {
									asset = new Asset();
								}
								if (!getOnlineUrl(answerUrl).equals(
										asset.getOnlineUrl())
										|| isDeltaSync) {
									asset.setUpdateRequired(Variable.STATUS_Y);
									asset.setOfflineUrl("");
								}
								asset.setAssetGroup(Variable.ASSET_GROUP_WIDGET);
								asset.setReferenceId(moduleId);
								asset.setUrlKey(Variable.WIDGET_ANSWER_TEXT_DOWNLOAD_TAG);
								asset.setOnlineUrl(getOnlineUrl(answerUrl));
								asset.setFileType(Variable.IMAGE_TYPE);
								asset.setIndex(j + "");
								asset.setAssetSize(0);
								asset.setAssetName(moduleId
										+ "_W_"
										+ j
										+ "_"
										+ URLDecoder.decode(answerUrl
												.substring(answerUrl
														.lastIndexOf("/") + 1,
														answerUrl.length())));
								asset.setAssetLastModified(timeModified);
								assetDao.updateAsset(asset);
								asset = assetDao
										.getAsset(
												moduleId,
												j + "",
												Variable.ASSET_GROUP_WIDGET,
												Variable.WIDGET_ANSWER_TEXT_DOWNLOAD_TAG);
								UserMapping userMapping = userMappingDao
										.getUserMapping(
												userId,
												Variable.USER_MAPPING_GROUP_ASSET,
												asset.getId());
								if (userMapping.getId() == 0) {
									userMapping = new UserMapping();
								}
								userMapping
										.setMappingType(Variable.USER_MAPPING_GROUP_ASSET);
								userMapping.setReferenceId(asset.getId());
								userMapping.setUserId(userId);
								userMappingDao.updateUserMapping(userMapping);
							}
						}
					}

				}
			}

			if (module.optJSONObject(Variable.QUIZ) != null) {
				JSONObject quiz = module.getJSONObject(Variable.QUIZ);
				if (quiz.optJSONArray(Variable.QUIZLIST) != null) {

					JSONArray quizlist = quiz.getJSONArray(Variable.QUIZLIST);

					for (int j = 0; j < quizlist.length(); j++) {

						JSONObject quizQuestion = quizlist.getJSONObject(j);
						if (quizQuestion.optJSONArray(Variable.QUESTIONS) != null) {
							JSONArray questions = quizQuestion
									.getJSONArray(Variable.QUESTIONS);

							for (int k = 0; k < questions.length(); k++) {
								JSONObject questionObj = questions
										.getJSONObject(k);

								processQuizQuestions(
										moduleId,
										user,
										questionObj,
										Variable.ASSET_GROUP_QUIZ,
										Variable.QUIZ_QUESTION_TEXT_DOWNLOAD_TAG,
										questionObj.getString(Variable.ID),
										isDeltaSync);

								if (questionObj.optJSONArray(Variable.CHOICES) != null) {
									JSONArray choices = questionObj
											.getJSONArray(Variable.CHOICES);
									for (int l = 0; l < choices.length(); l++) {

										JSONObject choiceObj = choices
												.getJSONObject(l);

										if (choiceObj
												.opt(Variable.QUIZ_CHOICES_LABEL_DOWNLOAD_TAG) != null) {
											String label = choiceObj
													.getString(Variable.QUIZ_CHOICES_LABEL_DOWNLOAD_TAG);
											if (label.toLowerCase().contains(
													Variable.HTTP)) {
												processQuizQuestions(
														moduleId,
														user,
														choiceObj,
														Variable.ASSET_GROUP_QUIZ,
														Variable.QUIZ_CHOICES_LABEL_DOWNLOAD_TAG,
														choiceObj
																.getString(Variable.ID),
														isDeltaSync);

											}
										}

										if (choiceObj
												.opt(Variable.QUIZ_CHOICES_SUBQUESTION_DOWNLOAD_TAG) != null) {
											String label = choiceObj
													.getString(Variable.QUIZ_CHOICES_SUBQUESTION_DOWNLOAD_TAG);
											if (label.toLowerCase().contains(
													Variable.HTTP)) {
												processQuizQuestions(
														moduleId,
														user,
														choiceObj,
														Variable.ASSET_GROUP_QUIZ,
														Variable.QUIZ_CHOICES_SUBQUESTION_DOWNLOAD_TAG,
														choiceObj
																.getString(Variable.ID),
														isDeltaSync);

											}
										}

									}

								}
							}

						}

					}

				}

				if (quiz.optJSONArray(Variable.QUIZINFO) != null) {

					JSONArray quizinfoArray = quiz
							.getJSONArray(Variable.QUIZINFO);

					for (int j = 0; j < quizinfoArray.length(); j++) {

						JSONObject quizInfo = quizinfoArray.getJSONObject(j);
						
						
						if (quizInfo.opt(Variable.FEEDBACK) != null) {
							JSONArray feedback = quizInfo
									.getJSONArray(Variable.FEEDBACK);

							for (int k = 0; k < feedback.length(); k++) {
								JSONObject feedbackObj = feedback
										.getJSONObject(k);

								if (feedbackObj
										.opt(Variable.QUIZ_FEEDBACK_TEXT_DOWNLOAD_TAG) != null) {
									String label = feedbackObj
											.getString(Variable.QUIZ_FEEDBACK_TEXT_DOWNLOAD_TAG);
									if (label.toLowerCase().contains(
											Variable.HTTP)) {
										processQuizQuestions(
												moduleId,
												user,
												feedbackObj,
												Variable.ASSET_GROUP_QUIZ,
												Variable.QUIZ_FEEDBACK_TEXT_DOWNLOAD_TAG,
												feedbackObj
														.getString(Variable.ID),
												isDeltaSync);

									}
								}

							}
						}

					}
				}

			}
			// }

		}
	}

	public void processQuizQuestions(int moduleId, User user,
			JSONObject questionObj, String quizGroup, String quizTag,
			String indexAppender, boolean isDeltaSync) throws CliniqueException {
		if (questionObj.optString(quizTag) != null) {
			try {
				String questionUrl;

				questionUrl = questionObj.getString(quizTag);
				Log.d("moduleId-->", moduleId + "");
				Log.d("questionUrl-->", questionUrl);
				if (questionUrl.toLowerCase().startsWith(Variable.HTTP)) {
					Asset asset = assetDao.getAsset(moduleId, 0 + "_" + quizTag
							+ "_" + indexAppender, quizGroup, quizTag);

					if (asset.getId() == 0) {
						asset = new Asset();
					}
					if (!getOnlineUrl(questionUrl).equals(asset.getOnlineUrl())
							|| isDeltaSync) {
						asset.setUpdateRequired(Variable.STATUS_Y);
						asset.setOfflineUrl("");
					}
					asset.setAssetGroup(quizGroup);
					asset.setReferenceId(moduleId);
					asset.setUrlKey(quizTag);
					asset.setOnlineUrl(getOnlineUrl(questionUrl));
					asset.setFileType(Variable.IMAGE_TYPE);
					asset.setIndex(0 + "_" + quizTag + "_" + indexAppender);
					asset.setAssetSize(0);
					asset.setAssetName(moduleId
							+ "_Q_"
							+ 0
							+ "_"
							+ indexAppender
							+ "_"
							+ URLDecoder.decode(questionUrl.substring(
									questionUrl.lastIndexOf("/") + 1,
									questionUrl.length())));
					asset.setAssetLastModified(0);
					assetDao.updateAsset(asset);
					asset = assetDao.getAsset(moduleId, 0 + "_" + quizTag + "_"
							+ indexAppender, quizGroup, quizTag);
					UserMapping userMapping = userMappingDao.getUserMapping(
							user.getUserId(),
							Variable.USER_MAPPING_GROUP_ASSET, asset.getId());
					if (userMapping.getId() == 0) {
						userMapping = new UserMapping();
					}
					userMapping
							.setMappingType(Variable.USER_MAPPING_GROUP_ASSET);
					userMapping.setReferenceId(asset.getId());
					userMapping.setUserId(user.getUserId());
					userMappingDao.updateUserMapping(userMapping);
				} else if (questionUrl.toLowerCase().contains(Variable.HTTP)) {
					Log.d("moduleId-->", moduleId + "");
					Log.d("questionUrl-->", questionUrl);

					List<String> contentUrls = Utilities
							.htmlImageParsing(questionUrl);
					int index = 0;
					for (String contentImage : contentUrls) {
						if (contentImage != null
								&& contentImage.startsWith(Variable.HTTP)) {
							Log.d("contentImage-->", contentImage + "");

							Asset asset = assetDao.getAsset(moduleId, index
									+ "_" + quizTag + "_" + indexAppender,
									quizGroup, quizTag);

							if (asset.getId() == 0) {
								asset = new Asset();
							}
							if (!getOnlineUrl(contentImage).equals(
									asset.getOnlineUrl())
									|| isDeltaSync) {
								asset.setUpdateRequired(Variable.STATUS_Y);
								asset.setOfflineUrl("");
							}
							asset.setAssetGroup(quizGroup);
							asset.setReferenceId(moduleId);
							asset.setUrlKey(quizTag);
							asset.setOnlineUrl(getOnlineUrl(contentImage));
							asset.setFileType(Variable.IMAGE_TYPE);
							asset.setIndex(index + "_" + quizTag + "_"
									+ indexAppender);
							asset.setAssetSize(0);
							asset.setAssetName(moduleId
									+ "_Q_"
									+ index
									+ "_"
									+ indexAppender
									+ "_"
									+ URLDecoder.decode(contentImage.substring(
											contentImage.lastIndexOf("/") + 1,
											contentImage.length())));
							asset.setAssetLastModified(0);
							assetDao.updateAsset(asset);
							asset = assetDao.getAsset(moduleId, index + "_"
									+ quizTag + "_" + indexAppender, quizGroup,
									quizTag);
							UserMapping userMapping = userMappingDao
									.getUserMapping(user.getUserId(),
											Variable.USER_MAPPING_GROUP_ASSET,
											asset.getId());
							if (userMapping.getId() == 0) {
								userMapping = new UserMapping();
							}
							userMapping
									.setMappingType(Variable.USER_MAPPING_GROUP_ASSET);
							userMapping.setReferenceId(asset.getId());
							userMapping.setUserId(user.getUserId());
							userMappingDao.updateUserMapping(userMapping);
							index++;
						}
					}
				}
			} catch (JSONException e) {
				e.printStackTrace();
				throw new CliniqueException(ErrorConstants.ERR10001,
						ErrorConstants.ERR10001);
			}
		}
	}

	public void processNotesData(JSONObject onlineJson, User user)
			throws JSONException {
		int userId = user.getUserId();
		int moduleId = 0;
		long timeModified;
		if (onlineJson.optJSONArray("notes") != null) {
			JSONArray notes = onlineJson.getJSONArray("notes");
			for (int i = 0; i < notes.length(); i++) {
				JSONObject notesObj = notes.getJSONObject(i);
				moduleId = notesObj.getInt(Variable.MODULE_ID);
				Note note = noteDao.getNote(userId, moduleId);
				timeModified = 1;// notesObj.getLong(Variable.TIMEMODIFIED);
				// if (timeModified != note.getTimeModified()) {
				if (note.getId() == 0) {
					note = new Note();
				}
				note.setComment(notesObj.getString("comment"));
				note.setUserId(userId);
				note.setModuleId(moduleId);
				note.setStatus(Variable.STATUS_S);
				note.setTimeModified(timeModified);
				noteDao.updateNote(note);
				// }
			}
		}
	}

	public void processBookmarksData(JSONObject onlineJson, User user)
			throws JSONException {
		int userId = user.getUserId();
		int moduleId = 0;
		if (onlineJson.optJSONArray("bookmarks") != null) {

			JSONArray bookmarks = onlineJson.getJSONArray("bookmarks");
			for (int i = 0; i < bookmarks.length(); i++) {
				JSONObject bookmarkObj = bookmarks.getJSONObject(i);
				moduleId = bookmarkObj.getInt(Variable.MODULE_ID);
				Bookmark bookmark = bookmarkDao.getBookmark(userId, moduleId);
				if (bookmark.getId() == 0) {
					bookmark = new Bookmark();
				}
				String pageNo = "";
				JSONArray pages = bookmarkObj.getJSONArray(Variable.PAGES);
				for (int j = 0; j < pages.length(); j++) {
					pageNo += pages.getInt(j) + "";
				}
				bookmark.setUserId(userId);
				bookmark.setModuleId(moduleId);
				bookmark.setPageNo(pageNo);
				bookmark.setAdded("");
				bookmark.setDeleted("");
				bookmark.setStatus(Variable.STATUS_S);
				bookmarkDao.updateBookmark(bookmark);
			}
		}
	}

	public void processFavoritesData(JSONObject onlineJson, User user)
			throws JSONException {
		int userId = user.getUserId();
		int moduleId = 0;
		if (onlineJson.optJSONArray("favorites") != null) {
			JSONArray favorites = onlineJson.getJSONArray("favorites");
			for (int i = 0; i < favorites.length(); i++) {
				JSONObject favorite = favorites.getJSONObject(i);
				if (!favorite.isNull(Variable.ID)) {
					moduleId = favorite.getInt(Variable.ID);
					Favorite favoriteObj = favoritesDao.getFavorite(userId,
							moduleId);
					if (favoriteObj.getId() == 0) {
						favoriteObj = new Favorite();
					}
					favoriteObj.setUserId(userId);
					favoriteObj.setModuleId(moduleId);
					favoriteObj.setJson(favorite.toString());
					favoriteObj.setStatus(Variable.STATUS_S);
					favoritesDao.updateFavorite(favoriteObj);
				}
			}
		}

	}

	public void processTopicsData(JSONObject onlineJson, User user,
			int categoryId, boolean isDeltaSync) throws JSONException {
		int topicsId = 0;
		int courseId = 0;
		String summary;
		List<String> contentUrls;
		int index = 0;
		Asset asset;
		long timeModified;
		JSONArray topics = onlineJson.getJSONArray("topics");
		for (int i = 0; i < topics.length(); i++) {
			JSONObject topic = topics.getJSONObject(i);
			topicsId = topic.getInt(Variable.ID);
			courseId = topic.getInt(Variable.COURSEID);
			Topics topicObj = topicsDao.getTopic(topicsId);
			timeModified = topic.getLong(Variable.TIMEMODIFIED);
			if (timeModified != topicObj.getTimeModified()) {
				if (topicObj.getId() == 0) {
					topicObj = new Topics();
				}
				topicObj.setTopicsId(topicsId);
				topicObj.setCourseId(courseId);
				topicObj.setJson(topic.toString());
				topicObj.setTimeModified(timeModified);
				topicsDao.updateTopics(topicObj);
				if ((categoryId == 3 || categoryId == 4)
						&& topic.optString(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG) != null) {
					summary = topic
							.getString(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG);
					contentUrls = Utilities.htmlImageParsing(summary);
					index = 0;
					for (String contentImage : contentUrls) {
						if (contentImage != null
								&& contentImage.startsWith(Variable.HTTP)) {
							asset = assetDao.getAsset(courseId, topicsId + "_"
									+ index, Variable.ASSET_GROUP_SUMMARY_TAG,
									Variable.SUMMARY_IMAGE_DOWNLOAD_TAG);
							if (asset.getId() == 0) {
								asset = new Asset();
							}
							asset.setUpdateRequired(Variable.STATUS_Y);
							asset.setAssetGroup(Variable.ASSET_GROUP_SUMMARY_TAG);
							asset.setReferenceId(courseId);
							asset.setIndex(topicsId + "_" + index);
							asset.setUrlKey(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG);
							asset.setOnlineUrl(getOnlineUrl(contentImage));
							asset.setFileType(Variable.IMAGE_TYPE);
							asset.setAssetSize(0);
							asset.setAssetName(topicsId
									+ "_T_"
									+ contentImage.substring(
											contentImage.lastIndexOf("/") + 1,
											contentImage.length()));
							asset.setOfflineUrl("");
							asset.setAssetLastModified(0);
							assetDao.updateAsset(asset);
							index++;
						}
					}
				}
			}
		}
	}

	public void processSubCategoryCoursesData(JSONObject onlineJson, User user,
			boolean isDeltaSync) throws JSONException {
		processCoursesData(onlineJson, user, 2, isDeltaSync);
	}

	public void processNewsData(JSONObject onlineJson, User user,
			boolean isDeltaSync) throws JSONException, CliniqueException {

		JSONObject news = onlineJson.getJSONObject("news");
		processCoursesData(news, user, 4, isDeltaSync);
		processTopicsData(news, user, 4, isDeltaSync);
		processModulesData(news, user, isDeltaSync);
	}

	public void processResourcesData(JSONObject onlineJson, User user,
			boolean isDeltaSync) throws JSONException, CliniqueException {

		JSONObject resources = onlineJson.getJSONObject("resources");
		processCoursesData(resources, user, 3, isDeltaSync);
		processTopicsData(resources, user, 3, isDeltaSync);
		processModulesData(resources, user, isDeltaSync);
	}

	public void processQuizSyncData(JSONObject onlineJson, User user)
			throws JSONException {
		int moduleId = 0;
		int courseId = 0;
		JSONObject quizUpdated = new JSONObject();
		JSONObject quizJson = new JSONObject();
		JSONArray quizsync = new JSONArray();
		if (onlineJson.optJSONArray(Variable.QUIZSYNC) != null) {
			quizsync = onlineJson.getJSONArray(Variable.QUIZSYNC);
			for (int i = 0; i < quizsync.length(); i++) {
				JSONObject module = quizsync.getJSONObject(i);
				moduleId = module.getInt(Variable.ID);
				courseId = module.getInt(Variable.COURSEID);
				if (module.optJSONObject(Variable.QUIZ) != null) {
					quizJson = module.getJSONObject(Variable.QUIZ);
					Quiz quiz = quizDao.getQuiz(user.getUserId(), courseId,
								moduleId);
					if (quiz.getId() != 0) {
						quizUpdated = new JSONObject(quiz.getValue());
						if (quizJson.optJSONArray(Variable.ATTEMPTS) != null) {
							quizUpdated.put(Variable.ALREADYATTEMPTED,
									quizJson.optJSONArray(Variable.ATTEMPTS));
						}
						
						if (quizJson.opt(Variable.ANYFINISHED) != null || quizJson.opt(Variable.ATTEMPTEDCOUNT) != null) {
								JSONArray quizinfoArray = quizUpdated
										.getJSONArray(Variable.QUIZINFO);
	
								for (int j = 0; j < quizinfoArray.length(); j++) {
									JSONObject quizInfo = quizinfoArray.getJSONObject(j);
									if (quizInfo.opt(Variable.ANYFINISHED) != null) {
										quizInfo.put(Variable.ANYFINISHED,
												quizJson.getInt(Variable.ANYFINISHED));
									}
									if (quizJson.opt(Variable.ATTEMPTEDCOUNT) != null) {
										quizInfo.put(Variable.ATTEMPTEDCOUNT,
												quizJson.getInt(Variable.ATTEMPTEDCOUNT));
									}
									if (quizJson.opt(Variable.NEWATTEMPTS) != null) {
										quizInfo.put(Variable.NEWATTEMPTS,quizJson.getInt(Variable.NEWATTEMPTS));
									}
								}
									
						}
						
						quiz.setValue(quizUpdated.toString());
						quizDao.updateQuiz(quiz);
					}
				}
			}
		}
		user.setQuizData(quizsync.toString());
		offlineStore.updateUser(user);
	}

	public void processDeletionData(JSONObject onlineJson, User user)
			throws JSONException {
		int courseId = 0;
		int moduleId = 0;
		JSONArray courses = new JSONArray();
		StringBuilder courseIds = new StringBuilder();
		StringBuilder moduleIds = new StringBuilder();
		if (onlineJson.optJSONArray("activeCourses") != null) {
			courses = onlineJson.getJSONArray("activeCourses");
			for (int i = 0; i < courses.length(); i++) {
				JSONObject course = courses.getJSONObject(i);
				courseId = course.getInt(Variable.ID);
				moduleIds = new StringBuilder();
				if (course.optJSONArray("modules") != null) {
					JSONArray modules = course.getJSONArray("modules");
					for (int j = 0; j < modules.length(); j++) {
						moduleId = modules.getInt(j);
						if (j == (modules.length() - 1)) {
							moduleIds.append("'" + moduleId + "'");
						} else {
							moduleIds.append("'" + moduleId + "',");
						}
					}
					if (moduleIds.toString().length() > 0) {
						moduleDao.deleteModuleIdMappings(courseId,
								moduleIds.toString());
					}
				}
				if (i == (courses.length() - 1)) {
					courseIds.append("'" + courseId + "'");
				} else {
					courseIds.append("'" + courseId + "',");
				}

			}
			if (courseIds.toString().length() > 0) {
				userMappingDao.deleteUserMapping(user.getUserId(),
						Variable.USER_MAPPING_GROUP_COURSE,
						courseIds.toString());
			}
		}
		user.setActiveCourses(courses.toString());
		offlineStore.updateUser(user);
	}

	public void processDependentActivities(JSONObject onlineJson, User user)
			throws JSONException {
		int moduleId = 0;
		int referenceId = 0;
		int userId = user.getUserId();
		JSONArray added = new JSONArray();
		if (onlineJson.optJSONArray("module_dependencies") == null) {
			return;
		}
		JSONArray courses = onlineJson.getJSONArray("module_dependencies");
		for (int i = 0; i < courses.length(); i++) {
			JSONObject module = courses.getJSONObject(i);
			moduleId = module.getInt(Variable.ID);
			if (module.optJSONArray("depends_on") != null) {
				JSONArray modules = module.getJSONArray("depends_on");
				for (int j = 0; j < modules.length(); j++) {
					referenceId = modules.getInt(j);
					DependentActivity activity = dependentActivityDao
							.getDependentActivity(userId, moduleId, referenceId);
					if (activity.getId() == 0) {
						activity = new DependentActivity();
						activity.setUserId(userId);
						activity.setModuleId(moduleId);
						activity.setReferenceId(referenceId);
						dependentActivityDao.addDependentActivity(activity);
					}
					ActivityMaintenance activityMain = activityMaintenanceDao
							.getCompletionStatus(userId, referenceId);
					if (activityMain.getId() == 0) {
						activityMain = new ActivityMaintenance();
						activityMain.setModuleId(referenceId);
						activityMain.setUserId(userId);
						activityMain.setIsCompletion(0);
					}
					activityMain.setStatus("N");
					activityMaintenanceDao.updateCompletionStatus(activityMain);
				}
			}
		}

		if (onlineJson.optJSONArray("completed_modules") != null) {
			added = onlineJson.getJSONArray("completed_modules");
			for (int i = 0; i < added.length(); i++) {
				moduleId = added.getInt(i);
				ActivityMaintenance activityMain = activityMaintenanceDao
						.getCompletionStatus(userId, moduleId);
				if (activityMain.getId() == 0) {
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

	public void processCoursesData(JSONObject onlineJson, User user,
			int categoryId, boolean isDeltaSync) throws JSONException {
		int userId = user.getUserId();
		int courseId = 0;
		int index = 0;
		long timeModified;
		String summary;
		List<String> contentUrls;
		Asset asset;
		if (onlineJson.optJSONArray("courses") == null) {
			return;
		}
		JSONArray courses = onlineJson.getJSONArray("courses");
		for (int i = 0; i < courses.length(); i++) {
			JSONObject course = courses.getJSONObject(i);
			courseId = course.getInt(Variable.ID);
			Course courseObj = courseDao.getCourse(courseId, categoryId);
			timeModified = course.getLong(Variable.TIMEMODIFIED);
			if (timeModified != courseObj.getTimeModified() || isDeltaSync) {
				if (courseObj.getId() == 0) {
					courseObj = new Course();
				}
				courseObj.setCourseId(courseId);
				courseObj.setJson(course.toString());
				courseObj.setCategoryId(categoryId);
				courseObj.setTimeModified(timeModified);
				courseDao.updateCourse(courseObj);

				if (categoryId == 2
						&& course
								.optString(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG) != null) {
					summary = course
							.getString(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG);
					contentUrls = Utilities.htmlImageParsing(summary);
					index = 0;
					for (String contentImage : contentUrls) {
						if (contentImage != null
								&& contentImage.startsWith(Variable.HTTP)) {
							asset = assetDao.getAsset(courseId, index + "",
									Variable.ASSET_GROUP_SUMMARY_TAG,
									Variable.SUMMARY_IMAGE_DOWNLOAD_TAG);
							if (asset.getId() == 0) {
								asset = new Asset();
							}

							asset.setUpdateRequired(Variable.STATUS_Y);
							asset.setOfflineUrl("");
							asset.setAssetGroup(Variable.ASSET_GROUP_SUMMARY_TAG);
							asset.setReferenceId(courseId);
							asset.setUrlKey(Variable.SUMMARY_IMAGE_DOWNLOAD_TAG);
							asset.setOnlineUrl(getOnlineUrl(contentImage));
							asset.setFileType(Variable.IMAGE_TYPE);
							asset.setAssetSize(0);
							asset.setAssetName(courseId
									+ "_C_"
									+ contentImage.substring(
											contentImage.lastIndexOf("/") + 1,
											contentImage.length()));
							// asset.setAssetLastModified(timeModified);
							assetDao.updateAsset(asset);
							index++;
						}
					}
				}
			}
			UserMapping userMapping = userMappingDao.getUserMapping(userId,
					Variable.USER_MAPPING_GROUP_COURSE, courseId);
			if (userMapping.getId() == 0) {
				userMapping = new UserMapping();
			}
			userMapping.setMappingType(Variable.USER_MAPPING_GROUP_COURSE);
			userMapping.setReferenceId(courseId);
			userMapping.setUserId(userId);
			userMappingDao.updateUserMapping(userMapping);
		}
	}

	public String getOnlineUrl(String url) {
		/*
		 * if(url.contains("?")){ url = url.substring(0,url.indexOf("?")); }
		 */
		return url;
	}

	public void processCategoriesData(JSONObject onlineJson)
			throws JSONException {
		int categoryId = 0;
		if (onlineJson.optJSONArray("course_categories") != null) {
			JSONArray categories = onlineJson.getJSONArray("course_categories");
			for (int i = 0; i < categories.length(); i++) {
				JSONObject category = categories.getJSONObject(i);
				categoryId = category.getInt(Variable.ID);
				Category categoryObj = categoriesDao.getCategory(categoryId);
				if (categoryObj.getId() == 0) {
					categoryObj = new Category();
				}
				categoryObj.setCategoryId(categoryId);
				categoryObj.setJson(category.toString());
				categoriesDao.updateCategory(categoryObj);
			}
		}
	}

	public void processQuizOffline(int moduleId, JSONObject questionObj,
			String quizGroup, String quizTag, String indexAppender)
			throws CliniqueException {
		if (questionObj.optString(quizTag) != null) {
			try {
				String questionUrl;

				questionUrl = questionObj.getString(quizTag);
				if (questionUrl.toLowerCase().startsWith(Variable.HTTP)) {
					Asset asset = assetDao.getAsset(moduleId, 0 + "_" + quizTag
							+ "_" + indexAppender, quizGroup, quizTag);
					if (asset.getId() != 0) {
						questionObj.put(quizTag,
								"file://" + asset.getOfflineUrl());
					}
				} else if (questionUrl.toLowerCase().contains(Variable.HTTP)) {
					Log.d("moduleId-->", moduleId + "");
					Log.d("questionUrl-->", questionUrl);
					List<String> contentUrls = Utilities
							.htmlImageParsing(questionUrl);
					int index = 0;
					for (String contentImage : contentUrls) {

						if (contentImage != null
								&& contentImage.startsWith(Variable.HTTP)) {
							Log.d("contentImage-->", contentImage);
							Asset asset = assetDao.getAsset(moduleId, index
									+ "_" + quizTag + "_" + indexAppender,
									quizGroup, quizTag);

							if (asset.getId() != 0) {
								String onlineUrl = asset.getOnlineUrl();
								Log.d("onlineUrl-->", onlineUrl);
								questionUrl = questionUrl.replaceFirst(
										onlineUrl,
										"file://" + asset.getOfflineUrl());
								index++;

							}
						}
					}
					questionObj.put(quizTag, questionUrl);

				}
			} catch (JSONException e) {
				e.printStackTrace();
				throw new CliniqueException(ErrorConstants.ERR10001,
						ErrorConstants.ERR10001);
			}
		}
	}

}
