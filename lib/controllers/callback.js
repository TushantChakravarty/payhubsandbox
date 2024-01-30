const fetch = require("node-fetch");

async function callbackPayin (details,url){
    const referenceId = Math.floor(Math.random() * 1000000000);
   console.log(referenceId)
    const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : '*',
          'Access-Control-Allow-Methods':'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
          'AuthKey':'edb7293b7a983d8b330a52a2ef139b8ee8054ac832db536491d197fee0184667',
                 },
        body: JSON.stringify(details)
      })
         .then(resp => resp.json())
         .then(json =>{
           console.log(json)
           if(json)
           return json
          return false
          })
         .catch((error)=>{
          console.log(error)
         })
      return response
}

module.exports={
    callbackPayin
}