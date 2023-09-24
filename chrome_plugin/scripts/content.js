function parse_paragraph(){
    const p = document.querySelectorAll('p')
    var p_content = []
    const h1 = document.querySelectorAll('h1')
    var h1_content = []
    const h2 = document.querySelectorAll('h2')
    var h2_content = []
    const li = document.querySelectorAll('li')
    var li_content = []
    const content_to_extract = [p, h1, h2, li]
    content_to_extract.forEach((tag)=>{
      tag.forEach((element)=>{
        var data ={
          text: element.textContent,
          id: element.id
        }
        if (data.id === ""){
          return
        }
        if (element.textContent.length > 0){
          if (tag === p){
            p_content.push(data)
          }
          else if (tag === h1){
            h1_content.push(data)
          }
          else if (tag === h2){
            h2_content.push(data)
          }
          else if (tag === li){
            li_content.push(data)
          }
        }
      })
    })
    h1_content = h1_content.slice(1)
    return {p: p_content, h1: h1_content, h2: h2_content, li: li_content}
    
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