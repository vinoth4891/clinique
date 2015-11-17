package com.photon.phresco.model;

public class UserBadges {

	private int id;

	private int userId;

	private String badges;

	private String added;

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

	public String getBadges() {
		return badges;
	}

	public void setBadges(String badges) {
		this.badges = badges;
	}

	public String getAdded() {
		return added;
	}

	public void setAdded(String added) {
		this.added = added;
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
