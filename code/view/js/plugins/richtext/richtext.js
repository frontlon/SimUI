
class Richtext: Behavior {

  const ACTIVE = 0x01;
  const DISABLED = 0x02;

  function attached() { 
    var nodes = this.nodes(); // store initial content
    this.clear();             // clear 
    this.append(this.toolbar = new Element("toolbar"));
    this.append(this.htmlarea = new Element("htmlarea"));
    //var body;
    //this.htmlarea.append(body = new Element("section"));
    //for( var node in nodes ) // assign content to htmlarea > body
    //  body.appendNode(node);
    this.observers = [];
    this.initToolbar();
    this.setupKeyBindings();
  }
  function detached() {}
  
  property source(v) {
    get return this.htmlarea.html;
  }
      
  // binds UI thing (e.g. toolbar button) with command|function to be executed onClick
  function bind(selector, cmd, param = undefined) {
    var me = this;
    var uiel = this.select(selector); assert uiel;
    if(typeof cmd == #function) {
      uiel.onClick = :: cmd.call(me,#exec,param);
      this.observers.push( function() {
        var cmdState = cmd.call(me,#query,param) || 0;
        uiel.state.checked  = (cmdState & ACTIVE) != 0;
        uiel.state.disabled = (cmdState & DISABLED) != 0;
      });
    } else if(typeof cmd == #string) {
      uiel.onClick = :: me.htmlarea.execCommand(cmd,param);
      this.observers.push( function() {
        var cmdState = me.htmlarea.queryCommand(cmd,param) || 0;
        uiel.state.checked  = (cmdState & ACTIVE) != 0;
        uiel.state.disabled = (cmdState & DISABLED) != 0;
      });
    } else 
      assert false: "Bad cmd type";
  }
    
  function initToolbar() {

    // build toolbar
    this.toolbar.$content
       (<button .bold />
        <button .italic />
        <button .underline />
        <splitter/>
        <button|menu .font-size>
          <menu.popup>
            <li>1 - xx-small</li>
            <li>2 - x-small</li>
            <li>3 - small</li>
            <li>4 - normal</li>
            <li>5 - large</li>
            <li>6 - x-large</li>
            <li>7 - xx-large</li>
          </menu>
        </button>

        <splitter/>
        <button .ulist title="unordered list" />
        <button .olist title="ordered list" />
        <button .dlist title="definitions list" />
        <splitter/>
        <button .pre title="pre block" />
        <splitter/>
        <button .picture />
       );
        
    this.bind("button.bold",          "format:toggle-span:b|strong");    
    this.bind("button.italic",        "format:toggle-span:i|em");
    this.bind("button.underline",     "format:toggle-span:u");

    this.bind("button.ulist",         "format:toggle-list:ul");
    this.bind("button.olist",         "format:toggle-list:ol");
    this.bind("button.dlist",         "format:toggle-list:dl");
    this.bind("button.pre",           "format:toggle-pre");

    this.bind("button.font-size li:nth-child(1)", "format:apply-span:font", {size:1});
    this.bind("button.font-size li:nth-child(2)", "format:apply-span:font", {size:2});
    this.bind("button.font-size li:nth-child(3)", "format:apply-span:font", {size:3});
    this.bind("button.font-size li:nth-child(4)", "format:apply-span:font", {size:4});
    this.bind("button.font-size li:nth-child(5)", "format:apply-span:font", {size:5});
    this.bind("button.font-size li:nth-child(6)", "format:apply-span:font", {size:6});
    this.bind("button.font-size li:nth-child(7)", "format:apply-span:font", {size:7});

    this.bind("button.picture", this.onInsertPicture); 

   
  }
  
  function SetupTableSelector(button) 
  {
      const DEF_TABLE_COLS = 8;
      const DEF_TABLE_ROWS = 5;

      var selTableRow = -1;
      var selTableCol = -1;
      
      var me = this;
      var menu = button.$(>menu);
      
      const tableStyle = "<header>table width:<button|radio(tablewidth) value='false' checked>auto</button>"
                                             "<button|radio(tablewidth) value='width=100%'>100%</button></header>";

        // initialization    
      var tableGrid = "<table><tbody>";
        for( var r in DEF_TABLE_ROWS ) {
          tableGrid += "<tr>";
          for( var c in DEF_TABLE_COLS )
            tableGrid += "<td/>";
          tableGrid += "</tr>";
        }
      tableGrid += "</tbody></table>";
      
      menu.html = tableStyle + tableGrid;
          
      var table = button.$(:root>menu>table>tbody);
      
      function setSelection(R = -1,C = -1) {
        if( C == selTableCol && R == selTableRow )
          return;
        for( var r in DEF_TABLE_ROWS )
          for( var c in DEF_TABLE_COLS )
                table[r][c].attributes["selected"] = r <= R && c <= C ? true : undefined; 
        selTableCol = C;
        selTableRow = R;
      }
      
      table << event mousemove(evt) 
      {
        var td = evt.target.$p(td);
        if( !td || !evt.target.belongsTo(table)) return;
        var C = td.index;
        var R = td.parent.index;
        setSelection(R,C);
      };

      table << event mouseleave(evt) {
        setSelection();
      };

      table << event click $(td) {
        var C = this.index;
        var R = this.parent.index;
        this.closePopup();
        me.insertTable(R+1,C+1, menu.$(header).value.tablewidth);
        return true; // handled
      };

      button << event popupready {
        setSelection();
      } 
      
  }

  function onStateChanged() 
  {
    for(var func in this.observers) func(); 
    // menus
    var noSelection = this.htmlarea.selection.isCollapsed;
    for( var button in this.toolbar.$$(button.font-size,button.font-family))
      button.state.disabled = noSelection; 
  }
  
  function insertTable(rows, columns, width=undefined, border=undefined) 
  {
    stdout.println("width", width, rows, columns);
    var html = "<table border " + (width || "") + ">";
    for( var r in rows ) {
      html += "<tr>";
      for( var r in columns )
          html += "<td />";
      html += "</tr>";
    }  
    html += "</table>";
    this.htmlarea.execCommand("edit:insert-html",html);

  }
  
  function insertPicture(url) {
  
    var html = String.$(<img src="{url}" >);
    
    function insertIt(transaction) {
      // 'this' here is an htmlarea
      var pos = transaction.removeRange();   // delete selection if any
      var insertedNodes = transaction.insertHtml(pos, html);     // insert the html at pos
      assert(insertedNodes && insertedNodes[0].tag == "img");
      var img = insertedNodes[0];
      
      this.state.focus = true;
      
      var firstTextPos = img.firstCaretPos;
      var lastTextPos = img.lastCaretPos;
      this.selection.select(firstTextPos,lastTextPos);  // select whole image
      return true;
    }
    this.htmlarea.transact(insertIt,"insert picture"); // do the action inside undoable transaction.    
  }
  
  function onInsertPicture(cmd,param) {
    if(cmd == #exec) {
      const defaultExt = "";
      const initialPath = "";
      const filter = "Images Files (*.gif;*.png;*.jpg;*.jpeg;*.ico;*.bmp;*.webp)|*.gif;*.png;*.jpg;*.jpeg;*.ico;*.bmp;*.webp|All Files (*.*)|*.*";
      const caption = CONF.Lang.SelectPicFile;
      var url = view.selectFile(#open, filter, defaultExt, initialPath, caption );
      if(url){
          url = URL.toPath(url);
          url = url.split("\/").join(SEPARATOR);
          var platform = $(#platform_list).select("li:current").value;
          url = mainView.UploadPlatformImages(platform,url);
          this.insertPicture(url);
      }
    }    
  }

  function onAlign(cmd,param) {
    var htmlarea = this.htmlarea;
    const ELEMENTS = "p,td,th,h1,h2,h3,h4,h5,h6";
    function state() {
      if(!htmlarea.selection.contains(ELEMENTS))
        return DISABLED;
      if(htmlarea.selection.contains("[align=" + param + "]"))
        return ACTIVE;
      return 0;
    }
    function apply() {
      var elements = htmlarea.selection.elements(ELEMENTS);
      function setAlign(transaction) {
        for(var el in elements)   
          transaction.attr(el,"align",param);
        return true;
      }
      htmlarea.transact(setAlign,"set align"); // do the action inside undoable transaction.
    }
    if(cmd == #exec) apply();
    return state(); 
  }
    
  // helper methods:
  function blockContainerOf(node) {
    var root = this.htmlarea;
    var c = node;
    while( c ) 
    {
      if(c.contentModel == #block-inside) return c;
      if(c == root) return null;
      c = c.parent;
    }
    return null;
  }
  
  function setupKeyBindings() {
  
    const magickeys = 
    [
         { name: "ENTER",   code: Event.VK_RETURN,   cmd:"edit:insert-block-break",        desc: "break block element" },

    ];
  
    this.htmlarea.onKey = function(evt) {
      if( evt.type != Event.KEY_DOWN ) return;
      if( !evt.ctrlKey ) return;
      for(var mk in magickeys)
        if( evt.keyCode == mk.code ) {
          return this.execCommand(mk.cmd,undefined);
        }
    }
  
  }
  
  
}



