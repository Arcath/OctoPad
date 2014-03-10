String.prototype.scan = function (re) {
    if (!re.global) throw "ducks";
    var s = this;
    var m, r = [];
    while (m = re.exec(s)) {
        m.shift();
        r.push(m);
    }
    return r;
};

function nl2br (str, is_xhtml) {
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

var OctoPad = {
  files: [],
  
  init: function(config){
    this.config = config
    document.querySelector(".no-js").style.display = "none";
    document.querySelector(".login").innerHTML = "<img src=\"/octopad/img/github.png\" /><input type=\"text\" id=\"gh-username\" placeholder=\"Github Username\" ><input type=\"password\" id=\"gh-password\" placeholder=\"Github Password\" /><button id=\"gh-login\">Login</button><h2>Or</h2><input type=\"text\" id=\"gh-token\" placeholder=\"Github Token\">"
    document.querySelector("#gh-login").addEventListener("click", function(){
      if(document.querySelector("#gh-token").value == ""){
        OctoPad.github = new Github({
          username: document.querySelector("#gh-username").value,
          password: document.querySelector("#gh-password").value,
          auth: "basic"
        })
      }else{
        OctoPad.github = new Github({
          token: document.querySelector("#gh-token").value,
          auth: "oauth"
        })
      }
      
      document.querySelector(".login").innerHTML = "<div class=\"loading\">Loading...</div>"
      
      OctoPad.repo = OctoPad.github.getRepo(OctoPad.config.ghUser, OctoPad.config.ghRepo)
      OctoPad.repo.show(function(err, repo){
        if(err){
          document.querySelector(".login").innerHTML = "<div class=\"no-js\">Error Connecting to Github</div>"
        }else{
          OctoPad.loadUi()
        }
      })
    })
  },
  
  loadUi: function(){
    document.querySelector("body").innerHTML = "<div id=\"menu\">Loading...</div><div id=\"main\">Loading...</div>"
    OctoPad.repo.contents(OctoPad.config.ghBranch, OctoPad.config.ghPath, function(err, data){
      console.log(err)
    }, false)
    
    OctoPad.loadMenu()
  },
  
  loadMenu: function(){
    document.querySelector("#menu").innerHTML = "<h1>OctoPad</h1><ul id=\"menu-items\"></ul>"
    tree = OctoPad.repo.getTree(OctoPad.config.ghBranch + "?recursive=true", function(err, data){
      for(entry in data){
        if(RegExp(OctoPad.config.ghPath).test(data[entry].path)){
          OctoPad.repo.read(OctoPad.config.ghBranch, data[entry].path, function(err, file){
            array = [data[entry].path, file]
            OctoPad.files.push(array)
            OctoPad.addMenuEntry(OctoPad.files.indexOf(array))
          })
        }
      }
    })
    
    document.querySelector("#menu-items").addEventListener("click", function(e){
      document.querySelector("#main").innerHTML = nl2br(OctoPad.files[e.target.dataset.index][1])
      fileInfo = OctoPad.parseFileInfo(e.target.dataset.index)
      MarkPad.editor({
        div: "#main",
        title: fileInfo[1]
      })
    })
  },
  
  addMenuEntry: function(fileIndex){
    console.log(fileIndex)
    fileInfo = OctoPad.parseFileInfo(fileIndex)
    document.querySelector("#menu-items").innerHTML = document.querySelector("#menu-items").innerHTML + "<li><a href=\"#\" data-path=\"" + fileInfo[0] + "\" data-index=\"" + fileIndex + "\">" + fileInfo[1] + "</a></li>"
  },
  
  parseFileInfo: function(fileIndex){
    info = []
    info.push(OctoPad.files[fileIndex][0])
    info.push(OctoPad.files[fileIndex][1].scan(/title:.*?"(.*)"/g)[0][0])
    return info;
  },
  
  save: function(){
    OctoPad.repo.write(OctoPad.config.ghBranch, fileInfo[0], MarkPad.helpers.preParseDivContents(document.querySelector("#markpad-ui-editor").innerHTML), 'Updated using OctoPad', function(err){
      console.log(err)
    })
  }
}