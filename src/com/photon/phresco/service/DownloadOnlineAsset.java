package com.photon.phresco.service;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.List;

import org.json.JSONObject;

import android.util.Log;

import com.JSONparser.CliniqueException;
import com.JSONparser.ErrorConstants;
import com.JSONparser.Utilities;
import com.JSONparser.Variable;
import com.clinique.phresco.hybrid.activity.MainActivity;
import com.photon.phresco.db.AssetDao;
import com.photon.phresco.model.Asset;
import com.photon.phresco.model.User;

class DownloadOnlineAsset {
	private List<Asset> assets;
	private User user;
	private int alreadyDownloaded;
	private MainActivity activity;
	private AssetDao assetDao = new AssetDao(
			MainActivity.dbStore.getMDbHelper());

	public DownloadOnlineAsset(List<Asset> assets1, User user1) {
		assets = assets1;
		user = user1;
		Utilities.makeDirectories(Variable.PUBLIC_STORAGE);
		Utilities.makeDirectories(Variable.SECURE_STORAGE);
		Utilities.makeDirectories(Variable.PUBLIC_STORAGE + "/SCORM/");
	}

	public void setActivity(MainActivity activity) {
		this.activity = activity;
	}

	public void setAlreadyDownloaded(int alreadyDownloaded) {
		this.alreadyDownloaded = alreadyDownloaded;
	}

	protected String execute(String... params) throws CliniqueException {
		JSONObject progressBarJson = new JSONObject();
		int fileNo = alreadyDownloaded;
		String file;
		String urlPath = "";
		String urlParameters;
		String fileName;
		int retry = 0;

		// activity.sendJavascript("progressInitiate();");
		int i = 0;
		fileNo++;
		Log.d("file download start-->","Total : " + assets.size());
		while (i < assets.size()) {
			Asset asset = assets.get(i);
			try {
				progressBarJson.put("TOTAL_FILES", assets.size()
						+ alreadyDownloaded);
				if (asset.getId() != 0) {

					String assetUrl = asset.getOnlineUrl();
					fileName = "";
					urlParameters = "";

					if (Variable.ASSET_GROUP_SCORM.equals(asset.getFileType())) {

						urlPath = assetUrl;
						fileName = Variable.PUBLIC_STORAGE + "/" + "SCORM"
								+ "/";
						fileName = fileName + asset.getAssetName() + ".zip";
					} else {
						if (assetUrl.startsWith(Variable.DOC_DOWNLOAD_URL)) {
							urlPath = assetUrl;
						} else {
							if (assetUrl.contains("?")) {
								file = assetUrl
										.substring(
												assetUrl.indexOf("pluginfile.php") + 14,
												assetUrl.indexOf("?"));
							} else {
								file = assetUrl.substring(assetUrl
										.indexOf("pluginfile.php") + 14);
							}
							urlParameters = "file="
									+ URLEncoder.encode(
											URLDecoder.decode(file), "UTF-8")
									+ "&token="
									+ URLEncoder.encode(user.getToken(),
											"UTF-8");
							urlPath = Variable.DOWNLOAD_POST_URL + "?"
									+ urlParameters;
						}

						if (Variable.IMAGE_TYPE.equals(asset.getFileType())) {
							fileName = Variable.PUBLIC_STORAGE + "/"
									+ asset.getAssetName();
						} else {
							fileName = Variable.SECURE_STORAGE + "/"
									+ asset.getAssetName();
						}
						fileName = fileName.replaceAll("%", "_");
						fileName = fileName.replaceAll(" ", "_");

					}
					Log.d("file download start-->", fileNo + " " + urlPath);

					URL url = new URL(urlPath);

					HttpURLConnection connection = (HttpURLConnection) url
							.openConnection();

					connection.setRequestMethod("GET");
					connection.setRequestProperty("Accept-Language",
							"en-US,en;q=0.5");
					connection.setUseCaches(false);
					connection.setDoOutput(true);
					int responseCode = connection.getResponseCode();
					if (responseCode == 200) {
						InputStream input = new BufferedInputStream(
								connection.getInputStream());

						// Output stream to write file
						OutputStream output = new FileOutputStream(fileName);

						byte data[] = new byte[1024];

						int count = 0;
						long contentSize = 0;
						try{
							//StringBuilder sb = new StringBuilder();
							while ((count = input.read(data)) != -1) {
								// sb.append(new String(data) + "\n");
								contentSize += count;
								output.write(data, 0, count);
							}
							// Log.d("conent:", sb.toString());
							output.flush();
							output.close();
							input.close();
							if (connection != null) {
								connection.disconnect();
							}
						}catch(Exception e){
							e.printStackTrace();
							if(contentSize!=0){
								throw e;
							}
						}
						
						progressBarJson.put("CURRENT_FILE_NO", fileNo);

						activity.sendJavascript("sendProgress("
								+ progressBarJson.toString() + ");");

						
						if (Variable.ASSET_GROUP_SCORM.equals(asset
								.getFileType())) {

							String dest = Variable.PUBLIC_STORAGE + "/"
									+ "SCORM" + "/" + asset.getReferenceId()
									+ "/";
							Utilities.makeDirectories(dest);

							Utilities.deleteDirectory(new File(dest));

							Utilities.unzip(fileName, dest);

							postExecute(asset, dest, contentSize);

							Utilities.deleteFile(fileName);

						} else {
							postExecute(asset, fileName, contentSize);
						}
						Log.d("AssetId--" + asset.getId(), "offlineUrl--"
								+ fileName);
						retry = 0;
					} else {
						if (connection != null) {
							connection.disconnect();
						}
						progressBarJson.put("CURRENT_FILE_NO", fileNo);
						activity.sendJavascript("sendProgress("
								+ progressBarJson.toString() + ");");
						postExecute(asset, fileName, 0);
						Log.d("Failure--" + asset.getId(), "offlineUrl--"
								+ fileName);
						retry = 0;
					}
				}

			} catch (Exception e) {
				retry++;
				e.printStackTrace();
				if (retry > 1) {
					Log.e("Error: ", e.getMessage());
					activity.sendJavascript("progressFailiure("
							+ Utilities.buildErrorResponse(
									ErrorConstants.ERR_10007,
									ErrorConstants.ERR10007) + ");");

					throw new CliniqueException(ErrorConstants.ERR10007,
							e.getMessage());
				}
			}
			if (retry == 0) {
				i++;
				fileNo++;
			}

		}
		return null;
	}

	public void postExecute(Asset asset, String fileName, long contentSize) {
		asset.setOfflineUrl(fileName);
		asset.setUpdateRequired(Variable.STATUS_S);
		asset.setAssetSize(contentSize);
		assetDao.updateAsset(asset);
	}

}