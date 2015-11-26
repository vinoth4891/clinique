package CustomView;

import android.content.Context;
import android.graphics.Typeface;
import android.util.AttributeSet;
import android.widget.TextView;

public class CliniqueTextView extends TextView {

	public CliniqueTextView(Context context, AttributeSet attrs, int defStyle) {
		super(context, attrs, defStyle);
	}

	public CliniqueTextView(Context context, AttributeSet attrs) {
		super(context, attrs);
	}

	public CliniqueTextView(Context context) {
		super(context);
	}

	@Override
	public void setTypeface(Typeface tf, int style) {

		// This is to override eclipse error messages
		if (!super.isInEditMode()) {

			if (style == Typeface.BOLD) {
				super.setTypeface(Typeface.createFromAsset(getContext().getAssets(), "www/fonts/HelveticaNeue-Medium.ttf"));
			} else if (style == Typeface.ITALIC) {
				super.setTypeface(Typeface.createFromAsset(getContext().getAssets(), "www/fonts/helveticaneueltstdlt0.ttf"));
			} else {
				super.setTypeface(Typeface.createFromAsset(getContext().getAssets(), "www/fonts/helveticaneueltstdlt0.ttf"));
			}
		}
	}

}
