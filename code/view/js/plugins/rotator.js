function rotateAttached(stackdom)
{
    stackdom.shown = stackdom[0]; 
    for( var i = 1; i < stackdom.length; ++i ){
        stackdom[i].style#display = "none";
    }
}
function rotateTo(stackdom, el, whenEnds = null )
    {
    const hiddenScale = 0.5; // hidden panel is twice less in size than normal view 
    var elementToHide = stackdom.shown;
    var elementToShow = stackdom.shown = el;
    elementToHide.style#display = "block";
    elementToShow.style#display = "block"; 
    assert  elementToHide.parent === elementToShow.parent; 
    var container = elementToHide.parent;
    var (w,h) = container.box(#dimension, #inner);
    var progress = 0.0;
    function xlat() { return Math.sin( progress * Math.PI ) * w / 2; }
    function zoom() { return Math.cos( progress * Math.PI + Math.PI) * 0.5 + 0.5; }
    var showScale  = [scale: hiddenScale ];
    var showTrans  = [translate: 0px, 0px ];
    var hideScale  = [scale: 1.0 ];
    var hideTrans  = [translate: 0px, 0px ];       
    var showZIndex = 0;
    var hideZIndex = 100;
    function step()
    {
      progress += 0.1;
      if( progress > 1.0 ) { 
          elementToHide.style#display = "none"; 
          if(whenEnds) whenEnds();
          return false; /*stop animation*/ 
      }
      showScale[0] = hiddenScale + (1.0 - hiddenScale) * zoom();
      showTrans[0] = px(xlat());
      hideScale[0] = hiddenScale + (1.0 - hiddenScale) * (1.0 - zoom());
      hideTrans[0] = px(-xlat());
      showZIndex = (progress * 100).toInteger();
      hideZIndex = 100 - (progress * 100).toInteger();
      
      elementToShow.style#transform = [showScale,showTrans];
      elementToHide.style#transform = [hideScale,hideTrans];
      elementToShow.style#z-index = showZIndex;
      elementToHide.style#z-index = hideZIndex;
      return true; // keep animating
    }
    container.animate(step);
}


