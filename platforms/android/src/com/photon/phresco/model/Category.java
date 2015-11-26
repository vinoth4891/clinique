package com.photon.phresco.model;

public class Category {

	private int id;
	
	private int categoryId;

	private String name;

	private String json;

	private long timeModified;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}
	
	

	public int getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(int categoryId) {
		this.categoryId = categoryId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
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
