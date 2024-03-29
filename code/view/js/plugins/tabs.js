

class Tabs : Element 
{
    function attached() 
    { 
      if( ! this.length )
        return;
      if( ! this.$(:root>strip) )
        this.init();
        
      this.state.focusable = true;
        
      var label = this.$(:root>strip>label[selected]) ||
                  this.$(:root>strip>label:first-child);
      // initialy selected tab or the first one

      var name = label.attributes["for"];
      
      // find panel we need to show by default 
      var panel = this.$(:root>panels>[name='{name}'],:root>panels>#{name});
      assert panel : "Tab panel with the name " + name + " not found";

      if(label) 
        this.post( function() {
          if( !this.$(:root>strip>label:current) ){ // if it was not set by code
             var ww = label.attributes["ww"];
             var wh = label.attributes["wh"];
             this.activate(label, false,ww,wh);       // proceed with initialization.
             }
        });
    }
     
    // get/set current tab by name
    property current(v) {
      get {
        var label = this.$(:root>strip>label:current);
        return label ? label.attributes["for"] : undefined;
      } 
      set {
        var label = this.$(:root>strip>label[for='{v}']);
        var ww = label.attributes["ww"];
        var wh = label.attributes["wh"];
        this.activate(label,false,ww,wh);
      }
    }

    function onMouse(event)
    {
      
      if( event.type != (Event.MOUSE_DOWN | Event.SINKING) && event.type != (Event.MOUSE_DCLICK | Event.SINKING))
        return false;
        
      var label = event.target.$p(label);
      
      if( label && label.parent === this.$(:root>strip) ){
        var ww = label.attributes["ww"];
        var wh = label.attributes["wh"];
        return this.activate( label,true,ww,wh );
      }
      return false;        
    }
    
    function onFocus(event) {
      switch( event.type )
      {
        case Event.GOT_FOCUS: /*stdout.println("focus");*/ break;
      }
    
    } // it is here to indicate that it needs focus.

    function onKey(event) 
    { 
      if(event.type != Event.KEY_DOWN)
        return false; // we are handling only KEY_DOWN here
        
      if(!this.state.focus)
        return false;

      var currentLabel = this.$(:root>strip>label:current);
      var ww = currentLabel.attributes["ww"];
      var wh = currentLabel.attributes["wh"];


      switch( event.keyCode )
      {
        case Event.VK_TAB: 
          if( event.ctrlKey ) 
            return this.activate( event.shiftKey? currentLabel.prior : currentLabel.next,true,ww,wh );
          break;
        case Event.VK_LEFT: return this.activate( currentLabel.prior,true,ww,wh );
        case Event.VK_RIGHT: return this.activate( currentLabel.next ,true,ww,wh);
        case Event.VK_HOME: return this.activate( currentLabel.parent.first ,true,ww,wh);
        case Event.VK_END: return this.activate( currentLabel.parent.last,true,ww,wh );
      }
      return false; 
    }

    // a.k.a. select tab, label here is a <label> inside <strip> 
    function activate( label, notify = true,ww="",wh="" )
    {
      if( !label )
        return false;
      if(label.state.current)
        // already selected, nothing to do...
        return true; // but we've handled it.
     

      //异步加载图集
      var attrId = label.attributes["id"];
      if(attrId == "idx_label_second"){
          var images = $$(#second_thumbs img);
          if(images.length > 0 ){
              for (var image in images){
                if(image.attributes["data-src"] != "" && image.attributes["data-src"] != undefined){
                  image.attributes["src"] = image.attributes["data-src"];
                  image.attributes["data-src"] = "";
                }
              }
          }

      }

      var strip = this.$(:root>strip);
     
      //find currently selected element (tab and panel) and remove "selected" from them
      var currentPanel = this.$(:root>panels>[name]:expanded,:root>panels>[id]:expanded);
      var currentLabel = strip.$(label:current);

      // find new tab and panel       
      var name = label.attributes["for"];
      var panel = this.$(:root>panels>[name='{name}'],:root>panels>#{name});
      
      assert panel : "panel " + name + " not found";

      if( currentPanel ) {
        currentPanel.state.collapsed = true; // set collapsed in case of someone use it for styling
        currentPanel.postEvent("collapsed");
      }
      if( currentLabel )
        currentLabel.state.current = false; 

      panel.sendEvent("expanded");
      strip.state.current = true; 
      panel.state.expanded = true; // expand it
      label.state.current = true;
      
      if (ww != undefined && wh != undefined && ww != "" && wh != ""){
        var (x,y,w,h) = view.box(#rectw,#border,#screen);
        view.move(x,y,self.toPixels(ww),self.toPixels(wh));
        //view.move(x,y,ww.toInteger(),wh.toInteger());
      }

      if(notify)
        this.postEvent("statechange");
      
      return true;
    }

}