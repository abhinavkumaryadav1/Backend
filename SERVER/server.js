//this is to creat a coustom server for hosting any applications on some port
const http = require("http")
const fs = require("fs")
const path = require("path")

const port = 3000;

//grabing all the neccesary data for server
const server =  http.createServer((req,res)=>{
  //__dirname is for curr directory path kinof PWD
  const filePath=  path.join(__dirname,req.url ==='/'?"index.html":req.url)

  const extName = path.extname(filePath).toLowerCase();

  //mimetype is to tell the browser about the type of filerequest
  const mimeTypes = {'.html': 'text/html',
                     '.css' : 'text/css',
                     '.js'  : 'text/javascript',
                     '.png' : 'text/png',
                    }
//It’s a generic MIME type for binary data
  const contentType=mimeTypes[extName] || 'application/octet-stream'
  
  fs.readFile(filePath,(err,content)=>{
    if(err)
    {
        if(err.code === "ENOENT") //errorcode
        {
            res.writeHead(404,{"content-type": "text/html"});
            res.end("404: File Not Found Bruuhhh");
            return;
        }
    }
    else
    {/*request/response on web servers has two key components HEAD & BODY
       the head has metadata like status etc and the bpdy has html or js */
      res.writeHead(200, {'Content-Type': contentType})  //giving reponse code and content type manually
      res.end(content , 'utf-8');
    }
  })

});

server.listen(port,()=>{
    console.log(`server is litening on port ${port}`);
    
});