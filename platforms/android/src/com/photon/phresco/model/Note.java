package com.photon.phresco.model;

public class Note {

	private int id;

	private int userId;
	
	private String comment;

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

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
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
