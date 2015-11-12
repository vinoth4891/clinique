package com.photon.phresco.model;

public class Topics {

	private int id;

	private int topicsId;

	private int courseId;

	private String json;
	
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

	
}
