package com.photon.phresco.model;


public class Asset {

	private int id;

	private String assetGroup;
	
	private int referenceId;
	
	private String index;

	private String urlKey;
    
    private String onlineUrl;
    
    private String offlineUrl;
    
    private String fileType;
    
    private String fileExtn;
    
    private long assetSize;
    
    private String assetName;
   
   
    private long assetLastModified;
    
    private String updateRequired;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}	
	

	public String getAssetGroup() {
		return assetGroup;
	}

	public void setAssetGroup(String assetGroup) {
		this.assetGroup = assetGroup;
	}

	public int getReferenceId() {
		return referenceId;
	}

	public void setReferenceId(int referenceId) {
		this.referenceId = referenceId;
	}

	public String getUrlKey() {
		return urlKey;
	}

	public void setUrlKey(String urlKey) {
		this.urlKey = urlKey;
	}

	public String getOnlineUrl() {
		return onlineUrl;
	}

	public void setOnlineUrl(String onlineUrl) {
		this.onlineUrl = onlineUrl;
	}

	public String getOfflineUrl() {
		return offlineUrl;
	}

	public void setOfflineUrl(String offlineUrl) {
		this.offlineUrl = offlineUrl;
	}

	public String getFileType() {
		return fileType;
	}

	public void setFileType(String fileType) {
		this.fileType = fileType;
	}

	public String getFileExtn() {
		return fileExtn;
	}

	public void setFileExtn(String fileExtn) {
		this.fileExtn = fileExtn;
	}

	public long getAssetSize() {
		return assetSize;
	}

	public void setAssetSize(long assetSize) {
		this.assetSize = assetSize;
	}

	public String getAssetName() {
		return assetName;
	}

	public void setAssetName(String assetName) {
		this.assetName = assetName;
	}

	public long getAssetLastModified() {
		return assetLastModified;
	}

	public void setAssetLastModified(long assetLastModified) {
		this.assetLastModified = assetLastModified;
	}

	public String getUpdateRequired() {
		return updateRequired;
	}

	public void setUpdateRequired(String updateRequired) {
		this.updateRequired = updateRequired;
	}

	public String getIndex() {
		return index;
	}

	public void setIndex(String index) {
		this.index = index;
	}       	
	
        
}
