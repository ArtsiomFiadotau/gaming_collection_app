const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3001; // или любой другой порт

// ВАШИ данные
const CLIENT_ID = 'h47uvldjvq5w0sdw00qh6md6i2a4c0';
const CLIENT_SECRET = 'bkuxsc25mkncrvzkmu016uatt74s08';

app.get('/get-igdb-token', async (req, res) => {
  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    });
    res.json({ access_token: response.data.access_token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка получения токена' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});