package com.clinique.phresco.hybrid;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;

import com.JSONparser.Utilities;

public class CheckOnline extends CordovaPlugin {

	private MainActivity activity;
	
	@Override
	public boolean execute(String action, JSONArray arg1, CallbackContext callbackContext) throws JSONException {
		// TODO Auto-generated method stub
//		Log.d("execute---->", action);
		activity = (MainActivity) cordova.getActivity();
		
		PluginResult.Status status = PluginResult.Status.OK;
		boolean result = false;
//		try{
			
			if (action.equals("status")) {
				result = isOnline();
			}
			callbackContext.sendPluginResult(new PluginResult(status, result));
			return true;
			
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
