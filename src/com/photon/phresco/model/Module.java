package com.photon.phresco.model;

public class Module {

	private int id;

	private int topicsId;

	private int moduleId;
	
	private int courseId;

	private String json;
	
	private String offlineJson;

	private long timeModified;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getTopicsId() {
		return topicsId;
	}

	public void setTopicsId(int topicsId) {
		this.topicsId = topicsId;
	}

	
	public int getModuleId() {
		return moduleId;
	}

	public void setModuleId(int moduleId) {
		this.moduleId = moduleId;
	}

	public String getJson() {
		return json;
	}

	public void setJson(String json) {
		this.json = json;
	}
	
	public String getOfflineJson() {
		return offlineJson;
	}

	public void setOfflineJson(String offlineJson) {
		this.offlineJson = offlineJson;
	}

	public long getTimeModified() {
		return timeModified;
	}

	public void setTimeModified(long timeModified) {
		this.timeModified = timeModified;
	}

	public int getCourseId() {
		return courseId;
	}

	public void setCourseId(int courseId) {
		this.courseId = courseId;
	}
	
	

}
