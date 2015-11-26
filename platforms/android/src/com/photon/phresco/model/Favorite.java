package com.photon.phresco.model;

public class Favorite {

	private int id;

	private int userId;
	
	private String json;

	private int moduleId;

	private String status;
	
	private long timeModified;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public String getJson() {
		return json;
	}

	public void setJson(String json) {
		this.json = json;
	}

	public int getModuleId() {
		return moduleId;
	}

	public void setModuleId(int moduleId) {
		this.moduleId = moduleId;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public long getTimeModified() {
		return timeModified;
	}

	public void setTimeModified(long timeModified) {
		this.timeModified = timeModified;
	}
	
	
	
}
