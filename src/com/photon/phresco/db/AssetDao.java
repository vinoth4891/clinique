package com.photon.phresco.db;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import com.clinique.phresco.hybrid.activity.CliniqueDBStore.DBHelper;
import com.photon.phresco.model.Asset;

public class AssetDao extends DBConstants {

	private SQLiteDatabase mDb;
	private DBHelper mDbHelper;

	public AssetDao(DBHelper mDbHelper) {
		this.mDbHelper = mDbHelper;
	}

	public boolean addAsset(Asset asset) {
		Log.d("addAsset-", asset.getReferenceId() + "");
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_ASSETGROUP, asset.getAssetGroup());
		values.put(KEY_REFERENCEID, asset.getReferenceId());
		values.put(KEY_INDEX,
				(asset.getIndex() == null ? "0" : asset.getIndex()));
		values.put(KEY_URLKEY, asset.getUrlKey());
		values.put(KEY_ONLINEURL, asset.getOnlineUrl());
		values.put(KEY_OFFLINEURL, asset.getOfflineUrl());
		values.put(KEY_FILETYPE, asset.getFileType());
		values.put(KEY_FILEEXTN, asset.getFileExtn());
		values.put(KEY_ASSETSIZE, asset.getAssetSize());
		values.put(KEY_ASSETNAME, asset.getAssetName());
		values.put(KEY_TIMEMODIFIED, asset.getAssetLastModified());
		values.put(KEY_UPDATEREQUIRED, asset.getUpdateRequired());

		long result = mDb.insert(TABLE_ASSETS, null, values);
		mDbHelper.closeDB();
		return (result > 0);
	}

	public Asset getAsset(int assetId) {
		Asset asset = new Asset();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_ASSETS, ASSET_COLUMNS, KEY_ID + " = ?",
				new String[] { String.valueOf(assetId) }, null, null, null,
				null);
		try {
			if (cursor.moveToFirst()) {
				asset = cursorToAsset(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}

		Log.d("getAsset()-", assetId + "");

		return asset;
	}

	public List<Asset> getAllAssets(String assetIds) {
		List<Asset> assets = new ArrayList<Asset>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_ASSETS, ASSET_COLUMNS, KEY_ID
				+ " in(?)", new String[] { assetIds }, null, null, null, null);
		cursor.moveToFirst();
		try {
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					assets.add(cursorToAsset(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}

		Log.d("getAllAssets()-", assetIds + "");
		return assets;
	}

	public Asset getAsset(int referenceId, String index, String assetGroup,
			String urlKey) {
		Asset asset = new Asset();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_ASSETS, ASSET_COLUMNS, KEY_REFERENCEID
				+ " = ? and " + KEY_INDEX + " = ? and " + KEY_ASSETGROUP
				+ " = ? and " + KEY_URLKEY + " = ? ",
				new String[] { String.valueOf(referenceId), index, assetGroup,
						urlKey }, null, null, null, null);
		try {
			if (cursor.moveToFirst()) {
				asset = cursorToAsset(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}

		Log.d("getAsset()-", referenceId + "," + index + "," + assetGroup + ","
				+ urlKey);

		return asset;
	}

	public List<Asset> getAllAssets(int referenceId, String assetGroup,
			String urlKey) {
		List<Asset> assets = new ArrayList<Asset>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_ASSETS, ASSET_COLUMNS, KEY_REFERENCEID
				+ " = ? and " + KEY_ASSETGROUP + " = ? and " + KEY_URLKEY
				+ " = ? ", new String[] { String.valueOf(referenceId),
				assetGroup, urlKey }, null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					assets.add(cursorToAsset(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}
		Log.d("getAllAssets()-", referenceId + "," + assetGroup + "," + urlKey);
		return assets;
	}

	public List<Asset> getAllAssets(String assetGroup, String urlKey) {
		List<Asset> assets = new ArrayList<Asset>();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_ASSETS, ASSET_COLUMNS, KEY_ASSETGROUP
				+ " = ? and " + KEY_URLKEY + " = ? ", new String[] {
				assetGroup, urlKey }, null, null, null, null);
		try {
			cursor.moveToFirst();
			while (!cursor.isAfterLast()) {
				if (cursor.getInt(0) != 0) {
					assets.add(cursorToAsset(cursor));
				}
				cursor.moveToNext();
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}

		Log.d("getAllAssets()-", assetGroup + "," + urlKey);
		return assets;
	}

	public Asset getAsset(int referenceId, String assetGroup, String urlKey) {
		Asset asset = new Asset();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_ASSETS, ASSET_COLUMNS, KEY_REFERENCEID
				+ " = ? and " + KEY_ASSETGROUP + " = ? and " + KEY_URLKEY
				+ " = ? ", new String[] { String.valueOf(referenceId),
				assetGroup, urlKey }, null, null, null, null);
		try {
			if (cursor.moveToFirst()) {
				asset = cursorToAsset(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}

		Log.d("getAsset()-", referenceId + "," + assetGroup + "," + urlKey);

		return asset;
	}

	public Asset getAsset(String index, String assetGroup, String urlKey) {
		Asset asset = new Asset();
		mDb = mDbHelper.getReadableDatabase();
		Cursor cursor = mDb.query(TABLE_ASSETS, ASSET_COLUMNS, KEY_INDEX
				+ " = ? and " + KEY_ASSETGROUP + " = ? and " + KEY_URLKEY
				+ " = ? ", new String[] { index, assetGroup, urlKey }, null,
				null, null, null);
		try {
			if (cursor.moveToFirst()) {
				asset = cursorToAsset(cursor);
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			cursor.close();
		}

		Log.d("getAsset()-", index + "," + assetGroup + "," + urlKey);

		return asset;
	}

	public boolean updateAsset(Asset asset) {
		if (asset.getId() == 0) {
			return addAsset(asset);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_URLKEY, asset.getUrlKey());

		if (asset.getOnlineUrl() != null)
			values.put(KEY_ONLINEURL, asset.getOnlineUrl());
		values.put(KEY_OFFLINEURL, asset.getOfflineUrl());
		values.put(KEY_INDEX,
				(asset.getIndex() == null ? "0" : asset.getIndex()));
		values.put(KEY_FILETYPE, asset.getFileType());
		values.put(KEY_FILEEXTN, asset.getFileExtn());
		values.put(KEY_ASSETSIZE, asset.getAssetSize());
		values.put(KEY_ASSETNAME, asset.getAssetName());
		values.put(KEY_TIMEMODIFIED, asset.getAssetLastModified());
		values.put(KEY_UPDATEREQUIRED, asset.getUpdateRequired());

		int i = mDb.update(TABLE_ASSETS, values, KEY_ID + " = ? ",
				new String[] { String.valueOf(asset.getId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	public boolean updateAssetStatus(Asset asset) {
		if (asset.getId() == 0) {
			return addAsset(asset);
		}
		mDb = mDbHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put(KEY_UPDATEREQUIRED, asset.getUpdateRequired());

		int i = mDb.update(TABLE_ASSETS, values, KEY_ID + " = ? ",
				new String[] { String.valueOf(asset.getId()) });
		mDbHelper.closeDB();
		return (i > 0);
	}

	private Asset cursorToAsset(Cursor cursor) {
		Asset asset = new Asset();
		asset.setId(cursor.getInt(0));
		asset.setAssetGroup(cursor.getString(1));
		asset.setReferenceId(cursor.getInt(2));
		asset.setIndex(cursor.getString(3));
		asset.setUrlKey(cursor.getString(4));
		asset.setOnlineUrl(cursor.getString(5));
		asset.setOfflineUrl(cursor.getString(6));
		asset.setFileType(cursor.getString(7));
		asset.setFileExtn(cursor.getString(8));
		asset.setAssetSize(cursor.getLong(9));
		asset.setAssetName(cursor.getString(10));
		asset.setUpdateRequired(cursor.getString(11));
		return asset;
	}

}
