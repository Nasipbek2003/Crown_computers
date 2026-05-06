# 📡 API Documentation

## Авторизация

### POST /api/auth/login
Вход в систему

**Request:**
```json
{
  "login": "manager1",
  "password": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "name": "Иван Петров",
    "login": "manager1",
    "role": "MANAGER",
    "salary": 5000000,
    "salesPercent": 3
  }
}
```

### POST /api/auth/register
Регистрация нового пользователя

**Request:**
```json
{
  "name": "Новый Сотрудник",
  "login": "new_user",
  "password": "123456",
  "role": "OPERATOR",
  "salary": 3000000,
  "salesPercent": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Пользователь успешно зарегистрирован",
  "user": {
    "id": "...",
    "name": "Новый Сотрудник",
    "login": "new_user",
    "role": "OPERATOR",
    "salary": 3000000,
    "salesPercent": null,
    "createdAt": "2026-05-06T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Все поля обязательны
- `400` - Пользователь с таким логином уже существует
- `400` - Неверная роль
- `500` - Ошибка сервера

---

## Продажи

### GET /api/sales
Получить все продажи

**Query params:**
- `managerId` (optional) - фильтр по менеджеру

**Response:**
```json
[
  {
    "id": "...",
    "managerId": "...",
    "productType": "LAPTOP",
    "model": "MacBook Pro 14",
    "price": 25000000,
    "clientName": "Алексей Иванов",
    "comment": null,
    "createdAt": "2026-05-06T10:30:00.000Z",
    "manager": {
      "id": "...",
      "name": "Иван Петров"
    }
  }
]
```

### POST /api/sales
Создать продажу

**Request:**
```json
{
  "managerId": "...",
  "productType": "LAPTOP",
  "model": "MacBook Pro 14",
  "price": 25000000,
  "clientName": "Алексей Иванов",
  "comment": "Дополнительная гарантия",
  "leadId": null
}
```

### DELETE /api/sales?id=...
Удалить продажу

---

## Лиды

### GET /api/leads
Получить все лиды

**Query params:**
- `operatorId` (optional) - фильтр по оператору

### POST /api/leads
Создать лид

**Request:**
```json
{
  "operatorId": "...",
  "clientName": "Максим Орлов",
  "phone": "+998901234567",
  "interest": "LAPTOP",
  "status": "WARM",
  "managerId": null,
  "comment": "Интересуется игровыми ноутбуками"
}
```

### PUT /api/leads
Обновить лид

**Request:**
```json
{
  "id": "...",
  "status": "TRANSFERRED",
  "managerId": "..."
}
```

---

## Посещаемость

### GET /api/attendance?userId=...
Получить посещаемость пользователя (последние 30 дней)

### POST /api/attendance
Отметить приход или уход

**Request (приход):**
```json
{
  "userId": "...",
  "type": "arrival"
}
```

**Request (уход):**
```json
{
  "userId": "...",
  "type": "departure"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Приход отмечен",
  "attendance": {
    "id": "...",
    "userId": "...",
    "date": "2026-05-06T00:00:00.000Z",
    "arrivalTime": "2026-05-06T08:55:00.000Z",
    "departureTime": null,
    "status": "PRESENT",
    "hoursWorked": null
  }
}
```

---

## Статистика

### GET /api/statistics?userId=...&role=MANAGER
Получить статистику пользователя за текущий месяц

**Response:**
```json
{
  "sales": {
    "totalSales": 12,
    "totalAmount": 240000000,
    "averageCheck": 20000000,
    "laptops": 8,
    "computers": 4
  },
  "attendance": {
    "totalDays": 20,
    "presentDays": 18,
    "lateDays": 2,
    "absentDays": 0,
    "totalHours": 160
  },
  "salary": {
    "baseSalary": 5000000,
    "bonuses": 500000,
    "penalties": 0,
    "totalSalary": 12700000
  }
}
```

---

## Планы продаж

### GET /api/plans
Получить план на текущий месяц

**Response:**
```json
{
  "id": "...",
  "month": "2026-05",
  "laptopTarget": 25,
  "computerTarget": 15,
  "totalAmountTarget": 600000000
}
```

### POST /api/plans
Создать или обновить план

**Request:**
```json
{
  "month": "2026-05",
  "laptopTarget": 25,
  "computerTarget": 15,
  "totalAmountTarget": 600000000
}
```

---

## Штрафы и бонусы

### GET /api/penalties
Получить все штрафы и бонусы

**Query params:**
- `userId` (optional) - фильтр по пользователю

### POST /api/penalties
Создать штраф или бонус

**Request:**
```json
{
  "userId": "...",
  "type": "BONUS",
  "amount": 500000,
  "reason": "Перевыполнение плана",
  "createdBy": "..."
}
```

### DELETE /api/penalties?id=...
Удалить штраф или бонус

---

## Пользователи

### GET /api/users
Получить всех пользователей

**Query params:**
- `role` (optional) - фильтр по роли (OWNER, ROP, MANAGER, OPERATOR)

**Response:**
```json
[
  {
    "id": "...",
    "name": "Иван Петров",
    "login": "manager1",
    "role": "MANAGER",
    "salary": 5000000,
    "salesPercent": 3,
    "avatar": null,
    "createdAt": "2026-05-06T00:00:00.000Z"
  }
]
```

---

## Типы данных

### UserRole
- `OWNER` - Владелец
- `ROP` - РОП
- `MANAGER` - Менеджер
- `OPERATOR` - Оператор

### ProductType
- `LAPTOP` - Ноутбук
- `COMPUTER` - Компьютер

### AttendanceStatus
- `PRESENT` - Присутствовал
- `LATE` - Опоздал
- `ABSENT` - Отсутствовал

### LeadStatus
- `COLD` - Холодный
- `WARM` - Тёплый
- `TRANSFERRED` - Передан менеджеру

### Interest
- `LAPTOP` - Ноутбук
- `COMPUTER` - Компьютер
- `UNDEFINED` - Не определён

### PenaltyBonusType
- `PENALTY` - Штраф
- `BONUS` - Бонус

---

## Коды ошибок

- `400` - Неверные параметры запроса
- `401` - Неверный логин или пароль
- `500` - Ошибка сервера
