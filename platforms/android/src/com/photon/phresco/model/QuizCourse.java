package com.photon.phresco.model;

public class QuizCourse {

	private int id;

	private int progressId;

	private String quizName;

	private int quizIndex;

	private double quizScore;

	private long timeModified;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getProgressId() {
		return progressId;
	}

	public void setProgressId(int progressId) {
		this.progressId = progressId;
	}

	public String getQuizName() {
		return quizName;
	}

	public void setQuizName(String quizName) {
		this.quizName = quizName;
	}

	public int getQuizIndex() {
		return quizIndex;
	}

	public void setQuizIndex(int quizIndex) {
		this.quizIndex = quizIndex;
	}

	public double getQuizScore() {
		return quizScore;
	}

	public void setQuizScore(double quizScore) {
		this.quizScore = quizScore;
	}

	public long getTimeModified() {
		return timeModified;
	}

	public void setTimeModified(long timeModified) {
		this.timeModified = timeModified;
	}

}
