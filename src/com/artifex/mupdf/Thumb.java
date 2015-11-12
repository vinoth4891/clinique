package com.artifex.mupdf;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.drawable.BitmapDrawable;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.GridView;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.JSONparser.Variable;
import com.clinique.phresco.hybrid.R;

public class Thumb extends Activity implements OnClickListener {

	public static ArrayList<Bitmap>	bitmap;
	ArrayList<Bitmap>				bookmarkBMP;
	String							FileName	= "";
	String							TotalPages	= "";
	ArrayList<String>				bookmarkPages;
	ArrayList<Integer>				bookmarkPagesInteger;
	GridView						grdView, grdThumbBookmark;
	Button							btnDone, btnAllPages, btnBookmarkPages;
	File							file;
	TextView						lblNoBmrk;
	boolean							isAllPages	= true;

	class Adapter extends BaseAdapter {

		ArrayList<Bitmap>	bmpAdapter;

		Adapter(ArrayList<Bitmap> bmp) {
			this.bmpAdapter = bmp;
		}

		@Override
		public int getCount() {
			return bmpAdapter.size();
		}

		@Override
		public Object getItem(int arg0) {
			return bmpAdapter.get(arg0);
		}

		@Override
		public long getItemId(int arg0) {
			return arg0;
		}

		@Override
		public View getView(int position, View view, ViewGroup arg2) {
			ViewHolder holder = null;
			if (view == null) {
				LayoutInflater inflater = (LayoutInflater) getSystemService(Context.LAYOUT_INFLATER_SERVICE);
				view = inflater.inflate(R.layout.inflate_item, null);
				holder = new ViewHolder();
				holder.imgThumbnail = (ImageView) view.findViewById(R.id.imgThumbnail);
				holder.imgBookmark = (ImageView) view.findViewById(R.id.imgBookmark);
				holder.loadingBar = (ProgressBar) view.findViewById(R.id.loadingBar);
				view.setTag(holder);
			} else {
				holder = (ViewHolder) view.getTag();
			}
			int i = position + 1;

			if (bookmarkPages.contains(i + "")) {
				holder.imgBookmark.setVisibility(View.VISIBLE);
				bookmarkBMP.add(bmpAdapter.get(position));
			} else {
				holder.imgBookmark.setVisibility(View.GONE);
			}
			BitmapDrawable ob = new BitmapDrawable(bmpAdapter.get(position));
			holder.imgThumbnail.setBackgroundDrawable(ob);
			holder.imgThumbnail.setTag(position + "");

			return view;
		}
	}

	class bookmarkAdapter extends BaseAdapter {

		@Override
		public int getCount() {
			return bookmarkPagesInteger.size();
		}

		@Override
		public Object getItem(int arg0) {
			return bookmarkPagesInteger.get(arg0);
		}

		@Override
		public long getItemId(int arg0) {
			return arg0;
		}

		@Override
		public View getView(int position, View view, ViewGroup arg2) {
			ViewHolder holder = null;
			if (view == null) {
				LayoutInflater inflater = (LayoutInflater) getSystemService(Context.LAYOUT_INFLATER_SERVICE);
				view = inflater.inflate(R.layout.inflate_item, null);
				holder = new ViewHolder();
				holder.imgThumbnail = (ImageView) view.findViewById(R.id.imgThumbnail);
				holder.imgBookmark = (ImageView) view.findViewById(R.id.imgBookmark);
				holder.loadingBar = (ProgressBar) view.findViewById(R.id.loadingBar);
				view.setTag(holder);
			} else {
				holder = (ViewHolder) view.getTag();
			}
			int i = position + 1;

			try {
				holder.imgBookmark.setVisibility(View.VISIBLE);
				BitmapDrawable ob = new BitmapDrawable(bitmap.get(bookmarkPagesInteger.get(position) - 1));
				holder.imgThumbnail.setBackgroundDrawable(ob);
				holder.imgThumbnail.setTag(bookmarkPagesInteger.get(position));
			} catch (Exception e) {
				e.printStackTrace();
			}

			return view;
		}
	}

	class ViewHolder {
		ImageView	imgThumbnail, imgBookmark;
		int			position;
		ProgressBar	loadingBar;
	}

	private void getIntentValue() {
		Bundle b = getIntent().getExtras();

		if (b != null) {
			bookmarkPages = b.getStringArrayList("bookmark");
			bookmarkPagesInteger = getIntegerArray(bookmarkPages);
			Collections.sort(bookmarkPagesInteger);

		}

	}

	private void init() {
		bookmarkBMP = new ArrayList<Bitmap>();
		grdView = (GridView) findViewById(R.id.grdThumb);
		grdThumbBookmark = (GridView) findViewById(R.id.grdThumbBookmark);
		btnDone = (Button) findViewById(R.id.btnDone);
		btnAllPages = (Button) findViewById(R.id.btnAllPages);
		btnBookmarkPages = (Button) findViewById(R.id.btnBookmarkPages);
		lblNoBmrk = (TextView) findViewById(R.id.lblNoBmrk);
		bitmap = MuPDFActivity.bitmap;
		grdView.setAdapter(new Adapter(MuPDFActivity.bitmap));
		lblNoBmrk.setVisibility(View.GONE);
		grdThumbBookmark.setVisibility(View.GONE);
		grdThumbBookmark.setAdapter(new bookmarkAdapter());

		grdView.setOnItemClickListener(new OnItemClickListener() {
			@Override
			public void onItemClick(AdapterView<?> arg0, View arg1, int position, long arg3) {
				Intent returnIntent = new Intent();
				returnIntent.putExtra(Variable.PAGE_NO, position);
				setResult(RESULT_OK, returnIntent);
				finish();
			}
		});

		grdThumbBookmark.setOnItemClickListener(new OnItemClickListener() {
			@Override
			public void onItemClick(AdapterView<?> arg0, View view, int position, long arg3) {
				ImageView imgThumbnail = (ImageView) view.findViewById(R.id.imgThumbnail);
				Intent returnIntent = new Intent();
				returnIntent.putExtra(Variable.PAGE_NO, Integer.parseInt(imgThumbnail.getTag().toString()) - 1);
				setResult(RESULT_OK, returnIntent);
				finish();
			}
		});

		btnDone.setOnClickListener(this);
		btnAllPages.setOnClickListener(this);
		btnBookmarkPages.setOnClickListener(this);
		btnAllPages.setBackgroundResource(R.drawable.list_select);

	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		setContentView(R.layout.activity_thumb);
		getIntentValue();
		init();

	}

	@Override
	public void onClick(View v) {
		switch (v.getId()) {
		case R.id.btnDone:
			finish();
			break;

		case R.id.btnAllPages:
			grdView.setVisibility(View.VISIBLE);
			grdThumbBookmark.setVisibility(View.GONE);
			btnAllPages.setBackgroundResource(R.drawable.list_select);
			btnBookmarkPages.setBackgroundResource(R.drawable.bookmark);
			lblNoBmrk.setVisibility(View.GONE);
			break;

		case R.id.btnBookmarkPages:
			grdView.setVisibility(View.GONE);
			if (bookmarkPages.size() > 0) {
				grdThumbBookmark.setVisibility(View.VISIBLE);
			} else {
				lblNoBmrk.setVisibility(View.VISIBLE);
				grdThumbBookmark.setVisibility(View.GONE);
			}
			btnAllPages.setBackgroundResource(R.drawable.list);
			btnBookmarkPages.setBackgroundResource(R.drawable.bookmark_select);
			break;

		default:
			break;
		}
	}

	@Override
	protected void onDestroy() {

		super.onDestroy();
	}

	private ArrayList<Integer> getIntegerArray(ArrayList<String> stringArray) {
		ArrayList<Integer> result = new ArrayList<Integer>();
		for (String stringValue : stringArray) {
			try {

				result.add(Integer.parseInt(stringValue));
			} catch (NumberFormatException nfe) {
				Log.w("NumberFormat", "Parsing failed! " + stringValue + " can not be an integer");
			}
		}
		return result;
	}

}
