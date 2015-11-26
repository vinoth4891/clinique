package com.photon.phresco.model;


public class User {

	private int id;

	private String username;

	private String password;
	
	private String pass;

	private String token;

	private int userId;

	private String json;
	
	private String activeCourses;
	
	private String quizData;
	
	private int firstTime;
	
	private long serverTime;
	
	private String offlineJson;
	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getUsername() {
		if(username!=null){
			return username.toLowerCase();
		}
		else{
			return null;
		}
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getJson() {
		return json;
	}

	public void setJson(String json) {
		this.json = json;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public String getOfflineJson() {
		return offlineJson;
	}

	public void setOfflineJson(String offlineJson) {
		this.offlineJson = offlineJson;
	}

	public int getFirstTime() {
		return firstTime;
	}

	public void setFirstTime(int firstTime) {
		this.firstTime = firstTime;
	}

	public long getServerTime() {
		return serverTime;
	}

	public void setServerTime(long serverTime) {
		this.serverTime = serverTime;
	}

	public String getPass() {
		return pass;
	}

	public void setPass(String pass) {
		this.pass = pass;
	}

	public String getActiveCourses() {
		return activeCourses;
	}

	public void setActiveCourses(String activeCourses) {
		this.activeCourses = activeCourses;
	}

	public String getQuizData() {
		return quizData;
	}

	public void setQuizData(String quizData) {
		this.quizData = quizData;
	}
	
	

}
