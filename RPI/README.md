# Raspberry PI

## Основные модули

### controller
Содержит в себе основную логику работы приложения и контролирует процесс оплаты

### init
Модуль для развертки и начальной инициализации системы

### sync
Модуль содержит логику синхронизации с сервером

## Дополнительные модули

### arduino
Содержит логику взаимодействия с Arduino

### card.class
Структурная модель карты

### dao
Модуль для взаимодействия с базой данных

### gps
Содержит логику взаимодействия с GPS модулем

### logger
Модуль для логирования

### net
Содержит логику взаимодействия с internet соединением

### notifier
Модуль для оповещения об ошибках

### parser
Модуль для разбора и форматирования сообщения для Arduino

### usb_controller
Модуль для взаимодействия usb устройствами

## Сторонние библиотеки

### gps
Библиотека для работы с GPS модулем, позволяет получать текущее местоположение

### mysql
Библиотека для работы с MySQL базой данных

### node-datetime
Библиотека для преобразования времени в различные форматы

### request
Библиотека для работы с сервером посредством HTTP запросов

### serialport
Библиотек для работы с последовательным портом, позволяет работа с Arduino посредством сообщений

### winston
Библиотека для работы с логами и удобной отладки