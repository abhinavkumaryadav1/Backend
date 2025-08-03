import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

    // Configuration
    cloudinary.config({ 
        cloud_name: process.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
    });
    
    const uplaodOnCloudinary = async (localFilePath) => {
        try {
            
            if(!localFilePath) return null; //localfilepath not exist
            //else upload
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto",
            })
            console.log("file successfully uploaded on cloudinary: " , response.url);
            return response; // for user to extract information

        } catch (error) {
            fs.unlinkSync(localFilePath) //remove file from local server because it can hinder ther server(nahi upload hua dhang se to hata hi do na)
            return null;  
        }
    }

     
