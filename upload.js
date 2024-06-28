const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;
const dir = './public/files';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage: storage });

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


const MAX_RETRIES = 3;

app.use(express.text());

const callChatGPT = async (message, retries = 0) => {
    try {
        // console.log('message:', message);
        const response = await axios.post('https://api.chatanywhere.tech/v1/chat/completions', {
            model: 'gpt-3.5-turbo', // Replace with the appropriate model
            messages: [{ role: 'user', content: message }],
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer sk-D96LeIzfqEIlE1tQ29B2Jm4FUVBm9m04T3so2cbUL7p8QsX3`,
                'Content-Type': 'application/json',
            },
        });

        const content = response.data.choices[0].message.content;
        console.log('content:', content);
        let jsonResponse;

        try {
            jsonResponse = JSON.parse(content);
            console.log("json:", jsonResponse);
            return jsonResponse;
        } catch (error) {
            if (retries < MAX_RETRIES) {
                console.warn(`Retry ${retries + 1}/${MAX_RETRIES}: Response not in JSON format.`);
                return callChatGPT(message, retries + 1);
            } else {
                throw new Error('Max retries reached. Response not in JSON format.');
            }
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
};

app.post('/api/time', async (req, res) => {
  const message = req.body;
  console.log('req.body:', req.body); // Ensure this prints the message

  try {
      const jsonResponse = await callChatGPT(message);
      await res.status(200).json(jsonResponse);
  } catch (error) {
      res.status(500).json({ error: 'Failed to get a valid JSON response from OpenAI API.' });
  }
});


app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: '没有上传文件' });
  }
  console.log('文件上传成功:', file.originalname);
  // get file content
  const data = fs.readFileSync(dir +
    '/' + file.originalname, 'utf8');
  // return file content
  return res.status(200).json({ message: data, filename: file.originalname });
});


app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
});