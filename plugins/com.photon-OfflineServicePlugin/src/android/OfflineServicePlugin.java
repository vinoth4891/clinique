/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2011, IBM Corporation
 */

package com.clinique.phresco.hybrid;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;

import com.JSONparser.ErrorConstants;
import com.JSONparser.Utilities;
import com.photon.phresco.service.OfflineService;

public class OfflineServicePlugin extends Plugin {

	private OfflineService offlineService = new OfflineService();

	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		PluginResult.Status status = PluginResult.Status.OK;
		String result = "";
		try {
			offlineService.setActivity(this.cordova.getActivity());
			if (action.equals("favorite")) {
				result = offlineService.getFavoritesData(new JSONObject(args
						.getString(0)));
			} else if (action.equals("create_favorite")) {
				offlineService
						.createFavorite(new JSONObject(args.getString(0)));
			} else if (action.equals("remove_favorite")) {
				offlineService
						.deleteFavorite(new JSONObject(args.getString(0)));
			} else if (action.equals("get_course_resource_comment")) {
				result = offlineService.getNoteData(new JSONObject(args.getString(0)));
			}  else if (action.equals("get_course_resource_comments")) {
				result = offlineService.getNotesData(new JSONObject(args.getString(0)));
			} else if (action.equals("insert_replace_course_resource_comment")) {
				offlineService.updateNote(new JSONObject(args.getString(0)));
			}else if (action.equals("progress")) {
				result = offlineService.getProgressData(new JSONObject(args.getString(0)));
			}else if (action.equals("players")) {
				result = offlineService.getPlayersData(new JSONObject(args.getString(0)));
			}else if (action.equals("badges")) {
				result = offlineService.getBadgeData(new JSONObject(args.getString(0)));
			}else if (action.equals("update_user_badges")) {
				result = offlineService.addBadgeData(new JSONObject(args.getString(0)));
			}else if (action.equals("getTermsAndConditions")) {
				result = offlineService.getTermsAndConditions(args.getString(0),args.getString(1));
			}else if (action.equals("updateCompletedModules")) {
				result = offlineService.updateCompletedModules(new JSONObject(args.getString(0)));
			}
			
			return new PluginResult(status,Utilities.buildSuccessResponse(result));
		} /*catch (CliniqueException e) {
			return new PluginResult(PluginResult.Status.ERROR,
					Utilities.buildErrorResponse(e.getErrorCode(),
							e.getMessage()));
		} */catch (Exception e) {
			e.printStackTrace();
			return new PluginResult(PluginResult.Status.ERROR,
					Utilities.buildErrorResponse(ErrorConstants.ERR_10001,
							e.getMessage()));
		}
	}

}
