package com.JSONparser;

public class CliniqueException extends Exception {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String errorCode;
	public CliniqueException() {
		super();
    }
	
	public CliniqueException(String message) {
		super(message);
    }
	
	public CliniqueException(String errorCode,String message) {
		super(message);
		this.errorCode= errorCode;
    }
	
	public String getErrorCode(){
		return errorCode;
	}
	
}
