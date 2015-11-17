package com.photon.phresco.hybrid.activity;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;

import com.JSONparser.Utilities;

public class CheckOnline extends Plugin {

	private MainActivity activity;
	
	@Override
	public PluginResult execute(String action, JSONArray arg1, String arg2) {
		// TODO Auto-generated method stub
//		Log.d("execute---->", action);
		activity = (MainActivity) cordova.getActivity();
		
		PluginResult.Status status = PluginResult.Status.OK;
		boolean result = false;
//		try{
			
			if (action.equals("status")) {
				result = isOnline();
			}
			return new PluginResult(status, result);
			
//		}catch(JSONException e){
//			return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
//		}
	}

	private boolean isOnline() {
		if( Utilities.isNetworkAvailable(activity.getApplicationContext()) ){
			return true;
		}else{
			return false;
		}
	}
}
