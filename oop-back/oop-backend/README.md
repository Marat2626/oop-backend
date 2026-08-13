# Локальный бэкенд OOP

## Быстрый старт (уже настроено)

1. Docker Desktop должен быть запущен.
2. PostgreSQL:
```powershell
cd E:\IT\OOP\OOP\oop-back\oop-backend
docker compose up -d
```
3. Бэкенд:
```powershell
cd E:\IT\OOP\OOP\oop-back\oop-backend
.\.venv\Scripts\Activate.ps1
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

- API: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Логин админки: `admin` / `123`

## .env бэка
```
DATABASE_URL=postgresql://oop:oop123@localhost:5432/moscow
ADMIN_LOGIN=admin
ADMIN_PASSWORD=123
SECRET_KEY=dev-secret-key-change-me
```

## Фронты
Адрес API — один файл: `E:\IT\OOP\OOP\.env`
```
REACT_APP_API_URL=http://localhost:8000
```
После правки:
```powershell
cd E:\IT\OOP\OOP
.\sync-api-url.ps1
```
и перезапуск `npm start`.
