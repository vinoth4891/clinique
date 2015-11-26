package com.photon.phresco.model;

public class Course {

	private int id;

	private int courseId;

	private int categoryId;

	private String json;

	private String status;

	private long activateTime;

	private String assetIds;

	private long timeModified;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getCourseId() {
		return courseId;
	}

	public void setCourseId(int courseId) {
		this.courseId = courseId;
	}

	public String getJson() {
		return json;
	}

	public void setJson(String json) {
		this.json = json;
	}

	public long getTimeModified() {
		return timeModified;
	}

	public void setTimeModified(long timeModified) {
		this.timeModified = timeModified;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public long getActivateTime() {
		return activateTime;
	}

	public void setActivateTime(long activateTime) {
		this.activateTime = activateTime;
	}

	public String getAssetIds() {
		return assetIds;
	}

	public void setAssetIds(String assetIds) {
		this.assetIds = assetIds;
	}

	public int getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
	}

}
