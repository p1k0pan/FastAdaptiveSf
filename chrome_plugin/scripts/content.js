function parse_paragraph(){
    const p = document.querySelectorAll('p')
    const h1 = document.querySelectorAll('h1')
    const h2 = document.querySelectorAll('h2')
    const li = document.querySelectorAll('li')
    const content_to_extract = [p, h1, h2, li]
    var content=[]
    content_to_extract.forEach((tag)=>{
      var skip=1
      tag.forEach((element)=>{
        var data ={
          text: element.textContent,
          id: element.id
        }
        if (data.id === "" || (tag===h1 && skip===1)){
          // remove h1 first element cause it is title of article
          return
        }
        if (element.textContent.length > 0){
          content.push(data)
        }
        skip+=1
      })
    })
    return content
    
  }
  
  document.addEventListener('DOMContentLoaded', function () {
      console.log("test content.js")
      var site_name = document.head.querySelector("meta[property='og:site_name']").getAttribute("content")
      chrome.runtime.onMessage.addListener((message, sender, sendResponse)=> {
          switch(message.action){
              case 'parse':
                if (site_name === "Medium"){
                  var result = parse_paragraph()
  
                  sendResponse({code: 200, msg: "sucessful parse the site", result: result})
                }else{
                  sendResponse({code: 400, msg: "not a medium site", result: null})
                }
                break;
  
          }
      // if (message.action === 'get_parse') {
      //     console.log('Received a greeting from the content script:', message.action);
          
      //     // You can send a response back if needed
      //     sendResponse({ response: 'Hello from the content script!' });
      // }
      });
  });