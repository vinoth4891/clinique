package CustomView;

 
import com.cliniqueoffline.phresco.hybrid.R;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.CheckBox;

public class CliniqueCheckBox extends CheckBox{
	
	
	public CliniqueCheckBox(Context context) {
		super(context);
 	}

	
	public CliniqueCheckBox(Context context, AttributeSet attrs) {
		super(context, attrs);
 	}

	
	public CliniqueCheckBox(Context context, AttributeSet attrs, int defStyle) {
		super(context, attrs, defStyle);
 	}
	
	@Override
    public void setChecked(boolean isChecked){
        if(isChecked)
        {
            this.setBackgroundResource(R.drawable.bookmark_select);
        }
        else
        {
            this.setBackgroundResource(R.drawable.bookmark);
        }
        super.setChecked(isChecked);
    }

}
