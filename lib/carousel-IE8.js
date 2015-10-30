var $descriptions = jQuery('#carousel-descriptions').children('li'),
            $controls = jQuery('#carousel-controls').find('span'),
            $carousel = jQuery('#carousel')
            .roundabout({
                childSelector:"li",
                minOpacity:1,
                minScale:0.1,
                maxScale:0.8,
				clickToFocus:true,
				dragFactor:10,
                enableDrag: true,
                responsive:true,
                dropDuration: 300
            })
            .on('focus', 'li', function() {
                var slideNum = $carousel.roundabout("getChildInFocus");
                $descriptions.add($controls).removeClass('current');
                jQuery($descriptions.get(slideNum)).addClass('current');
                jQuery($controls.get(slideNum)).addClass('current');
            });
            $controls.on('tap dblclick', function() {
                var slideNum = -1,
                i = 0, len = $controls.length;
                for (i=0 ; i<len; i++) {
                    if (this === $controls.get(i)) {
                        slideNum = i;
                        break;
                    }
                }
                if (slideNum >= 0) {
                    $controls.removeClass('current');
                    jQuery(this).addClass('current');
                    $carousel.roundabout('animateToChild', slideNum);
                }
            });