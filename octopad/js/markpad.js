var MarkPad = {
  fileName: "New File",
  
  editor: function(config){
    this.config = config;
    this.config.element = document.querySelector(this.config.div);
    this.load_ui();
  },
  
  load_ui: function(){
    current_text = this.config.element.innerHTML;
    this.config.element.innerHTML = "<div id=\"markpad-ui-toolbar\"><span class=\"brand\">" + MarkPad.config.title + "</span><div id=\"markpad-ui-toolbar-buttons\"></div></div><div id=\"markpad-ui-editor\" contenteditable=\"true\"></div><div id=\"markpad-ui-box\"></div><div id=\"markpad-ui-preview\"></div>";
    document.querySelector("#markpad-ui-editor").innerHTML = current_text
    MarkPad.updateContent()
    document.querySelector("#markpad-ui-editor").onkeyup = function(){
      MarkPad.updateContent()
      MarkPad.reScroll()
    }
    
    MarkPad.tools.init()
  },
  
  updateContent: function(){
    this.preParse = MarkPad.helpers.preParseDivContents(document.querySelector("#markpad-ui-editor").innerHTML)
    document.querySelector("#markpad-ui-preview").innerHTML = marked(this.preParse);
  },
  
  reScroll: function(){
    editor = document.querySelector("#markpad-ui-editor")
    preview = document.querySelector("#markpad-ui-preview")
    scrollPercentage = (editor.scrollTop + editor.offsetHeight) / editor.scrollHeight
    preview.scrollTop = preview.scrollHeight * scrollPercentage
  }
}

MarkPad.helpers = {  
  preParseDivContents: function(raw){
    return raw.replace(/<\/div><div>/g,"\r\n").replace(/<br>/g,"\r\n").replace(/<div>/g,"").replace(/<\/div>/g,"").replace(/&nbsp; /g," ")
  },
  
  appendHTML: function(el, append){
    el.innerHTML = el.innerHTML + append
  },
  
  displayModal: function(title, content){
    document.querySelector("#markpad-ui-editor").style.width = "25%"
    document.querySelector("#markpad-ui-preview").style.width = "25%"
    document.querySelector("#markpad-ui-box").style.width = "50%"
    document.querySelector("#markpad-ui-box").innerHTML = "<h1>" + title + "</h1>" + content + "<button id=\"markpad-ui-box-close\">Close</button>"
    setTimeout(function(){
      document.querySelector("#markpad-ui-box").style.padding = "15px"
    }, 100)
    document.querySelector("#markpad-ui-box-close").addEventListener("click", function(){
      MarkPad.helpers.closeModal()
    })
  },
  
  closeModal: function(){
    document.querySelector("#markpad-ui-editor").style.width = "50%"
    document.querySelector("#markpad-ui-preview").style.width = "50%"
    document.querySelector("#markpad-ui-box").style.width = "0%"
    document.querySelector("#markpad-ui-box").style.padding = "0px"
    document.querySelector("#markpad-ui-box").innerHTML = ""
  },
  
  save: function(){
    OctoPad.save()
  },
  
  open: function(){
    MarkPad.helpers.displayModal("Open", "<ul id=\"storage-list\"></ul>")
    setTimeout(function(){
      for(file in localStorage){
        if(file != "summaryCollapsed"){
          MarkPad.helpers.appendHTML(document.querySelector("#storage-list"), "<li><button class=\"markpad-load-file\">" + file + "</button></li>")
        }
      }
      
      files = document.querySelectorAll(".markpad-load-file")
      Array.prototype.slice.call(files).forEach(function(el){
        el.addEventListener("click", function(event){
          document.querySelector("#markpad-ui-editor").innerHTML = LZString.decompressFromUTF16(localStorage.getItem(event.target.innerHTML))
          MarkPad.helpers.closeModal()
          MarkPad.updateContent()
          MarkPad.fileName = event.target.innerHTML
        })
      })
    }, 100)
  }
}

MarkPad.tools = {
  buttons: [],
  
  init: function(){
    this.element = document.querySelector("#markpad-ui-toolbar-buttons")
    this.addButton("markpad-preview", "Close Preview", "arrow_right", function(){
      MarkPad.tools.preview()
    })
    this.addButton("markpad-save", "Save", "cloud_download", function(){
      MarkPad.helpers.save()
    })
    this.addButton("markpad-open", "Open", "book", function(){
      MarkPad.helpers.open()
    })
    this.buttons.forEach(function(button){
      document.querySelector("#" + button[0]).addEventListener("click", button[1])
    })
  },
  
  addButton: function(id, name, icon, callback){
    MarkPad.helpers.appendHTML(this.element, "<button id=\"" + id + "\" title=\"" + name + "\"><span class=\"iconic " + icon + "\"></span></button>")
    this.buttons.push([id, callback])
  },
  
  preview: function(){
    if(document.querySelector("#markpad-ui-preview").style.width == "0px"){
      document.querySelector("#markpad-ui-preview").style.width = "50%"
      document.querySelector("#markpad-ui-editor").style.width = "50%"
      document.querySelector("#markpad-ui-preview").style.padding = "15px"
      document.querySelector("#markpad-preview").innerHTML = "<span class=\"iconic arrow_right\"></span>"
    }else{
      document.querySelector("#markpad-ui-preview").style.width = "0px"
      document.querySelector("#markpad-ui-preview").style.padding = "0px"
      document.querySelector("#markpad-ui-editor").style.width = "100%"
      document.querySelector("#markpad-preview").innerHTML = "<span class=\"iconic arrow_left\"></span>"
    }
  }
}