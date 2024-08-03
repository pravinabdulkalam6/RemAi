const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const sharp = require('sharp');
require('dotenv').config();
const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // to handle large image data
const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
const preprocessBase64Image = async (base64Data) => {
    try {
        // Convert Base64 to buffer
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Process the image using sharp
        const processedImageBuffer = await sharp(imageBuffer)
            .resize({ width: 800 }) // Resize image to a standard width
            .normalize() // Normalize brightness and contrast
            .toBuffer();
        
        // Convert the processed buffer back to Base64
        return processedImageBuffer.toString('base64');
    } catch (error) {
        console.error('Error in preprocessing image:', error);
        throw error;
    }
};
// Function to clean Base64 image data by removing the prefix
const cleanBase64Data = (dataUrl) => {
    // Remove the prefix if it exists
    return dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
};
app.post('/recognize', async (req, res) => {
    const imagedata  = req.body.image;
    const texts=req.body.message
    console.log("text",req.body.message)
    // console.log("image got",imagedata)
    const base64Image = await cleanBase64Data(imagedata);
    //preprocess the image 
    const preprocessedImage = await preprocessBase64Image(base64Image);
try{
    const prompt = texts;
    const image = {
      inlineData: {
        data: preprocessedImage,
        mimeType: "image/png",
      },
    };
    
    const result = await model1.generateContent([prompt, image]);
    console.log(result.response.text());
    res.send({text:result.response.text()})
}
catch(error){
    console.error("error in getting text",error)
}

});
app.post('/recognize', async (req, res) => {
    const imagedata  = req.body.image;
    // console.log("image got",imagedata)
    const base64Image = await cleanBase64Data(imagedata);
    //preprocess the image 
    const preprocessedImage = await preprocessBase64Image(base64Image);
try{
    const prompt = "Convert the handwritten text in the provided image to plain text.";
    const image = {
      inlineData: {
        data: preprocessedImage,
        mimeType: "image/png",
      },
    };
    
    const result = await model1.generateContent([prompt, image]);
    console.log(result.response.text());
    res.send({text:result.response.text()})
}
catch(error){
    console.error("error in getting text",error)
}

});

// app.post('/recognizetext', async (req, res) => {
//     const inputtext  = req.body.text;
// try{
//     const prompt = "Write a story about a magic backpack."
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     console.log(text);
//     res.send({text:result.response.text()})
// }
// catch(error){
//     console.error("error in getting text",error)
// }

// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, '172.16.16.89',() => {
    console.log(`Server is running on port ${PORT}`);
});
