package com.photon.phresco.model;

public class ActivityMaintenance {

	private int id;

	private int userId;

	private int moduleId;

	private int isCompletion;

	private String status;

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

	public int getModuleId() {
		return moduleId;
	}

	public void setModuleId(int moduleId) {
		this.moduleId = moduleId;
	}

	public int getIsCompletion() {
		return isCompletion;
	}

	public void setIsCompletion(int isCompletion) {
		this.isCompletion = isCompletion;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

}
