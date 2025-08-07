// Тестовый файл для проверки аутентификации
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function testAuth() {
  const loginData = {
    email: "neo.movies.mail@gmail.com",
    password: "Vfhreif!1"
  };

  try {
    console.log('Отправляем запрос на аутентификацию...');
    console.log('URL:', `${API_URL}/api/v1/auth/login`);
    console.log('Body:', JSON.stringify(loginData, null, 2));

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    console.log('Статус ответа:', response.status);
    console.log('Заголовки ответа:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Ответ:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Аутентификация успешна!');
    } else {
      console.log('❌ Ошибка аутентификации');
    }
  } catch (error) {
    console.error('❌ Ошибка запроса:', error);
  }
}

// Запускаем тест
testAuth();