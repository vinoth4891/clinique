package com.photon.phresco.service;

import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;

import com.JSONparser.CliniqueException;
import com.JSONparser.ErrorConstants;
import com.JSONparser.Utilities;
import com.JSONparser.Variable;
import com.photon.phresco.db.ActivityMaintenanceDao;
import com.photon.phresco.db.AssetDao;
import com.photon.phresco.db.CoursesDao;
import com.photon.phresco.db.FavoritesDao;
import com.photon.phresco.db.LookupDao;
import com.photon.phresco.db.ModuleDao;
import com.photon.phresco.db.NoteDao;
import com.photon.phresco.db.PlayersDao;
import com.photon.phresco.db.ProgressDao;
import com.photon.phresco.db.UserBadgesDao;
import com.photon.phresco.hybrid.activity.MainActivity;
import com.photon.phresco.model.ActivityMaintenance;
import com.photon.phresco.model.Asset;
import com.photon.phresco.model.Course;
import com.photon.phresco.model.Favorite;
import com.photon.phresco.model.Module;
import com.photon.phresco.model.Note;
import com.photon.phresco.model.Player;
import com.photon.phresco.model.Progress;
import com.photon.phresco.model.UserBadges;

public class OfflineService {
	private LoginService loginService=new LoginService();
	private Activity activity;

	private FavoritesDao favoritesDao = new FavoritesDao(
			MainActivity.dbStore.getMDbHelper());
	private AssetDao assetDao = new AssetDao(
			MainActivity.dbStore.getMDbHelper());
	private ProgressDao progressDao = new ProgressDao(
			MainActivity.dbStore.getMDbHelper());
	private NoteDao noteDao = new NoteDao(MainActivity.dbStore.getMDbHelper());
	private CoursesDao courseDao = new CoursesDao(
			MainActivity.dbStore.getMDbHelper());

	private PlayersDao playersDao = new PlayersDao(
			MainActivity.dbStore.getMDbHelper());
	private LookupDao lookupDao = new LookupDao(
			MainActivity.dbStore.getMDbHelper());
	private ModuleDao moduleDao = new ModuleDao(
			MainActivity.dbStore.getMDbHelper());
	private UserBadgesDao userBadgesDao = new UserBadgesDao(
			MainActivity.dbStore.getMDbHelper());
	private ActivityMaintenanceDao activityMaintenanceDao = new ActivityMaintenanceDao(
			MainActivity.dbStore.getMDbHelper());
	private SyncBackService syncBackService = new SyncBackService();

	public void setActivity(Activity activity) {
		this.activity = activity;
	}

	public String getFavoritesData(JSONObject jbj) throws CliniqueException {
		JSONObject response = new JSONObject();
		JSONObject favoriteJson = new JSONObject();
		JSONObject moduleJson = new JSONObject();
		int index = 0;
		int noteCount = 0;
		try {
			int userId = jbj.getInt(Variable.U_ID);
			List<Favorite> favorites = favoritesDao.getFavorites(userId);

			for (Favorite favorite : favorites) {
				if (favorite.getId() != 0
						&& !"D".equalsIgnoreCase(favorite.getStatus())) {
					favoriteJson = new JSONObject(favorite.getJson());
					if(favorite.getModuleId()!=0){
						Asset asset = assetDao.getAsset(favorite.getModuleId(),
							Variable.ASSET_GROUP_CONTENT,
							Variable.CONTENTS_DOWNLOAD_TAG);
						favoriteJson.put("url", "file://"
								+ asset.getOfflineUrl());
						Module module = moduleDao.getModule(favorite.getModuleId());
						if(module.getModuleId()!=0){
							moduleJson = loginService.buildModuleData(module,userId);
						}
						favoriteJson.put(Variable.MODULE, moduleJson);
					}
					favoriteJson.put(Variable.ID, favorite.getModuleId());
				}
				response.put(index + "", favoriteJson);
				index++;
			}
			List<Note> notes = noteDao.getNotes(userId);
			for (Note note : notes) {
				if (note.getId() != 0 && note.getModuleId()!=0) {
					noteCount++;
				}
			}
			response.put("resource_comment_count", noteCount);

		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return response.toString();
	}

	public boolean createFavorite(JSONObject jbj) throws CliniqueException {
		JSONObject favoriteJson = new JSONObject();
		boolean result = false;
		try {
			int userId = jbj.getInt(Variable.U_ID);
			int moduleId = jbj.getInt(Variable.MODULE_ID);
			if (jbj.optString(Variable.TITLE) != null) {
				String content = jbj.getString(Variable.TITLE);
				String[] contents = content.split("@");
				Module module = moduleDao.getModule(moduleId);
				if(module.getId()!=0){
					JSONObject moduleJson = new JSONObject(module.getJson());
					if(!"null".equals(moduleJson.optString(Variable.CONTENTS))){
						JSONObject contentJson = moduleJson.getJSONObject(Variable.CONTENTS);
						favoriteJson.put("url", contentJson.getString(Variable.CONTENTS_DOWNLOAD_TAG));
					}
					else{
						favoriteJson.put("url", moduleJson.getString("url"));
					}					
				}else{
					favoriteJson.put("url", jbj.getString(Variable.BOOKMARK_URL));
				}
				favoriteJson.put(Variable.ID, moduleId);
				favoriteJson.put("course_type", contents[1]);
				favoriteJson.put("file_name", contents[2]);
				favoriteJson.put("file_type", contents[3]);
				favoriteJson.put("fname_upload", contents[4]);
				Favorite favorite = favoritesDao.getFavorite(userId, moduleId);
				if (favorite.getId() == 0) {
					favorite = new Favorite();
					favorite.setModuleId(moduleId);
					favorite.setUserId(userId);
					favorite.setJson(favoriteJson.toString());
					favorite.setTimeModified(Utilities.currentTime());
				}
				favorite.setStatus(Variable.STATUS_U);
				result = favoritesDao.updateFavorite(favorite);
				syncBackService.syncBackAll(userId, activity);
			}

		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return result;
	}

	public boolean deleteFavorite(JSONObject jbj) throws CliniqueException {
		boolean result = false;
		try {
			int userId = jbj.getInt(Variable.U_ID);
			int moduleId = jbj.getInt(Variable.MODULE_ID);
			Favorite favorite = favoritesDao.getFavorite(userId, moduleId);
			favorite.setStatus("D");
			result = favoritesDao.updateFavorite(favorite);
			syncBackService.syncBackAll(userId, activity);
		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return result;
	}

	public String getNoteData(JSONObject jbj) throws CliniqueException {
		JSONArray noteJsonArray = new JSONArray();
		try {
			int userId = jbj.getInt(Variable.U_ID);
			int moduleId = jbj.getInt(Variable.MODULE_ID);
			Note note = noteDao.getNote(userId, moduleId);
			if (note.getId() != 0 && note.getModuleId()!=0) {
				JSONObject noteObj = buildNoteResponse(note, userId);
				if(noteObj.opt("course_name")!=null){
					noteJsonArray.put(noteObj);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return noteJsonArray.toString();
	}

	private JSONObject buildNoteResponse(Note note, int userId)
			throws JSONException {
		String moduleName = "";
		String courseName = "";

		JSONObject noteObj = new JSONObject();
		if (note.getId() != 0) {
			moduleName = "";
			Module module = moduleDao.getModule(note.getModuleId());
			if(module.getJson()!=null){
				JSONObject moduleObj = new JSONObject(module.getJson());
				if (moduleObj.optString("name") != null) {
					moduleName = moduleObj.getString("name");
				}
			}
			Course course = courseDao.getCourse(module.getCourseId(), 2);
			if(course.getJson()!=null){
				JSONObject courseObj = new JSONObject(course.getJson());
				if (courseObj.optString("fullname") != null) {
					courseName = courseObj.getString("fullname");
				}
			}
			if(module.getModuleId()!=0 && course.getCourseId()!=0){
				noteObj.put("comment", note.getComment());
				noteObj.put("id", note.getId());
				noteObj.put("coursemoduleid", module.getModuleId());
				noteObj.put("resource_name", moduleName);
				noteObj.put("course_name", courseName);
			}
		}
		return noteObj;
	}

	public String getNotesData(JSONObject jbj) throws CliniqueException {
		JSONArray noteJsonArray = new JSONArray();
		JSONObject responseData = new JSONObject();
		try {
			int userId = jbj.getInt(Variable.U_ID);
			List<Note> notes = noteDao.getNotes(userId);
			for (Note note : notes) {
				if (note.getId() != 0 && note.getModuleId()!=0) {
					JSONObject noteObj = buildNoteResponse(note, userId);
					if(noteObj.opt("course_name")!=null){
						noteJsonArray.put(noteObj);
					}
				}
			}
			responseData.put("data", noteJsonArray);
			responseData.put("totalcount", noteJsonArray.length());

		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return responseData.toString();
	}

	public String getNotesCSVData(int userId, JSONArray modIds)
			throws CliniqueException {
		JSONObject responseData = new JSONObject();
		StringBuilder csvContent = new StringBuilder();
		try {
			responseData.put(Variable.U_ID, userId);

			for (int i = 0; i < modIds.length(); i++) {
				if(modIds.optString(i)!=null && !"null".equals(modIds.optString(i)) ){
					responseData.put(Variable.MODULE_ID, Integer.parseInt(modIds.getString(i)));
					JSONArray noteArray = new JSONArray(getNoteData(responseData));
					if(noteArray.length()>0){
						JSONObject note = noteArray.getJSONObject(0);
						csvContent.append(note.getString("course_name") + ","
								+ note.getString("resource_name") + ","
								+ note.getString("comment") );
						csvContent.append("\n");
					}
				}
			}

		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return csvContent.toString();
	}

	public boolean updateNote(JSONObject jbj) throws CliniqueException {
		boolean result = false;
		Note note;
		try {
			int userId = jbj.getInt(Variable.U_ID);
			int moduleId = jbj.getInt(Variable.MODULE_ID);
			String comment = jbj.getString(Variable.COMMENT);
			note = noteDao.getNote(userId, moduleId);
			if (note.getId() == 0) {
				note = new Note();
			}
			note.setComment(comment);
			note.setUserId(userId);
			note.setModuleId(moduleId);
			note.setStatus(Variable.STATUS_U);
			note.setTimeModified(System.currentTimeMillis());
			result = noteDao.updateNote(note);
			syncBackService.syncBackAll(userId, activity);
		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return result;
	}

	public String getProgressData(JSONObject jbj) throws CliniqueException {
		JSONObject progressJson = new JSONObject();
/*		JSONArray courseIds = new JSONArray();
		JSONObject course = new JSONObject();
		int courseId = 0;
*/
		try {
			int userId = jbj.getInt(Variable.U_ID);
			Progress progress = progressDao.getProgress(userId);

			if (progress.getId() != 0) {
				progressJson = new JSONObject(progress.getJson());
				/*if (progressJson.optJSONArray("course_id") != null) {
					courseIds = progressJson.getJSONArray("course_id");
					for (int i = 0; i < courseIds.length(); i++) {
						courseId = courseIds.getInt(i);
						JSONObject courseData = new JSONObject();
						JSONObject quizData = new JSONObject();
						UserMapping userMapping = userMappingDao
								.getUserMapping(userId,
										Variable.USER_MAPPING_GROUP_COURSE,
										courseId);
						List<QuizCourse> quizList = quizCourseDao
								.getQuizCourses(userMapping.getId());
						JSONArray quizNames = new JSONArray();
						JSONArray quizScores = new JSONArray();
						for (QuizCourse quizCourse : quizList) {
							quizNames.put(quizCourse.getQuizName());
							quizScores.put(quizCourse.getQuizScore());
						}
						quizData.put("name", quizNames);
						quizData.put("score", quizScores);
						courseData.put("quiz", quizData);
						course.put("" + courseId, courseData);
					}
					progressJson.put("course", course);
				}*/
			}
		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return progressJson.toString();
	}

	public String getPlayersData(JSONObject jbj) throws CliniqueException {
		JSONObject playerJson = new JSONObject();
		try {
			int userId = jbj.getInt(Variable.U_ID);
			int courseId = jbj.getInt(Variable.C_ID);
			Player player = playersDao.getPlayer(userId, courseId);

			if (player.getId() != 0) {
				playerJson = new JSONObject(player.getJson());
			}

		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return playerJson.toString();
	}

	public String getBadgeData(JSONObject jbj) throws CliniqueException {
		JSONObject badge = new JSONObject();
		try {
			badge = new JSONObject();
			badge.put("badges", getAllBadgeData(jbj));
			badge.put("userbadges", getUserBadges(jbj));

		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return badge.toString();
	}

	public JSONArray getAllBadgeData(JSONObject jbj) throws CliniqueException {
		JSONArray badges = new JSONArray();
		try {
			badges = lookupDao.getBadges();

		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return badges;
	}

	public JSONArray getUserBadges(JSONObject jbj) throws CliniqueException {
		JSONArray badges = new JSONArray();
		try {
			int userId = jbj.getInt(Variable.U_ID);
			UserBadges userBadges = userBadgesDao.getUserBadges(userId);
			if (userBadges.getId() != 0) {
				if (userBadges.getBadges() != null) {
					badges = new JSONArray(userBadges.getBadges());
				}
				if (!"".equals(userBadges.getAdded())) {
					JSONArray added = new JSONArray(userBadges.getAdded());
					for (int i = 0; i < added.length(); i++) {
						JSONObject badge = added.getJSONObject(i);
						JSONObject userBadge = new JSONObject();
						userBadge.put(Variable.ID, i);
						userBadge.put("user_badge_id",
								badge.getInt(Variable.ID));
						userBadge.put("badge_value",
								badge.getInt("badge_value"));
						userBadge.put("badge_name",
								badge.getString("badge_name"));
						badges.put(userBadge);
					}
				}
			}
		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return badges;
	}

	public String addBadgeData(JSONObject jbj) throws CliniqueException {
		String result = "";
		JSONArray added = new JSONArray();

		try {
			int userId = jbj.getInt(Variable.U_ID);
			int bid = jbj.getInt(Variable.B_ID);
			int bval = jbj.getInt(Variable.B_VAL);
			String bname = jbj.getString(Variable.B_NAME);
			JSONObject badge = new JSONObject();
			badge.put(Variable.ID, bid);
			badge.put("badge_name", bname);
			badge.put("badge_value", bval);
			UserBadges userBadges = userBadgesDao.getUserBadges(userId);

			if (userBadges.getId() == 0) {
				userBadges = new UserBadges();
			} else {
				added = new JSONArray(userBadges.getAdded());
				added.put(badge);
			}
			userBadges.setUserId(userId);
			userBadges.setAdded(added.toString());
			userBadges.setStatus(Variable.STATUS_U);
			userBadgesDao.updateUserBadges(userBadges);
			syncBackService.syncBackAll(userId, activity);
			result = getBadgeData(jbj);
		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return result;
	}
	
	public String updateCompletedModules(JSONObject jbj) throws CliniqueException {
		String result = "";
		ActivityMaintenance activityMaintenance = new ActivityMaintenance();
		try {
			int userId = jbj.getInt(Variable.U_ID);
			int moduleId = jbj.getInt("modId");
			activityMaintenance = activityMaintenanceDao.getCompletionStatus(userId, moduleId);
			if(activityMaintenance.getId()==0){
				activityMaintenance = new ActivityMaintenance();
			}
			activityMaintenance.setModuleId(moduleId);
			activityMaintenance.setUserId(userId);
			activityMaintenance.setStatus("C");
			activityMaintenance.setIsCompletion(1);
			activityMaintenanceDao.updateCompletionStatus(activityMaintenance);
			syncBackService.syncBackAll(userId, activity);
		} catch (JSONException e) {
			e.printStackTrace();
			throw new CliniqueException(ErrorConstants.ERR10001,
					e.getLocalizedMessage());
		}
		return result;
	}
	
	public String getTermsAndConditions(String type,String language) throws JSONException{
		String filePath="file://";
		JSONObject result= new JSONObject();
		Asset asset= new Asset();
		if("privacyPolicy".equalsIgnoreCase(type)){
			asset = assetDao.getAsset(language, Variable.ASSET_GROUP_LINKS, Variable.PRIVACY_DOWNLOAD_TAG);
		}else if("termsCondition".equalsIgnoreCase(type)){
			asset = assetDao.getAsset(language, Variable.ASSET_GROUP_LINKS, Variable.TERMS_DOWNLOAD_TAG);
		}
		if(asset!=null && asset.getOfflineUrl()!=null){
			filePath = "file://"+asset.getOfflineUrl();
		}
		result.put("downloadFilePath",filePath);
		return result.toString();
	}
}

