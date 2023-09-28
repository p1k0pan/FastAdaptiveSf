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

  function highlightToPage(ids){
    for (var i = 0; i < ids.length; i++){
        var selector = document.getElementById(ids[i])
        if (!selector.innerHTML.includes("Recommend Highlight")){
          // var markerElement = document.createElement("marker");
          var recommendText = document.createElement("text");

          // set recommend text
          recommendText.textContent = "Recommend Highlight";
          recommendText.style = "font-size: 12px; color: #6B6B6B; text-align: right; font-family: Helvetica, Arial, sans-serif;";

          // Replace the existing content of the <p> element with the <marker> element
          selector.innerHTML ="<marker style='background-color: #FFFEBA'>"+ selector.innerHTML + "</marker>"; 
          selector.appendChild(recommendText); // Append the <marker> element to the <p>
        }
    }
}

function highlightRevert(ids){
    for (var i = 0; i < ids.length; i++){
        var selector = document.getElementById(ids[i])
        selector.innerHTML = selector.innerHTML.replace(/<marker[^>]*>/g, "");
        selector.innerHTML = selector.innerHTML.replace(/<\/marker>/g, "");
        selector.innerHTML = selector.innerHTML.replace(/<text[^>]*>.*<\/text>/g, "");
    }
}
  
document.addEventListener('DOMContentLoaded', async function () {
    console.log("test content.js")
    var site = document.head.querySelector("meta[property='og:site_name']")
    var site_name=""
    if (site){site_name=site.getAttribute("content")}
    
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
            case 'highlight':
              console.log("data are", message.data)
              var ids = message.data
              highlightToPage(ids)
              break;
            case 'revert_highlight':
              console.log("data are", message.data)
              var ids = message.data
              highlightRevert(ids)
              break;

        }
    // if (message.action === 'get_parse') {
    //     console.log('Received a greeting from the content script:', message.action);
        
    //     // You can send a response back if needed
    //     sendResponse({ response: 'Hello from the content script!' });
    // }
    });
});